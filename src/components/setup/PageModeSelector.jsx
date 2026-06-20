import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PageModeSelector({ label, value, onChange }) {
  const mode = value?.mode || "create";
  const fileName = value?.fileName || "";

  const handleMode = (m) => onChange({ ...value, mode: m, fileName });
  const handleFileName = (e) => onChange({ ...value, mode, fileName: e.target.value });

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <Select value={mode} onValueChange={handleMode}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="create">Option A: Create new page</SelectItem>
          <SelectItem value="existing">Option B: Use existing page</SelectItem>
        </SelectContent>
      </Select>
      <Input
        value={fileName}
        onChange={handleFileName}
        placeholder={mode === "create" ? "e.g. pages/MySourcePage.jsx" : "e.g. pages/ExistingPage.jsx"}
      />
    </div>
  );
}