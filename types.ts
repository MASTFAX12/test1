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

// Represents a permanent patient record in the 'patients' collection
export interface PatientProfile {
  id: string;
  name: string;
  phone: string | null;
  age: number | null;
  firstVisit: Timestamp;
}

export interface CustomLineItem {
  id: string;
  description: string;
  price: number;
}

// Represents a single visit in the 'queue' collection
export interface PatientVisit {
  id:string;
  patientProfileId: string; // Link to the PatientProfile
  name: string; // Denormalized for easy display
  phone: string | null;
  reason: string | null;
  age: number | null; // Denormalized for easy display
  amountPaid: number | null;
  requiredAmount: number | null;
  servicesRendered: Service[] | null;
  customLineItems: CustomLineItem[] | null;
  showDetailsToPublic: boolean;
  status: PatientStatus;
  createdAt: Timestamp; // Used for ordering in the queue
  visitDate: Timestamp;
  sentToPaymentAt?: Timestamp; // Timestamp for when the doctor sends the patient to pay
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
  callDuration: number;
}

export interface ChatMessage {
  id: string;
  text?: string;
  imageUrl?: string;
  sender: Role;
  createdAt: Timestamp;
}