import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPatient } from '@/lib/store';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', age: '', gender: '' as 'male' | 'female' | 'other' | '',
    bloodType: '', emergencyContact: '', allergies: '', medicalHistory: '', currentMedications: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.gender) return;

    addPatient({
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender as 'male' | 'female' | 'other',
      medicalHistory: form.medicalHistory.split(',').map(s => s.trim()).filter(Boolean),
      currentMedications: form.currentMedications.split(',').map(s => s.trim()).filter(Boolean),
      bloodType: form.bloodType || undefined,
      allergies: form.allergies.split(',').map(s => s.trim()).filter(Boolean),
      emergencyContact: form.emergencyContact || undefined,
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Register New Patient</h1>
            <p className="text-sm text-muted-foreground">Enter patient details</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="medical-card space-y-5">
            <h2 className="font-semibold text-foreground">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Age *</Label>
                <Input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required min={0} max={150} placeholder="45" />
              </div>
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v as any }))}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Select value={form.bloodType} onValueChange={v => setForm(f => ({ ...f, bloodType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input value={form.emergencyContact} onChange={e => setForm(f => ({ ...f, emergencyContact: e.target.value }))} placeholder="+1-555-0100" />
            </div>
          </div>

          <div className="medical-card space-y-5">
            <h2 className="font-semibold text-foreground">Medical Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Allergies</Label>
                <Input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="Penicillin, Latex (comma separated)" />
              </div>
              <div className="space-y-2">
                <Label>Medical History</Label>
                <Input value={form.medicalHistory} onChange={e => setForm(f => ({ ...f, medicalHistory: e.target.value }))} placeholder="Hypertension, Diabetes (comma separated)" />
              </div>
              <div className="space-y-2">
                <Label>Current Medications</Label>
                <Input value={form.currentMedications} onChange={e => setForm(f => ({ ...f, currentMedications: e.target.value }))} placeholder="Metformin, Lisinopril (comma separated)" />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <UserPlus className="w-4 h-4 mr-2" /> Register Patient
          </Button>
        </form>
      </main>
    </div>
  );
};

export default PatientRegistration;
