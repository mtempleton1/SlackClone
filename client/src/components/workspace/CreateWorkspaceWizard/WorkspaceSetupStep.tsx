import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface WorkspaceSetupStepProps {
  value: Record<string, boolean>;
  onChange: (value: Record<string, boolean>) => void;
}

export function WorkspaceSetupStep({ value, onChange }: WorkspaceSetupStepProps) {
  const toggleSetting = (key: string) => {
    onChange({
      ...value,
      [key]: !value[key],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="notifications">Enable Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Receive notifications about workspace activity
          </p>
        </div>
        <Switch
          id="notifications"
          checked={value.notifications}
          onCheckedChange={() => toggleSetting('notifications')}
        />
      </div>
      
      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="public">Public Workspace</Label>
          <p className="text-sm text-muted-foreground">
            Allow anyone to find and join this workspace
          </p>
        </div>
        <Switch
          id="public"
          checked={value.public}
          onCheckedChange={() => toggleSetting('public')}
        />
      </div>
    </div>
  );
}
