import type { ClinicSettings } from './types.ts';
import { v4 as uuidv4 } from 'uuid';


export const DEFAULT_SETTINGS: ClinicSettings = {
  clinicName: 'عيادة الطبيب',
  doctorName: 'اسم الطبيب',
  clinicSpecialty: 'التخصص الطبي',
  publicMessage: 'أهلاً بكم في عيادتنا. نتمنى لكم دوام الصحة والعافية.',
  doctorProfilePicUrl: '',
  secretaryProfilePicUrl: '',
  themeColor: '#2563eb', // blue-600
  callSoundEnabled: true,
  services: [
    { id: uuidv4(), name: 'كشفية', price: 25000 },
    { id: uuidv4(), name: 'مراجعة', price: 15000 },
    { id: uuidv4(), name: 'سونار', price: 30000 },
  ],
  showAgeField: true,
  showPhoneField: true,
  showReasonField: true,
  showAmountPaidField: false, // Defaulted to false as per new workflow
  marqueeSpeed: 20, // seconds for one full scroll
  callDuration: 10, // seconds for the call notification to be visible
  publicTheme: 'deep-ocean',
};