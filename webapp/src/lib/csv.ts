// Generic CSV export. Builds a quoted CSV from headers + rows and triggers a
// client-side download. Used by collection pages that offer "Export".

function escape(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(escape).join(",")]
  for (const row of rows) lines.push(row.map(escape).join(","))
  return lines.join("\n")
}

export function downloadFile(
  filename: string,
  text: string,
  type = "text/csv"
): void {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  downloadFile(filename, toCsv(headers, rows))
}
