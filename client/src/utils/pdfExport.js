import { jsPDF } from 'jspdf';

/**
 * Export High-Resolution Print-Ready PDF Dieline & Title Block
 * Compatible with ESKO ArtiosCAD & Pacdora Studio Standards
 */
export async function exportDielineToPdf({
  svgString,
  boxName = 'کارتن پستی کیبوردی',
  boxCode = 'FEFCO 0427',
  pacdoraId = '150010',
  dimensions = { l: 200, w: 150, h: 50 },
  thicknessMm = 1.5,
  materialName = 'کارتن E-Flute',
  ruleCutMeters = 1.4,
  ruleCreaseMeters = 2.1,
  flatWidthMm = 380,
  flatHeightMm = 390,
  filename = 'Dieline-Pacdora.pdf'
}) {
  return new Promise((resolve, reject) => {
    try {
      if (!svgString) {
        throw new Error('محتوای خط تیغ وکتور یافت نشد.');
      }

      // 1. Create temporary SVG blob and Image for crisp canvas rendering
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        // High-res supersampling scale (3x scale for ultra crisp vector lines in PDF)
        const scaleFactor = 3;
        const canvas = document.createElement('canvas');
        canvas.width = (img.width || 800) * scaleFactor;
        canvas.height = (img.height || 600) * scaleFactor;
        const ctx = canvas.getContext('2d');

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imgData = canvas.toDataURL('image/png', 1.0);
        URL.revokeObjectURL(url);

        // 2. Create Landscape PDF Document (A3 or A4 according to flat dimensions)
        const isLarge = flatWidthMm > 260 || flatHeightMm > 190;
        const pdfFormat = isLarge ? 'a3' : 'a4';
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: pdfFormat
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 3. Draw Header & Prepress Technical Border
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.8);
        doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

        // Header Title Box
        doc.setFillColor(30, 27, 75);
        doc.rect(8, 8, pageWidth - 16, 16, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('ARMAN AMIRAN PACKAGING ERP - ARTIOSCAD & PACDORA DIELINE STUDIO', 14, 19);

        doc.setFontSize(9);
        doc.text(`MODEL: ${pacdoraId} | STANDARD: ${boxCode}`, pageWidth - 14, 19, { align: 'right' });

        // 4. Fit and Embed High-Res Dieline Drawing
        const marginH = 16;
        const marginV = 28;
        const availW = pageWidth - (marginH * 2);
        const availH = pageHeight - marginV - 34; // leave bottom space for title block

        const imgRatio = canvas.width / canvas.height;
        let renderW = availW;
        let renderH = availW / imgRatio;

        if (renderH > availH) {
          renderH = availH;
          renderW = availH * imgRatio;
        }

        const renderX = marginH + (availW - renderW) / 2;
        const renderY = marginV + (availH - renderH) / 2;

        doc.addImage(imgData, 'PNG', renderX, renderY, renderW, renderH);

        // 5. Prepress Technical Title Block Stamp (Bottom Right)
        const tbW = 160;
        const tbH = 26;
        const tbX = pageWidth - tbW - 10;
        const tbY = pageHeight - tbH - 10;

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(51, 65, 85);
        doc.setLineWidth(0.5);
        doc.rect(tbX, tbY, tbW, tbH, 'FD');

        // Divider lines
        doc.line(tbX, tbY + 8, tbX + tbW, tbY + 8);
        doc.line(tbX, tbY + 17, tbX + tbW, tbY + 17);
        doc.line(tbX + 80, tbY, tbX + 80, tbY + tbH);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');

        // Row 1
        doc.text(`Box: ${boxName}`, tbX + 3, tbY + 5.5);
        doc.text(`Dimensions: ${dimensions.l} x ${dimensions.w} x ${dimensions.h} mm`, tbX + 83, tbY + 5.5);

        // Row 2
        doc.text(`Material: ${materialName} (${thicknessMm}mm)`, tbX + 3, tbY + 13.5);
        doc.text(`Flat Size: ${flatWidthMm} x ${flatHeightMm} mm`, tbX + 83, tbY + 13.5);

        // Row 3
        doc.text(`Rule Cut: ${ruleCutMeters}m | Crease: ${ruleCreaseMeters}m`, tbX + 3, tbY + 22);
        doc.text(`ESKO ArtiosCAD 23.07 / Pacdora Engine`, tbX + 83, tbY + 22);

        // Bottom Left Legend
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.text('Layer Guide: Red = Cut Lines | Blue (Dashed) = Crease Lines | Purple = 3mm Bleed | Scale 1:1 Vector', 12, pageHeight - 12);

        // Save PDF file
        doc.save(filename);
        resolve({ success: true, filename });
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error('خطا در بارگذاری تصویر وکتور خط تیغ برای تبدیل به PDF'));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}
