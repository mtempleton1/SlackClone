import { CreateWorkspaceOverlay } from "@/components/workspace/CreateWorkspaceOverlay";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto">
        <CreateWorkspaceOverlay />
      </div>
    </div>
  );
}
