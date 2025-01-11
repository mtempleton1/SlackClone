import { FC } from "react";
import { Card } from "@/components/ui/card";
import { FileIcon, ImageIcon, VideoIcon } from "lucide-react";

interface MediaAttachmentDisplayProps {
  type: string;
  url: string;
  name?: string;
  size?: number;
}

export const MediaAttachmentDisplay: FC<MediaAttachmentDisplayProps> = ({
  type,
  url,
  name,
  size,
}) => {
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const renderMedia = () => {
    switch (type) {
      case "image":
        return (
          <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden">
            <img
              src={url}
              alt={name || "attachment"}
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
          <Card className="flex items-center gap-3 p-3 hover:bg-accent/5 transition-colors">
            <FileIcon className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {name || "Download attachment"}
              </div>
              {size && (
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(size)}
                </div>
              )}
            </div>
          </Card>
        );
    }
  };

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block hover:opacity-90 transition-opacity"
    >
      {renderMedia()}
    </a>
  );
};