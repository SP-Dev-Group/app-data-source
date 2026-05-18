import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export default function DataMasterListenerForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const uid = `UID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    onSubmit({ ...formData, unique_id: uid });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-foreground">Add New Record</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., John Doe"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g., john@example.com"
            required
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Record</Button>
        </div>
      </form>
    </div>
  );
}