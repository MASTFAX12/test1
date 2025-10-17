import type { Timestamp } from 'firebase/firestore';

export enum PatientStatus {
  Waiting = 'waiting',
  InProgress = 'inprogress',
  PendingPayment = 'pending_payment',
  Done = 'done',
  Skipped = 'skipped',
  Cancelled = 'cancelled',
}

export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface Patient {
  id: string;
  name: string;
  phone: string | null;
  reason: string | null;
  age: number | null;
  amountPaid: number | null;
  requiredAmount: number | null;
  servicesRendered: Service[] | null;
  showDetailsToPublic: boolean;
  status: PatientStatus;
  createdAt: Timestamp;
  visitDate: Timestamp;
}

export enum Role {
  None = 'none',
  Doctor = 'doctor',
  Secretary = 'secretary',
  Public = 'public',
}

export interface ClinicSettings {
  clinicName: string;
  doctorName: string;
  clinicSpecialty: string;
  publicMessage: string;
  doctorPassword?: string;
  secretaryPassword?: string;
  doctorProfilePicUrl?: string;
  secretaryProfilePicUrl?: string;
  themeColor: string;
  callSoundEnabled: boolean;
  services: Service[];
  // Form field controls
  showAgeField: boolean;
  showPhoneField: boolean;
  showReasonField: boolean;
  showAmountPaidField: boolean;
  // Marquee controls
  marqueeSpeed: number;
}

export interface ChatMessage {
  id: string;
  text?: string;
  imageUrl?: string;
  sender: Role;
  createdAt: Timestamp;
}