import { useQuery } from "@tanstack/react-query";
import { listLotsByClient } from "@/services/clients";
import { Lot } from "@/types/entities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function BookedLotsTab({ clientId }: { clientId: string }) {
  const { data: lots = [], isLoading } = useQuery<Lot[]>({
    queryKey: ["lots", "client", clientId],
    queryFn: () => listLotsByClient(clientId),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Block</TableHead>
          <TableHead>Lot</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lots.map((lot) => (
          <TableRow key={lot.id}>
            <TableCell>{lot.block_number}</TableCell>
            <TableCell>{lot.lot_number}</TableCell>
            <TableCell>
              <Badge
                variant={lot.status === "sold" ? "success" : lot.status === "reserved" ? "warning" : "secondary"}
              >
                {lot.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
