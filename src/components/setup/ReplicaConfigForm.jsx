import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function ReplicaConfigForm({ replicas, onUpdate, onAdd, onRemove, autoEntityName, projectName }) {
  const autoSecretName = `REPLICA_APP_${(projectName || '').replace(/\s+/g, '_').toUpperCase()}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(autoSecretName);
    setCopied(true);
    toast.success("Secret name copied!");
    setTimeout(() => setCopied(false), 2000);
  };
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
              <Label>Replica Entity Name</Label>
              <Input
                value={replica.replicaEntityName || `${autoEntityName}${index + 1}`}
                onChange={(e) => onUpdate(index, 'replicaEntityName', e.target.value)}
                placeholder={`${autoEntityName}${index + 1}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Secret Name *</Label>
              <div className="flex gap-2">
                <Input
                  value={autoSecretName}
                  readOnly
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
                <Button variant="outline" size="icon" onClick={handleCopy} title="Copy secret name">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secret Value (Replica App ID) *</Label>
              <Input
                value={replica.secretValue}
                onChange={(e) => onUpdate(index, 'secretValue', e.target.value)}
                placeholder="Replica App ID"
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