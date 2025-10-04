import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { listClients } from "@/services/clients";
import { reserveLot } from "@/services/lots";
import { Lot } from "@/types/entities";

const BookingSchema = z.object({
  clientId: z.string().min(1, "Please select a client."),
});

type BookingForm = z.infer<typeof BookingSchema>;

interface ClientLotBookingDialogProps {
  lot?: Lot;
  onBooking?: () => void;
}

function ClientLotBookingDialog({
  lot,
  onBooking,
}: ClientLotBookingDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(true);

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: listClients,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BookingForm>({
    resolver: zodResolver(BookingSchema),
  });

  const reserveMutation = useMutation({
    mutationFn: (variables: { lotId: string; clientId: string }) =>
      reserveLot(variables.lotId, variables.clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lots"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Success", description: "Lot booked successfully." });
      onBooking?.();
      setDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: BookingForm) => {
    if (lot?.id) {
      reserveMutation.mutate({ lotId: lot.id, clientId: data.clientId });
    } else {
      toast({ title: "Error", description: "No lot selected for booking.", variant: "destructive" });
    }
  };

  // If lot is not provided, don't render the dialog
  if (!lot) {
    return null;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Lot: Block {lot.block_number}, Lot {lot.lot_number}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Select
              onValueChange={(value) => setValue("clientId", value)}
              {...register("clientId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {clientsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading clients...
                  </SelectItem>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>
            )}
          </div>
          <Button type="submit" disabled={reserveMutation.isPending}>
            {reserveMutation.isPending ? "Booking..." : "Book Lot"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ClientLotBookingDialog;