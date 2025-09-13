import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Lead, Client, Lot, Payment, Appointment, Task, Document } from '@/types/entities';
import { 
  loadLeads, loadClients, loadLots, loadPayments, loadAppointments, loadTasks
} from '@/services/storage';

interface AppState {
  // Loading states
  loading: {
    leads: boolean;
    clients: boolean;
    lots: boolean;
    payments: boolean;
    appointments: boolean;
    tasks: boolean;
  };
  
  // Data
  leads: Lead[];
  clients: Client[];
  lots: Lot[];
  payments: Payment[];
  appointments: Appointment[];
  tasks: Task[];
  
  // UI State
  selectedItems: {
    lead: Lead | null;
    client: Client | null;
    lot: Lot | null;
    payment: Payment | null;
    appointment: Appointment | null;
    task: Task | null;
  };
  openDialogOnLoad: 'lead' | 'payment' | 'appointment' | null;
  
  // Filters
  filters: {
    leads: {
      status: string;
      search: string;
      source: string;
    };
    clients: {
      status: string;
      search: string;
    };
    lots: {
      status: string;
      search: string;
    };
    payments: {
      status: string;
      search: string;
    };
  };
  
  // Actions
  setLoading: (entity: keyof AppState['loading'], loading: boolean) => void;
  setOpenDialogOnLoad: (dialog: AppState['openDialogOnLoad']) => void;
  
  // Lead actions
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  setSelectedLead: (lead: Lead | null) => void;
  setLeadFilter: (key: keyof AppState['filters']['leads'], value: string) => void;
  
  // Client actions
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  setSelectedClient: (client: Client | null) => void;
  setClientFilter: (key: keyof AppState['filters']['clients'], value: string) => void;
  
  // Lot actions
  setLots: (lots: Lot[]) => void;
  addLot: (lot: Lot) => void;
  updateLot: (id: string, updates: Partial<Lot>) => void;
  deleteLot: (id: string) => void;
  setSelectedLot: (lot: Lot | null) => void;
  setLotFilter: (key: keyof AppState['filters']['lots'], value: string) => void;
  
  // Payment actions
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  setSelectedPayment: (payment: Payment | null) => void;
  setPaymentFilter: (key: keyof AppState['filters']['payments'], value: string) => void;
  
  // Appointment actions
  setAppointments: (appointments: Appointment[]) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  setSelectedAppointment: (appointment: Appointment | null) => void;
  
  // Task actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setSelectedTask: (task: Task | null) => void;
  
  // Utility actions
  reset: () => void;
}

const initialState = {
  loading: {
    leads: false,
    clients: false,
    lots: false,
    payments: false,
    appointments: false,
    tasks: false,
  },
  leads: [],
  clients: [],
  lots: [],
  payments: [],
  appointments: [],
  tasks: [],
  selectedItems: {
    lead: null,
    client: null,
    lot: null,
    payment: null,
    appointment: null,
    task: null,
  },
  openDialogOnLoad: null,
  filters: {
    leads: {
      status: 'all',
      search: '',
      source: 'all',
    },
    clients: {
      status: 'all',
      search: '',
    },
    lots: {
      status: 'all',
      search: '',
    },
    payments: {
      status: 'all',
      search: '',
    },
  },
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setLoading: (entity, loading) => 
          set((state) => ({ 
            loading: { ...state.loading, [entity]: loading } 
          }), false, `setLoading/${entity}`),
          
        setOpenDialogOnLoad: (dialog) => set({ openDialogOnLoad: dialog }, false, 'setOpenDialogOnLoad'),
        
        // Lead actions
        setLeads: (leads) => 
          set({ leads }, false, 'setLeads'),
        
        addLead: (lead) => 
          set((state) => ({ 
            leads: [lead, ...state.leads] 
          }), false, 'addLead'),
        
        updateLead: (id, updates) => 
          set((state) => ({ 
            leads: state.leads.map(lead => 
              lead.id === id ? { ...lead, ...updates } : lead
            ) 
          }), false, 'updateLead'),
        
        deleteLead: (id) => 
          set((state) => ({ 
            leads: state.leads.filter(lead => lead.id !== id) 
          }), false, 'deleteLead'),
        
        setSelectedLead: (lead) => 
          set((state) => ({ 
            selectedItems: { ...state.selectedItems, lead } 
          }), false, 'setSelectedLead'),
        
        setLeadFilter: (key, value) => 
          set((state) => ({ 
            filters: { 
              ...state.filters, 
              leads: { ...state.filters.leads, [key]: value } 
            } 
          }), false, 'setLeadFilter'),
        
        // Client actions
        setClients: (clients) => 
          set({ clients }, false, 'setClients'),
        
        addClient: (client) => 
          set((state) => ({ 
            clients: [client, ...state.clients] 
          }), false, 'addClient'),
        
        updateClient: (id, updates) => 
          set((state) => ({ 
            clients: state.clients.map(client => 
              client.id === id ? { ...client, ...updates } : client
            ) 
          }), false, 'updateClient'),
        
        deleteClient: (id) => 
          set((state) => ({ 
            clients: state.clients.filter(client => client.id !== id) 
          }), false, 'deleteClient'),
        
        setSelectedClient: (client) => 
          set((state) => ({ 
            selectedItems: { ...state.selectedItems, client } 
          }), false, 'setSelectedClient'),
        
        setClientFilter: (key, value) => 
          set((state) => ({ 
            filters: { 
              ...state.filters, 
              clients: { ...state.filters.clients, [key]: value } 
            } 
          }), false, 'setClientFilter'),
        
        // Lot actions
        setLots: (lots) => 
          set({ lots }, false, 'setLots'),
        
        addLot: (lot) => 
          set((state) => ({ 
            lots: [lot, ...state.lots] 
          }), false, 'addLot'),
        
        updateLot: (id, updates) => 
          set((state) => ({ 
            lots: state.lots.map(lot => 
              lot.id === id ? { ...lot, ...updates } : lot
            ) 
          }), false, 'updateLot'),
        
        deleteLot: (id) => 
          set((state) => ({ 
            lots: state.lots.filter(lot => lot.id !== id) 
          }), false, 'deleteLot'),
        
        setSelectedLot: (lot) => 
          set((state) => ({ 
            selectedItems: { ...state.selectedItems, lot } 
          }), false, 'setSelectedLot'),
        
        setLotFilter: (key, value) => 
          set((state) => ({ 
            filters: { 
              ...state.filters, 
              lots: { ...state.filters.lots, [key]: value } 
            } 
          }), false, 'setLotFilter'),
        
        // Payment actions
        setPayments: (payments) => 
          set({ payments }, false, 'setPayments'),
        
        addPayment: (payment) => 
          set((state) => ({ 
            payments: [payment, ...state.payments] 
          }), false, 'addPayment'),
        
        updatePayment: (id, updates) => 
          set((state) => ({ 
            payments: state.payments.map(payment => 
              payment.id === id ? { ...payment, ...updates } : payment
            ) 
          }), false, 'updatePayment'),
        
        deletePayment: (id) => 
          set((state) => ({ 
            payments: state.payments.filter(payment => payment.id !== id) 
          }), false, 'deletePayment'),
        
        setSelectedPayment: (payment) => 
          set((state) => ({ 
            selectedItems: { ...state.selectedItems, payment } 
          }), false, 'setSelectedPayment'),
        
        setPaymentFilter: (key, value) => 
          set((state) => ({ 
            filters: { 
              ...state.filters, 
              payments: { ...state.filters.payments, [key]: value } 
            } 
          }), false, 'setPaymentFilter'),
        
        // Appointment actions
        setAppointments: (appointments) => 
          set({ appointments }, false, 'setAppointments'),
        
        addAppointment: (appointment) => 
          set((state) => ({ 
            appointments: [appointment, ...state.appointments] 
          }), false, 'addAppointment'),
        
        updateAppointment: (id, updates) => 
          set((state) => ({ 
            appointments: state.appointments.map(appointment => 
              appointment.id === id ? { ...appointment, ...updates } : appointment
            ) 
          }), false, 'updateAppointment'),
        
        deleteAppointment: (id) => 
          set((state) => ({ 
            appointments: state.appointments.filter(appointment => appointment.id !== id) 
          }), false, 'deleteAppointment'),
        
        setSelectedAppointment: (appointment) => 
          set((state) => ({ 
            selectedItems: { ...state.selectedItems, appointment } 
          }), false, 'setSelectedAppointment'),
        
        // Task actions
        setTasks: (tasks) => 
          set({ tasks }, false, 'setTasks'),
        
        addTask: (task) => 
          set((state) => ({ 
            tasks: [task, ...state.tasks] 
          }), false, 'addTask'),
        
        updateTask: (id, updates) => 
          set((state) => ({ 
            tasks: state.tasks.map(task => 
              task.id === id ? { ...task, ...updates } : task
            ) 
          }), false, 'updateTask'),
        
        deleteTask: (id) => 
          set((state) => ({ 
            tasks: state.tasks.filter(task => task.id !== id) 
          }), false, 'deleteTask'),
        
        setSelectedTask: (task) => 
          set((state) => ({ 
            selectedItems: { ...state.selectedItems, task } 
          }), false, 'setSelectedTask'),
        
        // Utility actions
        reset: () => 
          set(initialState, false, 'reset'),
      }),
      {
        name: 'conglomerate-crm-storage',
        partialize: (state) =>
          Object.fromEntries(
            Object.entries(state).filter(([key]) => !['loading', 'selectedItems'].includes(key))
          ),
      }
    ),
    {
      name: 'conglomerate-crm',
    }
  )
);
