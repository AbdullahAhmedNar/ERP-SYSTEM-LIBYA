import html2pdf from 'html2pdf.js';
import systemLogo from '../imgaes/lib.ico';

/** ألوان التصميم الموحد (Odoo-style) لجميع الفواتير والتقارير */
const ODOO_PURPLE = '#714B67';
const ODOO_PURPLE_LIGHT = '#875A7B';
const ODOO_PURPLE_DARK = '#4E3457';
const ODOO_BORDER = '#e8e0eb';
const ODOO_BG_SOFT = '#fdfbfd';
const ODOO_ROW_ALT = '#fdfbfd';
const ODOO_SHADOW = '0 8px 40px rgba(113,75,103,0.12), 0 2px 8px rgba(0,0,0,0.06)';

/** المسار الموحد لشعار النظام في كل المطبوعات */
const SYSTEM_LOGO_PATH = systemLogo;

/** أنماط CSS الموحدة لجميع المطبوعات (تقارير) بتصميم قريب من الفواتير الحديثة */
function getUnifiedOdooPrintStyles(): string {
  return `
    @page { margin: 14mm; size: A4; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 28px 12px;
      font-family: Cairo, Tajawal, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f7f2fa;
      color: #111827;
      font-size: 11px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .odoo-page {
      width: 100%;
      max-width: 620px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: ${ODOO_SHADOW};
      border: 1px solid ${ODOO_BORDER};
    }
    .odoo-header {
      background: linear-gradient(90deg, ${ODOO_PURPLE_DARK}, ${ODOO_PURPLE_LIGHT});
      padding: 18px 28px 14px;
      border-bottom: 3px solid ${ODOO_PURPLE_LIGHT};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 4px;
    }
    .odoo-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
      overflow: hidden;
    }
    .odoo-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    .odoo-brand {
      font-size: 22px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .odoo-subtitle {
      font-size: 9px;
      color: #e5e7eb;
      margin-top: 2px;
    }
    .odoo-deco {
      color: rgba(255,255,255,0.6);
      font-size: 20px;
      opacity: 0.7;
    }
    .odoo-title-banner {
      background: #ffffff;
      padding: 16px 28px 10px;
      border-bottom: 1px solid ${ODOO_BORDER};
    }
    .odoo-title {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: ${ODOO_PURPLE_DARK};
      text-align: center;
    }
    .odoo-meta {
      padding: 12px 28px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      border-bottom: 1px solid ${ODOO_BORDER};
      background: #f9fafb;
    }
    .odoo-meta-item { font-family: inherit; }
    .odoo-meta-item .label { font-size: 11px; color: #6b7280; }
    .odoo-meta-item .value { font-size: 13px; color: #111827; margin-right: 6px; font-weight: 700; }
    .odoo-client {
      padding: 14px 28px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      border-bottom: 1px solid ${ODOO_BORDER};
      background: #fff;
    }
    .odoo-client-block { font-family: inherit; }
    .odoo-client-block .label { font-size: 11px; color: #6b7280; }
    .odoo-client-block .value { font-size: 13px; font-weight: 700; color: #111827; margin-top: 2px; }
    .odoo-table-wrap { padding: 0 28px; }
    .odoo-table-header {
      display: grid;
      grid-template-columns: 1fr 100px 80px 100px;
      padding: 12px 0;
      border-bottom: 2px solid ${ODOO_PURPLE};
      margin-top: 8px;
    }
    .odoo-table-header span {
      font-size: 13px;
      font-weight: 700;
      color: ${ODOO_PURPLE};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: sans-serif;
      text-align: right;
    }
    .odoo-table-header span:first-child { text-align: right; }
    .odoo-table-row {
      display: grid;
      grid-template-columns: 1fr 100px 80px 100px;
      padding: 13px 0;
      border-bottom: 1px solid #f0eaf2;
      background: var(--row-bg, #fff);
    }
    .odoo-table-row span { font-family: sans-serif; font-size: 14px; text-align: right; }
    .odoo-table-row span:first-child { color: #333; }
    .odoo-table-row .num { color: #555; }
    .odoo-table-row .amount { color: #333; font-weight: 600; }
    .odoo-totals-wrap { padding: 12px 28px 18px; display: flex; justify-content: flex-end; }
    .odoo-totals { min-width: 220px; font-family: inherit; }
    .odoo-total-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .odoo-total-row .label { font-size: 13px; color: #666; }
    .odoo-total-row .value { font-size: 13px; color: #444; }
    .odoo-total-row.paid .value { color: #16a34a; }
    .odoo-total-row.remaining .value { color: #dc2626; }
    .odoo-total-row.final { margin-top: 8px; padding-top: 10px; border-top: 2px solid ${ODOO_PURPLE}; }
    .odoo-total-row.final .label, .odoo-total-row.final .value { font-size: 16px; font-weight: 800; color: ${ODOO_PURPLE}; }
    .odoo-footer {
      background: ${ODOO_PURPLE_LIGHT};
      padding: 10px 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      flex-wrap: wrap;
    }
    .odoo-footer span { font-size: 10px; color: #fff; font-family: inherit; letter-spacing: 0.2px; }
    .odoo-content { padding: 16px 28px 20px; }
    .odoo-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px 24px;
      margin-bottom: 14px;
      padding: 10px 0 8px;
      border-bottom: 1px solid ${ODOO_BORDER};
      background: ${ODOO_BG_SOFT};
      font-family: inherit;
    }
    .odoo-info-grid .label { font-size: 11px; color: #6b7280; }
    .odoo-info-grid .value { font-size: 12px; color: #111827; font-weight: 700; }
    .odoo-report-table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 10px 0; font-family: inherit; }
    .odoo-report-table th {
      background: linear-gradient(90deg, ${ODOO_PURPLE_DARK}, ${ODOO_PURPLE_LIGHT});
      color: #ffffff;
      font-weight: 600;
      padding: 8px 10px;
      text-align: right;
      border-bottom: 1px solid ${ODOO_PURPLE_DARK};
      border-left: 1px solid ${ODOO_BORDER};
    }
    .odoo-report-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #e5e7eb;
      border-left: 1px solid ${ODOO_BORDER};
      color: #111827;
    }
    .odoo-report-table tr:nth-child(even) td { background: ${ODOO_ROW_ALT}; }
    .odoo-summary-box {
      margin-top: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: space-between;
    }
    .odoo-summary-item {
      min-width: 160px;
      padding: 8px 10px;
      border-radius: 6px;
      background: #f9fafb;
      border: 1px solid ${ODOO_BORDER};
      font-family: inherit;
      flex: 1 1 0;
      text-align: center;
    }
    .odoo-summary-item .label { font-size: 10px; font-weight: 600; color: #6b7280; }
    .odoo-summary-item .value { font-size: 15px; font-weight: 800; color: #111827; }
    .odoo-section-title {
      font-size: 12px;
      font-weight: 700;
      color: ${ODOO_PURPLE_DARK};
      margin: 18px 0 8px;
      padding-bottom: 5px;
      border-bottom: 2px solid ${ODOO_PURPLE_LIGHT};
    }
    .odoo-content table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin: 10px 0;
      font-family: inherit;
    }
    .odoo-content table th {
      background: linear-gradient(90deg, ${ODOO_PURPLE_DARK}, ${ODOO_PURPLE_LIGHT});
      color: #ffffff;
      font-weight: 600;
      padding: 8px 10px;
      text-align: right;
      border-bottom: 1px solid ${ODOO_PURPLE_DARK};
      border-left: 1px solid ${ODOO_BORDER};
    }
    .odoo-content table td {
      padding: 7px 10px;
      border-bottom: 1px solid #e5e7eb;
      border-left: 1px solid ${ODOO_BORDER};
      color: #111827;
    }
    .odoo-content table tr:nth-child(even) td { background: ${ODOO_ROW_ALT}; }
    @media print {
      body { background: #fff; padding: 0; }
      .odoo-page { box-shadow: none; }
    }
  `;
}

export interface PrintInfoBlock {
  label: string;
  value: string;
}

export interface PrintSummaryBlock {
  label: string;
  value: string;
  color?: string;
}

export interface OdooStylePrintOptions {
  systemName: string;
  pageTitle: string;
  pageSubtitle?: string;
  infoBlocks?: PrintInfoBlock[];
  tableHtml: string;
  summaryBlocks?: PrintSummaryBlock[];
  statsText?: string;
  /** هاتف في التذييل (اختياري) */
  footerPhone?: string;
  /** بريد في التذييل (اختياري) */
  footerEmail?: string;
  /** اسم الملف عند التحميل PDF */
  fileName?: string;
  /** عند التفعيل يكون العرض وتصميم الصفحة بشكل فاتورة حرارية مدمجة */
  isReceipt?: boolean;
}

/** خيارات تقرير متعدد الأقسام (لصفحة التقارير) */
export interface MultiSectionPrintOptions {
  systemName: string;
  pageTitle: string;
  pageSubtitle?: string;
  sections: { title: string; tableHtml: string; summaryBlocks?: PrintSummaryBlock[] }[];
  footerPhone?: string;
  footerEmail?: string;
  fileName?: string;
}

/** خيارات عرض سعر / فاتورة احترافية (عناوين أرجوانية، تخطيط موحد) */
export interface QuotationInvoicePrintOptions {
  /** عنوان المستند: فاتورة مبيعات / فاتورة شراء */
  documentTitle: string;
  /** رقم المستند */
  documentNumber: string;
  /** تاريخ العرض/الفاتورة */
  quotationDate: string;
  /** تاريخ انتهاء الصلاحية (اختياري) */
  expirationDate?: string;
  /** عنوان قسم الطرف (عميل/مورد) - افتراضي: عنوان الفواتير والشحن */
  addressSectionTitle?: string;
  /** عنوان قسم المعلومات - افتراضي: معلومات البيع */
  saleInfoSectionTitle?: string;
  /** اسم العميل أو المورد */
  customerName: string;
  /** العنوان */
  customerAddress?: string;
  /** هاتف العميل/المورد (يظهر فقط إذا وُجد) */
  customerPhone?: string;
  /** البريد */
  customerEmail?: string;
  /** العملة */
  currency: string;
  /** صفوف الطلب: المنتج، الكمية، سعر الوحدة، الضريبة، المبلغ */
  rows: { productName: string; quantity: number; unitPrice: string; taxes: string; amount: string }[];
  /** نص صف التسليم (اختياري) */
  deliveryDescription?: string;
  /** المبلغ قبل الضريبة */
  untaxedAmount: string;
  /** قيمة الخصم (اختياري - يظهر في الملخص) */
  discountAmount?: string;
  /** نسبة الضريبة (مثلاً "0" أو "16") */
  taxPercent: string;
  /** الإجمالي النهائي */
  total: string;
  /** المدفوع (اختياري - يظهر في الملخص) */
  paidAmount?: string;
  /** المتبقي (اختياري - يظهر في الملخص) */
  remainingAmount?: string;
  /** اسم الشركة (تذييل) */
  companyName?: string;
  /** شعار أو وصف تحت اسم الشركة (مثل: WITH JULIANA SILVA) */
  companySubtitle?: string;
  /** اسم البائع / المستخدم الذي أنشأ الفاتورة */
  salespersonName?: string;
  /** رقم هاتف البائع / مسؤول الشراء (يظهر إن وُجد) */
  salespersonPhone?: string;
  /** اسم المخزن المرتبط بالفاتورة */
  warehouseName?: string;
  /** تسمية طريقة الدفع (نقدي/تحويل/بطاقة...) */
  paymentMethodLabel?: string;
  /** حالة الدفع (فوري / آجل ...) */
  paymentStatusLabel?: string;
  /** هاتف في التذييل الأرجواني */
  footerPhone?: string;
  /** بريد في التذييل الأرجواني */
  footerEmail?: string;
  fileName?: string;
  /** نمط خاص (مثل: عقد إيجار أو فاتورة صيانة) يغيّر عناوين الجدول والملخص */
  mode?: 'default' | 'rental' | 'maintenance';
  /** وصف تفصيلي للمشكلة في نمط الصيانة */
  maintenanceDescription?: string;
  /** ملاحظات فنية في نمط الصيانة */
  maintenanceNotes?: string;
  /** اسم المولد لعقد الإيجار (يظهر في بطاقة العميل) */
  rentalGeneratorName?: string;
  /** نص فترة الإيجار لعقد الإيجار (يظهر في بطاقة العميل) */
  rentalPeriodText?: string;
}

/** خيارات فاتورة بتنسيق الشريط الذهبي (مثل الصورة المرجعية) */
export interface InvoicePrintOptions {
  /** اسم الشركة / النظام */
  companyName: string;
  /** وصف أو شعار اختياري تحت الاسم */
  companySlogan?: string;
  /** الرقم الضريبي إن وجد */
  taxNumber?: string;
  /** عنوان الفاتورة، مثلاً: فاتورة مبيعات */
  invoiceTitle: string;
  /** رقم الفاتورة */
  invoiceNumber: string;
  /** اسم العميل */
  clientName: string;
  /** رقم العميل إن وجد */
  clientNumber?: string;
  /** تاريخ الفاتورة */
  date: string;
  /** العملة */
  currency: string;
  /** صفوف الجدول: م، البيان، الكمية، السعر، الاجمالي */
  rows: { serial: number; description: string; quantity: number; unitPrice: string; total: string }[];
  /** المجموع الفرعي (قبل الضريبة) */
  subtotal: string;
  /** الضريبة (يمكن 0) */
  tax?: string;
  /** الإجمالي النهائي */
  grandTotal: string;
  /** ملاحظات (نقاط) */
  notes?: string[];
  /** هاتف في التذييل */
  footerPhone?: string;
  /** موقع في التذييل */
  footerWebsite?: string;
  /** اسم الملف عند التحميل PDF */
  fileName?: string;
}

/** Unified Odoo-style print CSS – single design standard for all invoices and reports */
function getOdooPrintStyles(isReceipt?: boolean): string {
  const pageMargin = isReceipt ? '10mm' : '20mm';
  const maxWidth = isReceipt ? '420px' : '900px';
  const pagePadding = isReceipt ? '12px 18px 12px' : '24px 28px 24px';
  return `
    @page { margin: ${pageMargin}; size: A4; }
    * { box-sizing: border-box; }
    body {
      font-family: Cairo, Tajawal, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      padding: 0;
      margin: 0;
      background: #fff;
      color: #1f2937;
      font-size: 12px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      max-width: ${maxWidth};
      margin: 0 auto;
      padding: ${pagePadding};
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      border-bottom: 3px solid #875A7B;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .header-left h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #875A7B;
      letter-spacing: -0.02em;
    }
    .header-left .doc-title {
      margin: 6px 0 0;
      font-size: 16px;
      font-weight: 700;
      color: #374151;
    }
    .header-left .doc-subtitle {
      margin: 4px 0 0;
      font-size: 11px;
      color: #6b7280;
    }
    .header-right {
      text-align: left;
      font-size: 11px;
      color: #6b7280;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 600;
      background: #f3e8ff;
      color: #875A7B;
    }
    .info {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px 24px;
      margin: 0 0 20px;
      padding: 16px 18px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      font-size: 12px;
    }
    .info div strong {
      color: #875A7B;
      font-weight: 700;
      margin-left: 6px;
    }
    .content { margin-top: 20px; }
    .content-section-title {
      font-size: 13px;
      font-weight: 700;
      color: #374151;
      margin: 0 0 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #875A7B;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 16px;
    }
    th {
      background: #875A7B;
      color: #fff;
      padding: 10px 12px;
      text-align: right;
      font-weight: 600;
      font-size: 11px;
      border: 1px solid #7c4d70;
    }
    td {
      padding: 10px 12px;
      border: 1px solid #e5e7eb;
      vertical-align: middle;
    }
    tr:nth-child(even) td { background: #faf7ff; }
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
      justify-content: flex-end;
    }
    .summary-item {
      min-width: 140px;
      padding: 8px 12px;
      border-radius: 6px;
      background: #f9fafb;
      border: 1px solid #875A7B;
      color: #111827;
      text-align: left;
    }
    .summary-label {
      font-size: 10px;
      font-weight: 600;
      margin-bottom: 2px;
      color: #6b7280;
    }
    .summary-value {
      font-size: 14px;
      font-weight: 800;
      color: #111827;
    }
    .summary-total .summary-value { font-size: 16px; color: #875A7B; }
    .summary-emerald .summary-value { color: #047857; }
    .summary-red .summary-value { color: #b91c1c; }
    .summary-amber .summary-value { color: #b45309; }
    .summary-purple .summary-value { color: #6b21a8; }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px;
      color: #6b7280;
    }
    .footer-brand { font-weight: 600; color: #875A7B; }
    .stats-footer { font-weight: 600; color: #4b5563; }
    @media print {
      body { overflow: visible !important; height: auto !important; }
      .page { overflow: visible !important; }
    }
  `;
}

function buildOdooStyleHtml(options: OdooStylePrintOptions): string {
  const {
    systemName,
    pageTitle,
    pageSubtitle,
    infoBlocks = [],
    tableHtml,
    summaryBlocks = [],
    statsText,
    footerPhone,
    footerEmail,
  } = options;

  const infoHtml =
    infoBlocks.length > 0
      ? `<div class="odoo-info-grid">${infoBlocks
          .map(b => `<div class="odoo-meta-item"><span class="label">${b.label}</span><span class="value">${b.value}</span></div>`)
          .join('')}</div>`
      : '';

  const summaryHtml =
    summaryBlocks.length > 0
      ? `<div class="odoo-summary-box">${summaryBlocks
          .map(b => `<div class="odoo-summary-item"><div class="label">${b.label}</div><div class="value">${b.value}</div></div>`)
          .join('')}</div>`
      : '';

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const printDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  const footerContent = [footerPhone, footerEmail].filter(Boolean).length > 0
    ? `${footerPhone ? `<span>📞 ${footerPhone}</span>` : ''} ${footerEmail ? `<span>✉️ ${footerEmail}</span>` : ''}`
    : `<span>Powered by ${systemName}</span>${statsText ? ` <span> · ${statsText}</span>` : ''}`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <title>${pageTitle}</title>
  <style>${getUnifiedOdooPrintStyles()}</style>
</head>
<body>
  <div class="odoo-page">
    <div class="odoo-header">
      <div class="odoo-logo">
        <img src="${SYSTEM_LOGO_PATH}" alt="${systemName}" />
      </div>
      <div class="odoo-brand">${systemName}</div>
      ${pageSubtitle ? `<div class="odoo-subtitle">${pageSubtitle}</div>` : ''}
    </div>
    <div class="odoo-title-banner">
      <h1 class="odoo-title">${pageTitle}</h1>
    </div>
    <div class="odoo-meta">
      <div class="odoo-meta-item"><span class="label">تاريخ الطباعة:</span><span class="value" dir="ltr">${printDate}</span></div>
    </div>
    ${infoHtml}
    <div class="odoo-content">
      ${tableHtml}
      ${summaryHtml}
    </div>
    <div class="odoo-footer">${footerContent}</div>
  </div>
</body>
</html>`;
}

export function openOdooStylePrint(options: OdooStylePrintOptions) {
  const w = window.open('', '_blank');
  if (!w) return;
  const html = buildOdooStyleHtml(options);
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 300);
}

/** لون الشريط الذهبي/البج الموحد للفاتورة */
const INVOICE_ACCENT = '#b8956e';
const INVOICE_ACCENT_DARK = '#8b6914';
const INVOICE_TEXT_ON_ACCENT = '#fff';
const INVOICE_BORDER = '#e5e7eb';

function buildInvoicePrintHtml(options: InvoicePrintOptions): string {
  const {
    companyName,
    companySlogan,
    taxNumber,
    invoiceTitle,
    invoiceNumber,
    clientName,
    clientNumber,
    date,
    currency,
    rows,
    subtotal,
    tax = '0.00',
    grandTotal,
    notes = [],
    footerPhone = '',
    footerWebsite = '',
  } = options;

  const totalRows = Math.max(rows.length, 8);
  const rowsHtml = Array.from({ length: totalRows }, (_, i) => {
    const row = rows[i];
    if (!row) {
      return `<tr><td class="inv-td inv-num">—</td><td class="inv-td">—</td><td class="inv-td inv-num">—</td><td class="inv-td inv-num">—</td><td class="inv-td inv-num">—</td></tr>`;
    }
    return `<tr>
  <td class="inv-td inv-num">${row.serial}</td>
  <td class="inv-td">${row.description}</td>
  <td class="inv-td inv-num">${row.quantity}</td>
  <td class="inv-td inv-num">${row.unitPrice}</td>
  <td class="inv-td inv-num">${row.total}</td>
</tr>`;
  }).join('');

  const notesHtml =
    notes.length > 0
      ? `<div class="inv-notes">
  <div class="inv-notes-title">ملاحظات</div>
  <ul>${notes.map(n => `<li>${n}</li>`).join('')}</ul>
</div>`
      : '';

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <title>${invoiceTitle}</title>
  <style>
    @page { margin: 4mm 3mm; size: 80mm auto; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: Cairo, Tajawal, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #fff;
      color: #374151;
      font-size: 13px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .inv-page {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      position: relative;
      background: #fff;
    }
    .inv-left-stripe {
      position: absolute;
      top: 0;
      left: 0;
      width: 5%;
      min-width: 18px;
      bottom: 0;
      background: ${INVOICE_ACCENT};
    }
    .inv-body { padding: 0 24px 20px; padding-left: calc(5% + 24px); }
    .inv-header {
      background: ${INVOICE_ACCENT};
      color: ${INVOICE_TEXT_ON_ACCENT};
      padding: 20px 24px;
      margin: 0 -24px 0 calc(-5% - 24px);
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .inv-header-logo {
      width: 48px;
      height: 48px;
      background: rgba(255,255,255,0.2);
      border-radius: 8px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .inv-header-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    .inv-header-text h1 { margin: 0; font-size: 22px; font-weight: 800; }
    .inv-header-text .slogan { margin: 4px 0 0; font-size: 12px; opacity: 0.95; }
    .inv-tax {
      margin: 12px 0 0;
      font-size: 12px;
      color: #6b7280;
    }
    .inv-main { margin-top: 20px; }
    .inv-doc-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid ${INVOICE_BORDER};
    }
    .inv-two-cols {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 24px;
    }
    .inv-col { flex: 1; }
    .inv-col .line { margin-bottom: 6px; font-size: 13px; }
    .inv-col .label { color: #6b7280; margin-left: 6px; }
    .inv-table-wrap { margin: 16px 0; overflow: hidden; border: 1px solid ${INVOICE_BORDER}; }
    .inv-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .inv-table thead tr { background: ${INVOICE_ACCENT}; color: ${INVOICE_TEXT_ON_ACCENT}; }
    .inv-table th {
      padding: 10px 12px;
      text-align: right;
      font-weight: 600;
      font-size: 12px;
    }
    .inv-td { padding: 10px 12px; border-bottom: 1px solid ${INVOICE_BORDER}; }
    .inv-num { text-align: right; }
    .inv-totals {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      max-width: 280px;
      margin-right: auto;
      margin-left: 0;
    }
    .inv-totals .row { display: flex; justify-content: space-between; width: 100%; padding: 4px 0; }
    .inv-totals .row.grand {
      background: ${INVOICE_ACCENT};
      color: ${INVOICE_TEXT_ON_ACCENT};
      margin-top: 8px;
      padding: 10px 14px;
      font-weight: 800;
      font-size: 15px;
      border-radius: 4px;
    }
    .inv-signature {
      margin-top: 24px;
      font-weight: 700;
      font-size: 13px;
      color: #374151;
    }
    .inv-signature-box { margin-top: 8px; height: 48px; border-bottom: 1px solid #9ca3af; }
    .inv-notes { margin-top: 20px; }
    .inv-notes-title { font-weight: 700; font-size: 13px; color: #374151; margin-bottom: 6px; }
    .inv-notes ul { margin: 0; padding-right: 20px; color: #4b5563; font-size: 12px; }
    .inv-thanks {
      text-align: center;
      margin: 20px 0 16px;
      font-size: 14px;
      color: #4b5563;
    }
    .inv-footer {
      background: ${INVOICE_ACCENT};
      color: ${INVOICE_TEXT_ON_ACCENT};
      padding: 12px 24px;
      margin: 0 -24px 0 calc(-5% - 24px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }
  </style>
</head>
<body>
    <div class="inv-page">
      <div class="inv-left-stripe"></div>
      <div class="inv-body">
        <header class="inv-header">
          <div class="inv-header-logo">
            <img src="${SYSTEM_LOGO_PATH}" alt="${companyName}" />
          </div>
          <div class="inv-header-text">
            <h1>${companyName}</h1>
            ${companySlogan ? `<div class="slogan">${companySlogan}</div>` : ''}
          </div>
        </header>
      ${taxNumber ? `<div class="inv-tax">الرقم الضريبي: ${taxNumber}</div>` : ''}
      <div class="inv-main">
        <div class="inv-doc-title">${invoiceTitle}</div>
        <div class="inv-two-cols">
          <div class="inv-col">
            <div class="line"><span class="label">اسم العميل:</span> ${clientName}</div>
            <div class="line"><span class="label">التاريخ:</span> ${date}</div>
          </div>
          <div class="inv-col">
            <div class="line"><span class="label">رقم العميل:</span> ${clientNumber ?? '—'}</div>
            <div class="line"><span class="label">رقم الفاتورة:</span> ${invoiceNumber}</div>
          </div>
        </div>
        <div class="inv-table-wrap">
          <table class="inv-table">
            <thead>
              <tr>
                <th>م</th>
                <th>البيان</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الاجمالي</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
        <div class="inv-totals">
          <div class="row"><span>السعر</span><span>${subtotal}</span></div>
          <div class="row"><span>الضريبة</span><span>${tax}</span></div>
          <div class="row grand"><span>الإجمالي</span><span>${grandTotal} ${currency}</span></div>
        </div>
        <div class="inv-signature">توقيع البائع</div>
        <div class="inv-signature-box"></div>
        ${notesHtml}
        <div class="inv-thanks">شكرا لكم!</div>
      </div>
      <footer class="inv-footer">
        <span>${footerPhone || ' '}</span>
        <span>${footerWebsite || ' '}</span>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

/** بناء HTML للفواتير/عروض السعر بتصميم حديث مخصص للفواتير */
function buildQuotationInvoicePrintHtml(options: QuotationInvoicePrintOptions): string {
  const {
    documentTitle,
    documentNumber,
    quotationDate,
    expirationDate,
    customerName,
    customerAddress,
    customerPhone,
    customerEmail,
    currency,
    rows,
    untaxedAmount,
    discountAmount,
    taxPercent,
    total,
    paidAmount,
    remainingAmount,
    companyName = '',
    companySubtitle,
    footerPhone,
    footerEmail,
    salespersonName,
    salespersonPhone,
    warehouseName,
    paymentMethodLabel,
    paymentStatusLabel,
    mode,
    rentalGeneratorName,
    rentalPeriodText,
    maintenanceDescription,
    maintenanceNotes,
  } = options;

  const isPurchase = documentTitle.includes('شراء');
  const isRentalMode = mode === 'rental';
  const isMaintenanceMode = mode === 'maintenance';

  const tableRowsHtml = isRentalMode
    ? (rows.length > 0
        ? rows
            .map(
              (r) => `
          <tr>
            <td>${r.productName}</td>
            <td>${r.quantity}</td>
            <td>${r.unitPrice}</td>
            <td>${r.amount}</td>
          </tr>`
            )
            .join('')
        : `<tr><td colspan="4" class="no-items">لا توجد بيانات لهذا العقد.</td></tr>`)
    : isMaintenanceMode
    ? (rows.length > 0
        ? rows
            .map(
              (r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.productName}</td>
            <td>${r.unitPrice}</td>
            <td>${r.amount}</td>
          </tr>`
            )
            .join('')
        : `<tr><td colspan="4" class="no-items">لا توجد بيانات لهذا الطلب.</td></tr>`)
    : rows.length > 0
    ? rows
        .map(
          (r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.productName}</td>
            <td>${r.quantity}</td>
            <td>${r.unitPrice}</td>
            <td>${r.amount}</td>
          </tr>`
        )
        .join('')
    : `<tr><td colspan="5" class="no-items">لا توجد أصناف في هذه الفاتورة.</td></tr>`;

  const paidRowHtml =
    paidAmount != null
      ? `<div class="sum-row">
           <span class="label">المدفوع</span>
           <span class="value text-green">${paidAmount} ${currency}</span>
         </div>`
      : '';

  const remainingRowHtml =
    remainingAmount != null
      ? `<div class="sum-row">
           <span class="label">المتبقي</span>
           <span class="value text-red">${remainingAmount} ${currency}</span>
         </div>`
      : '';

  const discountRowHtml =
    discountAmount != null && !isMaintenanceMode
      ? `<div class="sum-row">
           <span class="label">الخصم</span>
           <span class="value text-amber">${discountAmount} ${currency}</span>
         </div>`
      : '';

  const footerContent =
    [footerPhone, footerEmail].filter(Boolean).length > 0
      ? `${footerPhone ? `<span>📞 ${footerPhone}</span>` : ''} ${
          footerEmail ? `<span>✉️ ${footerEmail}</span>` : ''
        }`
      : companyName
      ? `<span>${companyName}</span>`
      : '<span>Powered by PowerCore ERP</span>';

  const isSale = documentTitle.includes('بيع');
  const docNumberHtml =
    documentNumber && !isPurchase && !isSale && !isRentalMode
      ? `<div class="inv-doc-meta"><span class="badge-soft">${documentNumber}</span></div>`
      : '';

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <title>${documentTitle}</title>
  <style>
    @page { margin: 12mm; size: A4; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: Cairo, Tajawal, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f7f2fa;
      color: #111827;
      font-size: 11px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .inv-wrapper {
      max-width: 380px;
      margin: 0 auto;
      padding: 8px;
    }
    .inv-paper {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(15,23,42,0.16);
      overflow: hidden;
      padding: 12px 14px 10px;
    }
    .inv-header {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 4px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .inv-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #f4e8f7;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
      overflow: hidden;
    }
    .inv-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    .inv-brand {
      font-size: 16px;
      font-weight: 800;
      color: ${ODOO_PURPLE};
    }
    .inv-subtitle {
      margin-top: 2px;
      font-size: 9px;
      color: #6b7280;
    }
    .inv-doc-type {
      font-size: 14px;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }
    .inv-doc-meta {
      margin-top: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #111827;
    }
    .badge-soft {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 999px;
      font-size: 9px;
      color: ${ODOO_PURPLE};
      background: #f4e8f7;
      margin-right: 4px;
    }
    .inv-section-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      margin-top: 10px;
    }
    .inv-card {
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      padding: 6px 8px;
      background: #fdfbff;
    }
    .inv-card-title {
      font-size: 10px;
      font-weight: 800;
      color: ${ODOO_PURPLE_DARK};
      margin-bottom: 4px;
    }
    .inv-card-row {
      font-size: 11px;
      margin-bottom: 2px;
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .inv-card-row .label {
      color: #6b7280;
      min-width: 70px;
      font-weight: 700;
    }
    .inv-card-row .value {
      font-weight: 700;
      color: #111827;
    }
    .inv-table-wrapper {
      margin-top: 20px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    thead tr {
      background: linear-gradient(90deg, ${ODOO_PURPLE_DARK}, ${ODOO_PURPLE});
      color: #ffffff;
    }
    th, td {
      padding: 6px 8px;
      text-align: right;
      border-left: 1px solid #e5e7eb;
    }
    th {
      font-weight: 800;
      font-size: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    tbody td {
      font-weight: 600;
    }
    tbody tr:nth-child(even) td {
      background: #f9fafb;
    }
    tbody tr td:first-child {
      color: #111827;
      font-size: 11px;
      width: auto;
    }
    .no-items {
      text-align: center;
      color: #9ca3af;
      font-size: 11px;
      padding: 10px 8px;
    }
    .inv-summary {
      margin-top: 10px;
      display: flex;
      justify-content: center;
    }
    .inv-summary-box {
      width: 100%;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      padding: 8px 10px;
      background: #f9fafb;
    }
    .sum-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 3px;
    }
    .sum-row .label {
      color: #6b7280;
      font-weight: 800;
    }
    .sum-row .value {
      font-weight: 800;
      color: #111827;
    }
    .sum-row.total {
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px dashed #d1d5db;
      font-size: 12px;
    }
    .sum-row.total .value {
      color: ${ODOO_PURPLE};
      font-size: 13px;
    }
    .text-green { color: #16a34a; }
    .text-red { color: #dc2626; }
    .text-amber { color: #d97706; }
    .rental-period {
      font-size: 10px;
      color: #6b7280;
      display: block;
      margin-top: 2px;
    }
    .inv-footer {
      margin-top: 10px;
      padding-top: 6px;
      border-top: 1px solid #e5e7eb;
      font-size: 9px;
      color: #6b7280;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .inv-footer-brand {
      font-weight: 600;
      color: ${ODOO_PURPLE};
    }
    @media print {
      body {
        background: #ffffff;
      }
      .inv-wrapper {
        padding: 0;
      }
      .inv-paper {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="inv-wrapper">
    <div class="inv-paper">
      <header class="inv-header">
        <div class="inv-logo">
          <img src="${SYSTEM_LOGO_PATH}" alt="${companyName || 'PowerCore ERP'}" />
        </div>
        <div class="inv-brand">${companyName || 'PowerCore ERP'}</div>
        ${companySubtitle ? `<div class="inv-subtitle">${companySubtitle}</div>` : ''}
        <p class="inv-doc-type">${documentTitle}</p>
        ${docNumberHtml}
        <div class="inv-doc-meta">
          <span>تاريخ الفاتورة: ${quotationDate}</span>
          ${expirationDate ? ` · <span>صالح حتى: ${expirationDate}</span>` : ''}
        </div>
      </header>

      <section class="inv-section-grid">
        <div class="inv-card">
          <div class="inv-card-title">${isPurchase ? 'بيانات المورد' : 'بيانات العميل'}</div>
          <div class="inv-card-row">
            <span class="label">الاسم</span>
            <span class="value">${customerName}</span>
          </div>
          <div class="inv-card-row">
            <span class="label">العنوان</span>
            <span class="value">${customerAddress || '—'}</span>
          </div>
          ${
            customerPhone
              ? `<div class="inv-card-row">
            <span class="label">الهاتف</span>
            <span class="value">${customerPhone}</span>
          </div>`
              : ''
          }
          ${
            isRentalMode && rentalGeneratorName
              ? `<div class="inv-card-row">
            <span class="label">المولد</span>
            <span class="value">${rentalGeneratorName}</span>
          </div>`
              : ''
          }
          ${
            isRentalMode && rentalPeriodText
              ? `<div class="inv-card-row">
            <span class="label">فترة الإيجار</span>
            <span class="value">${rentalPeriodText}</span>
          </div>`
              : ''
          }
        </div>

        ${
          isRentalMode
            ? ''
            : isMaintenanceMode
            ? `<div class="inv-card">
          <div class="inv-card-title">بيانات مسؤول الصيانة</div>
          <div class="inv-card-row">
            <span class="label">اسم المسؤول</span>
            <span class="value">${salespersonName || '—'}</span>
          </div>
          ${
            salespersonPhone
              ? `<div class="inv-card-row">
            <span class="label">هاتف المسؤول</span>
            <span class="value">${salespersonPhone}</span>
          </div>`
              : ''
          }
          ${
            paymentStatusLabel
              ? `<div class="inv-card-row">
            <span class="label">حالة الطلب</span>
            <span class="value">${paymentStatusLabel}</span>
          </div>`
              : ''
          }
        </div>`
            : `<div class="inv-card">
          <div class="inv-card-title">${isPurchase ? 'بيانات مسؤول الشراء والدفع' : 'بيانات البائع والدفع'}</div>
          <div class="inv-card-row">
            <span class="label">${isPurchase ? 'مسؤول الشراء' : 'البائع'}</span>
            <span class="value">${salespersonName || '—'}</span>
          </div>
          ${
            salespersonPhone
              ? `<div class="inv-card-row">
            <span class="label">هاتف المسؤول</span>
            <span class="value">${salespersonPhone}</span>
          </div>`
              : ''
          }
          <div class="inv-card-row">
            <span class="label">المخزن</span>
            <span class="value">${warehouseName || '—'}</span>
          </div>
          <div class="inv-card-row">
            <span class="label">طريقة الدفع</span>
            <span class="value">${paymentMethodLabel || '—'}</span>
          </div>
        </div>`
        }
      </section>

      <section class="inv-table-wrapper">
        <table>
          <thead>
            <tr>
              ${
                isRentalMode
                  ? `<th>البيان</th>
              <th>عدد الأيام</th>
              <th>سعر اليوم (${currency})</th>
              <th>إجمالي العقد (${currency})</th>`
                  : isMaintenanceMode
                  ? `<th>#</th>
              <th>نوع المشكلة</th>
              <th>تكلفة الصيانة (${currency})</th>
              <th>الإجمالي (${currency})</th>`
                  : `<th>#</th>
              <th>البيان</th>
              <th>الكمية</th>
              <th>سعر الوحدة (${currency})</th>
              <th>الإجمالي (${currency})</th>`
              }
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </section>

      <section class="inv-summary">
        <div class="inv-summary-box">
          ${
            isRentalMode
              ? `
          <div class="sum-row">
            <span class="label">إجمالي العقد</span>
            <span class="value">${total} ${currency}</span>
          </div>
          ${paidRowHtml.replace('المدفوع', 'المدفوع مقدماً')}
          ${remainingRowHtml}
          `
              : `
          ${!isMaintenanceMode ? `
          <div class="sum-row">
            <span class="label">المجموع قبل الخصم</span>
            <span class="value">${untaxedAmount} ${currency}</span>
          </div>` : ''}
          ${discountRowHtml}
          ${paidRowHtml}
          ${remainingRowHtml}
          <div class="sum-row total">
            <span class="label">${isMaintenanceMode ? 'إجمالي الصيانة' : 'الإجمالي'}</span>
            <span class="value">${total} ${currency}</span>
          </div>
          `
          }
        </div>
      </section>

      <footer class="inv-footer">
        <span class="inv-footer-brand">${companyName || 'PowerCore ERP'}</span>
        <span>${footerContent}</span>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

/** فتح نافذة طباعة عرض السعر / الفاتورة (تخطيط مرجعي) */
export function openQuotationInvoicePrint(options: QuotationInvoicePrintOptions) {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(buildQuotationInvoicePrintHtml(options));
  w.document.close();
  setTimeout(() => w.print(), 300);
}

/** تحميل عرض السعر / الفاتورة كـ PDF */
export async function downloadQuotationInvoicePDF(options: QuotationInvoicePrintOptions): Promise<void> {
  const html = buildQuotationInvoicePrintHtml(options);
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '680px';
  document.body.appendChild(container);
  const opt = {
    margin: 10,
    filename: (options.fileName || options.documentTitle).replace(/[^\w\u0600-\u06FF\s-]/g, '') + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  };
  await html2pdf().set(opt).from(container.querySelector('.odoo-page') || container).save();
  document.body.removeChild(container);
}

/** فتح نافذة طباعة الفاتورة بالتنسيق الموحد (شريط ذهبي) */
export function openInvoicePrint(options: InvoicePrintOptions) {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(buildInvoicePrintHtml(options));
  w.document.close();
  setTimeout(() => w.print(), 300);
}

/** تحميل الفاتورة كـ PDF */
export async function downloadInvoicePDF(options: InvoicePrintOptions): Promise<void> {
  const html = buildInvoicePrintHtml(options);
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm';
  document.body.appendChild(container);
  const opt = {
    margin: 8,
    filename: (options.fileName || options.invoiceTitle).replace(/[^\w\u0600-\u06FF\s-]/g, '') + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  };
  await html2pdf().set(opt).from(container.querySelector('.inv-page') || container).save();
  document.body.removeChild(container);
}

function buildMultiSectionHtml(options: MultiSectionPrintOptions): string {
  const { systemName, pageTitle, pageSubtitle, sections, footerPhone, footerEmail } = options;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const printDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

  const sectionsHtml = sections.map(sec => {
    const summaryHtml = (sec.summaryBlocks?.length ?? 0) > 0
      ? `<div class="odoo-summary-box" style="margin-top:12px">${sec.summaryBlocks!.map(b =>
          `<div class="odoo-summary-item"><div class="label">${b.label}</div><div class="value">${b.value}</div></div>`
        ).join('')}</div>`
      : '';
    return `<div class="odoo-content" style="page-break-inside: avoid;">
      <h3 class="odoo-section-title">${sec.title}</h3>
      ${sec.tableHtml}
      ${summaryHtml}
    </div>`;
  }).join('');

  const footerContent = [footerPhone, footerEmail].filter(Boolean).length > 0
    ? `${footerPhone ? `<span>📞 ${footerPhone}</span>` : ''} ${footerEmail ? `<span>✉️ ${footerEmail}</span>` : ''}`
    : `<span>Powered by ${systemName}</span>`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <title>${pageTitle}</title>
  <style>${getUnifiedOdooPrintStyles()}</style>
</head>
<body>
  <div class="odoo-page">
    <div class="odoo-header">
      <div class="odoo-logo">
        <img src="${SYSTEM_LOGO_PATH}" alt="${systemName}" />
      </div>
      <div class="odoo-brand">${systemName}</div>
      ${pageSubtitle ? `<div class="odoo-subtitle">${pageSubtitle}</div>` : ''}
    </div>
    <div class="odoo-title-banner">
      <h1 class="odoo-title">${pageTitle}</h1>
    </div>
    <div class="odoo-meta">
      <div class="odoo-meta-item"><span class="label">تاريخ الطباعة:</span><span class="value" dir="ltr">${printDate}</span></div>
    </div>
    ${sectionsHtml}
    <div class="odoo-footer">${footerContent}</div>
  </div>
</body>
</html>`;
}

/** طباعة تقرير متعدد الأقسام */
export function openMultiSectionPrint(options: MultiSectionPrintOptions) {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(buildMultiSectionHtml(options));
  w.document.close();
  setTimeout(() => w.print(), 300);
}

/** تحميل تقرير متعدد الأقسام كـ PDF */
export async function downloadMultiSectionPDF(options: MultiSectionPrintOptions): Promise<void> {
  const html = buildMultiSectionHtml(options);
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '680px';
  document.body.appendChild(container);
  const opt = {
    margin: 10,
    filename: (options.fileName || options.pageTitle).replace(/[^\w\u0600-\u06FF\s-]/g, '') + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  };
  await html2pdf().set(opt).from(container.querySelector('.odoo-page') || container).save();
  document.body.removeChild(container);
}

/** تحميل التقرير كملف PDF */
export async function downloadOdooStylePDF(options: OdooStylePrintOptions): Promise<void> {
  const html = buildOdooStyleHtml(options);
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '680px';
  document.body.appendChild(container);

  const opt = {
    margin: 10,
    filename: (options.fileName || options.pageTitle).replace(/[^\w\u0600-\u06FF\s-]/g, '') + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  };

  await html2pdf().set(opt).from(container.querySelector('.odoo-page') || container).save();
  document.body.removeChild(container);
}

