import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listLots } from '@/services/lots';
import { Lot } from '@/types/entities';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LotMap = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { data: lots, isLoading, isError } = useQuery<Lot[]>(['lots'], listLots);

  const filteredLots = useMemo(() => {
    if (!lots) return [];
    return lots.filter(lot => {
      const matchesStatus = selectedStatus === 'all' || lot.status === selectedStatus;
      const matchesSearch = lot.block_number.includes(searchTerm) || lot.lot_number.includes(searchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [lots, searchTerm, selectedStatus]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading lots</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'reserved':
        return 'bg-yellow-500';
      case 'sold':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search lots..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-10 gap-2">
        {filteredLots.map(lot => (
          <div
            key={lot.id}
            className={`p-2 rounded-md text-white text-xs text-center ${getStatusColor(lot.status)}`}
            title={`Block ${lot.block_number}, Lot ${lot.lot_number}`}
          >
            <div>{lot.block_number}-{lot.lot_number}</div>
            <Badge variant="secondary" className="text-xs">{lot.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LotMap;
