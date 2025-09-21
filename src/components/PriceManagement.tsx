
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { listLots } from "@/services/lots";
import { updateLotPrice } from "@/services/pricing";

function PriceManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLot, setSelectedLot] = useState<string | null>(null);

  const { data: lots = [], isLoading: lotsLoading } = useQuery({
    queryKey: ["lots"],
    queryFn: listLots,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedLot) {
        throw new Error("No lot selected.");
      }
      return updateLotPrice(selectedLot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lots"] });
      toast({ title: "Success", description: "Price updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleUpdatePrice = () => {
    mutation.mutate();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Price Management</h2>
      <div className="flex items-center space-x-2">
        <Select onValueChange={setSelectedLot} disabled={lotsLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select a lot..." />
          </SelectTrigger>
          <SelectContent>
            {lots.map((lot) => (
              <SelectItem key={lot.id} value={lot.id}>
                Block {lot.block_number}, Lot {lot.lot_number} (Current Price: {lot.price})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleUpdatePrice} disabled={!selectedLot || mutation.isPending}>
          {mutation.isPending ? "Updating..." : "Update Price Dynamically"}
        </Button>
      </div>
    </div>
  );
}

export default PriceManagement;
