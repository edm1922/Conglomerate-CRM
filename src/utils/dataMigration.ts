import { generateAllSampleData } from '@/data/seedData';
import { useAppStore } from '@/stores';
import { resetAllData, hasStoredData } from '@/services/storage';

/**
 * Seed the application with sample data if no data exists
 */
export function seedDataIfEmpty(): void {
  if (!hasStoredData()) {
    seedSampleData();
  }
}

/**
 * Force seed the application with sample data
 */
export function seedSampleData(): void {
  const sampleData = generateAllSampleData();
  const store = useAppStore.getState();
  
  // Set all sample data
  store.setLeads(sampleData.leads);
  store.setClients(sampleData.clients);
  store.setLots(sampleData.lots);
  store.setPayments(sampleData.payments);
  store.setAppointments(sampleData.appointments);
  store.setTasks(sampleData.tasks);
  
  console.log('Sample data seeded successfully');
}

/**
 * Reset all data in the application
 */
export function resetAllAppData(): void {
  const store = useAppStore.getState();
  
  // Reset localStorage
  resetAllData();
  
  // Reset store
  store.reset();
  
  console.log('All application data reset');
}

/**
 * Check if sample data should be loaded on app start
 */
export function shouldLoadSampleData(): boolean {
  return !hasStoredData();
}
