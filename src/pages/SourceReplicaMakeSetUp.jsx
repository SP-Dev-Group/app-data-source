import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Copy, Check, Trash2, BookOpen } from "lucide-react";
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
import TemplatesPanel from "@/components/setup/TemplatesPanel";
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

const EMPTY_FORM = {
  projectName: "",
  description: "",
  sourceEntityName: "",
  sourceSchemaOption: "create",
  sourceFields: [{ name: "", type: "string" }],
  sourceSchemaJson: "",
  createArchiveEntities: true,
  replicas: [{ secretName: "", secretValue: "", replicaEntityName: "" }],
  sourcePage: { mode: "create", fileName: "" },
  replicaPage: { mode: "create", fileName: "" },
};

export default function SourceReplicaMakeSetUp() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copiedSection, setCopiedSection] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null); // null = new, object = existing record
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [projectError, setProjectError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [savedAsUpdate, setSavedAsUpdate] = useState(false);

  const hasUnmetFields =
    !formData.projectName ||
    !formData.description ||
    !formData.sourceEntityName ||
    formData.replicas.some(r => !r.secretValue) ||
    !!projectError;

  const { data: existingTemplates } = useQuery({
    queryKey: ["SourceReplicaTemplateMakeReady"],
    queryFn: () => base44.entities.SourceReplicaTemplateMakeReady.list(),
  });

  const validateProjectName = (name) => {
    if (!name) return false;
    // When editing, allow same project name on the same record
    const exists = existingTemplates?.some(t => t.project_name === name && t.id !== editingRecord?.id);
    setProjectError(exists ? "Project name already exists. Please choose a different name." : "");
    return exists;
  };

  const recordToFormData = (tpl) => ({
    projectName: tpl.project_name || "",
    description: tpl.description || "",
    sourceEntityName: tpl.source_entity_name || "",
    sourceSchemaOption: tpl.source_schema_mode === "existing" ? "paste" : "create",
    sourceFields: tpl.source_fields?.map(f => ({ name: f.field_name, type: f.field_type })) || [{ name: "", type: "string" }],
    sourceSchemaJson: tpl.source_schema_json || "",
    createArchiveEntities: tpl.archive_entity_mode !== "existing",
    replicas: tpl.replica_configs?.map(r => ({
      replicaAppName: r.replica_entity_name || "",
      replicaEntityName: r.replica_entity_name || "",
      secretName: r.secret_name || "",
      secretValue: r.secret_value || "",
    })) || [{ secretName: "", secretValue: "", replicaEntityName: "" }],
    sourcePage: { mode: tpl.source_page_mode || "create", fileName: tpl.source_page_file_name || "" },
    replicaPage: { mode: tpl.replica_page_mode || "create", fileName: tpl.replica_page_file_name || "" },
  });

  const handleViewRecord = (tpl) => {
    setFormData(recordToFormData(tpl));
    setEditingRecord(tpl);
    setIsEditing(false);
    setSaveSuccess(false);
    setProjectError("");
    setFieldErrors({});
    setShowTemplates(false);
  };

  const handleEditRecord = (tpl) => {
    setFormData(recordToFormData(tpl));
    setEditingRecord(tpl);
    setIsEditing(true);
    setSaveSuccess(false);
    setProjectError("");
    setFieldErrors({});
    setShowTemplates(false);
  };

  const handleProjectNameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, projectName: value });
    validateProjectName(value);
    setFieldErrors(p => ({ ...p, projectName: false }));
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
    if (!formData.sourceEntityName) errors.sourceEntityName = true;
    formData.replicas.forEach((r, i) => {
      if (!r.secretValue) errors[`replica_secretValue_${i}`] = true;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Some field(s) still required before saving");
      return;
    }
    setFieldErrors({});

    if (validateProjectName(formData.projectName)) {
      toast.error("Project name already exists. Please choose a different name.");
      return;
    }

    const payload = {
      project_name: formData.projectName,
      description: formData.description,
      app_title: formData.projectName,
      source_entity_name: formData.sourceEntityName,
      source_schema_mode: formData.sourceSchemaOption === 'create' ? 'create_new' : 'existing',
      source_fields: formData.sourceFields.map(f => ({ field_name: f.name, field_type: f.type, is_required: false })),
      source_schema_json: formData.sourceSchemaJson,
      archive_entity_mode: formData.createArchiveEntities ? 'create_new' : 'existing',
      version_history_entity_mode: formData.createArchiveEntities ? 'create_new' : 'existing',
      source_page_mode: formData.sourcePage.mode,
      source_page_file_name: formData.sourcePage.fileName,
      replica_page_mode: formData.replicaPage.mode,
      replica_page_file_name: formData.replicaPage.fileName,
      replica_configs: formData.replicas.map((r, i) => ({
        replica_app_id: r.secretValue,
        replica_entity_name: r.replicaEntityName || (r.replicaAppName ? `Replica${r.replicaAppName.replace(/\s+/g,'')}${i + 1}` : `Replica${i + 1}`),
        secret_name: r.secretName || `REPLICA_APP_${formData.projectName.replace(/\s+/g, '_').toUpperCase()}`,
        secret_value: r.secretValue,
      })),
    };

    try {
      let savedId;
      let eventType;

      if (editingRecord) {
        // UPDATE existing record
        await base44.entities.SourceReplicaTemplateMakeReady.update(editingRecord.id, payload);
        savedId = editingRecord.id;
        eventType = "updated";
      } else {
        // CREATE new record
        const created = await base44.entities.SourceReplicaTemplateMakeReady.create(payload);
        savedId = created.id;
        eventType = "created";
      }

      // Write version history
      const history = await base44.entities.SourceReplicaTemplateVersionHistory.filter({ template_id: savedId });
      const version = history.length + 1;
      await base44.entities.SourceReplicaTemplateVersionHistory.create({
        template_id: savedId,
        project_name: formData.projectName,
        event_type: eventType,
        version,
        snapshot: JSON.stringify(payload),
      });

      queryClient.invalidateQueries({ queryKey: ["SourceReplicaTemplateMakeReady"] });
      setFormData({ ...EMPTY_FORM });
      setProjectError("");
      setFieldErrors({});
      setSavedAsUpdate(!!editingRecord);
      setIsEditing(false);
      setEditingRecord(null);
      setSaveSuccess(true);
    } catch (err) {
      toast.error(`Failed to save: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/menu")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Source Replica Setup Generator</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowTemplates(s => !s)}>
              <BookOpen className="w-4 h-4 mr-1" /> Templates
            </Button>
            <Button onClick={() => { setIsEditing(true); setEditingRecord(null); setSaveSuccess(false); setSavedAsUpdate(false); setFormData({ ...EMPTY_FORM }); setProjectError(""); setFieldErrors({}); }}>
              <Plus className="w-4 h-4 mr-1" /> New Template
            </Button>
          </div>
        </div>

        {showTemplates && (
          <div className="mb-6">
            <TemplatesPanel onView={handleViewRecord} onEdit={handleEditRecord} />
          </div>
        )}

        <div className={!isEditing ? "opacity-40 pointer-events-none select-none" : ""}>

        <Card className="mb-6">
          <CardHeader><CardTitle>Project Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input id="projectName" value={formData.projectName} onChange={handleProjectNameChange} placeholder="e.g. NewsBookSite Staff" className={!formData.projectName ? "border-red-500" : ""} />
                {projectError && <p className="text-sm text-destructive">{projectError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (max 20 chars) *</Label>
                <Input id="description" value={formData.description} onChange={(e) => { setFormData({ ...formData, description: e.target.value.slice(0, 20) }); }} placeholder="e.g. Staff" maxLength={20} className={!formData.description ? "border-red-500" : ""} />
                <p className="text-xs text-muted-foreground">{formData.description.length}/20</p>
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
                <Input id="sourceEntityName" value={formData.sourceEntityName} onChange={(e) => { setFormData({ ...formData, sourceEntityName: e.target.value }); }} placeholder="e.g. SourceSSOT10" className={!formData.sourceEntityName ? "border-red-500" : ""} />
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
              projectName={formData.projectName}
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

        </div>{/* end greyed-out wrapper */}

        <div className="flex items-center gap-3 mb-6">
          <Button onClick={handleSave} disabled={!isEditing || hasUnmetFields}>
            {editingRecord ? "Update Template" : "Save Template"}
          </Button>
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <Check className="w-4 h-4" /> {savedAsUpdate ? "Template Updated!" : "Success! New Template Added to Database"}
            </span>
          )}
          {!saveSuccess && isEditing && hasUnmetFields && (
            <span className="text-sm text-destructive">Some field(s) still required before saving</span>
          )}
        </div>

        <Tabs defaultValue="source" className="space-y-4">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-4">
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
              <CardContent className="space-y-4">
                <Alert><AlertDescription className="whitespace-pre-wrap font-mono text-xs">{generateSourceInstructions(formData)}</AlertDescription></Alert>
                {formData.sourcePage?.mode === 'create' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Source Page Code</h3>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateSourcePageCode(formData), 'source-page-inline')}>
                        {copiedSection === 'source-page-inline' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Page Code
                      </Button>
                    </div>
                    <Alert><AlertDescription className="whitespace-pre-wrap font-mono text-xs">{generateSourcePageCode(formData)}</AlertDescription></Alert>
                  </div>
                )}
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
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Backend Functions</CardTitle>
                  {(() => {
                    const p = formData.projectName.replace(/\s+/g, '');
                    return (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const all = formData.replicas.map((_, index) =>
                            [
                              `// --- pushToReplica${p} ---`,
                              generatePushFunction(formData, index),
                              `// --- deleteFromReplicas${p} ---`,
                              generateDeleteFunction(formData, index),
                              `// --- pushAllocatedRecord${p} ---`,
                              generateAllocateFunction(formData, index),
                              `// --- reinstateFromArchive${p} ---`,
                              generateReinstateFunction(formData, index),
                            ].join('\n\n')
                          ).join('\n\n// ==================\n\n');
                          copyToClipboard(all, 'all-functions');
                        }}
                      >
                        {copiedSection === 'all-functions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy All Functions
                      </Button>
                    );
                  })()}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.replicas.map((replica, index) => {
                  const p = formData.projectName.replace(/\s+/g, '');
                  return (
                    <div key={index} className="space-y-2">
                      <h3 className="font-semibold">Replica {index + 1}: {replica.replicaEntityName || (replica.replicaAppName ? `Replica${replica.replicaAppName.replace(/\s+/g,'')}` : 'Not configured')}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatePushFunction(formData, index), `push-${index}`)}>
                          {copiedSection === `push-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} pushToReplica{p}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateDeleteFunction(formData, index), `delete-${index}`)}>
                          {copiedSection === `delete-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} deleteFromReplicas{p}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateAllocateFunction(formData, index), `allocate-${index}`)}>
                          {copiedSection === `allocate-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} pushAllocatedRecord{p}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateReinstateFunction(formData, index), `reinstate-${index}`)}>
                          {copiedSection === `reinstate-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} reinstateFromArchive{p}
                        </Button>
                      </div>
                    </div>
                  );
                })}
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