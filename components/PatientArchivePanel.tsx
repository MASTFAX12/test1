import React, { useState, useMemo, FC } from 'react';
import type { PatientProfile, PatientVisit } from '../types.ts';
import { 
    MagnifyingGlassIcon, XMarkIcon, PencilIcon, TrashIcon, ArchiveBoxIcon as HistoryIcon, UserIcon, PhoneIcon, ClockIcon 
} from './Icons.tsx';
import { toast } from 'react-hot-toast';
import { deletePatientProfile } from '../services/firebase.ts';
import PatientHistoryModal from './PatientHistoryModal.tsx';
import { ConfirmationDialog } from './Icons.tsx';
import EditPatientProfileModal from './EditPatientProfileModal.tsx';

interface PatientArchivePanelProps {
    patientProfiles: PatientProfile[];
    allVisits: PatientVisit[];
}

const PatientArchivePanel: FC<PatientArchivePanelProps> = ({ patientProfiles, allVisits }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProfile, setEditingProfile] = useState<PatientProfile | null>(null);
    const [deletingProfile, setDeletingProfile] = useState<PatientProfile | null>(null);
    const [historyProfile, setHistoryProfile] = useState<PatientProfile | null>(null);

    const visitCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const visit of allVisits) {
            if (visit.patientProfileId) {
                counts.set(visit.patientProfileId, (counts.get(visit.patientProfileId) || 0) + 1);
            }
        }
        return counts;
    }, [allVisits]);

    const filteredProfiles = useMemo(() => {
        if (!searchTerm) return patientProfiles;
        const lowercasedFilter = searchTerm.toLowerCase();
        return patientProfiles.filter(p => 
            p.name.toLowerCase().includes(lowercasedFilter) || 
            (p.phone && p.phone.includes(lowercasedFilter))
        );
    }, [patientProfiles, searchTerm]);

    const handleDelete = async () => {
        if (!deletingProfile) return;
        const toastId = toast.loading('جاري حذف المراجع وكل سجلاته...');
        try {
            await deletePatientProfile(deletingProfile.id);
            toast.success(`تم حذف "${deletingProfile.name}" نهائياً.`, { id: toastId });
            setDeletingProfile(null);
        } catch (error) {
            console.error(error);
            toast.error('فشل حذف المراجع.', { id: toastId });
        }
    };
    
    return (
        <>
            <div className="h-full flex flex-col animate-fade-in space-y-4">
                <header>
                    <h1 className="text-3xl font-bold text-gray-800">أرشيف المراجعين</h1>
                    <p className="text-gray-500">سجل دائم لجميع المراجعين الذين زاروا العيادة.</p>
                </header>

                <div className="relative flex-shrink-0">
                    <MagnifyingGlassIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو رقم الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input !pr-12 w-full"
                    />
                    {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>}
                </div>

                <div className="flex-grow bg-white p-4 rounded-2xl shadow-lg flex flex-col min-h-0">
                    <div className="overflow-y-auto pr-2 -mr-2">
                        {filteredProfiles.length > 0 ? (
                             <div className="space-y-3">
                                {filteredProfiles.map(profile => (
                                    <div key={profile.id} className="bg-gray-50 hover:bg-gray-100/70 p-4 rounded-xl border border-gray-200/80 transition-colors duration-200 flex items-center justify-between">
                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <div className="flex items-center gap-3 font-bold text-gray-800 text-lg">
                                                <UserIcon className="w-5 h-5 text-gray-400"/>
                                                <span>{profile.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                                                <PhoneIcon className="w-5 h-5 text-gray-400"/>
                                                <span>{profile.phone || 'لا يوجد رقم'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                                                <ClockIcon className="w-5 h-5 text-gray-400"/>
                                                <span>عدد الزيارات:</span>
                                                <span className="font-bold text-lg text-[var(--theme-color)]">{visitCounts.get(profile.id) || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-2 ml-4">
                                            <button onClick={() => setHistoryProfile(profile)} title="عرض سجل الزيارات" className="p-2 rounded-lg text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"><HistoryIcon className="w-5 h-5"/></button>
                                            <button onClick={() => setEditingProfile(profile)} title="تعديل البيانات" className="p-2 rounded-lg text-gray-500 hover:bg-green-100 hover:text-green-600 transition-colors"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => setDeletingProfile(profile)} title="حذف المراجع" className="p-2 rounded-lg text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        ) : (
                            <div className="text-center py-16 text-gray-500">
                                <p>لا يوجد مراجعون مطابقون للبحث.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {editingProfile && (
                <EditPatientProfileModal 
                    profile={editingProfile}
                    onClose={() => setEditingProfile(null)}
                />
            )}

            {historyProfile && (
                <PatientHistoryModal 
                    patientProfileId={historyProfile.id}
                    patientName={historyProfile.name}
                    onClose={() => setHistoryProfile(null)}
                />
            )}

            <ConfirmationDialog
                isOpen={!!deletingProfile}
                onClose={() => setDeletingProfile(null)}
                onConfirm={handleDelete}
                title="حذف المراجع نهائياً"
                message={`هل أنت متأكد من حذف "${deletingProfile?.name}"؟ سيتم حذف ملفه الشخصي وجميع سجلات زياراته بشكل دائم. لا يمكن التراجع عن هذا الإجراء.`}
                confirmButtonText="نعم، حذف الكل"
                confirmButtonColor="bg-red-600 hover:bg-red-700"
                icon={<TrashIcon className="w-5 h-5" />}
            />
        </>
    );
};

export default PatientArchivePanel;
