import { FC } from "react";
import { Card } from "@/components/ui/card";
import { FileIcon, ImageIcon, VideoIcon } from "lucide-react";

interface MediaAttachmentDisplayProps {
  type: string;
  url: string;
}

export const MediaAttachmentDisplay: FC<MediaAttachmentDisplayProps> = ({
  type,
  url,
}) => {
  const renderMedia = () => {
    switch (type) {
      case "image":
        return (
          <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden">
            <img
              src={url}
              alt="attachment"
              className="object-cover w-full h-full"
            />
          </div>
        );
      case "video":
        return (
          <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden">
            <video
              src={url}
              controls
              className="w-full h-full"
            />
          </div>
        );
      default:
        return (
          <Card className="flex items-center gap-2 p-2">
            <FileIcon className="h-4 w-4" />
            <span className="text-sm">Download attachment</span>
          </Card>
        );
    }
  };

  return (
    <div className="mt-2">
      {renderMedia()}
    </div>
  );
};
