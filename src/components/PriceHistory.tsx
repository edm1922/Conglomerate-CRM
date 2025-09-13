import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lot } from '@/types/entities';

interface PriceHistoryProps {
  lot: Lot;
}

const PriceHistory: React.FC<PriceHistoryProps> = ({ lot }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Price history for Block {lot.block_number}, Lot {lot.lot_number}</p>
        {/* Price history will be implemented here */}
      </CardContent>
    </Card>
  );
};

export default PriceHistory;
