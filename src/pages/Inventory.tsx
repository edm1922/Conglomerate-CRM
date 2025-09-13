import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listLots, createLot, updateLot, deleteLot, onLotsChange } from "@/services/lots";
import { CreateLotSchema, UpdateLotSchema, type CreateLot, type UpdateLot } from "@/types/validation";
import { Lot as LotEntity } from "@/types/entities";
import ClientLotBookingDialog from "@/components/ClientLotBookingDialog";
import LotMap from "@/components/LotMap";
import LotComparison from "@/components/LotComparison";
import PriceHistory from "@/components/PriceHistory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building,
  Search,
  Filter,
  MapPin,
  Ruler,
  Plus,
  Edit,
  Trash2,
  GitCompare,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function EditLotDialog({ lot, open, onOpenChange, onUpdate }: { lot: LotEntity; open: boolean; onOpenChange: (open: boolean) => void; onUpdate: (data: UpdateLot) => void; }) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UpdateLot>({
    resolver: zodResolver(UpdateLotSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        block_number: lot.block_number,
        lot_number: lot.lot_number,
        size: lot.size,
        price: lot.price,
        location: lot.location,
        description: lot.description,
        status: lot.status,
      });
    }
  }, [open, lot, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Edit Lot</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="block_number-edit">Block Number</Label>
                  <Input id="block_number-edit" {...register("block_number")} />
                  {errors.block_number && <p className="text-sm text-red-500">{errors.block_number.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lot_number-edit">Lot Number</Label>
                  <Input id="lot_number-edit" {...register("lot_number")} />
                  {errors.lot_number && <p className="text-sm text-red-500">{errors.lot_number.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size-edit">Size (sqm)</Label>
                <Input id="size-edit" type="number" {...register("size", { valueAsNumber: true })} />
                {errors.size && <p className="text-sm text-red-500">{errors.size.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-edit">Price (PHP)</Label>
                <Input id="price-edit" type="number" {...register("price", { valueAsNumber: true })} />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="status-edit">Status</Label>
                <Select defaultValue={lot.status} onValueChange={(v) => setValue("status", v as "available" | "reserved" | "sold")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-edit">Location Description</Label>
                <Input id="location-edit" {...register("location")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description-edit">Description</Label>
                <Textarea id="description-edit" {...register("description")} />
              </div>
              <Button className="w-full" type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default function Inventory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<LotEntity | null>(null);
  const [bookingLot, setBookingLot] = useState<LotEntity | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [comparisonList, setComparisonList] = useState<LotEntity[]>([]);
  const [priceHistoryLot, setPriceHistoryLot] = useState<LotEntity | null>(null);

  const { data: lotsData = [], isLoading: lotsLoading, isError, error } = useQuery({
    queryKey: ["lots"],
    queryFn: listLots,
  });

  useEffect(() => {
    const channel = onLotsChange(() => {
      queryClient.invalidateQueries({ queryKey: ["lots"] });
    });
    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateLot>({
    resolver: zodResolver(CreateLotSchema),
  });

  const createMutation = useMutation({
    mutationFn: createLot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lots"] });
      reset();
      setDialogOpen(false);
      toast({ title: "Success", description: "Lot created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLot }) => updateLot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lots"] });
      setEditDialogOpen(false);
      setEditingLot(null);
      toast({ title: "Success", description: "Lot updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lots"] });
      toast({ title: "Success", description: "Lot deleted successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleCreateSubmit = (values: CreateLot) => {
    createMutation.mutate(values);
  };

  const handleUpdateSubmit = (values: UpdateLot) => {
    if (editingLot) {
      updateMutation.mutate({ id: editingLot.id, data: values });
    }
  };

  const handleBookingSuccess = () => {
    setBookingLot(null);
  };

  const toggleCompare = (lot: LotEntity) => {
    if (comparisonList.find(l => l.id === lot.id)) {
      setComparisonList(comparisonList.filter(l => l.id !== lot.id));
    } else {
      setComparisonList([...comparisonList, lot]);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "success",
      reserved: "warning",
      sold: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredLots = useMemo(() => {
    return (lotsData || []).filter((lot) => {
      const matchesStatus = selectedStatus === "all" || lot.status === selectedStatus;
      const matchesSearch =
        lot.block_number.includes(searchTerm) ||
        lot.lot_number.includes(searchTerm) ||
        (lot.location || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [lotsData, selectedStatus, searchTerm]);

  const stats = useMemo(() => ({
    total: (lotsData || []).length,
    available: (lotsData || []).filter(lot => lot.status === "available").length,
    reserved: (lotsData || []).filter(lot => lot.status === "reserved").length,
    sold: (lotsData || []).filter(lot => lot.status === "sold").length,
  }), [lotsData]);

  if (lotsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load inventory: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Property Inventory</h1>
          <p className="text-muted-foreground">Manage residential lots and their availability</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Lot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Lot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="block_number">Block Number</Label>
                  <Input id="block_number" {...register("block_number")} />
                  {errors.block_number && <p className="text-sm text-red-500">{errors.block_number.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lot_number">Lot Number</Label>
                  <Input id="lot_number" {...register("lot_number")} />
                  {errors.lot_number && <p className="text-sm text-red-500">{errors.lot_number.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Size (sqm)</Label>
                <Input id="size" type="number" {...register("size", { valueAsNumber: true })} />
                {errors.size && <p className="text-sm text-red-500">{errors.size.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (PHP)</Label>
                <Input id="price" type="number" {...register("price", { valueAsNumber: true })} />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location Description</Label>
                <Input id="location" {...register("location")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} />
              </div>
              <Button className="w-full" type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Lot"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <LotMap />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{stats.total}</div><p className="text-sm text-muted-foreground">Total Lots</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-success">{stats.available}</div><p className="text-sm text-muted-foreground">Available</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-warning">{stats.reserved}</div><p className="text-sm text-muted-foreground">Reserved</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-destructive">{stats.sold}</div><p className="text-sm text-muted-foreground">Sold</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by block, lot number, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.map((lot) => (
          <Card key={lot.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Block {lot.block_number}, Lot {lot.lot_number}</CardTitle>
                {getStatusBadge(lot.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /><span>{lot.location}</span></div>
              <div className="flex items-center gap-2 text-sm"><Ruler className="w-4 h-4 text-muted-foreground" /><span>{lot.size} sqm</span></div>
              <div className="flex items-center gap-2"><span className="text-sm font-bold text-muted-foreground">₱</span><span className="font-semibold text-lg">{formatPrice(lot.price)}</span></div>
              <p className="text-sm text-muted-foreground">{lot.description}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingLot(lot); setEditDialogOpen(true); }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {lot.status === "available" && (
                  <Button variant="default" size="sm" className="flex-1" onClick={() => setBookingLot(lot)}>
                    Book
                  </Button>
                )}
                <Button variant="destructive" size="sm" className="flex-1" onClick={() => { if (confirm("Are you sure?")) deleteMutation.mutate(lot.id); }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant={comparisonList.find(l => l.id === lot.id) ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => toggleCompare(lot)}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPriceHistoryLot(lot)}>
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {comparisonList.length > 0 && (
        <LotComparison
          lots={comparisonList}
          onClose={() => setComparisonList([])}
        />
      )}

      {priceHistoryLot && (
        <Dialog open={priceHistoryLot !== null} onOpenChange={() => setPriceHistoryLot(null)}>
          <DialogContent>
            <PriceHistory lot={priceHistoryLot} />
          </DialogContent>
        </Dialog>
      )}

      {editingLot && (
        <EditLotDialog
            lot={editingLot}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdate={handleUpdateSubmit}
        />
      )}

      {bookingLot && (
        <ClientLotBookingDialog
          lot={bookingLot}
          onBooking={handleBookingSuccess}
        />
      )}
    </div>
  );
}
