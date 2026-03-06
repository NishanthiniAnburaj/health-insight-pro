import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPatient, getVisits } from '@/lib/store';
import { analyzeVitals, checkDrugInteractions, calculateRiskScores, suggestDiseases, recommendDepartments } from '@/lib/clinicalEngine';
import {
  ArrowLeft, Plus, Heart, Thermometer, Droplets, Wind,
  Activity, Pill, AlertTriangle, FileText, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = getPatient(id!);
  const visits = getVisits(id!).sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Patient not found</p>
          <Link to="/dashboard"><Button className="mt-4">Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const latestVisit = visits[0];
  const alerts = latestVisit ? [
    ...analyzeVitals(latestVisit.vitals, patient.age),
    ...checkDrugInteractions(latestVisit.medicines),
  ] : [];
  const riskScores = latestVisit ? calculateRiskScores(latestVisit.vitals, patient.age, latestVisit.symptoms, patient.medicalHistory) : [];
  const diseaseRecs = latestVisit ? suggestDiseases(latestVisit.symptoms) : [];
  const deptRecs = latestVisit ? recommendDepartments(latestVisit.symptoms) : [];

  const riskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-warning';
      case 'moderate': return 'bg-primary';
      default: return 'bg-success';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">{patient.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{patient.name}</h1>
                <p className="text-sm text-muted-foreground">{patient.age}y • {patient.gender} • {patient.bloodType || 'Unknown'}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/patients/${id}/visit`}>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Visit</Button>
            </Link>
            <Link to={`/patients/${id}/report`}>
              <Button size="sm" variant="outline"><FileText className="w-4 h-4 mr-1" /> Report</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Patient info cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="medical-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Medical History</h3>
            <div className="flex flex-wrap gap-1.5">
              {patient.medicalHistory.map(h => (
                <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>
              ))}
              {patient.medicalHistory.length === 0 && <span className="text-sm text-muted-foreground">None recorded</span>}
            </div>
          </div>
          <div className="medical-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Medications</h3>
            <div className="flex flex-wrap gap-1.5">
              {patient.currentMedications.map(m => (
                <Badge key={m} variant="outline" className="text-xs"><Pill className="w-3 h-3 mr-1" />{m}</Badge>
              ))}
              {patient.currentMedications.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
            </div>
          </div>
          <div className="medical-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Allergies</h3>
            <div className="flex flex-wrap gap-1.5">
              {(patient.allergies || []).map(a => (
                <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
              ))}
              {(!patient.allergies || patient.allergies.length === 0) && <span className="text-sm text-muted-foreground">None known</span>}
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
            <TabsTrigger value="risks">Risk Scores</TabsTrigger>
            <TabsTrigger value="history">Visit History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {latestVisit ? (
              <>
                {/* Vitals */}
                <div className="medical-card">
                  <h3 className="font-semibold text-foreground mb-4">Latest Vitals — {new Date(latestVisit.visitDate).toLocaleDateString()}</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { icon: Thermometer, label: 'Temperature', value: `${latestVisit.vitals.temperature}°F`, warn: latestVisit.vitals.temperature > 100.4 },
                      { icon: Activity, label: 'Blood Pressure', value: `${latestVisit.vitals.systolicBP}/${latestVisit.vitals.diastolicBP}`, warn: latestVisit.vitals.systolicBP > 140 },
                      { icon: Heart, label: 'Heart Rate', value: `${latestVisit.vitals.heartRate} bpm`, warn: latestVisit.vitals.heartRate > 100 || latestVisit.vitals.heartRate < 50 },
                      { icon: Droplets, label: 'Blood Sugar', value: `${latestVisit.vitals.bloodSugar} mg/dL`, warn: latestVisit.vitals.bloodSugar > 200 },
                      { icon: Wind, label: 'SpO2', value: `${latestVisit.vitals.oxygenLevel}%`, warn: latestVisit.vitals.oxygenLevel < 92 },
                    ].map(v => (
                      <div key={v.label} className={`p-4 rounded-lg border ${v.warn ? 'border-destructive/40 bg-destructive/5' : 'bg-muted/50'}`}>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <v.icon className="w-4 h-4" />
                          <span className="text-xs">{v.label}</span>
                        </div>
                        <p className={`text-xl font-bold ${v.warn ? 'text-destructive' : 'text-foreground'}`}>{v.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Symptoms & Recommendations */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="medical-card">
                    <h3 className="font-semibold text-foreground mb-3">Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {latestVisit.symptoms.map(s => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="medical-card">
                    <h3 className="font-semibold text-foreground mb-3">Possible Conditions</h3>
                    {diseaseRecs.length > 0 ? (
                      <div className="space-y-3">
                        {diseaseRecs.map((r, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${r.urgency === 'high' ? 'bg-warning' : 'bg-primary'}`} />
                            <div>
                              <p className="text-sm font-medium text-foreground">{r.title}</p>
                              <p className="text-xs text-muted-foreground">{r.description}</p>
                              {r.department && <p className="text-xs text-primary mt-0.5">→ {r.department}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No conditions detected</p>
                    )}
                  </div>
                </div>

                {/* Department Recommendations */}
                {deptRecs.length > 0 && (
                  <div className="medical-card">
                    <h3 className="font-semibold text-foreground mb-3">Department Recommendations</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {deptRecs.map((r, i) => (
                        <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="font-medium text-sm text-foreground">{r.department}</p>
                          <ul className="mt-1 space-y-0.5">
                            {r.reasons.map((reason, ri) => (
                              <li key={ri} className="text-xs text-muted-foreground">• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="medical-card text-center py-12">
                <p className="text-muted-foreground">No visits recorded</p>
                <Link to={`/patients/${id}/visit`}>
                  <Button className="mt-4"><Plus className="w-4 h-4 mr-1" /> Record First Visit</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-3">
            {alerts.length > 0 ? alerts.map((alert, i) => (
              <div key={i} className={`p-5 rounded-lg border ${
                alert.type === 'critical' ? 'alert-critical' : alert.type === 'warning' ? 'alert-warning' : 'alert-info'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>{alert.type}</Badge>
                    </div>
                    <p className="text-sm mt-1 opacity-80">{alert.message}</p>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium opacity-70">Reasons:</p>
                      {alert.reasons.map((r, ri) => (
                        <p key={ri} className="text-xs opacity-70">• {r}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="medical-card text-center py-8 text-muted-foreground">
                <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No active alerts for this patient
              </div>
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            {riskScores.length > 0 ? riskScores.map((score, i) => (
              <div key={i} className="medical-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">{score.condition} Risk</h4>
                  <Badge className={`${riskColor(score.level)} text-primary-foreground`}>
                    {score.score}% — {score.level}
                  </Badge>
                </div>
                <Progress value={score.score} className="h-2 mb-3" />
                <div className="space-y-1">
                  {score.factors.map((f, fi) => (
                    <p key={fi} className="text-xs text-muted-foreground">• {f}</p>
                  ))}
                </div>
              </div>
            )) : (
              <div className="medical-card text-center py-8 text-muted-foreground">No risk data available</div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {visits.length > 0 ? visits.map(visit => (
              <div key={visit.id} className="medical-card">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{new Date(visit.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Symptoms</p>
                    <div className="flex flex-wrap gap-1">
                      {visit.symptoms.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Vitals</p>
                    <div className="text-xs text-foreground space-y-0.5">
                      <p>BP: {visit.vitals.systolicBP}/{visit.vitals.diastolicBP} • HR: {visit.vitals.heartRate} • Temp: {visit.vitals.temperature}°F</p>
                      <p>Sugar: {visit.vitals.bloodSugar} • SpO2: {visit.vitals.oxygenLevel}%</p>
                    </div>
                  </div>
                </div>
                {visit.diagnosis && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground font-medium">Diagnosis</p>
                    <p className="text-sm text-foreground">{visit.diagnosis}</p>
                  </div>
                )}
              </div>
            )) : (
              <div className="medical-card text-center py-8 text-muted-foreground">No visit history</div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PatientDetail;
