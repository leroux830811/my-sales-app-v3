
"use client";
import * as htmlToImage from 'html-to-image';

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

export function exportToHtml(element: HTMLElement, filename: string): void {
  const pageStyles = Array.from(document.styleSheets)
    .map(sheet => {
        try {
            return Array.from(sheet.cssRules)
                .map(rule => rule.cssText)
                .join('');
        } catch (e) {
            console.warn('Could not read cross-origin stylesheet', e);
            return '';
        }
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Catalog</title>
        <style>
            body { font-family: sans-serif; }
            ${pageStyles}
        </style>
    </head>
    <body style="background: white; padding: 2rem;">
        <h1>Product Catalog</h1>
        ${element.outerHTML}
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

    