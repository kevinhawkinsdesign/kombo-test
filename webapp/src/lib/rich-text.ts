// Helpers for the shared RichTextEditor. Message bodies are stored as HTML;
// these convert to/from plain text so legacy plain-text drafts/seeds render and
// so we can check emptiness or build list snippets.

export function isHtml(s: string): boolean {
  return /<[a-z][\s\S]*>/i.test(s)
}

// Normalize a value into HTML for the editor: plain text gets escaped and its
// newlines turned into <br>; anything already containing tags is left as-is.
export function plainToHtml(s: string): string {
  if (isHtml(s)) return s
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")
}

// Flatten HTML to a plain-text string (list snippets, emptiness checks).
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}
