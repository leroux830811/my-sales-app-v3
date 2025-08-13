"use client";

import * as XLSX from 'xlsx';

export function exportToExcel<T extends Record<string, any>>(data: T[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // It will default to creating an .xlsx file
  XLSX.writeFile(workbook, filename);
}
