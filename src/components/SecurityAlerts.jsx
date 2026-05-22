import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Shield, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SecurityAlerts({ service, compact = false }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const loadAlerts = async () => {
    setLoading(true);
    const all = await base44.entities.SecurityAlert.filter({ service });
    // Show unactioned or unread first; fully completed ones last
    all.sort((a, b) => new Date(b.check_date) - new Date(a.check_date));
    setAlerts(all);
    setLoading(false);
  };

  useEffect(() => { loadAlerts(); }, [service]);

  const update = async (id, data) => {
    await base44.entities.SecurityAlert.update(id, data);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const pendingAlerts = alerts.filter(a => !a.read_confirmed || !a.google_side_actioned || !a.our_side_actioned);
  const doneAlerts = alerts.filter(a => a.read_confirmed && a.google_side_actioned && a.our_side_actioned);

  if (loading) return null;
  if (alerts.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${pendingAlerts.length > 0 ? 'bg-amber-50 border-b border-amber-200' : 'bg-muted/30 border-b'}`}>
        <div className="flex items-center gap-2">
          <Shield className={`h-4 w-4 ${pendingAlerts.length > 0 ? 'text-amber-600' : 'text-muted-foreground'}`} />
          <span className="font-medium text-sm">
            Security Alerts
            {pendingAlerts.length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">{pendingAlerts.length}</span>
            )}
          </span>
        </div>
        {doneAlerts.length > 0 && (
          <span className="text-xs text-muted-foreground">{doneAlerts.length} completed</span>
        )}
      </div>

      {/* Pending alerts */}
      {pendingAlerts.map(alert => (
        <AlertCard
          key={alert.id}
          alert={alert}
          expanded={!!expanded[alert.id]}
          onToggle={() => setExpanded(p => ({ ...p, [alert.id]: !p[alert.id] }))}
          onUpdate={(data) => update(alert.id, data)}
        />
      ))}

      {/* Completed alerts (collapsed by default) */}
      {doneAlerts.length > 0 && !compact && (
        <details className="group">
          <summary className="px-4 py-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/20 list-none flex items-center gap-1">
            <ChevronDown className="h-3 w-3 group-open:hidden" />
            <ChevronUp className="h-3 w-3 hidden group-open:block" />
            Show {doneAlerts.length} completed alert{doneAlerts.length > 1 ? 's' : ''}
          </summary>
          {doneAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              expanded={!!expanded[alert.id]}
              onToggle={() => setExpanded(p => ({ ...p, [alert.id]: !p[alert.id] }))}
              onUpdate={(data) => update(alert.id, data)}
              dimmed
            />
          ))}
        </details>
      )}
    </div>
  );
}

function AlertCard({ alert, expanded, onToggle, onUpdate, dimmed = false }) {
  const isFullyDone = alert.read_confirmed && alert.google_side_actioned && alert.our_side_actioned;

  return (
    <div className={`border-b last:border-0 ${dimmed ? 'opacity-60' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-muted/10"
      >
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {isFullyDone
            ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            : <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          }
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
            <p className="text-xs text-muted-foreground">{alert.service} · {new Date(alert.check_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-muted-foreground">{alert.summary}</p>

          {alert.action_items?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Action Items:</p>
              <ul className="space-y-1">
                {alert.action_items.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="flex-shrink-0 text-primary font-medium">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Acknowledgement controls */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              variant={alert.read_confirmed ? "secondary" : "outline"}
              className="text-xs h-7"
              onClick={() => onUpdate({ read_confirmed: !alert.read_confirmed })}
            >
              {alert.read_confirmed ? "✓ Read" : "Mark as Read"}
            </Button>
            <Button
              size="sm"
              variant={alert.google_side_actioned ? "secondary" : "outline"}
              className="text-xs h-7"
              onClick={() => onUpdate({ google_side_actioned: !alert.google_side_actioned })}
            >
              {alert.google_side_actioned ? "✓ Google Side Done" : "Google Side Actioned"}
            </Button>
            <Button
              size="sm"
              variant={alert.our_side_actioned ? "secondary" : "outline"}
              className="text-xs h-7"
              onClick={() => onUpdate({ our_side_actioned: !alert.our_side_actioned })}
            >
              {alert.our_side_actioned ? "✓ Our Side Done" : "Our Side Actioned"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}