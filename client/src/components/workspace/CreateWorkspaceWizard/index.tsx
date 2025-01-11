import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Steps } from "./Steps";
import { WorkspaceNameStep } from "./WorkspaceNameStep";
import { WorkspaceDetailsStep } from "./WorkspaceDetailsStep";
import { WorkspaceSetupStep } from "./WorkspaceSetupStep";

interface CreateWorkspaceWizardProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function CreateWorkspaceWizard({
  currentStep,
  onStepChange,
}: CreateWorkspaceWizardProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    settings: {},
  });

  const steps = [
    {
      title: "Name Your Workspace",
      component: (
        <WorkspaceNameStep
          value={formData.name}
          onChange={(name) => setFormData({ ...formData, name })}
        />
      ),
    },
    {
      title: "Add Details",
      component: (
        <WorkspaceDetailsStep
          value={formData.description}
          onChange={(description) => setFormData({ ...formData, description })}
        />
      ),
    },
    {
      title: "Setup",
      component: (
        <WorkspaceSetupStep
          value={formData.settings}
          onChange={(settings) => setFormData({ ...formData, settings })}
        />
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="space-y-4">
      <Steps currentStep={currentStep} steps={steps.map((s) => s.title)} />
      <div className="min-h-[200px]">
        {steps[currentStep].component}
      </div>
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? "Create Workspace" : "Next"}
        </Button>
      </div>
    </div>
  );
}
