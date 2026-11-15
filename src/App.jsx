import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SeniorView from './components/SeniorView';
import CaretakerView from './components/CaretakerView';
import FamilyView from './components/FamilyView';
import DoctorView from './components/DoctorView';
import PinPadModal from './components/PinPadModal';
import EmergencyModal from './components/EmergencyModal';
import EmailPreviewModal from './components/EmailPreviewModal';
import DrugInteractionModal from './components/DrugInteractionModal';
import NudgePopupModal from './components/NudgePopupModal';
import { api } from './services/apiService';
import { audioFeedback } from './services/audioService';
import { BRANDING } from './config/branding';

const DEFAULT_ROLE = {
  id: 'senior',
  name: 'Arthur (Senior)'
};

export default function App() {
  const [currentRole, setCurrentRole] = useState(DEFAULT_ROLE);
  const [roles, setRoles] = useState(() => api.getRoles());
  const [patient, setPatient] = useState(() => api.getPatient());
  const [medications, setMedications] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [refillAlerts, setRefillAlerts] = useState([]);
  const [safetyWarnings, setSafetyWarnings] = useState([]);
  const [loveNudges, setLoveNudges] = useState([]);
  const [vitals, setVitals] = useState(() => api.getVitals());

  // Accessibility State
  const [fontSize, setFontSize] = useState('font-standard');
  const [theme, setTheme] = useState('theme-default');
  const [speechEnabled, setSpeechEnabled] = useState(true);

  // Modals
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailPreviewData, setEmailPreviewData] = useState(null);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [activeNudgePopup, setActiveNudgePopup] = useState(null);

  useEffect(() => {
    document.documentElement.classList.remove('font-standard', 'font-large', 'font-xlarge');
    document.documentElement.classList.add(fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.body.classList.remove('theme-default', 'theme-contrast', 'theme-warm');
    document.body.classList.add(theme);
  }, [theme]);

  const refreshData = useCallback(async () => {
    const [medData, apts, adh, safety, nudges, apiPatient, apiVitals, apiRoles] = await Promise.all([
      api.getMedications(),
      api.getAppointments(),
      api.getAdherence(),
      api.checkSafety(),
      api.getNudges(),
      api.getPatientFromApi(),
      api.getVitalsFromApi(),
      api.getRolesFromApi()
    ]);

    setMedications(medData.medications || []);
    setTodaySchedule(medData.todaySchedule || []);
    setRefillAlerts(medData.refillAlerts || []);
    setAppointments(apts || []);
    setMetrics(adh.metrics);
    setSafetyWarnings(safety.warnings || []);
    setLoveNudges(nudges || []);
    if (apiPatient) setPatient(apiPatient);
    if (Array.isArray(apiVitals)) setVitals(apiVitals);
    if (Array.isArray(apiRoles)) setRoles(apiRoles);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleTakeMedication = async (medId) => {
    const res = await api.markMedicationTaken(medId);
    if (res.loveNudge) {
      setActiveNudgePopup(res.loveNudge);
    }
    await refreshData();
  };

  const handleSkipMedication = async (medId, reason) => {
    await api.markMedicationSkipped(medId, reason);
    await refreshData();
  };

  const handleAddMedication = async (medData) => {
    const res = await api.addMedication(medData);
    await refreshData();
    if (res.safetyWarnings && res.safetyWarnings.length > 0) {
      setSafetyWarnings(res.safetyWarnings);
      setIsSafetyModalOpen(true);
    }
  };

  const handleDeleteMedication = async (medId) => {
    await api.deleteMedication(medId);
    await refreshData();
  };

  const handleAddAppointment = async (aptData) => {
    await api.addAppointment(aptData);
    await refreshData();
  };

  const handleAddVital = async (vitalData) => {
    const created = await api.addVital(vitalData);
    setVitals(prev => [created, ...prev]);
  };

  const handleSendNudge = async (nudgeData) => {
    await api.sendNudge(nudgeData);
    await refreshData();
  };

  const handleTriggerSos = async () => {
    await api.triggerEmergencySos();
    setIsEmergencyModalOpen(true);
  };

  const handleUpdatePatient = async (updatedPatient) => {
    const saved = await api.updatePatient(updatedPatient);
    setPatient(saved);
  };

  const handleAddRole = async (newRole) => {
    const created = await api.addRole(newRole);
    const updatedRoles = await api.getRolesFromApi();
    setRoles(updatedRoles);
    return created;
  };

  const handleUpdateRole = async (roleId, updates) => {
    await api.updateRole(roleId, updates);
    const updatedRoles = await api.getRolesFromApi();
    setRoles(updatedRoles);
  };

  const handleResetDemoData = async () => {
    await api.resetToInitialData();
    audioFeedback.playSuccessChime();
    await refreshData();
  };

  const handleOpenEmailPreview = async (type) => {
    const data = type === 'urgent' ? await api.previewUrgentAlert() : await api.previewEmailBriefing();
    setEmailPreviewData(data);
    setIsEmailModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-700 focus:text-white focus:rounded-xl focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Navbar
        currentRole={currentRole}
        onOpenPinPad={() => setIsPinModalOpen(true)}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        theme={theme}
        onChangeTheme={setTheme}
        speechEnabled={speechEnabled}
        onToggleSpeech={() => setSpeechEnabled(prev => !prev)}
        onTriggerSos={handleTriggerSos}
      />

      <main id="main-content" className="flex-1 pb-16">
        {currentRole.id === 'senior' && (
          <SeniorView
            patient={patient}
            schedule={todaySchedule}
            appointments={appointments}
            onTakeMedication={handleTakeMedication}
            onSkipMedication={handleSkipMedication}
            onTriggerSos={handleTriggerSos}
            loveNudges={loveNudges}
          />
        )}
        {currentRole.id === 'caretaker' && (
          <CaretakerView
            patient={patient}
            medications={medications}
            appointments={appointments}
            vitals={vitals}
            refillAlerts={refillAlerts}
            safetyWarnings={safetyWarnings}
            roles={roles}
            onAddMedication={handleAddMedication}
            onDeleteMedication={handleDeleteMedication}
            onAddAppointment={handleAddAppointment}
            onAddVital={handleAddVital}
            onOpenEmailPreview={handleOpenEmailPreview}
            onOpenDrugInteractionModal={() => setIsSafetyModalOpen(true)}
            onUpdatePatient={handleUpdatePatient}
            onAddRole={handleAddRole}
            onUpdateRole={handleUpdateRole}
            onResetDemoData={handleResetDemoData}
          />
        )}
        {currentRole.id === 'family' && (
          <FamilyView patient={patient} metrics={metrics} onSendNudge={handleSendNudge} />
        )}
        {currentRole.id === 'doctor' && (
          <DoctorView patient={patient} medications={medications} metrics={metrics} />
        )}
      </main>

      <footer className="py-6 border-t border-slate-200 text-center text-xs font-semibold text-slate-500">
        {BRANDING.appName} Assistive Health Platform • Senior Accessibility &amp; Multi-User Ecosystem
      </footer>

      <PinPadModal
        isOpen={isPinModalOpen}
        roles={roles}
        onClose={() => setIsPinModalOpen(false)}
        onAuthenticated={(role) => {
          setCurrentRole(role);
          setIsPinModalOpen(false);
          audioFeedback.playSuccessChime();
        }}
      />
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        patient={patient}
        medications={medications}
      />
      <EmailPreviewModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        previewData={emailPreviewData}
      />
      <DrugInteractionModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        warnings={safetyWarnings}
      />
      <NudgePopupModal
        isOpen={Boolean(activeNudgePopup)}
        onClose={() => setActiveNudgePopup(null)}
        nudge={activeNudgePopup}
      />
    </div>
  );
}
