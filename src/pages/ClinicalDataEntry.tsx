import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatient, getVisits, addVisit } from '@/lib/store';
import { runFullAnalysis } from '@/lib/clinicalEngine';
import type { Vitals } from '@/lib/types';
import { ArrowLeft, Stethoscope, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const COMMON_SYMPTOMS = [
  'fever', 'cough', 'fatigue', 'headache', 'chest pain', 'shortness of breath',
  'nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'dizziness', 'body ache',
  'sore throat', 'wheezing', 'joint pain', 'back pain', 'chills', 'sweating',
  'blurred vision', 'painful urination', 'skin rash', 'severe headache',
  'swelling in legs', 'excessive thirst', 'frequent urination', 'confusion',
];

const ClinicalDataEntry = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = getPatient(id!);

  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [vitals, setVitals] = useState<Vitals>({
    temperature: 98.6,
    systolicBP: 120,
    diastolicBP: 80,
    heartRate: 72,
    bloodSugar: 100,
    oxygenLevel: 98,
  });
  const [medicines, setMedicines] = useState<string[]>(patient?.currentMedications || []);
  const [newMedicine, setNewMedicine] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  if (!patient) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Patient not found</p></div>;
  }

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !symptoms.includes(customSymptom.trim().toLowerCase())) {
      setSymptoms(prev => [...prev, customSymptom.trim().toLowerCase()]);
      setCustomSymptom('');
    }
  };

  const addMedicine = () => {
    if (newMedicine.trim() && !medicines.includes(newMedicine.trim())) {
      setMedicines(prev => [...prev, newMedicine.trim()]);
      setNewMedicine('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const previousVisits = getVisits(id!);
    const analysis = runFullAnalysis(patient, symptoms, vitals, medicines, previousVisits);

    addVisit({
      patientId: id!,
      visitDate: new Date().toISOString(),
      symptoms,
      vitals,
      medicines,
      diagnosis: diagnosis || undefined,
      alerts: analysis.alerts,
      riskScores: analysis.riskScores,
      recommendations: [...analysis.recommendations, ...analysis.departmentRecommendations],
    });

    navigate(`/patients/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Clinical Data Entry</h1>
            <p className="text-sm text-muted-foreground">Patient: {patient.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symptoms */}
          <div className="medical-card space-y-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" /> Symptoms
            </h2>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className={`vital-badge border cursor-pointer transition-colors ${
                    symptoms.includes(s) 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-muted text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom symptom..."
                value={customSymptom}
                onChange={e => setCustomSymptom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSymptom())}
              />
              <Button type="button" variant="outline" onClick={addCustomSymptom}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-xs text-muted-foreground self-center">Selected:</span>
                {symptoms.map(s => (
                  <Badge key={s} className="gap-1">
                    {s}
                    <button type="button" onClick={() => toggleSymptom(s)}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Vitals */}
          <div className="medical-card space-y-4">
            <h2 className="font-semibold text-foreground">Vital Signs</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Temperature (°F)</Label>
                <Input type="number" step="0.1" value={vitals.temperature} onChange={e => setVitals(v => ({ ...v, temperature: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Systolic BP (mmHg)</Label>
                <Input type="number" value={vitals.systolicBP} onChange={e => setVitals(v => ({ ...v, systolicBP: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Diastolic BP (mmHg)</Label>
                <Input type="number" value={vitals.diastolicBP} onChange={e => setVitals(v => ({ ...v, diastolicBP: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Heart Rate (bpm)</Label>
                <Input type="number" value={vitals.heartRate} onChange={e => setVitals(v => ({ ...v, heartRate: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Blood Sugar (mg/dL)</Label>
                <Input type="number" value={vitals.bloodSugar} onChange={e => setVitals(v => ({ ...v, bloodSugar: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Oxygen Level (%)</Label>
                <Input type="number" value={vitals.oxygenLevel} onChange={e => setVitals(v => ({ ...v, oxygenLevel: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
          </div>

          {/* Medicines */}
          <div className="medical-card space-y-4">
            <h2 className="font-semibold text-foreground">Current Medications</h2>
            <div className="flex flex-wrap gap-2">
              {medicines.map(m => (
                <Badge key={m} variant="outline" className="gap-1">
                  {m}
                  <button type="button" onClick={() => setMedicines(prev => prev.filter(x => x !== m))}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add medication..."
                value={newMedicine}
                onChange={e => setNewMedicine(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMedicine())}
              />
              <Button type="button" variant="outline" onClick={addMedicine}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="medical-card space-y-4">
            <h2 className="font-semibold text-foreground">Diagnosis / Notes</h2>
            <Input placeholder="Enter diagnosis or notes..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Stethoscope className="w-4 h-4 mr-2" /> Run Analysis & Save Visit
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ClinicalDataEntry;
