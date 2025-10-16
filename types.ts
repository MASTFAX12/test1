
import { Timestamp } from 'firebase/firestore';

export enum PatientStatus {
  Waiting = 'waiting',
  InProgress = 'inprogress',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  reason?: string;
  status: PatientStatus;
  createdAt: Timestamp;
}
