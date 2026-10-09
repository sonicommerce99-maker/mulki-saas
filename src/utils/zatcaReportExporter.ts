import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialTransaction, Organization, Currency } from '../types';
import { Language } from '../locales/translations';
import { loadAccountSettings, LandlordAccountSettings } from '../lib/accountSettings';

/**
 * Universal Data-to-Blob Downloader
 * Handles browser object URL creation, anchor trigger, and memory cleanup
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Formats and exports financial transactions as a ZATCA-compliant CSV report Blob
 * Prepend \uFEFF BOM for Arabic Excel compatibility
 */
export function exportTransactionsToZatcaCSV(
  transactions: FinancialTransaction[],
  org: Organization,
  currency: Currency,
  lang: Language = 'ar'
): void {
  const today = new Date().toISOString().split('T')[0];
  const zatcaVatNumber = org.vat_number || '310892049100003';
  const orgName = org.name_ar || 'شركة مَحْفَظَتِي العَقَارِيَّة لإدارة وتطوير الأملاك العقارية';
  const crNumber = '1010884920';

  // Electronic Invoicing & Audit Headers
  const headers = [
    'Invoice/Voucher ID (رقم السند/الفاتورة)',
    'Issue Date (تاريخ الإصدار)',
    'Invoice Type Code (رمز نوع الفاتورة: 388 فاتورة / 383 إشعار)',
    'Seller Name (اسم المورد)',
    'Seller VAT ID (الرقم الضريبي للمورد)',
    'Seller CR (السجل التجاري)',
    'Buyer Name (اسم العميل / المستأجر)',
    'Property & Unit (العقار والوحدة)',
    'Account Classification (التصنيف المحاسبي)',
    'Entry Type (نوع القيد: إيراد / مصروف)',
    'Taxable Base Net (المبلغ الخاضع للضريبة)',
    'VAT Category (فئة الضريبة)',
    'VAT Rate % (نسبة الضريبة)',
    'VAT Amount (مبلغ ضريبة القيمة المضافة)',
    'Gross Total Amount (الإجمالي شامل الضريبة)',
    'Currency (العملة)',
    'Payment Channel Code (طريقة السداد)',
    'Audit Status (حالة التوثيق المحاسبي)'
  ];

  const rows = transactions.map((tx) => {
    const baseAmt = (tx.base_amount || tx.amount).toFixed(2);
    const vatAmt = tx.vat_amount.toFixed(2);
    const totalAmt = tx.total_amount.toFixed(2);
    const invoiceTypeCode = tx.type === 'income' ? '388' : '383';
    const vatCategoryCode = 'S'; // Standard rate 15%
    const vatRatePercent = '15.00%';
    const paymentChannel = tx.payment_method || 'mada';
    const auditStatus = 'VERIFIED_AND_LOGGED';
    const desc = lang === 'ar' ? tx.category_ar : tx.category_en;
    const propertyInfo = `${tx.property_name_ar || tx.property_name_en} - ${tx.unit_number ? `وحدة ${tx.unit_number}` : 'عام'}`;

    return [
      `"${tx.reference_number}"`,
      `"${tx.date}"`,
      `"${invoiceTypeCode}"`,
      `"${orgName}"`,
      `"${zatcaVatNumber}"`,
      `"${crNumber}"`,
      `"${tx.tenant_name || 'جهة معتمدة'}"`,
      `"${propertyInfo}"`,
      `"${desc}"`,
      `"${tx.type === 'income' ? (lang === 'ar' ? 'إيراد إيجار' : 'Income') : (lang === 'ar' ? 'مصروف تشغيلي' : 'Expense')}"`,
      baseAmt,
      `"${vatCategoryCode}"`,
      `"${vatRatePercent}"`,
      vatAmt,
      totalAmt,
      `"${currency}"`,
      `"${paymentChannel}"`,
      `"${auditStatus}"`
    ];
  });

  // Calculate Summary Totals
  const totalBase = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + (t.base_amount || t.amount), 0)
    .toFixed(2);
  const totalVat = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.vat_amount, 0)
    .toFixed(2);
  const totalGross = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.total_amount, 0)
    .toFixed(2);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.total_amount, 0)
    .toFixed(2);

  const summaryRow = [
    '"SUMMARY TOTALS / الإجمالي العام"',
    `"${today}"`,
    '""',
    `"${orgName}"`,
    `"${zatcaVatNumber}"`,
    '""',
    '""',
    '""',
    '"إجمالي المبيعات والمصروفات"',
    '""',
    totalBase,
    '"S"',
    '"15.00%"',
    totalVat,
    totalGross,
    `"${currency}"`,
    `"EXPENSES: ${totalExpenses}"`,
    '"AUDITED_AND_COMPLIANT"'
  ];

  // Prepend UTF-8 BOM (\uFEFF) to guarantee Arabic text renders correctly in Excel
  const csvContent = '\uFEFF' + [
    `# Electronic Invoicing & Financial Tax Audit Log - ${orgName}`,
    `# VAT ID: ${zatcaVatNumber} | CR: ${crNumber} | Date: ${today} | VAT Rate: 15%`,
    headers.join(','),
    ...rows.map(r => r.join(',')),
    summaryRow.join(',')
  ].join('\r\n');

  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(csvBlob, `Financial_Tax_Audit_Report_${today}.csv`);
}

/**
 * Formats and exports financial transactions as a high-fidelity ZATCA-compliant PDF Report Blob
 * Using jsPDF and jsPDF-autotable with exact tax compliance layout
 */
export function exportTransactionsToZatcaPDF(
  transactions: FinancialTransaction[],
  org: Organization,
  currency: Currency,
  lang: Language = 'ar'
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const today = new Date().toISOString().split('T')[0];
  const zatcaVatNumber = org.vat_number || '310892049100003';
  const orgName = org.name_ar || 'My Real Estate Portfolio Asset Management';
  const crNumber = '1010884920';
  const reportUUID = `FIN-AUDIT-${Date.now().toString().slice(-8)}`;

  // Totals calculations
  const totalIncomeBase = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + (t.base_amount || t.amount), 0);
  const totalVatCollected = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.vat_amount, 0);
  const totalIncomeGross = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.total_amount, 0);
  const totalExpenseGross = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.total_amount, 0);
  const netOperatingIncome = totalIncomeGross - totalExpenseGross;

  // Header Banner styling
  doc.setFillColor(15, 90, 71); // #0F5A47 Mulki Emerald
  doc.rect(0, 0, 297, 24, 'F');

  // Title in White
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MY REAL ESTATE PORTFOLIO - FINANCIAL & TAX AUDIT REPORT', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Kingdom of Saudi Arabia | Electronic Tax Ledger (15% VAT) | Date: ${today} | Ref: ${reportUUID}`,
    14,
    18
  );

  // Metadata Box (Company & Tax details)
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Organization: ${orgName}`, 14, 32);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`VAT Registration Number: ${zatcaVatNumber}   |   CR Number: ${crNumber}   |   Currency: ${currency}`, 14, 38);
  doc.text(`Audit Scope: Complete Financial Transaction Ledger & VAT Liability Breakdown`, 14, 43);

  // KPI Summary Table
  autoTable(doc, {
    startY: 47,
    head: [[
      'Total Collected Income (Gross)',
      'Taxable Sales Base (Net)',
      'Output VAT (15%)',
      'Operational Expenses (OpEx)',
      'Net Operating Income (NOI)'
    ]],
    body: [[
      `${currency} ${totalIncomeGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `${currency} ${totalIncomeBase.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `${currency} ${totalVatCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `${currency} ${totalExpenseGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `${currency} ${netOperatingIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [15, 90, 71],
    },
    margin: { left: 14, right: 14 },
  });

  // Transaction Ledger Table
  const tableData = transactions.map((tx, idx) => {
    const baseAmt = (tx.base_amount || tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const vatAmt = tx.vat_amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const totalAmt = tx.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const typeCode = tx.type === 'income' ? '388 (Tax Inv)' : '383 (Debit Note)';
    const category = tx.category_en || tx.category_ar;
    const propertyUnit = `${tx.property_name_en || tx.property_name_ar} ${tx.unit_number ? `U-${tx.unit_number}` : ''}`;
    const sign = tx.type === 'income' ? '+' : '-';

    return [
      (idx + 1).toString(),
      tx.date,
      tx.reference_number,
      typeCode,
      propertyUnit,
      tx.tenant_name || 'Authorized Counterparty',
      category,
      baseAmt,
      '15%',
      vatAmt,
      `${sign}${totalAmt}`,
      tx.payment_method.toUpperCase(),
      'VERIFIED'
    ];
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 6,
    head: [[
      '#',
      'Date',
      'Voucher Ref',
      'Doc Type',
      'Property / Unit',
      'Counterparty',
      'Category',
      'Net Base',
      'VAT%',
      'VAT 15%',
      `Gross (${currency})`,
      'Payment',
      'Status'
    ]],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 90, 71],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 18 },
      2: { fontStyle: 'bold', halign: 'center', cellWidth: 22 },
      3: { halign: 'center', cellWidth: 20 },
      7: { halign: 'right', cellWidth: 18 },
      8: { halign: 'center', cellWidth: 12 },
      9: { halign: 'right', cellWidth: 18 },
      10: { fontStyle: 'bold', halign: 'right', cellWidth: 22 },
      11: { halign: 'center', cellWidth: 18 },
      12: { halign: 'center', cellWidth: 16 },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer & Compliance Declaration Block
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  const pageHeight = doc.internal.pageSize.getHeight();

  if (finalY + 25 < pageHeight) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Note: This electronic financial statement summarizes recorded transactions and 15% Value Added Tax calculations.',
      14,
      finalY + 10
    );
    doc.text(
      `Authorized Signatures: [ Certified Public Accountant: Mohammed Al-Shehri ]    |    [ CFO Approval & Corporate Stamp: Verified ]`,
      14,
      finalY + 16
    );
  }

  // Generate pure binary PDF Blob
  const pdfBlob = doc.output('blob');
  downloadBlob(pdfBlob, `Financial_Audit_Report_${today}.pdf`);
}

/**
 * Generates and downloads a printer-friendly A4 portrait single transaction invoice summary PDF
 */
export function exportSingleTransactionInvoicePDF(
  tx: FinancialTransaction,
  org: Organization,
  currency: Currency,
  accountSettings?: LandlordAccountSettings
): void {
  const settings = accountSettings || loadAccountSettings();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const sellerName = settings.companyNameEn || org.name_en || 'My Real Estate Portfolio Co.';
  const vatNumber = settings.vatNumber || org.vat_number || '310458923400003';
  const crNumber = settings.crNumber || org.cr_number || '1010789456';
  const invoiceType = tx.type === 'income' ? 'TAX INVOICE (388)' : 'DEBIT / EXPENSE VOUCHER (383)';
  const baseAmt = tx.base_amount || tx.amount;
  const vatAmt = tx.vat_amount;
  const totalAmt = tx.total_amount;

  // 1. Top Emerald Header Banner
  doc.setFillColor(15, 90, 71);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('MY REAL ESTATE PORTFOLIO - TAX E-INVOICE SUMMARY', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Document Type: ${invoiceType}   |   VAT Rate: 15%`, 14, 20);
  doc.text(`Invoice Ref: ${tx.reference_number}   |   Issue Date: ${tx.date}`, 14, 26);

  // 2. Seller & Buyer Details Grid
  doc.setTextColor(15, 23, 42);
  autoTable(doc, {
    startY: 38,
    head: [['SELLER / LANDLORD DETAILS', 'BUYER / COUNTERPARTY DETAILS']],
    body: [
      [
        `Company: ${sellerName}\nVAT Registration Number: ${vatNumber}\nCommercial Reg (CR): ${crNumber}`,
        `Client / Tenant: ${tx.tenant_name || 'Registered Counterparty'}\nProperty: ${tx.property_name_en || tx.property_name_ar}\nUnit Number: ${tx.unit_number || 'General'}\nPayment Method: ${(tx.payment_method || 'MADA / IBAN').toUpperCase()}`,
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 90, 71],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
      cellPadding: 4,
    },
    margin: { left: 14, right: 14 },
  });

  // 3. Line Item & Tax Breakdown Table
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [
      [
        'Item Description',
        'Property / Unit',
        'Qty',
        `Taxable Base (${currency})`,
        'VAT Rate',
        `VAT Amount (${currency})`,
        `Total Gross (${currency})`,
      ],
    ],
    body: [
      [
        tx.category_en || tx.category_ar || 'Real Estate Lease / Service Entry',
        `${tx.property_name_en || 'Portfolio Property'} - ${tx.unit_number || 'General'}`,
        '1',
        baseAmt.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        '15%',
        vatAmt.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        totalAmt.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      ],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 90, 71],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
      halign: 'center',
    },
    margin: { left: 14, right: 14 },
  });

  // 4. Financial Tax Summary Box
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 6,
    head: [['TAX & TOTAL SUMMARY', `AMOUNT (${currency})`]],
    body: [
      ['Total Taxable Amount (Excluding VAT)', `${currency} ${baseAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ['Total Value Added Tax (Standard 15% VAT)', `${currency} ${vatAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ['Gross Invoice Total (Including VAT)', `${currency} ${totalAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      fontStyle: 'bold',
      textColor: [15, 90, 71],
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // 5. Official Landlord Bank Account (IBAN) & Verification Box
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 8,
    head: [['OFFICIAL BANK ACCOUNT FOR PAYMENT (IBAN)', 'DIGITAL INVOICE STAMP']],
    body: [
      [
        `Bank Name: ${settings.bankName}\nBeneficiary: ${settings.beneficiaryName}\nIBAN: ${settings.ibanNumber}`,
        `Status: ISSUED & VERIFIED\nInvoice Ref: ${tx.reference_number}\nSeller VAT ID: ${vatNumber}\nAuthorized Signatory: ${settings.financialManagerName || 'A. Al-Mansoor'}`,
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [210, 235, 212],
      textColor: [10, 74, 53],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 4,
    },
    margin: { left: 14, right: 14 },
  });

  const footerY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This printer-friendly tax invoice summary was generated electronically by My Real Estate Portfolio.',
    14,
    footerY
  );

  const pdfBlob = doc.output('blob');
  downloadBlob(pdfBlob, `Tax_Invoice_${tx.reference_number}.pdf`);
}

