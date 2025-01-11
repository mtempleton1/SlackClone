import { FC } from "react";
import { MediaAttachmentDisplay } from "./MediaAttachmentDisplay";

interface MessageContentProps {
  message: {
    content: string;
    attachments?: Array<{
      type: string;
      url: string;
    }>;
  };
}

export const MessageContent: FC<MessageContentProps> = ({ message }) => {
  return (
    <div className="space-y-2">
      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
      {message.attachments && message.attachments.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {message.attachments.map((attachment, index) => (
            <MediaAttachmentDisplay
              key={`${attachment.url}-${index}`}
              type={attachment.type}
              url={attachment.url}
            />
          ))}
        </div>
      )}
    </div>
  );
};