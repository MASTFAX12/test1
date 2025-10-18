import type { Timestamp } from 'firebase/firestore';

// NEW THEME DEFINITIONS
export interface PublicTheme {
  id: string;
  name: string;
  background: string;
  primaryText: string;
  secondaryText: string;
  cardBackground: string;
  cardBorder: string;
  timeDisplayBackground: string;
  listItemDefaultBackground: string;
}

export const themes: PublicTheme[] = [
  {
    id: 'deep-ocean',
    name: 'محيط هادئ',
    background: 'bg-[#1a1a2e]',
    primaryText: 'text-white',
    secondaryText: 'text-gray-300',
    cardBackground: 'bg-white/5 backdrop-blur-lg',
    cardBorder: 'border-white/20',
    timeDisplayBackground: 'bg-white/10 backdrop-blur-sm',
    listItemDefaultBackground: 'bg-white/10',
  },
  {
    id: 'modern-light',
    name: 'نهاري حديث',
    background: 'bg-gray-100',
    primaryText: 'text-gray-800',
    secondaryText: 'text-gray-600',
    cardBackground: 'bg-white/80 backdrop-blur-lg',
    cardBorder: 'border-gray-200',
    timeDisplayBackground: 'bg-white shadow-sm',
    listItemDefaultBackground: 'bg-black/5',
  },
  {
    id: 'forest-calm',
    name: 'غابة هادئة',
    background: 'bg-emerald-900',
    primaryText: 'text-white',
    secondaryText: 'text-emerald-200',
    cardBackground: 'bg-white/5 backdrop-blur-lg',
    cardBorder: 'border-white/20',
    timeDisplayBackground: 'bg-white/10 backdrop-blur-sm',
    listItemDefaultBackground: 'bg-white/10',
  },
  {
    id: 'royal-purple',
    name: 'بنفسجي ملكي',
    background: 'bg-purple-900',
    primaryText: 'text-white',
    secondaryText: 'text-purple-200',
    cardBackground: 'bg-white/5 backdrop-blur-lg',
    cardBorder: 'border-white/20',
    timeDisplayBackground: 'bg-white/10 backdrop-blur-sm',
    listItemDefaultBackground: 'bg-white/10',
  },
];

export const getThemeById = (id: string | undefined | null): PublicTheme => {
  return themes.find(theme => theme.id === id) || themes[0];
};
// END NEW THEME DEFINITIONS

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
  publicTheme: string;
}

export interface ChatMessage {
  id: string;
  text?: string;
  imageUrl?: string;
  sender: Role;
  createdAt: Timestamp;
}