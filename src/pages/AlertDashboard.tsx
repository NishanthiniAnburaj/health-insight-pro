import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPatients, getVisits } from '@/lib/store';
import { analyzeVitals, checkDrugInteractions } from '@/lib/clinicalEngine';
import { ArrowLeft, AlertTriangle, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AlertDashboard = () => {
  const navigate = useNavigate();
  const patients = getPatients();
  const allVisits = getVisits();

  const allAlerts = useMemo(() => {
    const alerts: { patientName: string; patientId: string; alert: ReturnType<typeof analyzeVitals>[0] }[] = [];
    for (const patient of patients) {
      const visits = allVisits.filter(v => v.patientId === patient.id).sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
      if (visits.length > 0) {
        const latest = visits[0];
        [...analyzeVitals(latest.vitals, patient.age), ...checkDrugInteractions(latest.medicines)].forEach(a =>
          alerts.push({ patientName: patient.name, patientId: patient.id, alert: a })
        );
      }
    }
    return alerts.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.alert.type] - order[b.alert.type];
    });
  }, [patients, allVisits]);

  const critical = allAlerts.filter(a => a.alert.type === 'critical');
  const warnings = allAlerts.filter(a => a.alert.type === 'warning');
  const info = allAlerts.filter(a => a.alert.type === 'info');

  const renderAlertSection = (title: string, alerts: typeof allAlerts, icon: React.ReactNode) => (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        {icon} {title} ({alerts.length})
      </h2>
      {alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">No {title.toLowerCase()}</p>
      ) : (
        alerts.map((item, i) => (
          <Link key={i} to={`/patients/${item.patientId}`}>
            <div className={`p-5 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
              item.alert.type === 'critical' ? 'alert-critical' : item.alert.type === 'warning' ? 'alert-warning' : 'alert-info'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">{item.alert.title}</h4>
                  <p className="text-xs opacity-70 mt-0.5">Patient: {item.patientName}</p>
                  <p className="text-sm mt-2 opacity-80">{item.alert.message}</p>
                  <div className="mt-2 space-y-0.5">
                    {item.alert.reasons.map((r, ri) => (
                      <p key={ri} className="text-xs opacity-60">• {r}</p>
                    ))}
                  </div>
                </div>
                <Badge variant={item.alert.type === 'critical' ? 'destructive' : 'secondary'}>{item.alert.type}</Badge>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Alert Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">{allAlerts.length} total alerts across {patients.length} patients</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {renderAlertSection('Critical Alerts', critical, <AlertTriangle className="w-5 h-5 text-destructive" />)}
        {renderAlertSection('Warnings', warnings, <Shield className="w-5 h-5 text-warning" />)}
        {renderAlertSection('Information', info, <Bell className="w-5 h-5 text-primary" />)}
      </main>
    </div>
  );
};

export default AlertDashboard;
