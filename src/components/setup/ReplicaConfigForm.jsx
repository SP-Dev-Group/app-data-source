import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Copy, Check, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function ReplicaConfigForm({ replicas, onUpdate, onAdd, onRemove, projectName }) {
  const autoSecretName = `REPLICA_APP_${(projectName || '').replace(/\s+/g, '_').toUpperCase()}`;
  const [copied, setCopied] = useState(false);
  const [editingEntityName, setEditingEntityName] = useState({});
  const [editingSecretName, setEditingSecretName] = useState({});
  const [editingSecretValue, setEditingSecretValue] = useState({});

  const handleCopy = () => {
    navigator.clipboard.writeText(autoSecretName);
    setCopied(true);
    toast.success("Secret name copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {replicas.map((replica, index) => {
        const defaultEntityName = `Replica${index + 1}`;
        const defaultSecretName = autoSecretName;
        const isEditingEntity = editingEntityName[index];
        const isEditingSecret = editingSecretName[index];
        const isEditingSecretValue = editingSecretValue[index];

        const autoEntityFromName = replica.replicaAppName
          ? `Replica${replica.replicaAppName.replace(/\s+/g, '')}${index + 1}`
          : defaultEntityName;

        return (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Replica {index + 1}</h3>
              <Button variant="outline" size="sm" onClick={() => onRemove(index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Replica App Name *</Label>
                <Input
                  value={replica.replicaAppName || ""}
                  onChange={(e) => onUpdate(index, 'replicaAppName', e.target.value)}
                  placeholder="e.g. NewsBookSite"
                />
              </div>
              <div className="space-y-2">
                <Label>Replica Entity Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={replica.replicaEntityName || autoEntityFromName}
                    onChange={(e) => onUpdate(index, 'replicaEntityName', e.target.value)}
                    readOnly={!isEditingEntity}
                    className={!isEditingEntity ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                    placeholder={autoEntityFromName}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    title="Edit entity name"
                    onClick={() => setEditingEntityName(prev => ({ ...prev, [index]: !prev[index] }))}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secret Name *</Label>
                <div className="flex gap-2">
                  <Input
                    value={replica.secretName || defaultSecretName}
                    onChange={(e) => onUpdate(index, 'secretName', e.target.value)}
                    readOnly={!isEditingSecret}
                    className={!isEditingSecret ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    title="Edit secret name"
                    onClick={() => setEditingSecretName(prev => ({ ...prev, [index]: !prev[index] }))}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleCopy} title="Copy secret name">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secret Value (Replica App ID) *</Label>
                <div className="flex gap-2">
                  <Input
                    value={replica.secretValue}
                    onChange={(e) => onUpdate(index, 'secretValue', e.target.value)}
                    readOnly={!isEditingSecretValue}
                    className={!isEditingSecretValue ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                    placeholder="Replica App ID"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    title="Edit secret value"
                    onClick={() => setEditingSecretValue(prev => ({ ...prev, [index]: !prev[index] }))}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <Button variant="outline" onClick={onAdd}>
        <Plus className="w-4 h-4 mr-1" /> Add Another Replica
      </Button>
    </div>
  );
}