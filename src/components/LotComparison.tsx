import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lot } from '@/types/entities';

interface LotComparisonProps {
  lots: Lot[];
  onClose: () => void;
}

const LotComparison: React.FC<LotComparisonProps> = ({ lots, onClose }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Lot Comparison</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {lots.map(lot => (
          <Card key={lot.id}>
            <CardHeader>
              <CardTitle>Block {lot.block_number}, Lot {lot.lot_number}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Price:</strong> {lot.price}</p>
              <p><strong>Size:</strong> {lot.size} sqm</p>
              <p><strong>Status:</strong> {lot.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LotComparison;
