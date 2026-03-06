import type { Alert, Vitals, RiskScore, Recommendation, DrugInteraction, PatientVisit, Patient } from './types';

// ─── Clinical Rule Engine ───

export function analyzeVitals(vitals: Vitals, age: number): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  if (vitals.systolicBP > 140 || vitals.diastolicBP > 90) {
    alerts.push({
      id: crypto.randomUUID(),
      type: vitals.systolicBP > 180 ? 'critical' : 'warning',
      title: 'Hypertension Risk',
      message: `Blood pressure is ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`,
      reasons: [
        `BP is ${vitals.systolicBP}/${vitals.diastolicBP} (normal < 120/80)`,
        ...(age > 50 ? ['Age above 50 increases risk'] : []),
        ...(vitals.systolicBP > 180 ? ['Hypertensive crisis level - immediate attention needed'] : []),
      ],
      timestamp: now,
    });
  }

  if (vitals.bloodSugar > 200) {
    alerts.push({
      id: crypto.randomUUID(),
      type: vitals.bloodSugar > 300 ? 'critical' : 'warning',
      title: 'Diabetes Risk',
      message: `Blood sugar level is ${vitals.bloodSugar} mg/dL`,
      reasons: [
        `Blood sugar is ${vitals.bloodSugar} mg/dL (normal fasting < 100)`,
        vitals.bloodSugar > 300 ? 'Dangerously high - risk of diabetic ketoacidosis' : 'Significantly elevated glucose levels',
      ],
      timestamp: now,
    });
  }

  if (vitals.temperature > 102) {
    alerts.push({
      id: crypto.randomUUID(),
      type: vitals.temperature > 104 ? 'critical' : 'warning',
      title: 'High Fever',
      message: `Temperature is ${vitals.temperature}°F`,
      reasons: [
        `Temperature ${vitals.temperature}°F exceeds normal range (97-99°F)`,
        vitals.temperature > 104 ? 'Hyperpyrexia - risk of organ damage' : 'May indicate active infection',
      ],
      timestamp: now,
    });
  }

  if (vitals.heartRate > 120 && vitals.systolicBP < 90) {
    alerts.push({
      id: crypto.randomUUID(),
      type: 'critical',
      title: '⚠ Possible Shock Alert',
      message: 'Tachycardia with hypotension detected',
      reasons: [
        `Heart rate ${vitals.heartRate} bpm (>120) with systolic BP ${vitals.systolicBP} (<90)`,
        'This combination suggests possible circulatory shock',
        'Immediate medical intervention required',
      ],
      timestamp: now,
    });
  }

  if (vitals.oxygenLevel < 92) {
    alerts.push({
      id: crypto.randomUUID(),
      type: vitals.oxygenLevel < 88 ? 'critical' : 'warning',
      title: 'Low Oxygen Saturation',
      message: `SpO2 is ${vitals.oxygenLevel}%`,
      reasons: [
        `Oxygen saturation ${vitals.oxygenLevel}% (normal > 95%)`,
        vitals.oxygenLevel < 88 ? 'Severe hypoxemia - supplemental oxygen needed immediately' : 'Moderate hypoxemia detected',
      ],
      timestamp: now,
    });
  }

  if (vitals.heartRate > 100) {
    alerts.push({
      id: crypto.randomUUID(),
      type: vitals.heartRate > 150 ? 'critical' : 'info',
      title: 'Tachycardia',
      message: `Heart rate is ${vitals.heartRate} bpm`,
      reasons: [`Heart rate ${vitals.heartRate} bpm exceeds normal resting range (60-100 bpm)`],
      timestamp: now,
    });
  }

  if (vitals.heartRate < 50) {
    alerts.push({
      id: crypto.randomUUID(),
      type: 'warning',
      title: 'Bradycardia',
      message: `Heart rate is ${vitals.heartRate} bpm`,
      reasons: [`Heart rate ${vitals.heartRate} bpm below normal resting range (60-100 bpm)`],
      timestamp: now,
    });
  }

  return alerts;
}

// ─── Drug Interaction Database ───

const DRUG_INTERACTIONS: DrugInteraction[] = [
  { drug1: 'warfarin', drug2: 'aspirin', severity: 'severe', description: 'Risk of internal bleeding. Both drugs affect blood clotting.' },
  { drug1: 'warfarin', drug2: 'ibuprofen', severity: 'severe', description: 'Increased bleeding risk. NSAIDs potentiate anticoagulant effect.' },
  { drug1: 'metformin', drug2: 'alcohol', severity: 'moderate', description: 'Risk of lactic acidosis. Alcohol impairs lactate metabolism.' },
  { drug1: 'lisinopril', drug2: 'potassium', severity: 'moderate', description: 'Risk of hyperkalemia. ACE inhibitors increase potassium retention.' },
  { drug1: 'simvastatin', drug2: 'amiodarone', severity: 'severe', description: 'Risk of rhabdomyolysis. Amiodarone inhibits statin metabolism.' },
  { drug1: 'methotrexate', drug2: 'ibuprofen', severity: 'severe', description: 'Reduced methotrexate clearance. Risk of toxicity.' },
  { drug1: 'ssri', drug2: 'tramadol', severity: 'severe', description: 'Risk of serotonin syndrome. Both increase serotonin levels.' },
  { drug1: 'digoxin', drug2: 'amiodarone', severity: 'severe', description: 'Increased digoxin levels. Risk of toxicity and arrhythmia.' },
  { drug1: 'ciprofloxacin', drug2: 'theophylline', severity: 'moderate', description: 'Increased theophylline levels. Risk of seizures.' },
  { drug1: 'clopidogrel', drug2: 'omeprazole', severity: 'moderate', description: 'Reduced clopidogrel effectiveness. Omeprazole inhibits CYP2C19.' },
];

export function checkDrugInteractions(medicines: string[]): Alert[] {
  const alerts: Alert[] = [];
  const meds = medicines.map(m => m.toLowerCase().trim());

  for (const interaction of DRUG_INTERACTIONS) {
    const has1 = meds.some(m => m.includes(interaction.drug1));
    const has2 = meds.some(m => m.includes(interaction.drug2));
    if (has1 && has2) {
      alerts.push({
        id: crypto.randomUUID(),
        type: interaction.severity === 'severe' ? 'critical' : 'warning',
        title: `Drug Interaction: ${interaction.drug1} + ${interaction.drug2}`,
        message: interaction.description,
        reasons: [
          `Patient is taking both ${interaction.drug1} and ${interaction.drug2}`,
          `Interaction severity: ${interaction.severity}`,
          interaction.description,
        ],
        timestamp: new Date().toISOString(),
      });
    }
  }
  return alerts;
}

// ─── Symptom-Based Disease Suggestion ───

interface DiseaseRule {
  disease: string;
  requiredSymptoms: string[];
  optionalSymptoms: string[];
  minMatch: number;
  department: string;
}

const DISEASE_RULES: DiseaseRule[] = [
  { disease: 'Viral Infection', requiredSymptoms: ['fever'], optionalSymptoms: ['cough', 'fatigue', 'body ache', 'headache', 'sore throat'], minMatch: 2, department: 'Internal Medicine' },
  { disease: 'Influenza (Flu)', requiredSymptoms: ['fever', 'cough'], optionalSymptoms: ['fatigue', 'body ache', 'chills', 'headache'], minMatch: 2, department: 'Internal Medicine' },
  { disease: 'Respiratory Infection', requiredSymptoms: ['cough'], optionalSymptoms: ['fever', 'shortness of breath', 'chest pain', 'wheezing', 'fatigue'], minMatch: 2, department: 'Pulmonology' },
  { disease: 'Pneumonia', requiredSymptoms: ['fever', 'cough', 'shortness of breath'], optionalSymptoms: ['chest pain', 'fatigue', 'chills'], minMatch: 3, department: 'Pulmonology' },
  { disease: 'Gastroenteritis', requiredSymptoms: ['nausea'], optionalSymptoms: ['vomiting', 'diarrhea', 'abdominal pain', 'fever', 'fatigue'], minMatch: 2, department: 'Gastroenterology' },
  { disease: 'Migraine', requiredSymptoms: ['severe headache'], optionalSymptoms: ['nausea', 'vomiting', 'sensitivity to light', 'dizziness'], minMatch: 2, department: 'Neurology' },
  { disease: 'Urinary Tract Infection', requiredSymptoms: ['painful urination'], optionalSymptoms: ['frequent urination', 'fever', 'abdominal pain', 'back pain'], minMatch: 2, department: 'Urology' },
  { disease: 'Coronary Artery Disease', requiredSymptoms: ['chest pain'], optionalSymptoms: ['shortness of breath', 'fatigue', 'dizziness', 'sweating'], minMatch: 2, department: 'Cardiology' },
  { disease: 'Asthma Exacerbation', requiredSymptoms: ['wheezing', 'shortness of breath'], optionalSymptoms: ['cough', 'chest tightness'], minMatch: 2, department: 'Pulmonology' },
  { disease: 'Diabetic Emergency', requiredSymptoms: ['excessive thirst', 'frequent urination'], optionalSymptoms: ['fatigue', 'blurred vision', 'nausea', 'confusion'], minMatch: 2, department: 'Endocrinology' },
];

export function suggestDiseases(symptoms: string[]): Recommendation[] {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase().trim());
  const recommendations: Recommendation[] = [];

  for (const rule of DISEASE_RULES) {
    const allRuleSymptoms = [...rule.requiredSymptoms, ...rule.optionalSymptoms];
    const matchedSymptoms = allRuleSymptoms.filter(s => lowerSymptoms.some(ls => ls.includes(s) || s.includes(ls)));
    const requiredMet = rule.requiredSymptoms.every(s => lowerSymptoms.some(ls => ls.includes(s) || s.includes(ls)));

    if (requiredMet && matchedSymptoms.length >= rule.minMatch) {
      const confidence = Math.min(95, Math.round((matchedSymptoms.length / allRuleSymptoms.length) * 100) + 20);
      recommendations.push({
        title: `Possible: ${rule.disease}`,
        description: `${confidence}% symptom match based on ${matchedSymptoms.length} matching symptoms`,
        department: rule.department,
        reasons: [
          `Matching symptoms: ${matchedSymptoms.join(', ')}`,
          `Recommended department: ${rule.department}`,
        ],
        urgency: confidence > 70 ? 'high' : 'moderate',
      });
    }
  }

  return recommendations.sort((a, b) => {
    const urgencyOrder = { emergency: 0, high: 1, moderate: 2, low: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

// ─── Department Recommendation ───

const SYMPTOM_DEPARTMENTS: Record<string, { department: string; urgency: 'low' | 'moderate' | 'high' | 'emergency' }> = {
  'chest pain': { department: 'Cardiology', urgency: 'high' },
  'severe headache': { department: 'Neurology', urgency: 'high' },
  'headache': { department: 'Neurology', urgency: 'moderate' },
  'breathing difficulty': { department: 'Pulmonology', urgency: 'high' },
  'shortness of breath': { department: 'Pulmonology', urgency: 'high' },
  'abdominal pain': { department: 'Gastroenterology', urgency: 'moderate' },
  'joint pain': { department: 'Orthopedics', urgency: 'moderate' },
  'skin rash': { department: 'Dermatology', urgency: 'low' },
  'blurred vision': { department: 'Ophthalmology', urgency: 'moderate' },
  'painful urination': { department: 'Urology', urgency: 'moderate' },
  'anxiety': { department: 'Psychiatry', urgency: 'moderate' },
  'depression': { department: 'Psychiatry', urgency: 'moderate' },
  'ear pain': { department: 'ENT', urgency: 'low' },
  'dizziness': { department: 'Neurology', urgency: 'moderate' },
  'seizure': { department: 'Neurology', urgency: 'emergency' },
};

export function recommendDepartments(symptoms: string[]): Recommendation[] {
  const departments = new Map<string, Recommendation>();
  const lowerSymptoms = symptoms.map(s => s.toLowerCase().trim());

  for (const symptom of lowerSymptoms) {
    for (const [key, value] of Object.entries(SYMPTOM_DEPARTMENTS)) {
      if (symptom.includes(key) || key.includes(symptom)) {
        if (!departments.has(value.department)) {
          departments.set(value.department, {
            title: `Refer to ${value.department}`,
            description: `Based on presented symptoms`,
            department: value.department,
            reasons: [`Symptom "${symptom}" suggests ${value.department} consultation`],
            urgency: value.urgency,
          });
        } else {
          departments.get(value.department)!.reasons.push(`Symptom "${symptom}" also points to ${value.department}`);
        }
      }
    }
  }

  return Array.from(departments.values());
}

// ─── Risk Score Calculation ───

export function calculateRiskScores(vitals: Vitals, age: number, symptoms: string[], medicalHistory: string[]): RiskScore[] {
  const scores: RiskScore[] = [];

  // Heart disease risk
  let heartScore = 0;
  const heartFactors: string[] = [];
  if (vitals.systolicBP > 140) { heartScore += 25; heartFactors.push(`High systolic BP: ${vitals.systolicBP}`); }
  if (vitals.heartRate > 100) { heartScore += 15; heartFactors.push(`Elevated heart rate: ${vitals.heartRate}`); }
  if (age > 50) { heartScore += 15; heartFactors.push(`Age factor: ${age}`); }
  if (symptoms.some(s => s.toLowerCase().includes('chest pain'))) { heartScore += 30; heartFactors.push('Chest pain reported'); }
  if (medicalHistory.some(h => h.toLowerCase().includes('heart') || h.toLowerCase().includes('cardiac'))) { heartScore += 20; heartFactors.push('Cardiac history'); }
  scores.push({ condition: 'Heart Disease', score: Math.min(100, heartScore), level: getLevel(heartScore), factors: heartFactors });

  // Diabetes risk
  let diabetesScore = 0;
  const diabetesFactors: string[] = [];
  if (vitals.bloodSugar > 200) { diabetesScore += 40; diabetesFactors.push(`Blood sugar: ${vitals.bloodSugar} mg/dL`); }
  else if (vitals.bloodSugar > 140) { diabetesScore += 20; diabetesFactors.push(`Elevated blood sugar: ${vitals.bloodSugar} mg/dL`); }
  if (age > 45) { diabetesScore += 10; diabetesFactors.push(`Age: ${age}`); }
  if (medicalHistory.some(h => h.toLowerCase().includes('diabetes'))) { diabetesScore += 30; diabetesFactors.push('Diabetes history'); }
  if (symptoms.some(s => s.toLowerCase().includes('thirst') || s.toLowerCase().includes('frequent urination'))) { diabetesScore += 20; diabetesFactors.push('Classic diabetes symptoms'); }
  scores.push({ condition: 'Diabetes', score: Math.min(100, diabetesScore), level: getLevel(diabetesScore), factors: diabetesFactors });

  // Infection risk
  let infectionScore = 0;
  const infectionFactors: string[] = [];
  if (vitals.temperature > 100.4) { infectionScore += 30; infectionFactors.push(`Temperature: ${vitals.temperature}°F`); }
  if (symptoms.some(s => ['fever', 'cough', 'sore throat', 'fatigue'].some(k => s.toLowerCase().includes(k)))) { infectionScore += 25; infectionFactors.push('Infection-related symptoms'); }
  if (vitals.heartRate > 100) { infectionScore += 10; infectionFactors.push('Elevated heart rate (possible infection response)'); }
  scores.push({ condition: 'Infection', score: Math.min(100, infectionScore), level: getLevel(infectionScore), factors: infectionFactors });

  return scores.filter(s => s.score > 0);
}

function getLevel(score: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

// ─── Patient History Analysis ───

export function analyzePatientHistory(patient: Patient, currentVisit: { symptoms: string[]; vitals: Vitals }, previousVisits: PatientVisit[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();
  const currentSymptoms = currentVisit.symptoms.map(s => s.toLowerCase());

  for (const visit of previousVisits) {
    const pastSymptoms = visit.symptoms.map(s => s.toLowerCase());
    const recurring = currentSymptoms.filter(s => pastSymptoms.some(ps => ps.includes(s) || s.includes(ps)));

    if (recurring.length > 0) {
      const newSymptoms = currentSymptoms.filter(s => !pastSymptoms.some(ps => ps.includes(s) || s.includes(ps)));

      if (newSymptoms.length > 0) {
        // Check for heart disease progression
        if (recurring.includes('chest pain') && newSymptoms.some(s => s.includes('shortness of breath') || s.includes('fatigue'))) {
          alerts.push({
            id: crypto.randomUUID(),
            type: 'critical',
            title: 'Possible Heart Disease Progression',
            message: 'Recurring chest pain with new symptoms detected',
            reasons: [
              `Past visit (${new Date(visit.visitDate).toLocaleDateString()}): ${recurring.join(', ')}`,
              `New symptoms: ${newSymptoms.join(', ')}`,
              'Pattern suggests possible progression of cardiac condition',
              'Recommend immediate cardiology consultation',
            ],
            timestamp: now,
          });
        }

        alerts.push({
          id: crypto.randomUUID(),
          type: 'info',
          title: 'Recurring Symptoms Detected',
          message: `${recurring.length} symptoms match previous visit on ${new Date(visit.visitDate).toLocaleDateString()}`,
          reasons: [
            `Recurring symptoms: ${recurring.join(', ')}`,
            ...(newSymptoms.length > 0 ? [`New symptoms since last visit: ${newSymptoms.join(', ')}`] : []),
            'Consider reviewing treatment effectiveness',
          ],
          timestamp: now,
        });
      }
    }
  }

  return alerts;
}

// ─── Full Analysis ───

export function runFullAnalysis(
  patient: Patient,
  symptoms: string[],
  vitals: Vitals,
  medicines: string[],
  previousVisits: PatientVisit[]
): {
  alerts: Alert[];
  riskScores: RiskScore[];
  recommendations: Recommendation[];
  departmentRecommendations: Recommendation[];
} {
  const vitalAlerts = analyzeVitals(vitals, patient.age);
  const drugAlerts = checkDrugInteractions(medicines);
  const historyAlerts = analyzePatientHistory(patient, { symptoms, vitals }, previousVisits);
  const diseaseRecommendations = suggestDiseases(symptoms);
  const departmentRecommendations = recommendDepartments(symptoms);
  const riskScores = calculateRiskScores(vitals, patient.age, symptoms, patient.medicalHistory);

  return {
    alerts: [...vitalAlerts, ...drugAlerts, ...historyAlerts],
    riskScores,
    recommendations: diseaseRecommendations,
    departmentRecommendations,
  };
}
