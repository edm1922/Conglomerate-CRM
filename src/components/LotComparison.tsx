import React from 'react';
import { Button } from '@/components/ui/button';
import { Lot } from '@/types/entities';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LotComparisonProps {
  lots: Lot[];
  onClose: () => void;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price);
  };

const LotComparison: React.FC<LotComparisonProps> = ({ lots, onClose }) => {
  if (lots.length === 0) {
    return null;
  }

  const attributes = [
    { key: 'price', label: 'Price' },
    { key: 'size', label: 'Size (sqm)' },
    { key: 'status', label: 'Status' },
    { key: 'location', label: 'Location' },
    { key: 'description', label: 'Description' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-50">
        <Card className="m-4 border-t-2 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lot Comparison</CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">Feature</TableHead>
                            {lots.map(lot => (
                                <TableHead key={lot.id} className="font-semibold">Block {lot.block_number}, Lot {lot.lot_number}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attributes.map(attr => (
                            <TableRow key={attr.key}>
                                <TableCell className="font-medium">{attr.label}</TableCell>
                                {lots.map(lot => (
                                    <TableCell key={lot.id}>
                                        {attr.key === 'price' ? formatPrice(lot[attr.key as keyof Lot] as number) : String(lot[attr.key as keyof Lot] || '-')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
};

export default LotComparison;
