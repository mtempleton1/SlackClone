import { Check } from "lucide-react";

interface StepsProps {
  currentStep: number;
  steps: string[];
}

export function Steps({ currentStep, steps }: StepsProps) {
  return (
    <div className="space-y-2">
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`h-8 w-8 rounded-full border-2 flex items-center justify-center
                ${
                  index <= currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                }`}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-[2px] w-16 mx-2 mt-4 
                  ${
                    index < currentStep
                      ? "bg-primary"
                      : "bg-muted-foreground"
                  }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <span
            key={step}
            className={`text-sm ${
              index <= currentStep
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
