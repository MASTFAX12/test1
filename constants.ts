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
  quickPaymentAmount: 15000,
  quickExaminationNotes: [
    'فحص النظر',
    'فحص الشبكية',
    'فحص قاع العين',
    'قياس ضغط العين',
    'فحص الساحة البصرية',
    'صورة مقطعية للشبكية (OCT)',
    'تصوير الأوعية بالفلوريسين',
    'فحص العدسات اللاصقة'
  ],
};