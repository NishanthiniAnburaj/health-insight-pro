import type { Patient, PatientVisit, Doctor, AuditLog } from './types';

// ─── Local Storage Data Store ───

const KEYS = {
  patients: 'cdss_patients',
  visits: 'cdss_visits',
  doctor: 'cdss_doctor',
  auditLogs: 'cdss_audit_logs',
  isAuthenticated: 'cdss_authenticated',
};

function get<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function set(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Auth ───

export function login(email: string, password: string): Doctor | null {
  // Demo credentials
  if (email === 'doctor@hospital.com' && password === 'doctor123') {
    const doctor: Doctor = { id: '1', name: 'Dr. Sarah Mitchell', specialty: 'Internal Medicine', email };
    set(KEYS.doctor, doctor);
    set(KEYS.isAuthenticated, true);
    addAuditLog(doctor.id, 'LOGIN', undefined, 'Doctor logged in');
    return doctor;
  }
  if (email === 'admin@hospital.com' && password === 'admin123') {
    const doctor: Doctor = { id: '2', name: 'Dr. James Carter', specialty: 'Cardiology', email };
    set(KEYS.doctor, doctor);
    set(KEYS.isAuthenticated, true);
    addAuditLog(doctor.id, 'LOGIN', undefined, 'Doctor logged in');
    return doctor;
  }
  return null;
}

export function logout() {
  const doc = getCurrentDoctor();
  if (doc) addAuditLog(doc.id, 'LOGOUT', undefined, 'Doctor logged out');
  set(KEYS.isAuthenticated, false);
  localStorage.removeItem(KEYS.doctor);
}

export function isAuthenticated(): boolean {
  return get(KEYS.isAuthenticated, false);
}

export function getCurrentDoctor(): Doctor | null {
  return get<Doctor | null>(KEYS.doctor, null);
}

// ─── Patients ───

export function getPatients(): Patient[] {
  return get<Patient[]>(KEYS.patients, SEED_PATIENTS);
}

export function getPatient(id: string): Patient | undefined {
  return getPatients().find(p => p.id === id);
}

export function addPatient(patient: Omit<Patient, 'id' | 'registeredDate'>): Patient {
  const patients = getPatients();
  const newPatient: Patient = {
    ...patient,
    id: crypto.randomUUID(),
    registeredDate: new Date().toISOString(),
  };
  patients.push(newPatient);
  set(KEYS.patients, patients);
  const doc = getCurrentDoctor();
  if (doc) addAuditLog(doc.id, 'REGISTER_PATIENT', newPatient.id, `Registered patient: ${newPatient.name}`);
  return newPatient;
}

export function updatePatient(id: string, updates: Partial<Patient>) {
  const patients = getPatients().map(p => p.id === id ? { ...p, ...updates } : p);
  set(KEYS.patients, patients);
}

// ─── Visits ───

export function getVisits(patientId?: string): PatientVisit[] {
  const visits = get<PatientVisit[]>(KEYS.visits, SEED_VISITS);
  return patientId ? visits.filter(v => v.patientId === patientId) : visits;
}

export function addVisit(visit: Omit<PatientVisit, 'id'>): PatientVisit {
  const visits = getVisits();
  const newVisit: PatientVisit = { ...visit, id: crypto.randomUUID() };
  visits.push(newVisit);
  set(KEYS.visits, visits);
  const doc = getCurrentDoctor();
  if (doc) addAuditLog(doc.id, 'ADD_VISIT', visit.patientId, `Added visit record`);
  return newVisit;
}

// ─── Audit Logs ───

export function addAuditLog(doctorId: string, action: string, patientId: string | undefined, details: string) {
  const logs = get<AuditLog[]>(KEYS.auditLogs, []);
  logs.push({ id: crypto.randomUUID(), doctorId, action, patientId, timestamp: new Date().toISOString(), details });
  set(KEYS.auditLogs, logs);
}

export function getAuditLogs(): AuditLog[] {
  return get<AuditLog[]>(KEYS.auditLogs, []);
}

// ─── Seed Data ───

const SEED_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'John Anderson',
    age: 62,
    gender: 'male',
    medicalHistory: ['Hypertension', 'Type 2 Diabetes', 'Previous MI (2021)'],
    currentMedications: ['Metformin', 'Lisinopril', 'Aspirin'],
    registeredDate: '2024-01-15',
    bloodType: 'A+',
    allergies: ['Penicillin'],
    emergencyContact: '+1-555-0101',
  },
  {
    id: 'p2',
    name: 'Maria Garcia',
    age: 45,
    gender: 'female',
    medicalHistory: ['Asthma', 'Migraine'],
    currentMedications: ['Albuterol', 'Sumatriptan'],
    registeredDate: '2024-03-22',
    bloodType: 'O-',
    allergies: ['Sulfa drugs'],
    emergencyContact: '+1-555-0202',
  },
  {
    id: 'p3',
    name: 'Robert Chen',
    age: 78,
    gender: 'male',
    medicalHistory: ['Atrial Fibrillation', 'Heart Failure', 'COPD'],
    currentMedications: ['Warfarin', 'Digoxin', 'Furosemide'],
    registeredDate: '2023-11-08',
    bloodType: 'B+',
    allergies: [],
    emergencyContact: '+1-555-0303',
  },
  {
    id: 'p4',
    name: 'Emily Watson',
    age: 34,
    gender: 'female',
    medicalHistory: ['Depression', 'Anxiety'],
    currentMedications: ['Sertraline', 'Tramadol'],
    registeredDate: '2024-06-10',
    bloodType: 'AB+',
    allergies: ['Latex'],
    emergencyContact: '+1-555-0404',
  },
];

const SEED_VISITS: PatientVisit[] = [
  {
    id: 'v1',
    patientId: 'p1',
    visitDate: '2024-12-01',
    symptoms: ['chest pain', 'fatigue', 'shortness of breath'],
    vitals: { temperature: 98.6, systolicBP: 155, diastolicBP: 95, heartRate: 88, bloodSugar: 220, oxygenLevel: 96 },
    medicines: ['Metformin', 'Lisinopril', 'Aspirin'],
    diagnosis: 'Hypertensive episode with hyperglycemia',
    alerts: [],
    riskScores: [],
    recommendations: [],
  },
  {
    id: 'v2',
    patientId: 'p1',
    visitDate: '2025-01-15',
    symptoms: ['chest pain', 'dizziness'],
    vitals: { temperature: 98.8, systolicBP: 148, diastolicBP: 92, heartRate: 92, bloodSugar: 195, oxygenLevel: 95 },
    medicines: ['Metformin', 'Lisinopril', 'Aspirin'],
    diagnosis: 'Follow-up for cardiac monitoring',
    alerts: [],
    riskScores: [],
    recommendations: [],
  },
  {
    id: 'v3',
    patientId: 'p3',
    visitDate: '2025-01-20',
    symptoms: ['shortness of breath', 'fatigue', 'swelling in legs'],
    vitals: { temperature: 98.2, systolicBP: 130, diastolicBP: 85, heartRate: 110, bloodSugar: 105, oxygenLevel: 90 },
    medicines: ['Warfarin', 'Digoxin', 'Furosemide'],
    diagnosis: 'Heart failure exacerbation',
    alerts: [],
    riskScores: [],
    recommendations: [],
  },
];
