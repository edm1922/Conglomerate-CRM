import { FC } from 'react';
import { Communication } from '@/types/entities';

interface CommunicationListProps {
  communications: Communication[];
}

const CommunicationList: FC<CommunicationListProps> = ({ communications }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Communication History</h3>
      {communications.length === 0 ? (
        <p>No communications yet.</p>
      ) : (
        <ul className="space-y-4">
          {communications.map((comm) => (
            <li key={comm.id} className="p-4 border rounded-lg">
              <p className="text-sm text-gray-500">
                {new Date(comm.created_at).toLocaleString()} - {comm.type}
              </p>
              <p>{comm.notes}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommunicationList;
