import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface WorkspaceNameStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function WorkspaceNameStep({ value, onChange }: WorkspaceNameStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Workspace Name</Label>
        <Input
          id="name"
          placeholder="Enter workspace name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        This will be the display name for your workspace. You can change it later.
      </p>
    </div>
  );
}
