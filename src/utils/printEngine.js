import {
  encodeCode128Rects,
  formatJalaliDateTime,
  formatNumber,
  paymentMethodLabel,
} from './format.js';

function buildBarcodeSvgHtml(codeText, heightPx = 38) {
  const { rects, totalModules } = encodeCode128Rects(String(codeText));
  const bars = rects
    .map((r) => `<rect x="${r.x}" y="0" width="${r.width}" height="100" fill="#000000" />`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalModules} 100" preserveAspectRatio="none" style="width:100%;height:${heightPx}px;display:block;">
    <rect x="0" y="0" width="${totalModules}" height="100" fill="#ffffff" />
    ${bars}
  </svg>`;
}

function triggerIframePrint(htmlDocument) {
  const existing = document.getElementById('kaveh-print-iframe');
  if (existing) existing.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'kaveh-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '-9999px';
  iframe.style.bottom = '-9999px';
  iframe.style.width = '400px';
  iframe.style.height = '600px';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlDocument);
  doc.close();

  const doPrint = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Print error:', e);
    }
  };

  if (iframe.contentWindow.document.fonts && iframe.contentWindow.document.fonts.ready) {
    iframe.contentWindow.document.fonts.ready.then(() => {
      setTimeout(doPrint, 120);
    });
  } else {
    setTimeout(doPrint, 250);
  }
}

/**
 * 1) چاپ لیبل باتری (پرینتر لیبل‌زن از کد ۱۵۰۰ به بالا)
 */
export function printBatteryLabel(sale, settings = {}) {
  const w = Number(settings.label_width_mm || 50) || 50;
  const h = Number(settings.label_height_mm || 30) || 30;
  const storeName = settings.store_name || 'نمایندگی صبا باتری - باتری کاوه';
  const barcodeSvg = buildBarcodeSvgHtml(String(sale.label_number), 34);
  const dt = formatJalaliDateTime(sale.created_at);

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>لیبل باتری #${sale.label_number}</title>
  <link rel="stylesheet" href="/local-fonts/Vazirmatn-font-face.css" />
  <style>
    @page {
      size: ${w}mm ${h}mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: ${w}mm;
      height: ${h}mm;
      font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
      background: #fff;
      color: #000;
      overflow: hidden;
    }
    .label-box {
      width: ${w}mm;
      height: ${h}mm;
      padding: 1.5mm 2mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 0.3mm solid #000;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 0.3mm solid #000;
      padding-bottom: 0.8mm;
      font-size: 6.5pt;
      font-weight: 800;
    }
    .serial-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 0.6mm;
    }
    .serial-num {
      font-size: 11pt;
      font-weight: 900;
      direction: ltr;
      letter-spacing: 0.5px;
    }
    .spec {
      font-size: 7pt;
      font-weight: 800;
    }
    .barcode-wrap {
      margin: 0.5mm 0;
    }
    .bottom-bar {
      display: flex;
      justify-content: space-between;
      font-size: 6pt;
      font-weight: 700;
      border-top: 0.25mm dashed #000;
      padding-top: 0.6mm;
    }
  </style>
</head>
<body>
  <div class="label-box">
    <div class="top-bar">
      <span>${storeName}</span>
    </div>
    <div class="serial-row">
      <span class="spec">${sale.brand_name} ${sale.amperage}Ah (${sale.quantity}×)</span>
      <span class="serial-num">#${sale.label_number}</span>
    </div>
    <div class="barcode-wrap">
      ${barcodeSvg}
    </div>
    <div class="bottom-bar">
      <span>${sale.category_name}${sale.has_scrap ? ` | داغی:${sale.scrap_amperage}A` : ''}</span>
      <span>${dt}</span>
    </div>
  </div>
</body>
</html>`;

  triggerIframePrint(html);
}

/**
 * 2) چاپ فیش مشتری سایز ۸ سانتی (80mm Thermal Roll Printer)
 */
export function printReceipt80mm(sale, settings = {}) {
  const storeName = settings.store_name || 'نمایندگی صبا باتری - باتری کاوه';
  const storePhone = settings.store_phone || '';
  const storeAddress = settings.store_address || '';
  const footerNote = settings.receipt_footer || 'ضمانت اصالت و گارانتی معتبر صبا باتری';
  const dt = formatJalaliDateTime(sale.created_at);
  const barcodeSvg = buildBarcodeSvgHtml(String(sale.label_number), 36);

  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>فیش فروش ${sale.invoice_number}</title>
  <link rel="stylesheet" href="/local-fonts/Vazirmatn-font-face.css" />
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 80mm;
      font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
      background: #ffffff;
      color: #000000;
      font-size: 9pt;
      line-height: 1.45;
    }
    .receipt {
      width: 74mm;
      margin: 0 auto;
      padding: 3mm 1mm 6mm 1mm;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 2.5mm;
      margin-bottom: 2.5mm;
    }
    .title {
      font-size: 12pt;
      font-weight: 900;
    }
    .subtitle {
      font-size: 8pt;
      font-weight: 700;
      margin-top: 1mm;
    }
    .meta-grid {
      font-size: 8.2pt;
      border-bottom: 1px dashed #000;
      padding-bottom: 2mm;
      margin-bottom: 2mm;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.8mm;
    }
    .label-highlight {
      border: 1.5px solid #000;
      padding: 1mm 2mm;
      text-align: center;
      font-weight: 900;
      font-size: 10pt;
      margin-bottom: 2mm;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2.5mm;
      font-size: 8.3pt;
    }
    th {
      border-top: 1.5px solid #000;
      border-bottom: 1.5px solid #000;
      padding: 1.2mm 0.5mm;
      text-align: right;
      font-weight: 800;
    }
    td {
      padding: 1.5mm 0.5mm;
      border-bottom: 1px dotted #000;
      vertical-align: top;
      font-weight: 600;
    }
    .num {
      text-align: left;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .totals {
      border-top: 1.5px solid #000;
      padding-top: 2mm;
      margin-bottom: 2.5mm;
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1mm;
      font-size: 8.5pt;
      font-weight: 700;
    }
    .net-box {
      border: 2px solid #000;
      padding: 2mm;
      margin: 2mm 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5pt;
      font-weight: 900;
    }
    .pay-box {
      font-size: 8.2pt;
      border-bottom: 1px dashed #000;
      padding-bottom: 2mm;
      margin-bottom: 2.5mm;
      font-weight: 700;
    }
    .footer {
      text-align: center;
      font-size: 7.5pt;
      font-weight: 700;
    }
    .barcode-footer {
      width: 52mm;
      margin: 2mm auto 1mm auto;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="title">${storeName}</div>
      ${storeAddress ? `<div class="subtitle">${storeAddress}</div>` : ''}
      ${storePhone ? `<div class="subtitle">تلفن: ${storePhone}</div>` : ''}
    </div>

    <div class="label-highlight">
      شماره لیبل باتری: #${sale.label_number}
    </div>

    <div class="meta-grid">
      <div class="meta-row">
        <span>شماره فاکتور:</span>
        <strong style="direction:ltr">${sale.invoice_number}</strong>
      </div>
      <div class="meta-row">
        <span>تاریخ و ساعت:</span>
        <strong>${dt}</strong>
      </div>
      <div class="meta-row">
        <span>صندوقدار:</span>
        <strong>${sale.cashier_name}</strong>
      </div>
      ${
        sale.customer_name
          ? `<div class="meta-row"><span>مشتری:</span><strong>${sale.customer_name}${sale.customer_phone ? ` (${sale.customer_phone})` : ''}</strong></div>`
          : ''
      }
    </div>

    <table>
      <thead>
        <tr>
          <th>شرح کالا / خدمات</th>
          <th>آمپر</th>
          <th class="num">مبلغ (تومان)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div>${sale.category_name} برند ${sale.brand_name}</div>
            <div style="font-size:7.3pt">تعداد: ${formatNumber(sale.quantity)} | آمپری ${formatNumber(sale.unit_price_per_amp)}</div>
          </td>
          <td>${formatNumber(sale.total_sold_amps)}Ah</td>
          <td class="num">${formatNumber(sale.gross_amount)}</td>
        </tr>
        ${
          sale.has_scrap
            ? `<tr>
                <td>
                  <div>کسر تحویل باتری داغی</div>
                  <div style="font-size:7.3pt">${sale.scrap_category_name || sale.category_name} | آمپری ${formatNumber(sale.scrap_price_per_amp)}</div>
                </td>
                <td>${formatNumber(sale.total_scrap_amps)}Ah</td>
                <td class="num">-${formatNumber(sale.scrap_deduction_amount)}</td>
              </tr>`
            : ''
        }
      </tbody>
    </table>

    <div class="totals">
      <div class="tot-row">
        <span>جمع باتری نو:</span>
        <span>${formatNumber(sale.gross_amount)} تومان</span>
      </div>
      <div class="tot-row">
        <span>کسر باتری داغی:</span>
        <span>${sale.has_scrap ? `${formatNumber(sale.scrap_deduction_amount)}- تومان` : '۰ تومان'}</span>
      </div>
      ${
        sale.is_manual_price && sale.calculated_net_amount !== sale.final_sale_amount
          ? `<div class="tot-row">
              <span>تعدیل / تخفیف صندوق:</span>
              <span>${formatNumber(Math.abs(sale.calculated_net_amount - sale.final_sale_amount))} تومان</span>
            </div>`
          : ''
      }
    </div>

    <div class="net-box">
      <span>مبلغ قابل پرداخت:</span>
      <span>${formatNumber(sale.final_sale_amount)} تومان</span>
    </div>

    <div class="pay-box">
      <div>روش پرداخت: ${paymentMethodLabel(sale)}</div>
      ${sale.payment_ref ? `<div>شماره مرجع/پیگیری: ${sale.payment_ref}</div>` : ''}
    </div>

    <div class="footer">
      <div class="barcode-footer">${barcodeSvg}</div>
      <div style="direction:ltr;font-weight:900;margin-bottom:1.5mm">*${sale.label_number}*</div>
      <div>${footerNote}</div>
    </div>
  </div>
</body>
</html>`;

  triggerIframePrint(html);
}
