import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";

export default function SourceEntityForm({ sourceSchemaOption, sourceFields, sourceSchemaJson, createArchive, onSchemaOptionChange, onFieldChange, onAddField, onRemoveField, onSchemaJsonChange, onArchiveChange }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Source Schema Option</Label>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={sourceSchemaOption === 'create'} onCheckedChange={(v) => onSchemaOptionChange(v ? 'create' : 'paste')} />
            <Label>Create Fields</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={sourceSchemaOption === 'paste'} onCheckedChange={(v) => onSchemaOptionChange(v ? 'paste' : 'create')} />
            <Label>Paste JSON Schema</Label>
          </div>
        </div>
      </div>

      {sourceSchemaOption === 'create' ? (
        <div className="space-y-2">
          <Label>Source Entity Fields</Label>
          {sourceFields.map((field, index) => (
            <div key={index} className="flex gap-2">
              <Input value={field.name} onChange={(e) => onFieldChange(index, 'name', e.target.value)} placeholder="Field name" className="flex-1" />
              <select value={field.type} onChange={(e) => onFieldChange(index, 'type', e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
              </select>
              <Button variant="outline" size="icon" onClick={() => onRemoveField(index)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={onAddField}>
            <Plus className="w-4 h-4 mr-1" /> Add Field
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Paste JSON Schema</Label>
          <Textarea
            value={sourceSchemaJson}
            onChange={(e) => onSchemaJsonChange(e.target.value)}
            placeholder='{"name": "MyEntity", "type": "object", ...}'
            className="font-mono text-sm h-48"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch checked={createArchive} onCheckedChange={onArchiveChange} />
        <Label>Create Archive & Version History Entities</Label>
      </div>
    </div>
  );
}