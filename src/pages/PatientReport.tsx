import { useParams, useNavigate } from 'react-router-dom';
import { getPatient, getVisits, getCurrentDoctor } from '@/lib/store';
import { runFullAnalysis } from '@/lib/clinicalEngine';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PatientReport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = getPatient(id!);
  const visits = getVisits(id!).sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  const doctor = getCurrentDoctor();
  const latestVisit = visits[0];

  if (!patient) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Patient not found</p></div>;
  }

  const analysis = latestVisit
    ? runFullAnalysis(patient, latestVisit.symptoms, latestVisit.vitals, latestVisit.medicines, visits.slice(1))
    : null;

  const riskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive' as const;
      case 'high': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Patient Case Report</h1>
              <p className="text-sm text-muted-foreground">{patient.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print Report
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="medical-card space-y-8">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Clinical Case Summary</h2>
            </div>
            <p className="text-sm text-muted-foreground">Generated: {new Date().toLocaleString()}</p>
            {doctor && <p className="text-sm text-muted-foreground">Physician: {doctor.name} — {doctor.specialty}</p>}
          </div>

          {/* Patient Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Patient Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{patient.name}</span></div>
              <div><span className="text-muted-foreground">Age:</span> <span className="font-medium text-foreground">{patient.age}</span></div>
              <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium text-foreground capitalize">{patient.gender}</span></div>
              <div><span className="text-muted-foreground">Blood Type:</span> <span className="font-medium text-foreground">{patient.bloodType || 'Unknown'}</span></div>
              <div className="col-span-2"><span className="text-muted-foreground">History:</span> <span className="font-medium text-foreground">{patient.medicalHistory.join(', ') || 'None'}</span></div>
            </div>
          </div>

          <Separator />

          {latestVisit && analysis && (
            <>
              {/* Current Visit */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Current Visit — {new Date(latestVisit.visitDate).toLocaleDateString()}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Symptoms</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {latestVisit.symptoms.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Vital Signs</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 text-sm text-foreground">
                      <p>Temperature: {latestVisit.vitals.temperature}°F</p>
                      <p>BP: {latestVisit.vitals.systolicBP}/{latestVisit.vitals.diastolicBP} mmHg</p>
                      <p>HR: {latestVisit.vitals.heartRate} bpm</p>
                      <p>Blood Sugar: {latestVisit.vitals.bloodSugar} mg/dL</p>
                      <p>SpO2: {latestVisit.vitals.oxygenLevel}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Medications</p>
                    <p className="text-sm text-foreground mt-1">{latestVisit.medicines.join(', ') || 'None'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Detected Risks */}
              {analysis.alerts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Detected Risks & Alerts</h3>
                  <div className="space-y-3">
                    {analysis.alerts.map((alert, i) => (
                      <div key={i} className={`p-4 rounded-lg border ${
                        alert.type === 'critical' ? 'alert-critical' : alert.type === 'warning' ? 'alert-warning' : 'alert-info'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{alert.title}</span>
                          <Badge variant={riskColor(alert.type)}>{alert.type}</Badge>
                        </div>
                        <p className="text-xs mt-1 opacity-80">{alert.message}</p>
                        <ul className="mt-2 space-y-0.5">
                          {alert.reasons.map((r, ri) => <li key={ri} className="text-xs opacity-60">• {r}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Scores */}
              {analysis.riskScores.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Risk Assessment</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {analysis.riskScores.map((score, i) => (
                      <div key={i} className="p-4 rounded-lg border bg-muted/50">
                        <p className="font-medium text-sm text-foreground">{score.condition}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{score.score}%</p>
                        <Badge variant={riskColor(score.level)} className="mt-1">{score.level}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Clinical Recommendations</h3>
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec, i) => (
                      <div key={i} className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="font-medium text-sm text-foreground">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                        {rec.department && <p className="text-xs text-primary mt-1 font-medium">Department: {rec.department}</p>}
                        <ul className="mt-2 space-y-0.5">
                          {rec.reasons.map((r, ri) => <li key={ri} className="text-xs text-muted-foreground">• {r}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.departmentRecommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Department Referrals</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {analysis.departmentRecommendations.map((rec, i) => (
                      <div key={i} className="p-3 rounded-lg border bg-accent/5 border-accent/20">
                        <p className="font-medium text-sm text-foreground">{rec.department}</p>
                        <ul className="mt-1 space-y-0.5">
                          {rec.reasons.map((r, ri) => <li key={ri} className="text-xs text-muted-foreground">• {r}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!latestVisit && (
            <div className="text-center py-8 text-muted-foreground">No visit data available for report generation.</div>
          )}

          {/* Footer */}
          <div className="text-center border-t pt-6 text-xs text-muted-foreground">
            <p>Smart CDSS — Clinical Decision Support System</p>
            <p>This report is generated for clinical reference only. All decisions should be validated by the attending physician.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientReport;
