import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPatients, getVisits, getCurrentDoctor, logout } from '@/lib/store';
import { analyzeVitals, checkDrugInteractions } from '@/lib/clinicalEngine';
import {
  Activity, Users, AlertTriangle, FileText, LogOut, Plus,
  Heart, Thermometer, TrendingUp, Bell, ChevronRight, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const navigate = useNavigate();
  const doctor = getCurrentDoctor();
  const patients = getPatients();
  const allVisits = getVisits();
  const [searchQuery, setSearchQuery] = useState('');

  // Generate alerts from latest visits
  const allAlerts = useMemo(() => {
    const alerts: { patientName: string; patientId: string; alert: ReturnType<typeof analyzeVitals>[0] }[] = [];
    for (const patient of patients) {
      const visits = allVisits.filter(v => v.patientId === patient.id).sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
      if (visits.length > 0) {
        const latest = visits[0];
        const vitalAlerts = analyzeVitals(latest.vitals, patient.age);
        const drugAlerts = checkDrugInteractions(latest.medicines);
        [...vitalAlerts, ...drugAlerts].forEach(a => alerts.push({ patientName: patient.name, patientId: patient.id, alert: a }));
      }
    }
    return alerts.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.alert.type] - order[b.alert.type];
    });
  }, [patients, allVisits]);

  const criticalCount = allAlerts.filter(a => a.alert.type === 'critical').length;
  const warningCount = allAlerts.filter(a => a.alert.type === 'warning').length;

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Smart CDSS</h1>
                <p className="text-xs text-muted-foreground">Clinical Decision Support</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                {criticalCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse-alert">
                    {criticalCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{doctor?.name}</p>
                <p className="text-xs text-muted-foreground">{doctor?.specialty}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Patients</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{patients.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-sm text-muted-foreground">Critical</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Warnings</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{warningCount}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Visits Today</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{allVisits.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Alert Feed */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Active Alerts</h2>
              <Link to="/alerts">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {allAlerts.slice(0, 8).map((item, i) => (
                <Link key={i} to={`/patients/${item.patientId}`}>
                  <div className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow animate-slide-in ${
                    item.alert.type === 'critical' ? 'alert-critical' : 
                    item.alert.type === 'warning' ? 'alert-warning' : 'alert-info'
                  }`} style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.alert.title}</p>
                        <p className="text-xs opacity-80 mt-0.5">{item.patientName}</p>
                        <p className="text-xs opacity-70 mt-1 line-clamp-2">{item.alert.message}</p>
                      </div>
                      <Badge variant={item.alert.type === 'critical' ? 'destructive' : 'secondary'} className="text-[10px] shrink-0">
                        {item.alert.type}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
              {allAlerts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No active alerts
                </div>
              )}
            </div>
          </div>

          {/* Patient List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">Patients</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-9 w-48"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Link to="/patients/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Patient
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {filteredPatients.map(patient => {
                const visits = allVisits.filter(v => v.patientId === patient.id);
                const latestVisit = visits.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())[0];
                const patientAlerts = allAlerts.filter(a => a.patientId === patient.id);

                return (
                  <Link key={patient.id} to={`/patients/${patient.id}`}>
                    <div className="medical-card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-semibold text-lg">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{patient.name}</h3>
                          {patientAlerts.some(a => a.alert.type === 'critical') && (
                            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-alert" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {patient.age}y • {patient.gender} • {patient.bloodType || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {patient.medicalHistory.slice(0, 2).map(h => (
                            <span key={h} className="vital-badge bg-secondary text-secondary-foreground">{h}</span>
                          ))}
                          {patient.medicalHistory.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{patient.medicalHistory.length - 2} more</span>
                          )}
                        </div>
                      </div>
                      <div className="hidden sm:block text-right shrink-0">
                        {latestVisit && (
                          <>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Thermometer className="w-3 h-3" />
                              {latestVisit.vitals.temperature}°F
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Heart className="w-3 h-3" />
                              {latestVisit.vitals.heartRate} bpm
                            </div>
                          </>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
