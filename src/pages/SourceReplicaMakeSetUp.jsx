import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Copy, Check, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SourceEntityForm from "@/components/setup/SourceEntityForm";
import ReplicaConfigForm from "@/components/setup/ReplicaConfigForm";
import PageModeSelector from "@/components/setup/PageModeSelector";
import {
  generateSourceInstructions,
  generateReplicaInstructions,
  generatePushFunction,
  generateDeleteFunction,
  generateAllocateFunction,
  generateReinstateFunction,
  generateSourcePageCode,
  generateReplicaPageCode,
} from "@/lib/codeGenerators";

export default function SourceReplicaMakeSetUp() {
  const navigate = useNavigate();
  const [copiedSection, setCopiedSection] = useState(null);
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    appTitle: "",
    sourceEntityName: "",
    sourceSchemaOption: "create",
    sourceFields: [{ name: "", type: "string" }],
    sourceSchemaJson: "",
    createArchiveEntities: true,
    replicas: [{ secretName: "", secretValue: "", replicaEntityName: "" }],
    sourcePage: { mode: "create", fileName: "" },
    replicaPage: { mode: "create", fileName: "" },
  });
  const [projectError, setProjectError] = useState("");
  const [editingAutoEntityName, setEditingAutoEntityName] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { data: existingTemplates } = useQuery({
    queryKey: ["SourceReplicaTemplateMakeReady"],
    queryFn: () => base44.entities.SourceReplicaTemplateMakeReady.list(),
  });

  const validateProjectName = (name) => {
    if (!name) return false;
    const exists = existingTemplates?.some(t => t.project_name === name);
    setProjectError(exists ? "Project name already exists. Please choose a different name." : "");
    return exists;
  };

  const handleProjectNameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, projectName: value });
    validateProjectName(value);
    setFieldErrors(p => ({ ...p, projectName: false }));
  };

  const getAutoReplicaEntityName = () => {
    if (formData.customAutoEntityName !== undefined) return formData.customAutoEntityName;
    const desc = formData.description.replace(/\s+/g, '');
    const title = formData.appTitle.replace(/\s+/g, '');
    return `Replica${desc}${title}`;
  };

  const addReplica = () => {
    setFormData({ ...formData, replicas: [...formData.replicas, { secretName: "", secretValue: "", replicaEntityName: "" }] });
  };

  const removeReplica = (index) => {
    if (formData.replicas.length === 1) {
      toast.error("At least one replica is required");
      return;
    }
    setFormData({ ...formData, replicas: formData.replicas.filter((_, i) => i !== index) });
  };

  const updateReplica = (index, field, value) => {
    const newReplicas = [...formData.replicas];
    newReplicas[index] = { ...newReplicas[index], [field]: value };
    setFormData({ ...formData, replicas: newReplicas });
  };

  const addSourceField = () => {
    setFormData({ ...formData, sourceFields: [...formData.sourceFields, { name: "", type: "string" }] });
  };

  const removeSourceField = (index) => {
    if (formData.sourceFields.length === 1) {
      toast.error("At least one field is required");
      return;
    }
    setFormData({ ...formData, sourceFields: formData.sourceFields.filter((_, i) => i !== index) });
  };

  const updateSourceField = (index, field, value) => {
    const newFields = [...formData.sourceFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setFormData({ ...formData, sourceFields: newFields });
  };

  const copyToClipboard = async (text, section) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.projectName) errors.projectName = true;
    if (!formData.description) errors.description = true;
    if (!formData.appTitle) errors.appTitle = true;
    if (!formData.sourceEntityName) errors.sourceEntityName = true;
    formData.replicas.forEach((r, i) => {
      if (!r.secretValue) errors[`replica_secretValue_${i}`] = true;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill in all required fields highlighted in red");
      return;
    }
    setFieldErrors({});

    if (validateProjectName(formData.projectName)) {
      toast.error("Project name already exists. Please choose a different name.");
      return;
    }
    try {
      await base44.entities.SourceReplicaTemplateMakeReady.create({
        project_name: formData.projectName,
        description: formData.description,
        app_title: formData.appTitle,
        source_entity_name: formData.sourceEntityName,
        source_schema_mode: formData.sourceSchemaOption === 'create' ? 'create_new' : 'existing',
        source_fields: formData.sourceFields.map(f => ({ field_name: f.name, field_type: f.type, is_required: false })),
        source_schema_json: formData.sourceSchemaJson,
        archive_entity_mode: formData.createArchiveEntities ? 'create_new' : 'existing',
        version_history_entity_mode: formData.createArchiveEntities ? 'create_new' : 'existing',
        replica_configs: formData.replicas.map((r, i) => ({
          replica_app_id: r.secretValue,
          replica_entity_name: r.replicaEntityName || (getAutoReplicaEntityName() + (i + 1)),
          secret_name: r.secretName || `REPLICA_APP_${formData.projectName.replace(/\s+/g, '_').toUpperCase()}`,
          secret_value: r.secretValue,
        })),
      });
      toast.success("Template saved successfully!");
    } catch (err) {
      toast.error(`Failed to save: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/menu")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Source Replica Setup Generator</h1>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle>Project Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input id="projectName" value={formData.projectName} onChange={handleProjectNameChange} placeholder="e.g. NewsBookSite Staff" className={fieldErrors.projectName ? "border-red-500" : ""} />
                {projectError && <p className="text-sm text-destructive">{projectError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (max 20 chars) *</Label>
                <Input id="description" value={formData.description} onChange={(e) => { setFormData({ ...formData, description: e.target.value.slice(0, 20) }); setFieldErrors(p => ({ ...p, description: false })); }} placeholder="e.g. Staff" maxLength={20} className={fieldErrors.description ? "border-red-500" : ""} />
                <p className="text-xs text-muted-foreground">{formData.description.length}/20</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appTitle">App Title *</Label>
              <Input id="appTitle" value={formData.appTitle} onChange={(e) => { setFormData({ ...formData, appTitle: e.target.value }); setFieldErrors(p => ({ ...p, appTitle: false })); }} placeholder="e.g. Manager" className={fieldErrors.appTitle ? "border-red-500" : ""} />
            </div>
            <div className="space-y-2">
              <Label>Auto-generated Replica Entity Name</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.customAutoEntityName ?? getAutoReplicaEntityName()}
                  readOnly={!editingAutoEntityName}
                  onChange={(e) => setFormData({ ...formData, customAutoEntityName: e.target.value })}
                  className={!editingAutoEntityName ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                />
                <Button
                  variant="outline"
                  size="icon"
                  title="Edit auto entity name"
                  onClick={() => setEditingAutoEntityName(v => !v)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Source Entity Configuration</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sourceEntityName">Source Entity Name *</Label>
                <Input id="sourceEntityName" value={formData.sourceEntityName} onChange={(e) => { setFormData({ ...formData, sourceEntityName: e.target.value }); setFieldErrors(p => ({ ...p, sourceEntityName: false })); }} placeholder="e.g. SourceSSOT10" className={fieldErrors.sourceEntityName ? "border-red-500" : ""} />
              </div>
              <SourceEntityForm
                sourceSchemaOption={formData.sourceSchemaOption}
                sourceFields={formData.sourceFields}
                sourceSchemaJson={formData.sourceSchemaJson}
                createArchive={formData.createArchiveEntities}
                onSchemaOptionChange={(v) => setFormData({ ...formData, sourceSchemaOption: v ? 'create' : 'paste' })}
                onFieldChange={updateSourceField}
                onAddField={addSourceField}
                onRemoveField={removeSourceField}
                onSchemaJsonChange={(v) => setFormData({ ...formData, sourceSchemaJson: v })}
                onArchiveChange={(v) => setFormData({ ...formData, createArchiveEntities: v })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Replica Apps</CardTitle></CardHeader>
          <CardContent>
            <ReplicaConfigForm
              replicas={formData.replicas}
              onUpdate={updateReplica}
              onAdd={addReplica}
              onRemove={removeReplica}
              autoEntityName={getAutoReplicaEntityName()}
              projectName={formData.projectName}
              fieldErrors={fieldErrors}
              onClearError={(key) => setFieldErrors(p => ({ ...p, [key]: false }))}
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle>Page Configuration</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-6">
            <PageModeSelector
              label="Source App Page"
              value={formData.sourcePage}
              onChange={(v) => setFormData({ ...formData, sourcePage: v })}
            />
            <PageModeSelector
              label="Replica App Page"
              value={formData.replicaPage}
              onChange={(v) => setFormData({ ...formData, replicaPage: v })}
            />
          </CardContent>
        </Card>

        <div className="flex gap-2 mb-6">
          <Button onClick={handleSave} disabled={!!projectError}>Save Template</Button>
        </div>

        <Tabs defaultValue="source" className="space-y-4">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="source">SOURCE Instructions</TabsTrigger>
            <TabsTrigger value="replica">REPLICA Instructions</TabsTrigger>
            <TabsTrigger value="functions">Function Code</TabsTrigger>
            <TabsTrigger value="page">Page Code</TabsTrigger>
          </TabsList>

          <TabsContent value="source">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>SOURCE App Setup Instructions</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateSourceInstructions(formData), 'source-instructions')}>
                    {copiedSection === 'source-instructions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Alert><AlertDescription className="whitespace-pre-wrap font-mono text-xs">{generateSourceInstructions(formData)}</AlertDescription></Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="replica">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>REPLICA App Setup Instructions</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateReplicaInstructions(formData), 'replica-instructions')}>
                    {copiedSection === 'replica-instructions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Alert><AlertDescription className="whitespace-pre-wrap font-mono text-xs">{generateReplicaInstructions(formData)}</AlertDescription></Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="functions">
            <Card>
              <CardHeader><CardTitle>Backend Functions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {formData.replicas.map((replica, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold">Replica {index + 1}: {replica.replicaEntityName || getAutoReplicaEntityName() + (index + 1) || 'Not configured'}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatePushFunction(formData, index), `push-${index}`)}>
                        {copiedSection === `push-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} pushToReplica
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateDeleteFunction(formData, index), `delete-${index}`)}>
                        {copiedSection === `delete-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} deleteFromReplicas
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateAllocateFunction(formData, index), `allocate-${index}`)}>
                        {copiedSection === `allocate-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} pushAllocatedRecord
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateReinstateFunction(formData, index), `reinstate-${index}`)}>
                        {copiedSection === `reinstate-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} reinstateFromArchive
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="page">
            <Card>
              <CardHeader><CardTitle>Page Code</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Source App Page</h3>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateSourcePageCode(formData), 'source-page')}>
                    {copiedSection === 'source-page' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Source Page Code
                  </Button>
                  <Alert><AlertDescription className="whitespace-pre-wrap font-mono text-xs">{generateSourcePageCode(formData)}</AlertDescription></Alert>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Replica App Page</h3>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateReplicaPageCode(formData), 'replica-page')}>
                    {copiedSection === 'replica-page' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Replica Page Code
                  </Button>
                  <Alert><AlertDescription className="whitespace-pre-wrap font-mono text-xs">{generateReplicaPageCode(formData)}</AlertDescription></Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}