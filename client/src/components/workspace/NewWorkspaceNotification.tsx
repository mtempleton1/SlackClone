import { FC } from "react";
import { useToast } from "@/hooks/use-toast";

export const NewWorkspaceNotification: FC = () => {
  const { toast } = useToast();
  
  // This function will be called when a new workspace is created
  const showNotification = (success: boolean) => {
    toast({
      title: success ? "Success" : "Error",
      description: success 
        ? "Workspace created successfully!" 
        : "Failed to create workspace. Please try again.",
      variant: success ? "default" : "destructive",
    });
  };

  return null; // This is a utility component that doesn't render anything
};
