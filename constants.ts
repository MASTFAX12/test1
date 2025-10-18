import type { ClinicSettings } from './types.ts';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_SETTINGS: ClinicSettings = {
  clinicName: 'عيادة الدكتور مصطفى للعناية الصحية والجراحة',
  doctorName: 'د. مصطفى العلاوي',
  clinicSpecialty: 'الطب العام والجراحة البسيطة',
  publicMessage: 'مرحباً بكم في عيادتنا. يسعدنا خدمتكم ونتمنى لكم دوام الصحة والعافية.',
  doctorProfilePicUrl: '',
  secretaryProfilePicUrl: '',
  themeColor: '#22c55e', // emerald green color
  callSoundEnabled: true,
  services: [
    { id: uuidv4(), name: 'كشف عام', price: 15000 },
    { id: uuidv4(), name: 'استشارة تخصصية', price: 20000 },
    { id: uuidv4(), name: 'فحص ضغط وسكر', price: 12000 },
    { id: uuidv4(), name: 'علاج جرح بسيط', price: 25000 },
    { id: uuidv4(), name: 'عملية بسيطة', price: 50000 },
  ],
  showAgeField: true,
  showPhoneField: true,
  showReasonField: true,
  showAmountPaidField: true,
  marqueeSpeed: 15, // seconds for one full scroll
};
