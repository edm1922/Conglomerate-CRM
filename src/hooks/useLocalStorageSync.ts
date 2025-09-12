import { useEffect } from 'react';
import { useAppStore } from '@/stores';
import { 
  saveLeads, saveClients, saveLots, savePayments, saveAppointments, saveTasks,
  updateLastSyncTime
} from '@/services/storage';

/**
 * Custom hook to automatically sync store changes to localStorage
 */
export function useLocalStorageSync() {
  const { leads, clients, lots, payments, appointments, tasks } = useAppStore();

  // Sync leads to localStorage
  useEffect(() => {
    saveLeads(leads);
    updateLastSyncTime();
  }, [leads]);

  // Sync clients to localStorage
  useEffect(() => {
    saveClients(clients);
    updateLastSyncTime();
  }, [clients]);

  // Sync lots to localStorage
  useEffect(() => {
    saveLots(lots);
    updateLastSyncTime();
  }, [lots]);

  // Sync payments to localStorage
  useEffect(() => {
    savePayments(payments);
    updateLastSyncTime();
  }, [payments]);

  // Sync appointments to localStorage
  useEffect(() => {
    saveAppointments(appointments);
    updateLastSyncTime();
  }, [appointments]);

  // Sync tasks to localStorage
  useEffect(() => {
    saveTasks(tasks);
    updateLastSyncTime();
  }, [tasks]);
}
