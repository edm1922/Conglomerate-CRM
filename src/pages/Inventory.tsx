import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Building,
  Search,
  Filter,
  MapPin,
  Ruler,
  DollarSign,
  Plus,
} from "lucide-react";

interface Lot {
  id: string;
  blockNumber: string;
  lotNumber: string;
  size: number;
  price: number;
  status: "Available" | "Reserved" | "Sold";
  location: string;
  description: string;
  reservedBy?: string;
  soldTo?: string;
  dateReserved?: string;
  dateSold?: string;
}

export default function Inventory() {
  const [lots] = useState<Lot[]>([
    {
      id: "1",
      blockNumber: "1",
      lotNumber: "1",
      size: 200,
      price: 600000,
      status: "Available",
      location: "Corner lot, near main entrance",
      description: "Prime corner lot with excellent accessibility",
    },
    {
      id: "2",
      blockNumber: "1",
      lotNumber: "2",
      size: 180,
      price: 540000,
      status: "Available",
      location: "Interior lot, quiet area",
      description: "Peaceful interior lot perfect for family home",
    },
    {
      id: "3",
      blockNumber: "2",
      lotNumber: "5",
      size: 220,
      price: 660000,
      status: "Reserved",
      location: "Near amenities",
      description: "Close to planned community center",
      reservedBy: "Carlos Miranda",
      dateReserved: "2024-01-14",
    },
    {
      id: "4",
      blockNumber: "3",
      lotNumber: "8",
      size: 250,
      price: 750000,
      status: "Sold",
      location: "Premium location",
      description: "Largest lot in Block 3",
      soldTo: "Sofia Reyes",
      dateSold: "2024-01-12",
    },
    {
      id: "5",
      blockNumber: "4",
      lotNumber: "12",
      size: 190,
      price: 570000,
      status: "Available",
      location: "Near park area",
      description: "Close to planned green spaces",
    },
    {
      id: "6",
      blockNumber: "5",
      lotNumber: "3",
      size: 210,
      price: 630000,
      status: "Available",
      location: "Corner lot, good view",
      description: "Corner lot with mountain view",
    },
  ]);

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    const variants = {
      Available: "success",
      Reserved: "warning", 
      Sold: "destructive",
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

  const filteredLots = lots.filter((lot) => {
    const matchesStatus = selectedStatus === "all" || lot.status === selectedStatus;
    const matchesSearch = 
      lot.blockNumber.includes(searchTerm) ||
      lot.lotNumber.includes(searchTerm) ||
      lot.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: lots.length,
    available: lots.filter(lot => lot.status === "Available").length,
    reserved: lots.filter(lot => lot.status === "Reserved").length,
    sold: lots.filter(lot => lot.status === "Sold").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Property Inventory</h1>
          <p className="text-muted-foreground">
            Manage residential lots and their availability
          </p>
        </div>
        <Dialog>
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="block">Block Number</Label>
                  <Input id="block" placeholder="Block #" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lot">Lot Number</Label>
                  <Input id="lot" placeholder="Lot #" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Size (sqm)</Label>
                <Input id="size" type="number" placeholder="Enter size in square meters" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (PHP)</Label>
                <Input id="price" type="number" placeholder="Enter price" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location Description</Label>
                <Input id="location" placeholder="e.g., Corner lot, near entrance" />
              </div>
              <Button className="w-full">Add Lot</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Lots</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.available}</div>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{stats.reserved}</div>
              <p className="text-sm text-muted-foreground">Reserved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{stats.sold}</div>
              <p className="text-sm text-muted-foreground">Sold</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.map((lot) => (
          <Card key={lot.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Block {lot.blockNumber}, Lot {lot.lotNumber}
                </CardTitle>
                {getStatusBadge(lot.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{lot.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                <span>{lot.size} sqm</span>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-lg">{formatPrice(lot.price)}</span>
              </div>
              
              <p className="text-sm text-muted-foreground">{lot.description}</p>
              
              {lot.status === "Reserved" && lot.reservedBy && (
                <div className="text-sm text-warning">
                  Reserved by: {lot.reservedBy}
                  <br />
                  Date: {lot.dateReserved}
                </div>
              )}
              
              {lot.status === "Sold" && lot.soldTo && (
                <div className="text-sm text-destructive">
                  Sold to: {lot.soldTo}
                  <br />
                  Date: {lot.dateSold}
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  disabled={lot.status === "Sold"}
                >
                  {lot.status === "Available" ? "Reserve" : "View Details"}
                </Button>
                {lot.status === "Available" && (
                  <Button size="sm" className="flex-1">
                    Mark as Sold
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}