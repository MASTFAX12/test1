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
    background: 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e]',
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
    background: 'bg-gradient-to-br from-gray-50 to-slate-200',
    primaryText: 'text-slate-900',
    secondaryText: 'text-slate-500',
    cardBackground: 'bg-white/60 backdrop-blur-xl shadow-2xl',
    cardBorder: 'border-white/50',
    timeDisplayBackground: 'bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-md',
    listItemDefaultBackground: 'bg-white/80',
  },
  {
    id: 'forest-calm',
    name: 'غابة هادئة',
    background: 'bg-gradient-to-br from-gray-800 to-emerald-900',
    primaryText: 'text-white',
    secondaryText: 'text-emerald-300',
    cardBackground: 'bg-white/5 backdrop-blur-lg',
    cardBorder: 'border-white/20',
    timeDisplayBackground: 'bg-white/10 backdrop-blur-sm',
    listItemDefaultBackground: 'bg-white/10',
  },
  {
    id: 'royal-purple',
    name: 'بنفسجي ملكي',
    background: 'bg-gradient-to-br from-indigo-900 to-purple-900',
    primaryText: 'text-white',
    secondaryText: 'text-purple-300',
    cardBackground: 'bg-white/5 backdrop-blur-lg',
    cardBorder: 'border-white/20',
    timeDisplayBackground: 'bg-white/10 backdrop-blur-sm',
    listItemDefaultBackground: 'bg-white/10',
  },
  {
    id: 'sunset-glow',
    name: 'وهج الغروب',
    background: 'bg-gradient-to-br from-orange-400 to-rose-500',
    primaryText: 'text-white',
    secondaryText: 'text-rose-100',
    cardBackground: 'bg-black/10 backdrop-blur-lg',
    cardBorder: 'border-white/20',
    timeDisplayBackground: 'bg-black/10 backdrop-blur-sm',
    listItemDefaultBackground: 'bg-black/10',
  }
];

export const getThemeById = (id: string | undefined | null): PublicTheme => {
  return themes.find(theme => theme.id === id) || themes[0];
};
// END NEW THEME DEFINITIONS

export enum PatientStatus {
  Waiting = 'waiting',
  InProgress = 'inprogress',
  PendingExamination = 'pending_examination',
  Done = 'done',
  Skipped = 'skipped',
  Cancelled = 'cancelled',
}

// Represents a permanent patient record in the 'patients' collection
export interface PatientProfile {
  id: string;
  name: string;
  phone: string | null;
  age: number | null;
  firstVisit: Timestamp;
}

// Represents a single visit in the 'queue' collection
export interface PatientVisit {
  id:string;
  patientProfileId: string; // Link to the PatientProfile
  name: string; // Denormalized for easy display
  phone: string | null;
  reason: string | null;
  age: number | null; // Denormalized for easy display
  isPaid: boolean;
  paymentAmount: number | null;
  paymentNotes: string | null;
  clinicalNotes?: string;
  showDetailsToPublic: boolean;
  status: PatientStatus;
  createdAt: Timestamp; // Used for ordering in the queue
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
  themeColor: string;
  callSoundEnabled: boolean;
  // Form field controls
  showAgeField: boolean;
  showPhoneField: boolean;
  showReasonField: boolean;
  // Marquee controls
  callDuration: number;
  publicTheme: string;
  // Workflow controls
  autoInProgressOnCall: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Role;
  createdAt: Timestamp;
}