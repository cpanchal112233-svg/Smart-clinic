export type UserRole = "patient" | "admin" | "doctor" | "doctor_pending";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Doctor {
  id: string;
  profile_id: string;
  specialty: string;
  bio: string | null;
  is_available: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  profile?: Profile;
}

export type DoctorApplicationStatus = "pending" | "approved" | "rejected";

export interface DoctorApplication {
  id: string;
  profile_id: string;
  full_name: string;
  email: string;
  specialty: string;
  document_urls: string[];
  status: DoctorApplicationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string;
  end_time: string;
  created_at: string;
  doctor?: Doctor;
}

export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  patient?: Profile;
  doctor?: Doctor;
  service?: Service;
}

export type QueueStatus = "waiting" | "in_progress" | "completed";

export interface QueueEntry {
  id: string;
  appointment_id: string;
  queue_number: number;
  status: QueueStatus;
  checked_in_at: string | null;
  created_at: string;
  appointment?: Appointment;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
