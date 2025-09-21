// Local storage service for data persistence
import type { Lead, Client, Lot, Payment, Appointment, Task } from '@/types/entities';
import { sanitizeFilename } from '../utils/sanitize';

const STORAGE_KEYS = {
  LEADS: 'crm_leads',
  CLIENTS: 'crm_clients', 
  LOTS: 'crm_lots',
  PAYMENTS: 'crm_payments',
  APPOINTMENTS: 'crm_appointments',
  TASKS: 'crm_tasks',
  BACKUP: 'crm_backup',
  LAST_SYNC: 'crm_last_sync',
} as const;

export interface CRMData {
  leads: Lead[];
  clients: Client[];
  lots: Lot[];
  payments: Payment[];
  appointments: Appointment[];
  tasks: Task[];
  lastSync?: string;
}

// Generic storage operations
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

// Entity-specific storage operations
export function saveLeads(leads: Lead[]): void {
  saveToStorage(STORAGE_KEYS.LEADS, leads);
}

export function loadLeads(): Lead[] {
  return loadFromStorage<Lead[]>(STORAGE_KEYS.LEADS) || [];
}

export function saveClients(clients: Client[]): void {
  saveToStorage(STORAGE_KEYS.CLIENTS, clients);
}

export function loadClients(): Client[] {
  return loadFromStorage<Client[]>(STORAGE_KEYS.CLIENTS) || [];
}

export function saveLots(lots: Lot[]): void {
  saveToStorage(STORAGE_KEYS.LOTS, lots);
}

export function loadLots(): Lot[] {
  return loadFromStorage<Lot[]>(STORAGE_KEYS.LOTS) || [];
}

export function savePayments(payments: Payment[]): void {
  saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
}

export function loadPayments(): Payment[] {
  return loadFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS) || [];
}

export function saveAppointments(appointments: Appointment[]): void {
  saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
}

export function loadAppointments(): Appointment[] {
  return loadFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS) || [];
}

export function saveTasks(tasks: Task[]): void {
  saveToStorage(STORAGE_KEYS.TASKS, tasks);
}

export function loadTasks(): Task[] {
  return loadFromStorage<Task[]>(STORAGE_KEYS.TASKS) || [];
}

// Backup and restore operations
export function createBackup(): string {
  const backup: CRMData = {
    leads: loadLeads(),
    clients: loadClients(),
    lots: loadLots(),
    payments: loadPayments(),
    appointments: loadAppointments(),
    tasks: loadTasks(),
    lastSync: new Date().toISOString(),
  };
  
  const backupData = JSON.stringify(backup, null, 2);
  saveToStorage(STORAGE_KEYS.BACKUP, backup);
  
  return backupData;
}

export function restoreFromBackup(backupData: string): boolean {
  try {
    const backup: CRMData = JSON.parse(backupData);
    
    // Validate backup structure
    if (!backup.leads || !backup.clients || !backup.lots || !backup.payments || !backup.appointments || !backup.tasks) {
      throw new Error('Invalid backup format');
    }
    
    // Restore all data
    saveLeads(backup.leads);
    saveClients(backup.clients);
    saveLots(backup.lots);
    savePayments(backup.payments);
    saveAppointments(backup.appointments);
    saveTasks(backup.tasks);
    
    // Update last sync time
    saveToStorage(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return false;
  }
}

export function exportData(): string {
  return createBackup();
}

export function importData(data: string): boolean {
  return restoreFromBackup(data);
}

// Reset functionality
export function resetAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
}

// Get storage usage info
export function getStorageInfo(): { used: number; available: number } {
  let used = 0;
  
  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('crm_')) {
        used += localStorage[key].length;
      }
    }
  } catch (error) {
    console.error('Failed to calculate storage usage:', error);
  }
  
  // localStorage typically has 5-10MB limit
  const available = 5 * 1024 * 1024; // 5MB estimate
  
  return { used, available };
}

// Check if data exists in storage
export function hasStoredData(): boolean {
  return !!(loadLeads().length || 
          loadClients().length || 
          loadLots().length || 
          loadPayments().length || 
          loadAppointments().length || 
          loadTasks().length);
}

// Get last sync time
export function getLastSyncTime(): string | null {
  return loadFromStorage<string>(STORAGE_KEYS.LAST_SYNC);
}

// Update last sync time
export function updateLastSyncTime(): void {
  saveToStorage(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
}

// uploadClientDocument
import { supabase } from "./supabase";

const BUCKET = "documents";

export async function uploadClientDocument(
  clientId: string,
  file: File
): Promise<{ filePath: string }>{
  const sanitizedFilename = sanitizeFilename(file.name);
  const timestamp = Date.now();
  const path = `${clientId}/${timestamp}-${sanitizedFilename}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) throw uploadError;

  return { filePath: path };
}

export async function listClientDocuments(clientId: string) {
  const { data, error } = await supabase.storage.from(BUCKET).list(clientId, {
    limit: 100,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw error;
  return data;
}

export async function deleteClientDocument(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) throw error;
}


export function getPublicUrl(filePath: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function createSignedUrl(filePath: string, expiresInSeconds = 60) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
