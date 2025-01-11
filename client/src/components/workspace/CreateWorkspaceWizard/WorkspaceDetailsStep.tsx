import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface WorkspaceDetailsStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function WorkspaceDetailsStep({ value, onChange }: WorkspaceDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Workspace Description</Label>
        <Textarea
          id="description"
          placeholder="Enter a description for your workspace"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Help others understand what this workspace is about.
      </p>
    </div>
  );
}
