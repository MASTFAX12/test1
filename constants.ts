import type { ClinicSettings } from './types.ts';

export const DEFAULT_SETTINGS: ClinicSettings = {
  clinicName: 'عيادة الطبيب',
  doctorName: 'اسم الطبيب',
  clinicSpecialty: 'التخصص الطبي',
  publicMessage: 'أهلاً بكم في عيادتنا. نتمنى لكم دوام الصحة والعافية.',
  themeColor: '#2563eb', // blue-600
  callSoundEnabled: true,
  showAgeField: true,
  showPhoneField: true,
  showReasonField: true,
  callDuration: 10, // seconds for the call notification to be visible
  publicTheme: 'deep-ocean',
  autoInProgressOnCall: false,
  requirePaymentBeforeInProgress: false,
  autoDoneAfterInProgress: false,
  autoDoneTimeout: 30, // minutes
  autoCallNextOnDone: false,
};