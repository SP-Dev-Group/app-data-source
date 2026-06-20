import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

export default function ReplicaConfigForm({ replicas, onUpdate, onAdd, onRemove, autoEntityName, projectName }) {
  const autoSecretName = `REPLICA_APP_${(projectName || '').replace(/\s+/g, '_').toUpperCase()}`;
  return (
    <div className="space-y-4">
      {replicas.map((replica, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Replica {index + 1}</h3>
            <Button variant="outline" size="sm" onClick={() => onRemove(index)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Replica App ID *</Label>
              <Input
                value={replica.appId}
                onChange={(e) => onUpdate(index, 'appId', e.target.value)}
                placeholder="App ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Replica Entity Name</Label>
              <Input
                value={replica.replicaEntityName}
                onChange={(e) => onUpdate(index, 'replicaEntityName', e.target.value)}
                placeholder={autoEntityName}
              />
            </div>
            <div className="space-y-2">
              <Label>Secret Name *</Label>
              <Input
                value={replica.secretName || autoSecretName}
                onChange={(e) => onUpdate(index, 'secretName', e.target.value)}
                placeholder={autoSecretName}
              />
            </div>
            <div className="space-y-2">
              <Label>Secret Value *</Label>
              <Input
                value={replica.secretValue}
                onChange={(e) => onUpdate(index, 'secretValue', e.target.value)}
                placeholder="Service role key"
                type="password"
              />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={onAdd}>
        <Plus className="w-4 h-4 mr-1" /> Add Another Replica
      </Button>
    </div>
  );
}