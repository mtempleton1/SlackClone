import { FC } from "react";
import { MediaAttachmentDisplay } from "./MediaAttachmentDisplay";

interface MessageContentProps {
  message: {
    content: string;
    attachments?: Array<{
      type: string;
      url: string;
      name?: string;
      size?: number;
    }>;
  };
}

export const MessageContent: FC<MessageContentProps> = ({ message }) => {
  const renderTextWithLinks = (text: string) => {
    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;

    // Split text into parts with URLs
    const parts = text.split(urlPattern);

    return parts.map((part, index) => {
      if (part.match(urlPattern)) {
        return (
          <a 
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2">
      <p className="whitespace-pre-wrap text-sm">
        {renderTextWithLinks(message.content)}
      </p>
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {message.attachments.map((attachment, index) => (
            <MediaAttachmentDisplay
              key={`${attachment.url}-${index}`}
              type={attachment.type}
              url={attachment.url}
              name={attachment.name}
              size={attachment.size}
            />
          ))}
        </div>
      )}
    </div>
  );
};