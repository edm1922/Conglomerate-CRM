import { useMemo, useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { listAvailableLots, reserveLot } from "@/services/lots";
import { Client, Lot } from "@/types/entities";

const BookingSchema = z.object({
  lotId: z.string().min(1, "Please select a lot."),
});

type BookingForm = z.infer<typeof BookingSchema>;

interface ClientLotBookingDialogProps {
  client: Client;
  onBooking?: () => void;
}

function ClientLotBookingDialog({
  client,
  onBooking,
}: ClientLotBookingDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(true);

  const { data: lots = [], isLoading: lotsLoading } = useQuery({
    queryKey: ["lots", "available"],
    queryFn: listAvailableLots,
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
    reserveMutation.mutate({ lotId: data.lotId, clientId: client.id });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book a Lot for {client.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Select
              onValueChange={(value) => setValue("lotId", value)}
              {...register("lotId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a lot..." />
              </SelectTrigger>
              <SelectContent>
                {lotsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading available lots...
                  </SelectItem>
                ) : (
                  lots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      Block {lot.block_number}, Lot {lot.lot_number} ({lot.size} sqm)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.lotId && (
              <p className="text-red-500 text-sm mt-1">{errors.lotId.message}</p>
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
