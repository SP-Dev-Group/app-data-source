import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";

export default function SourceEntityForm({ sourceSchemaOption, sourceFields, sourceSchemaJson, isEditing, onSchemaOptionChange, onFieldChange, onAddField, onRemoveField, onSchemaJsonChange }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Source Schema Option</Label>
        {isEditing ? (
          <div className="px-3 py-2 rounded-md bg-muted border border-border text-sm">
            {sourceSchemaOption === 'create' ? 'Create Fields' : 'Paste JSON Schema'}
            <span className="text-xs text-amber-600 font-medium ml-2">🔒 Locked after first save</span>
          </div>
        ) : (
          <RadioGroup value={sourceSchemaOption} onValueChange={onSchemaOptionChange} className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="create" id="create" />
              <Label htmlFor="create">Create Fields</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="paste" id="paste" />
              <Label htmlFor="paste">Paste JSON Schema</Label>
            </div>
          </RadioGroup>
        )}
      </div>

      {sourceSchemaOption === 'create' ? (
        <div className="space-y-2">
          <Label>Source Entity Fields</Label>
          <div className="rounded-md border border-border bg-muted/40 p-3 mb-2">
            <div className="flex items-center gap-2">
              <Input value="unique_id" readOnly className="flex-1 bg-background font-mono" />
              <select disabled value="string" className="border rounded-md px-3 py-2 text-sm bg-background">
                <option value="string">String</option>
              </select>
              <span className="text-xs text-muted-foreground ml-2">System-generated (auto-created on Add Record)</span>
            </div>
          </div>
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
    </div>
  );
}