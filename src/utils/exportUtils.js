// src/utils/exportUtils.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- NEW: import the function directly
import * as XLSX from 'xlsx';

/**
 * Export data to PDF with a styled table
 */
export const exportToPDF = ({ title, columns, rows, fileName = 'export' }) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // Document title
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 40, 40);

  // Subtitle with timestamp
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 58);

  // Table — NEW API: call autoTable(doc, options) instead of doc.autoTable(options)
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 75,
    styles: {
      fontSize: 9,
      cellPadding: 6,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 75, left: 40, right: 40 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 60,
        doc.internal.pageSize.getHeight() - 20
      );
    },
  });

  doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export data to Excel (.xlsx)
 */
export const exportToExcel = ({ columns, rows, fileName = 'export', sheetName = 'Sheet1' }) => {
  const worksheet = XLSX.utils.aoa_to_sheet([columns, ...rows]);

  const columnWidths = columns.map((col, idx) => {
    const maxLength = Math.max(
      col.length,
      ...rows.map(row => String(row[idx] || '').length)
    );
    return { wch: Math.min(Math.max(maxLength + 2, 12), 50) };
  });
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const getExportFileName = (prefix) => {
  return `${prefix}_${new Date().toISOString().split('T')[0]}`;
};