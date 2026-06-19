import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, RefreshCw, Users, Loader2, RotateCw } from "lucide-react";

export default function StaffAllocationManager() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});
  const [syncing, setSyncing] = useState({});

  const loadData = async () => {
    setLoading(true);
    setError(null);

    // Load staff from source app via backend function
    const staffRes = await base44.functions.invoke('listSourceStaff', {});
    if (staffRes.data?.error) {
      setError(staffRes.data.error);
      setLoading(false);
      return;
    }
    const staffList = staffRes.data?.staff || [];

    // Load configs - filter to StaffSSOT with replica_app_id set
    const allConfigs = await base44.entities.SourceReplicaConfig.list();
    const configMap = {};
    allConfigs
      .filter(c => c.source_entity_name === 'StaffSSOT' && c.replica_app_id)
      .forEach(c => {
        if (!configMap[c.project_name] || c.created_date > configMap[c.project_name].created_date) {
          configMap[c.project_name] = c;
        }
      });

    // Load allocations
    const allocs = await base44.entities.StaffAllocation.list('-created_date', 500);
    const allocMap = {};
    allocs.forEach(a => { allocMap[a.unique_id] = a; });

    setStaff(staffList);
    setConfigs(Object.values(configMap));
    setAllocations(allocMap);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const isAllocated = (uniqueId, projectName) => {
    return allocations[uniqueId]?.allocated_projects?.includes(projectName) || false;
  };

  const handleToggle = async (staffRecord, projectName) => {
    const uid = staffRecord.unique_id || staffRecord.staff_id;
    const key = `${uid}:${projectName}`;
    setProcessing(p => ({ ...p, [key]: true }));

    const currently = isAllocated(uid, projectName);

    // Push or withdraw via backend
    if (currently) {
      await base44.functions.invoke('withdrawFromReplica', { unique_id: uid, project_name: projectName });
    } else {
      await base44.functions.invoke('allocatedPush', { unique_id: uid, project_name: projectName });
    }

    // Update local allocation record
    const existing = allocations[uid];
    const currentProjects = existing?.allocated_projects || [];
    const newProjects = currently
      ? currentProjects.filter(p => p !== projectName)
      : [...currentProjects, projectName];

    if (existing) {
      await base44.entities.StaffAllocation.update(existing.id, {
        allocated_projects: newProjects,
        staff_name: staffRecord.full_name || ''
      });
    } else {
      await base44.entities.StaffAllocation.create({
        unique_id: uid,
        staff_name: staffRecord.full_name || '',
        allocated_projects: newProjects
      });
    }

    // Refresh allocations
    const allocs = await base44.entities.StaffAllocation.list('-created_date', 500);
    const allocMap = {};
    allocs.forEach(a => { allocMap[a.unique_id] = a; });
    setAllocations(allocMap);
    setProcessing(p => ({ ...p, [key]: false }));
  };

  const handleSyncRow = async (staffRecord) => {
    const uid = staffRecord.unique_id || staffRecord.staff_id;
    const alloc = allocations[uid];
    const projects = alloc?.allocated_projects || [];
    if (projects.length === 0) return;

    setSyncing(s => ({ ...s, [uid]: true }));
    for (const projectName of projects) {
      await base44.functions.invoke('allocatedPush', { unique_id: uid, project_name: projectName });
    }
    setSyncing(s => ({ ...s, [uid]: false }));
  };

  const getShortName = (projectName) => {
    return projectName.replace('StaffSSOTfor', '').replace('App', '');
  };

  // Sort: unallocated first
  const sortedStaff = [...staff].sort((a, b) => {
    const aAlloc = allocations[a.unique_id || a.staff_id]?.allocated_projects?.length || 0;
    const bAlloc = allocations[b.unique_id || b.staff_id]?.allocated_projects?.length || 0;
    return aAlloc - bAlloc;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-0 left-0 right-0 h-[15px] bg-black">
        <div className="h-full w-full bg-purple-500" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Staff Allocation Manager
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Control which downstream apps receive each staff record
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/base44menu")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        <p className="text-xs text-muted-foreground mb-4">
          {staff.length} staff record{staff.length !== 1 ? 's' : ''} · {configs.length} downstream app{configs.length !== 1 ? 's' : ''}
        </p>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Unique ID</th>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  {configs.map(c => (
                    <th key={c.project_name} className="text-center px-4 py-3 font-medium whitespace-nowrap">
                      {getShortName(c.project_name)}
                    </th>
                  ))}
                  <th className="text-center px-4 py-3 font-medium">Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {sortedStaff.map(s => {
                  const uid = s.unique_id || s.staff_id;
                  const allocCount = allocations[uid]?.allocated_projects?.length || 0;
                  const isUnallocated = allocCount === 0;
                  return (
                    <tr key={uid || s.id} className={isUnallocated ? "bg-yellow-50/60 hover:bg-yellow-50" : "hover:bg-muted/40"}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {uid}
                        {isUnallocated && <span className="ml-2 text-[10px] font-semibold text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded">NEW</span>}
                      </td>
                      <td className="px-4 py-3">{s.full_name}</td>
                      {configs.map(c => {
                        const key = `${uid}:${c.project_name}`;
                        const allocated = isAllocated(uid, c.project_name);
                        const busy = processing[key];
                        return (
                          <td key={c.project_name} className="px-4 py-3 text-center">
                            {busy ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                            ) : (
                              <Switch
                                checked={allocated}
                                onCheckedChange={() => handleToggle(s, c.project_name)}
                              />
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center">
                        {syncing[uid] ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={allocCount === 0}
                            onClick={() => handleSyncRow(s)}
                            title="Re-push to all allocated apps"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={3 + configs.length} className="px-4 py-8 text-center text-muted-foreground">
                      No staff records found in source app.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}