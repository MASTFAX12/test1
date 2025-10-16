
import React from 'react';
import type { Patient } from '../types.ts';
import { PatientStatus } from '../types.ts';
import { UserIcon } from './Icons.tsx';

interface CurrentPatientCardProps {
  patient: Patient | undefined; // The patient with 'inprogress' status
  callingPatient: Patient | null; // The patient being actively called
}

const CurrentPatientCard: React.FC<CurrentPatientCardProps> = ({ patient, callingPatient }) => {
  const isCalling = !!callingPatient;
  const currentPatient = !isCalling && patient && patient.status === PatientStatus.InProgress ? patient : null;

  const containerClasses = isCalling
    ? 'bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-6 text-center shadow-lg border-4 border-white/50 relative h-full flex flex-col justify-center animate-pulse-intense'
    : 'bg-gradient-to-br from-red-400 to-pink-400 rounded-2xl p-6 text-center shadow-lg border-2 border-white/50 relative overflow-hidden h-full flex flex-col';

  return (
    <div className={containerClasses}>
      {!isCalling && (
        <>
          {/* Shimmer effect for default state */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent animate-[shimmer_3s_infinite]" />
          {/* Background icon for default state */}
          <UserIcon className="absolute inset-0 w-full h-full text-gray-800 opacity-10 p-8" />
        </>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
        {isCalling ? (
          // Calling State UI
          <>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              جاري النداء على
            </h2>
            <p className="text-5xl md:text-8xl font-black tracking-wider break-words text-white drop-shadow-xl">
              {callingPatient.name}
            </p>
          </>
        ) : (
          // Default State UI
          <>
            {currentPatient ? (
              <>
                <h2 className="text-5xl lg:text-7xl font-bold text-gray-800 drop-shadow-md mb-4 break-words leading-tight">
                  {currentPatient.name}
                </h2>
                {currentPatient.reason && (
                  <p className="text-2xl lg:text-3xl text-gray-700 opacity-90 mt-2">
                    {currentPatient.reason}
                  </p>
                )}
              </>
            ) : (
              <div className="text-4xl lg:text-5xl font-bold text-gray-800 opacity-80">
                لا يوجد مراجع حالياً
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Label (only in default state) */}
      {!isCalling && (
        <div className="relative z-20 flex-shrink-0">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl py-2 px-4 shadow-md inline-flex items-center gap-3">
            <UserIcon className="w-8 h-8 text-gray-700" />
            <span className="text-xl font-semibold text-gray-800">
              المراجع الحالي داخل العيادة
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentPatientCard;