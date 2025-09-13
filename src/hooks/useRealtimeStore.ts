import { useEffect } from 'react';
import { useAppStore } from '@/stores';
import { 
  onLeadsChange,
  onClientsChange,
  onLotsChange,
  onPaymentsChange,
  onAppointmentsChange,
  onTasksChange 
} from '@/services';

export function useRealtimeStore() {
  const addLead = useAppStore(state => state.addLead);
  const updateLead = useAppStore(state => state.updateLead);
  const deleteLead = useAppStore(state => state.deleteLead);
  const addClient = useAppStore(state => state.addClient);
  const updateClient = useAppStore(state => state.updateClient);
  const deleteClient = useAppStore(state => state.deleteClient);
  const addLot = useAppStore(state => state.addLot);
  const updateLot = useAppStore(state => state.updateLot);
  const deleteLot = useAppStore(state => state.deleteLot);
  const addPayment = useAppStore(state => state.addPayment);
  const updatePayment = useAppStore(state => state.updatePayment);
  const deletePayment = useAppStore(state => state.deletePayment);
  const addAppointment = useAppStore(state => state.addAppointment);
  const updateAppointment = useAppStore(state => state.updateAppointment);
  const deleteAppointment = useAppStore(state => state.deleteAppointment);
  const addTask = useAppStore(state => state.addTask);
  const updateTask = useAppStore(state => state.updateTask);
  const deleteTask = useAppStore(state => state.deleteTask);

  useEffect(() => {
    const leadSubscription = onLeadsChange(payload => {
      if (payload.new) {
        if (payload.old && payload.old.id) {
          updateLead(payload.new.id, payload.new);
        } else {
          addLead(payload.new);
        }
      } else if (payload.old && payload.old.id) {
        deleteLead(payload.old.id);
      }
    });

    const clientSubscription = onClientsChange(payload => {
      if (payload.new) {
        if (payload.old && payload.old.id) {
          updateClient(payload.new.id, payload.new);
        } else {
          addClient(payload.new);
        }
      } else if (payload.old && payload.old.id) {
        deleteClient(payload.old.id);
      }
    });

    const lotSubscription = onLotsChange(payload => {
      if (payload.new) {
        if (payload.old && payload.old.id) {
          updateLot(payload.new.id, payload.new);
        } else {
          addLot(payload.new);
        }
      } else if (payload.old && payload.old.id) {
        deleteLot(payload.old.id);
      }
    });

    const paymentSubscription = onPaymentsChange(payload => {
      if (payload.new) {
        if (payload.old && payload.old.id) {
          updatePayment(payload.new.id, payload.new);
        } else {
          addPayment(payload.new);
        }
      } else if (payload.old && payload.old.id) {
        deletePayment(payload.old.id);
      }
    });

    const appointmentSubscription = onAppointmentsChange(payload => {
      if (payload.new) {
        if (payload.old && payload.old.id) {
          updateAppointment(payload.new.id, payload.new);
        } else {
          addAppointment(payload.new);
        }
      } else if (payload.old && payload.old.id) {
        deleteAppointment(payload.old.id);
      }
    });

    const taskSubscription = onTasksChange(payload => {
      if (payload.new) {
        if (payload.old && payload.old.id) {
          updateTask(payload.new.id, payload.new);
        } else {
          addTask(payload.new);
        }
      } else if (payload.old && payload.old.id) {
        deleteTask(payload.old.id);
      }
    });

    return () => {
      leadSubscription.unsubscribe();
      clientSubscription.unsubscribe();
      lotSubscription.unsubscribe();
      paymentSubscription.unsubscribe();
      appointmentSubscription.unsubscribe();
      taskSubscription.unsubscribe();
    };
  }, []); // Empty dependency array - Zustand selectors are stable
}
