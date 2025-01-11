import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkspaceDropdown } from "./WorkspaceDropdown";
import { CreateWorkspaceWizard } from "./CreateWorkspaceWizard";
import { WorkspaceNameDisplay } from "./WorkspaceNameDisplay";
import { SettingsMenu } from "./SettingsMenu";
import { NewWorkspaceNotification } from "./NewWorkspaceNotification";

export function CreateWorkspaceOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          Create New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex flex-col space-y-4">
          {/* Main components as per JSON structure */}
          <WorkspaceDropdown />
          <CreateWorkspaceWizard 
            currentStep={currentStep} 
            onStepChange={setCurrentStep}
          />
          <WorkspaceNameDisplay />
          <SettingsMenu />
          <NewWorkspaceNotification />
        </div>
      </DialogContent>
    </Dialog>
  );
}
