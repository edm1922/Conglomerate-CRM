export interface AppointmentTemplate {
  id: string;
  name: string;
  type: string;
  duration: number;
  location?: string;
  notes?: string;
}
