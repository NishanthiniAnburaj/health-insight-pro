export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string[];
  currentMedications: string[];
  registeredDate: string;
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: string;
}

export interface Vitals {
  temperature: number;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  bloodSugar: number;
  oxygenLevel: number;
}

export interface PatientVisit {
  id: string;
  patientId: string;
  visitDate: string;
  symptoms: string[];
  vitals: Vitals;
  medicines: string[];
  diagnosis?: string;
  notes?: string;
  alerts: Alert[];
  riskScores: RiskScore[];
  recommendations: Recommendation[];
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  reasons: string[];
  timestamp: string;
}

export interface RiskScore {
  condition: string;
  score: number; // 0-100
  level: 'low' | 'moderate' | 'high' | 'critical';
  factors: string[];
}

export interface Recommendation {
  title: string;
  description: string;
  department?: string;
  reasons: string[];
  urgency: 'low' | 'moderate' | 'high' | 'emergency';
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface AuditLog {
  id: string;
  doctorId: string;
  action: string;
  patientId?: string;
  timestamp: string;
  details: string;
}
