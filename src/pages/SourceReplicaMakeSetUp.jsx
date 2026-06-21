import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Copy, Check, Trash2, BookOpen, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import SourceEntityForm from "@/components/setup/SourceEntityForm";
import ReplicaConfigForm from "@/components/setup/ReplicaConfigForm";
import PageModeSelector from "@/components/setup/PageModeSelector";
import TemplatesPanel from "@/components/setup/TemplatesPanel";
import {
  generateSourceInstructions,
  generateReplicaInstructions,
  generateSourceUpdateInstructions,
  generateReplicaUpdateInstructions,
  generatePushFunction,
  generateDeleteFunction,
  generateAllocateFunction,
  generateReinstateFunction,
  generateSourcePageCode,
  generateReplicaPageCode,
  generateSourcePageSubscriptionSnippet,
  generateReplicaPageSubscriptionSnippet,
} from "@/lib/codeGenerators";

const EMPTY_FORM = {
  projectName: "",
  description: "",
  sourceEntityName: "",
  sourceSchemaOption: "create",
  sourceFields: [{ name: "", type: "string" }],
  sourceSchemaJson: "",
  replicas: [{ secretName: "", secretValue: "", replicaEntityName: "" }],
  sourcePage: { mode: "create", fileName: "" },
  replicaPage: { mode: "create", fileName: "" },
};

export default function SourceReplicaMakeSetUp() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copiedSection, setCopiedSection] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [projectError, setProjectError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [savedAsUpdate, setSavedAsUpdate] = useState(false);
  const [versionInfo, setVersionInfo] = useState(null);
  const [templateStatus, setTemplateStatus] = useState(null);
  const [updateConfirmed, setUpdateConfirmed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
    replicas: tpl.replica_configs?.map(r => ({
      replicaAppName: r.replica_entity_name || "",
      replicaEntityName: r.replica_entity_name || "",
      secretName: r.secret_name || "",
      secretValue: r.secret_value || "",
    })) || [{ secretName: "", secretValue: "", replicaEntityName: "" }],
    sourcePage: { mode: tpl.source_page_mode || "create", fileName: tpl.source_page_file_name || "" },
    replicaPage: { mode: tpl.replica_page_mode || "create", fileName: tpl.replica_page_file_name || "" },
  });

  const handleViewRecord = async (tpl) => {
    setFormData(recordToFormData(tpl));
    setEditingRecord(tpl);
    setIsEditing(false);
    setSaveSuccess(false);
    setProjectError("");
    setFieldErrors({});
    setShowTemplates(false);
    
    // Fetch version info
    const history = await base44.entities.SourceReplicaTemplateVersionHistory.filter({ template_id: tpl.id });
    if (history.length > 0) {
      const latestVersion = history.sort((a, b) => b.version - a.version)[0];
      setVersionInfo({
        version: latestVersion.version,
        dateTime: format(new Date(latestVersion.created_date), "EEEE, MMMM d, yyyy h:mm a"),
      });
    }
    
    // Fetch status
    const statuses = await base44.entities.SourceReplicaTemplateStatus.filter({ template_id: tpl.id });
    if (statuses.length > 0) {
      setTemplateStatus(statuses[0]);
      setUpdateConfirmed(statuses[0].update_confirmed || false);
    } else {
      setTemplateStatus(null);
      setUpdateConfirmed(false);
    }
  };

  const handleEditRecord = async (tpl) => {
    setFormData(recordToFormData(tpl));
    setEditingRecord(tpl);
    setIsEditing(true);
    setSaveSuccess(false);
    setProjectError("");
    setFieldErrors({});
    setShowTemplates(false);
    
    // Fetch version info
    const history = await base44.entities.SourceReplicaTemplateVersionHistory.filter({ template_id: tpl.id });
    if (history.length > 0) {
      const latestVersion = history.sort((a, b) => b.version - a.version)[0];
      setVersionInfo({
        version: latestVersion.version,
        dateTime: format(new Date(latestVersion.created_date), "EEEE, MMMM d, yyyy h:mm a"),
      });
    }
    
    // Fetch status
    const statuses = await base44.entities.SourceReplicaTemplateStatus.filter({ template_id: tpl.id });
    if (statuses.length > 0) {
      setTemplateStatus(statuses[0]);
      setUpdateConfirmed(statuses[0].update_confirmed || false);
    } else {
      setTemplateStatus(null);
      setUpdateConfirmed(false);
    }
  };

  const handleConfirmUpdateApplied = async () => {
    if (!editingRecord) return;
    
    try {
      const now = new Date().toISOString();
      const me = await base44.auth.me();
      
      if (templateStatus) {
        await base44.entities.SourceReplicaTemplateStatus.update(templateStatus.id, {
          update_confirmed: true,
          update_confirmed_at: now,
          update_confirmed_by: me?.full_name || me?.email || "unknown",
          update_confirmed_version: versionInfo?.version,
        });
      } else {
        await base44.entities.SourceReplicaTemplateStatus.create({
          template_id: editingRecord.id,
          project_name: formData.projectName,
          update_confirmed: true,
          update_confirmed_at: now,
          update_confirmed_by: me?.full_name || me?.email || "unknown",
          update_confirmed_version: versionInfo?.version,
        });
      }
      
      const statuses = await base44.entities.SourceReplicaTemplateStatus.filter({ template_id: editingRecord.id });
      if (statuses.length > 0) {
        setTemplateStatus(statuses[0]);
        setUpdateConfirmed(true);
      }
      
      setShowConfirmDialog(false);
      toast.success("Update confirmed as applied to source and replica files!");
    } catch (err) {
      toast.error(`Failed to confirm update: ${err.message}`);
    }
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
      archive_entity_mode: 'create_new',
      version_history_entity_mode: 'create_new',
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
        await base44.entities.SourceReplicaTemplateMakeReady.update(editingRecord.id, payload);
        savedId = editingRecord.id;
        eventType = "updated";
      } else {
        const created = await base44.entities.SourceReplicaTemplateMakeReady.create(payload);
        savedId = created.id;
        eventType = "created";
      }

      const history = await base44.entities.SourceReplicaTemplateVersionHistory.filter({ template_id: savedId });
      const version = history.length + 1;
      await base44.entities.SourceReplicaTemplateVersionHistory.create({
        template_id: savedId,
        project_name: formData.projectName,
        event_type: eventType,
        version,
        snapshot: JSON.stringify(payload),
      });

      if (!editingRecord && formData.sourceSchemaOption === 'create') {
        const existingMaster = await base44.entities.SSOTmasterRECORDS.filter({ template_id: savedId });
        if (existingMaster.length === 0) {
          await base44.entities.SSOTmasterRECORDS.create({
            project_name: formData.projectName,
            source_entity_name: formData.sourceEntityName,
            description: formData.description,
            template_id: savedId,
            status: "active",
            replica_entity_names: formData.replicas.map((r, i) => r.replicaEntityName || (r.replicaAppName ? `Replica${r.replicaAppName.replace(/\s+/g,'')}${i+1}` : `Replica${i+1}`)),
            replica_app_ids: formData.replicas.map(r => r.secretValue || ''),
          });
        } else {
          await base44.entities.SSOTmasterRECORDS.update(existingMaster[0].id, {
            replica_entity_names: formData.replicas.map((r, i) => r.replicaEntityName || (r.replicaAppName ? `Replica${r.replicaAppName.replace(/\s+/g,'')}${i+1}` : `Replica${i+1}`)),
            replica_app_ids: formData.replicas.map(r => r.secretValue || ''),
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["SourceReplicaTemplateMakeReady"] });
      queryClient.invalidateQueries({ queryKey: ["SSOTmasterRECORDS"] });
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
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="outline" size="icon" onClick={() => navigate("/menu")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Source Replica Setup Generator</h1>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => {
              const instructionsSection = document.getElementById('instructions-section');
              if (instructionsSection) {
                instructionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}>
              Jump to Instructions
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowTemplates(s => !s)}>
                <BookOpen className="w-4 h-4 mr-1" /> Templates
              </Button>
              <Button size="sm" onClick={() => { setIsEditing(true); setEditingRecord(null); setSaveSuccess(false); setSavedAsUpdate(false); setFormData({ ...EMPTY_FORM }); setProjectError(""); setFieldErrors({}); setVersionInfo(null); }}>
                    <Plus className="w-4 h-4 mr-1" /> New Template
                  </Button>
            </div>
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
                {editingRecord ? (
                  <>
                    <Input id="projectName" value={formData.projectName} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" />
                    <p className="text-xs text-amber-600 font-medium">🔒 Can't be changed after Save</p>
                  </>
                ) : (
                  <>
                    <Input id="projectName" value={formData.projectName} onChange={handleProjectNameChange} placeholder="e.g. NewsBookSite Staff" className={!formData.projectName ? "border-red-500" : ""} />
                    {projectError && <p className="text-sm text-destructive">{projectError}</p>}
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (max 20 chars) *</Label>
                {editingRecord ? (
                  <>
                    <Input id="description" value={formData.description} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" />
                    <p className="text-xs text-amber-600 font-medium">🔒 Can't be changed after Save</p>
                  </>
                ) : (
                  <>
                    <Input id="description" value={formData.description} onChange={(e) => { setFormData({ ...formData, description: e.target.value.slice(0, 20) }); }} placeholder="e.g. Staff" maxLength={20} className={!formData.description ? "border-red-500" : ""} />
                    <p className="text-xs text-muted-foreground">{formData.description.length}/20</p>
                  </>
                )}
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
                {editingRecord ? (
                  <>
                    <Input id="sourceEntityName" value={formData.sourceEntityName} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" />
                    <p className="text-xs text-amber-600 font-medium">🔒 Can't be changed after Save</p>
                  </>
                ) : (
                  <Input id="sourceEntityName" value={formData.sourceEntityName} onChange={(e) => { setFormData({ ...formData, sourceEntityName: e.target.value }); }} placeholder="e.g. SourceSSOT10" className={!formData.sourceEntityName ? "border-red-500" : ""} />
                )}
              </div>
              <SourceEntityForm
                sourceSchemaOption={formData.sourceSchemaOption}
                sourceFields={formData.sourceFields}
                sourceSchemaJson={formData.sourceSchemaJson}
                isEditing={!!editingRecord}
                onSchemaOptionChange={(v) => setFormData({ ...formData, sourceSchemaOption: v })}
                onFieldChange={updateSourceField}
                onAddField={addSourceField}
                onRemoveField={removeSourceField}
                onSchemaJsonChange={(v) => setFormData({ ...formData, sourceSchemaJson: v })}
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

        </div>

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

        <div id="instructions-section" className="scroll-mt-4">
        <Tabs defaultValue="source" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-4 p-1">
            <TabsTrigger value="source">SOURCE Instructions</TabsTrigger>
            <TabsTrigger value="replica">REPLICA Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="source">
            <div className="space-y-6">
              {/* ORIGINAL CODE SECTION */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle>SOURCE App Setup Instructions - Original Code</CardTitle>
                    {editingRecord && (
                      <Badge variant={templateStatus?.confirmed_in_use ? "default" : "outline"} className={templateStatus?.confirmed_in_use ? "bg-green-600" : ""}>
                        {templateStatus?.confirmed_in_use ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" /> In Use</>
                        ) : (
                          <><Circle className="w-3 h-3 mr-1" /> Not Yet In Use</>
                        )}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Use these instructions for initial setup (first-time creation)</p>
                  {versionInfo && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <span className="font-medium">Version {versionInfo.version}</span>
                      <span>•</span>
                      <span>{versionInfo.dateTime}</span>
                      {templateStatus?.update_confirmed && templateStatus.update_confirmed_version === versionInfo.version && (
                        <span className="ml-2 text-green-700">✓ Files Updated</span>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Full Page with existing table / push</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.replicas.map((_, index) => (
                          <Button
                            key={index}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              const p = formData.projectName.replace(/\s+/g, '');
                              const parts = [];
                              let sectionNum = 1;
                              parts.push(`## SECTION ${sectionNum++}: SETUP INSTRUCTIONS\n\n${generateSourceInstructions(formData, versionInfo)}`);
                              const fnSpecific = [
                                `// --- pushToReplica${p} ---`, generatePushFunction(formData, index),
                                `// --- deleteFromReplicas${p} ---`, generateDeleteFunction(formData, index),
                                `// --- pushAllocatedRecord${p} ---`, generateAllocateFunction(formData, index),
                                `// --- reinstateFromArchive${p} ---`, generateReinstateFunction(formData, index),
                              ].join('\n\n');
                              parts.push(`## SECTION ${sectionNum++}: BACKEND FUNCTIONS (Replica ${index + 1})\n// Create each as a separate file in functions/\n\n${fnSpecific}`);
                              parts.push(`## SECTION ${sectionNum++}: SOURCE PAGE CODE (Option A — Full replacement)\n// File: ${formData.sourcePage?.fileName || 'pages/YourSourcePage.jsx'}\n\n${generateSourcePageCode(formData)}`);
                              copyToClipboard(parts.join('\n\n---\n\n'), `source-all-a-${index}`);
                            }}
                          >
                            {copiedSection === `source-all-a-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Replica {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Full Page Subscription Snippet</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.replicas.map((_, index) => (
                          <Button
                            key={index}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              const p = formData.projectName.replace(/\s+/g, '');
                              const parts = [];
                              let sectionNum = 1;
                              parts.push(`## SECTION ${sectionNum++}: SETUP INSTRUCTIONS\n\n${generateSourceInstructions(formData, versionInfo)}`);
                              const fnSpecific = [
                                `// --- pushToReplica${p} ---`, generatePushFunction(formData, index),
                                `// --- deleteFromReplicas${p} ---`, generateDeleteFunction(formData, index),
                                `// --- pushAllocatedRecord${p} ---`, generateAllocateFunction(formData, index),
                                `// --- reinstateFromArchive${p} ---`, generateReinstateFunction(formData, index),
                              ].join('\n\n');
                              parts.push(`## SECTION ${sectionNum++}: BACKEND FUNCTIONS (Replica ${index + 1})\n// Create each as a separate file in functions/\n\n${fnSpecific}`);
                              parts.push(`## SECTION ${sectionNum++}: SOURCE PAGE CODE (Option B — Subscription snippet only)\n\n${generateSourcePageSubscriptionSnippet(formData)}`);
                              copyToClipboard(parts.join('\n\n---\n\n'), `source-all-b-${index}`);
                            }}
                          >
                            {copiedSection === `source-all-b-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Replica {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateSourceInstructions(formData, versionInfo), 'source-instructions')}>
                      {copiedSection === 'source-instructions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Instructions Only
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* CODE UPDATE SECTION - Only shown when editing */}
              {editingRecord && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <CardTitle>SOURCE App Setup Instructions - Code Update</CardTitle>
                      {editingRecord && (
                        <div className="flex items-center gap-2">
                          {updateConfirmed ? (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Files Updated (v{templateStatus?.update_confirmed_version})
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-500 text-orange-600">
                              <AlertCircle className="w-3 h-3 mr-1" /> Pending File Update
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">⚠️ Use these instructions to UPDATE your existing setup after editing the template</p>
                    {versionInfo && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <span className="font-medium">Version {versionInfo.version}</span>
                        <span>•</span>
                        <span>{versionInfo.dateTime}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Full Page with existing table / push</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.replicas.map((_, index) => (
                            <Button
                              key={index}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                              onClick={() => {
                                const p = formData.projectName.replace(/\s+/g, '');
                                const parts = [];
                                let sectionNum = 1;
                                parts.push(`## SECTION ${sectionNum++}: UPDATE INSTRUCTIONS\n\n${generateSourceUpdateInstructions(formData, versionInfo)}`);
                                const fnSpecific = [
                                  `// --- pushToReplica${p} ---`, generatePushFunction(formData, index),
                                  `// --- deleteFromReplicas${p} ---`, generateDeleteFunction(formData, index),
                                  `// --- pushAllocatedRecord${p} ---`, generateAllocateFunction(formData, index),
                                  `// --- reinstateFromArchive${p} ---`, generateReinstateFunction(formData, index),
                                ].join('\n\n');
                                parts.push(`## SECTION ${sectionNum++}: BACKEND FUNCTIONS (Replica ${index + 1})\n// Replace each file in functions/\n\n${fnSpecific}`);
                                parts.push(`## SECTION ${sectionNum++}: SOURCE PAGE CODE (Option A — Full replacement)\n// File: ${formData.sourcePage?.fileName || 'pages/YourSourcePage.jsx'}\n\n${generateSourcePageCode(formData)}`);
                                copyToClipboard(parts.join('\n\n---\n\n'), `source-update-all-a-${index}`);
                              }}
                            >
                              {copiedSection === `source-update-all-a-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Replica {index + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Full Page Subscription Snippet</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.replicas.map((_, index) => (
                            <Button
                              key={index}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                              onClick={() => {
                                const p = formData.projectName.replace(/\s+/g, '');
                                const parts = [];
                                let sectionNum = 1;
                                parts.push(`## SECTION ${sectionNum++}: UPDATE INSTRUCTIONS\n\n${generateSourceUpdateInstructions(formData, versionInfo)}`);
                                const fnSpecific = [
                                  `// --- pushToReplica${p} ---`, generatePushFunction(formData, index),
                                  `// --- deleteFromReplicas${p} ---`, generateDeleteFunction(formData, index),
                                  `// --- pushAllocatedRecord${p} ---`, generateAllocateFunction(formData, index),
                                  `// --- reinstateFromArchive${p} ---`, generateReinstateFunction(formData, index),
                                ].join('\n\n');
                                parts.push(`## SECTION ${sectionNum++}: BACKEND FUNCTIONS (Replica ${index + 1})\n// Replace each file in functions/\n\n${fnSpecific}`);
                                parts.push(`## SECTION ${sectionNum++}: SOURCE PAGE CODE (Option B — Subscription snippet only)\n\n${generateSourcePageSubscriptionSnippet(formData)}`);
                                copyToClipboard(parts.join('\n\n---\n\n'), `source-update-all-b-${index}`);
                              }}
                            >
                              {copiedSection === `source-update-all-b-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Replica {index + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateSourceUpdateInstructions(formData, versionInfo), 'source-update-instructions')}>
                        {copiedSection === 'source-update-instructions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Update Instructions Only
                      </Button>
                      {!updateConfirmed && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowConfirmDialog(true)}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm Update Applied
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="replica">
            <div className="space-y-6">
              {/* ORIGINAL CODE SECTION */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle>REPLICA App Setup Instructions - Original Code</CardTitle>
                    {editingRecord && (
                      <Badge variant={templateStatus?.confirmed_in_use ? "default" : "outline"} className={templateStatus?.confirmed_in_use ? "bg-green-600" : ""}>
                        {templateStatus?.confirmed_in_use ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" /> In Use</>
                        ) : (
                          <><Circle className="w-3 h-3 mr-1" /> Not Yet In Use</>
                        )}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Use these instructions for initial setup (first-time creation)</p>
                  {versionInfo && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <span className="font-medium">Version {versionInfo.version}</span>
                      <span>•</span>
                      <span>{versionInfo.dateTime}</span>
                      {templateStatus?.update_confirmed && templateStatus.update_confirmed_version === versionInfo.version && (
                        <span className="ml-2 text-green-700">✓ Files Updated</span>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Full Page with existing table / push</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.replicas.map((_, index) => (
                          <Button
                            key={index}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              const parts = [];
                              let sectionNum = 1;
                              parts.push(`## SECTION ${sectionNum++}: REPLICA SETUP INSTRUCTIONS\n\n${generateReplicaInstructions(formData, versionInfo)}`);
                              parts.push(`## SECTION ${sectionNum++}: REPLICA PAGE CODE (Option A — Full replacement) [Replica ${index + 1}]\n// File: ${formData.replicaPage?.fileName || 'pages/YourReplicaPage.jsx'}\n\n${generateReplicaPageCode(formData)}`);
                              copyToClipboard(parts.join('\n\n---\n\n'), `replica-all-a-${index}`);
                            }}
                          >
                            {copiedSection === `replica-all-a-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Replica {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Full Page Subscription Snippet</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.replicas.map((_, index) => (
                          <Button
                            key={index}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              const parts = [];
                              let sectionNum = 1;
                              parts.push(`## SECTION ${sectionNum++}: REPLICA SETUP INSTRUCTIONS\n\n${generateReplicaInstructions(formData, versionInfo)}`);
                              parts.push(`## SECTION ${sectionNum++}: REPLICA PAGE CODE (Option B — Subscription snippet only) [Replica ${index + 1}]\n\n${generateReplicaPageSubscriptionSnippet(formData)}`);
                              copyToClipboard(parts.join('\n\n---\n\n'), `replica-all-b-${index}`);
                            }}
                          >
                            {copiedSection === `replica-all-b-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Replica {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateReplicaInstructions(formData, versionInfo), 'replica-instructions')}>
                      {copiedSection === 'replica-instructions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Instructions Only
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* CODE UPDATE SECTION - Only shown when editing */}
              {editingRecord && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <CardTitle>REPLICA App Setup Instructions - Code Update</CardTitle>
                      {editingRecord && (
                        <div className="flex items-center gap-2">
                          {updateConfirmed ? (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Files Updated (v{templateStatus?.update_confirmed_version})
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-500 text-orange-600">
                              <AlertCircle className="w-3 h-3 mr-1" /> Pending File Update
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">⚠️ Use these instructions to UPDATE your existing setup after editing the template</p>
                    {versionInfo && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <span className="font-medium">Version {versionInfo.version}</span>
                        <span>•</span>
                        <span>{versionInfo.dateTime}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Full Page with existing table / push</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.replicas.map((_, index) => (
                            <Button
                              key={index}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                              onClick={() => {
                                const parts = [];
                                let sectionNum = 1;
                                parts.push(`## SECTION ${sectionNum++}: REPLICA UPDATE INSTRUCTIONS\n\n${generateReplicaUpdateInstructions(formData, versionInfo)}`);
                                parts.push(`## SECTION ${sectionNum++}: REPLICA PAGE CODE (Option A — Full replacement) [Replica ${index + 1}]\n// File: ${formData.replicaPage?.fileName || 'pages/YourReplicaPage.jsx'}\n\n${generateReplicaPageCode(formData)}`);
                                copyToClipboard(parts.join('\n\n---\n\n'), `replica-update-all-a-${index}`);
                              }}
                            >
                              {copiedSection === `replica-update-all-a-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Replica {index + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Full Page Subscription Snippet</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.replicas.map((_, index) => (
                            <Button
                              key={index}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                              onClick={() => {
                                const parts = [];
                                let sectionNum = 1;
                                parts.push(`## SECTION ${sectionNum++}: REPLICA UPDATE INSTRUCTIONS\n\n${generateReplicaUpdateInstructions(formData, versionInfo)}`);
                                parts.push(`## SECTION ${sectionNum++}: REPLICA PAGE CODE (Option B — Subscription snippet only) [Replica ${index + 1}]\n\n${generateReplicaPageSubscriptionSnippet(formData)}`);
                                copyToClipboard(parts.join('\n\n---\n\n'), `replica-update-all-b-${index}`);
                              }}
                            >
                              {copiedSection === `replica-update-all-b-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Replica {index + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(generateReplicaUpdateInstructions(formData, versionInfo), 'replica-update-instructions')}>
                        {copiedSection === 'replica-update-instructions' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Update Instructions Only
                      </Button>
                      {!updateConfirmed && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowConfirmDialog(true)}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm Update Applied
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Code Update Applied</DialogTitle>
              <DialogDescription>
                Please confirm that you have replaced the code in both Source and Replica application files with the updated instructions above.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action will mark version {versionInfo?.version} as implemented for both Source and Replica apps. Future edits will show this update as completed and track new available updates.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleConfirmUpdateApplied} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm Files Updated
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}