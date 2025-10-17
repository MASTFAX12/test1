import React from 'react';
import type { PatientVisit } from '../types.ts';
import { PatientStatus } from '../types.ts';
import { UserIcon } from './Icons.tsx';

interface CurrentPatientCardProps {
  patient: PatientVisit | undefined; // The patient with 'inprogress' status
  callingPatient: PatientVisit | null; // The patient being actively called
  title: string;
  noPatientText: string;
  callingTitle: string;
}

const CurrentPatientCard: React.FC<CurrentPatientCardProps> = ({ patient, callingPatient, title, noPatientText, callingTitle }) => {
  const isCalling = !!callingPatient;
  const currentPatient = !isCalling && patient && patient.status === PatientStatus.InProgress ? patient : null;

  const containerClasses = isCalling
    ? 'bg-gradient-to-br from-[var(--theme-color)] to-cyan-400 rounded-2xl p-6 text-center shadow-lg border-4 border-white/50 relative h-full flex flex-col justify-center animate-pulse-intense'
    : 'bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-center shadow-lg border-2 border-white/20 relative overflow-hidden h-full flex flex-col';

  return (
    <div className={containerClasses}>
      {!isCalling && (
        <>
          <div className="absolute inset-0 animate-shimmer" />
          <UserIcon className="absolute inset-0 w-full h-full text-white opacity-5 p-8" />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
        {isCalling ? (
          <>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              {callingTitle}
            </h2>
            <p className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-wider break-words text-white drop-shadow-xl">
              {callingPatient.name}
            </p>
          </>
        ) : (
          <>
            {currentPatient ? (
              <>
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white drop-shadow-md mb-4 break-words leading-tight">
                  {currentPatient.name}
                </h2>
                {currentPatient.reason && (
                  <p className="text-2xl lg:text-3xl text-gray-300 opacity-90 mt-2">
                    {currentPatient.reason}
                  </p>
                )}
              </>
            ) : (
              <div className="text-4xl lg:text-5xl font-bold text-white opacity-60">
                {noPatientText}
              </div>
            )}
          </>
        )}
      </div>

      {!isCalling && (
        <div className="relative z-20 flex-shrink-0">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl py-2 px-4 shadow-md inline-flex items-center gap-3">
            <UserIcon className="w-8 h-8 text-[var(--theme-color)]" />
            <span className="text-xl font-semibold text-gray-800">
              {title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentPatientCard;