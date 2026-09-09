import { toCanvas } from 'html-to-image';
import jsPDF from 'jspdf';

export async function exportDashboardToPdf(elementId: string = 'dashboard-content'): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element for PDF export not found:', elementId);
    return false;
  }

  // Track hidden elements to restore them safely
  const nonPrintableElements = document.querySelectorAll('.no-print');

  try {
    // Hide non-printable elements
    nonPrintableElements.forEach((el) => ((el as HTMLElement).style.display = 'none'));

    // Allow a micro-task for DOM to settle
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Convert DOM element to HTML Canvas
    const canvas = await toCanvas(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#020617', // Match dark theme
      cacheBust: true,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-print')) {
          return false;
        }
        return true;
      },
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas rendering produced an empty image.');
    }

    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    const marginX = 10; // 10mm left/right margin
    const marginY = 10; // 10mm top/bottom margin

    const printableWidth = pdfWidth - marginX * 2; // 190 mm
    const printableHeight = pdfHeight - marginY * 2; // 277 mm

    // Pixel ratio scaling relative to printable A4 width
    const pxPerMm = canvas.width / printableWidth;
    const pagePxHeight = Math.floor(printableHeight * pxPerMm);
    const totalPages = Math.ceil(canvas.height / pagePxHeight);

    for (let p = 0; p < totalPages; p++) {
      if (p > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const sourceY = p * pagePxHeight;
      const sourceHeight = Math.min(pagePxHeight, canvas.height - sourceY);

      // Create a slice canvas for this page segment
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );
      }

      const sliceDataUrl = pageCanvas.toDataURL('image/png', 0.95);
      const slicePdfHeight = sourceHeight / pxPerMm;

      pdf.addImage(sliceDataUrl, 'PNG', marginX, marginY, printableWidth, slicePdfHeight);
    }

    // Date timestamp filename
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `relatorio-phone-manaux-crm-${dateStr}.pdf`;

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error exporting dashboard PDF:', error);
    return false;
  } finally {
    // Restore non-printable elements in all cases
    nonPrintableElements.forEach((el) => ((el as HTMLElement).style.display = ''));
  }
}

