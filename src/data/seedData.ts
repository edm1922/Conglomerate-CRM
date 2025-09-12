import type { Lead, Client, Lot, Payment, Appointment, Task } from '@/types/entities';

// Generate realistic sample data
export function generateSampleLeads(): Lead[] {
  return [
    {
      id: 'lead-1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0101',
      source: 'Facebook',
      status: 'new',
      notes: 'Interested in corner lots with good view',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'lead-2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0102',
      source: 'Google',
      status: 'contacted',
      notes: 'Looking for lots near the school district',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'lead-3',
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '+1-555-0103',
      source: 'Referral',
      status: 'site_visit',
      notes: 'Scheduled site visit for next week',
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString(),
    },
  ];
}

export function generateSampleClients(): Client[] {
  return [
    {
      id: 'client-1',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1-555-0201',
      address: '123 Main St, Cityville, State 12345',
      status: 'active',
      total_investment: 85000,
      created_at: new Date(Date.now() - 345600000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'client-2',
      name: 'Robert Wilson',
      email: 'robert.wilson@email.com',
      phone: '+1-555-0202',
      address: '456 Oak Ave, Townsburg, State 67890',
      status: 'reserved',
      total_investment: 120000,
      created_at: new Date(Date.now() - 432000000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
}

export function generateSampleLots(): Lot[] {
  return [
    {
      id: 'lot-1',
      block_number: 'A',
      lot_number: '101',
      size: 500,
      price: 75000,
      status: 'available',
      location: 'North Section',
      description: 'Corner lot with excellent street access',
      created_at: new Date(Date.now() - 604800000).toISOString(),
      updated_at: new Date(Date.now() - 604800000).toISOString(),
    },
    {
      id: 'lot-2',
      block_number: 'A',
      lot_number: '102',
      size: 450,
      price: 68000,
      status: 'reserved',
      location: 'North Section',
      description: 'Regular lot with good drainage',
      reserved_by: 'client-1',
      date_reserved: new Date(Date.now() - 259200000).toISOString(),
      created_at: new Date(Date.now() - 604800000).toISOString(),
      updated_at: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: 'lot-3',
      block_number: 'B',
      lot_number: '201',
      size: 600,
      price: 95000,
      status: 'sold',
      location: 'East Section',
      description: 'Premium lot with mountain view',
      sold_to: 'client-2',
      date_sold: new Date(Date.now() - 172800000).toISOString(),
      created_at: new Date(Date.now() - 604800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
}

export function generateSamplePayments(): Payment[] {
  return [
    {
      id: 'payment-1',
      receipt_no: 'RCP-001',
      client_id: 'client-1',
      lot_id: 'lot-2',
      amount: 10000,
      payment_method: 'Bank Transfer',
      payment_type: 'Reservation Fee',
      status: 'confirmed',
      notes: 'Initial reservation payment',
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: 'payment-2',
      receipt_no: 'RCP-002',
      client_id: 'client-2',
      lot_id: 'lot-3',
      amount: 95000,
      payment_method: 'Check',
      payment_type: 'Full Payment',
      reference: 'CHK-789456',
      status: 'confirmed',
      notes: 'Full lot payment',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
}

export function generateSampleAppointments(): Appointment[] {
  return [
    {
      id: 'appointment-1',
      title: 'Site Visit - Lot A101',
      client_id: 'client-1',
      type: 'Site Visit',
      scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduled_time: '10:00:00',
      duration: 60,
      location: 'North Section - Lot A101',
      status: 'scheduled',
      notes: 'Bring site plans and measurements',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'appointment-2',
      title: 'Contract Signing',
      client_id: 'client-2',
      type: 'Contract',
      scheduled_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      scheduled_time: '14:30:00',
      duration: 90,
      location: 'Main Office',
      status: 'confirmed',
      notes: 'Final contract signing and payment processing',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export function generateSampleTasks(): Task[] {
  return [
    {
      id: 'task-1',
      title: 'Follow up with John Smith',
      description: 'Call to schedule site visit and answer questions about corner lots',
      priority: 'high',
      due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'pending',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Prepare contract for Emily Davis',
      description: 'Draft purchase contract for Lot A102 reservation',
      priority: 'medium',
      due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      status: 'in_progress',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Update lot status after sale',
      description: 'Mark Lot B201 as sold and update inventory system',
      priority: 'low',
      status: 'completed',
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ];
}

// Complete sample data set
export function generateAllSampleData() {
  return {
    leads: generateSampleLeads(),
    clients: generateSampleClients(),
    lots: generateSampleLots(),
    payments: generateSamplePayments(),
    appointments: generateSampleAppointments(),
    tasks: generateSampleTasks(),
  };
}
