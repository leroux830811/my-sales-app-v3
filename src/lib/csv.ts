"use client";

export function exportToCsv<T extends Record<string, any>>(data: T[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const replacer = (_key: string, value: any): string => (value === null ? '' : String(value));
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','), // header row
    ...data.map((row) =>
      header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
