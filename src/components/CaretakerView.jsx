import React, { useState, useRef } from 'react';
import { Calendar, ShieldAlert, Pill, Activity, Mail, AlertTriangle, ExternalLink, Users } from 'lucide-react';
import MedicationsTab from './caretaker/MedicationsTab';
import AppointmentsTab from './caretaker/AppointmentsTab';
import VitalsTab from './caretaker/VitalsTab';
import EmailCenterTab from './caretaker/EmailCenterTab';
import ProfilesTab from './caretaker/ProfilesTab';
import AddMedicationModal from './caretaker/AddMedicationModal';
import AddAppointmentModal from './caretaker/AddAppointmentModal';
import AddProfileModal from './caretaker/AddProfileModal';
import LogVitalModal from './caretaker/LogVitalModal';
import ChangePinModal from './caretaker/ChangePinModal';
import ResetConfirmModal from './caretaker/ResetConfirmModal';

const TABS = [
  { id: 'meds', label: 'Medications', icon: Pill },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'vitals', label: 'Vitals', icon: Activity },
  { id: 'emailCenter', label: 'Email Reminders (Google)', icon: Mail, iconClass: 'text-emerald-600' },
  { id: 'profiles', label: 'Profiles & PINs', icon: Users, iconClass: 'text-purple-600' }
];

export default function CaretakerView({
  patient,
  medications = [],
  appointments = [],
  vitals = [],
  refillAlerts = [],
  safetyWarnings = [],
  roles = [],
  onAddMedication,
  onDeleteMedication,
  onAddAppointment,
  onAddVital,
  onOpenEmailPreview,
  onOpenDrugInteractionModal,
  onUpdatePatient,
  onAddRole,
  onUpdateRole,
  onResetDemoData
}) {
  const [activeTab, setActiveTab] = useState('meds');
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddAptModal, setShowAddAptModal] = useState(false);
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [showLogVitalModal, setShowLogVitalModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [roleForPinChange, setRoleForPinChange] = useState(null);
  const [knownPins, setKnownPins] = useState({});
  const tabRefs = useRef([]);

  const getTabLabel = (tab) => {
    if (tab.id === 'meds') return `${tab.label} (${medications.length})`;
    if (tab.id === 'appointments') return `${tab.label} (${appointments.length})`;
    if (tab.id === 'profiles') return `${tab.label} (${roles.length})`;
    return tab.label;
  };

  const handleTabKeyDown = (event, index) => {
    let nextIndex = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = TABS.length - 1;
    if (nextIndex !== null) {
      event.preventDefault();
      setActiveTab(TABS[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-blue-100 text-blue-700">
              Primary Caretaker Portal
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Managing: {patient.name} ({patient.age} y/o)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Care &amp; Schedule Administration</h1>
          <p className="text-sm font-medium text-slate-500">
            Allergies: <span className="font-bold text-rose-600">{patient.allergies.join(', ')}</span> • Conditions:{' '}
            {patient.medicalConditions.join(', ')}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Caretaker sections"
          className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200"
        >
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[idx] = el; }}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selected ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.iconClass || ''}`} aria-hidden="true" />
                <span>{getTabLabel(tab)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {safetyWarnings.length > 0 && (
        <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-2xl shrink-0">
              <ShieldAlert className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                AI Drug Safety Alert Detected ({safetyWarnings.length} Warnings)
              </div>
              <h2 className="text-lg font-black text-rose-950 mt-0.5">{safetyWarnings[0].title}</h2>
              <p className="text-xs font-medium text-rose-800 mt-0.5 line-clamp-1">{safetyWarnings[0].description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenDrugInteractionModal}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shrink-0 shadow-sm"
          >
            Review Clinical Analysis
          </button>
        </div>
      )}

      {refillAlerts.length > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
            <div>
              <span className="font-bold text-sm text-amber-900">Pharmacy Refill Alert: </span>
              <span className="text-xs font-semibold text-amber-800">
                {refillAlerts.map(r => `${r.name} (${r.remainingCount} pills left)`).join(', ')}
              </span>
            </div>
          </div>
          <a
            href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pharmacy+Refill+Reminder&details=Refill+prescriptions+at+CVS/Walgreens"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1"
          >
            <span>Add Refill to GCal</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      )}

      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'meds' && (
          <MedicationsTab
            medications={medications}
            onDeleteMedication={onDeleteMedication}
            onOpenAddModal={() => setShowAddMedModal(true)}
            onOpenResetModal={() => setShowResetModal(true)}
          />
        )}
        {activeTab === 'appointments' && (
          <AppointmentsTab appointments={appointments} onOpenAddModal={() => setShowAddAptModal(true)} />
        )}
        {activeTab === 'vitals' && (
          <VitalsTab vitals={vitals} onOpenLogVitalModal={() => setShowLogVitalModal(true)} />
        )}
        {activeTab === 'emailCenter' && (
          <EmailCenterTab patientName={patient.name} onOpenEmailPreview={onOpenEmailPreview} />
        )}
        {activeTab === 'profiles' && (
          <ProfilesTab
            patient={patient}
            roles={roles}
            knownPins={knownPins}
            onUpdatePatient={onUpdatePatient}
            onOpenAddProfileModal={() => setShowAddProfileModal(true)}
            onSelectRoleForPinChange={setRoleForPinChange}
          />
        )}
      </div>

      <AddMedicationModal
        isOpen={showAddMedModal}
        onClose={() => setShowAddMedModal(false)}
        patientFirstName={patient.name.split(' ')[0]}
        onSubmit={onAddMedication}
      />
      <AddAppointmentModal
        isOpen={showAddAptModal}
        onClose={() => setShowAddAptModal(false)}
        onSubmit={onAddAppointment}
      />
      <AddProfileModal
        isOpen={showAddProfileModal}
        onClose={() => setShowAddProfileModal(false)}
        onSubmit={async (newRole) => {
          const created = await onAddRole(newRole);
          if (created?.id && newRole.pin) {
            setKnownPins(prev => ({ ...prev, [created.id]: newRole.pin }));
          }
        }}
      />
      <LogVitalModal
        isOpen={showLogVitalModal}
        onClose={() => setShowLogVitalModal(false)}
        onSubmit={onAddVital}
      />
      <ChangePinModal
        role={roleForPinChange}
        onClose={() => setRoleForPinChange(null)}
        onSubmit={(roleId, newPin) => {
          onUpdateRole(roleId, { pin: newPin });
          setKnownPins(prev => ({ ...prev, [roleId]: newPin }));
        }}
      />
      <ResetConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={onResetDemoData}
      />
    </div>
  );
}
