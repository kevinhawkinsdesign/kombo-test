import { plainToHtml } from "@/lib/rich-text"
import { cn } from "@/lib/utils"

// Renders a message body that may be rich HTML (from the WYSIWYG editor) or
// legacy plain text (seed data / AI drafts). Plain text is normalized so its
// line breaks show; HTML keeps its formatting.
export function MessageBody({
  html,
  className,
}: {
  html: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "whitespace-pre-wrap [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
        className
      )}
      dangerouslySetInnerHTML={{ __html: plainToHtml(html) }}
    />
  )
}
