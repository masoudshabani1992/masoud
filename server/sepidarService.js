import { db, getAllSettings } from './db.js';

export function buildSepidarPayload(sale) {
  const settings = getAllSettings();
  const multiplier = Number(settings.sepidar_currency_multiplier || 10) || 1;
  const currencyLabel = multiplier === 10 ? 'ریال' : 'تومان';

  const brand = db.prepare('SELECT * FROM battery_brands WHERE id = ?').get(sale.brand_id);
  const category = db.prepare('SELECT * FROM battery_categories WHERE id = ?').get(sale.category_id);
  const rateRow = db
    .prepare('SELECT * FROM brand_category_rates WHERE brand_id = ? AND category_id = ?')
    .get(sale.brand_id, sale.category_id);

  const posTerminal = sale.pos_terminal_id
    ? db.prepare('SELECT * FROM pos_terminals WHERE id = ?').get(sale.pos_terminal_id)
    : null;

  const itemPrefix = rateRow?.sepidar_item_prefix || `${brand?.code?.toUpperCase() || 'BAT'}-${category?.code?.toUpperCase() || 'GEN'}`;
  const sepidarItemCode = `${itemPrefix}-${sale.amperage}AH`;
  const warehouseCode = category?.sepidar_warehouse_code || '101';
  const scrapWarehouseCode = category?.sepidar_scrap_warehouse_code || '102';
  const scrapItemCode = category?.sepidar_scrap_item_code || 'DAGHI-01';

  const grossSepidar = Math.round(sale.gross_amount * multiplier);
  const scrapSepidar = Math.round(sale.scrap_deduction_amount * multiplier);
  const finalPaidSepidar = Math.round(sale.final_sale_amount * multiplier);
  const manualDiffToman = sale.calculated_net_amount - sale.final_sale_amount; // >0 means discount, <0 means extra charge
  const manualDiffSepidar = Math.round(manualDiffToman * multiplier);

  // Payment mapping
  let settlementType = 'Cash';
  let treasuryTargetCode = settings.sepidar_cash_fund_code || 'FUND-101';
  let treasuryAccountCode = settings.sepidar_cash_sl_code || '111001';
  let treasuryTitle = 'صندوق نقد فروشگاه';

  if (sale.payment_method === 'pos') {
    settlementType = 'PosReceipt';
    treasuryTargetCode = posTerminal?.sepidar_pos_code || 'POS-DEFAULT';
    treasuryAccountCode = posTerminal?.sepidar_dl_code || '112001';
    treasuryTitle = posTerminal ? `${posTerminal.terminal_title} (${posTerminal.sepidar_pos_code})` : `کارتخوان ${sale.pos_bank_name}`;
  } else if (sale.payment_method === 'transfer') {
    settlementType = 'BankDraft';
    treasuryTargetCode = settings.sepidar_transfer_bank_code || 'BANK-TR-01';
    treasuryAccountCode = settings.sepidar_transfer_sl_code || '112005';
    treasuryTitle = `حساب بانکی واریزی (${treasuryTargetCode})`;
  }

  // Build Balanced Double-Entry Accounting Voucher Preview (سند حسابداری دوبل سپیدار)
  const voucherLines = [];

  // 1. Debit: Bank POS / Cash / Transfer for net collected cash
  if (finalPaidSepidar > 0) {
    voucherLines.push({
      row: voucherLines.length + 1,
      accountCode: treasuryAccountCode,
      accountTitle: treasuryTitle,
      description: `بابت دریافت فاکتور ${sale.invoice_number} (لیبل ${sale.label_number})${sale.payment_ref ? ` - پیگیری ${sale.payment_ref}` : ''}`,
      debit: finalPaidSepidar,
      credit: 0,
    });
  }

  // 2. Debit: Scrap Battery Inventory / Trade-in Value
  if (scrapSepidar > 0) {
    voucherLines.push({
      row: voucherLines.length + 1,
      accountCode: settings.sepidar_scrap_sl_code || '151005',
      accountTitle: `موجودی انبار باتری داغی (${sale.scrap_category_name || sale.category_name} - ${sale.total_scrap_amps} آمپر)`,
      description: `دریافت داغی ${sale.scrap_amperage} آمپر (${sale.scrap_quantity} عدد) از مشتری بابت فاکتور ${sale.invoice_number}`,
      debit: scrapSepidar,
      credit: 0,
    });
  }

  // 3. Handle manual discount or price adjustment so Debit == Credit always balances
  if (manualDiffSepidar > 0) {
    voucherLines.push({
      row: voucherLines.length + 1,
      accountCode: '612002',
      accountTitle: 'تخفیفات نقدی فروش',
      description: `تخفیف دستی ثبت شده روی فاکتور ${sale.invoice_number}`,
      debit: manualDiffSepidar,
      credit: 0,
    });
  }

  // 4. Credit: Battery Sales Revenue
  voucherLines.push({
    row: voucherLines.length + 1,
    accountCode: settings.sepidar_sale_sl_code || '611001',
    accountTitle: `فروش کالای تجاری (${sale.category_name} - برند ${sale.brand_name})`,
    description: `فروش ${sale.quantity} عدد ${sale.category_name} ${sale.brand_name} ${sale.amperage} آمپر (لیبل ${sale.label_number})`,
    debit: 0,
    credit: grossSepidar + (manualDiffSepidar < 0 ? Math.abs(manualDiffSepidar) : 0),
  });

  const apiPayload = {
    FiscalYear: Number(settings.sepidar_fiscal_year || 1405),
    IntegrationId: settings.sepidar_integration_key || 'KAVEH-SABA-POS-01',
    AuthUser: settings.sepidar_username || '',
    Currency: currencyLabel,
    SaleInvoice: {
      ExternalNumber: sale.invoice_number,
      LabelSerialNumber: sale.label_number,
      Date: sale.created_at,
      CustomerCode: settings.sepidar_default_customer_code || '10001',
      CustomerName: sale.customer_name || 'مشتری حضوری فروشگاه باتری کاوه',
      CustomerPhone: sale.customer_phone || '',
      CashierName: sale.cashier_name,
      Items: [
        {
          RowNumber: 1,
          WarehouseCode: warehouseCode,
          ItemCode: sepidarItemCode,
          ItemTitle: `${sale.category_name} ${sale.brand_name} ${sale.amperage} آمپر`,
          Quantity: sale.quantity,
          TotalAmperage: sale.total_sold_amps,
          FeePerAmpere: sale.unit_price_per_amp * multiplier,
          UnitPrice: Math.round((sale.gross_amount / sale.quantity) * multiplier),
          GrossPrice: grossSepidar,
          DiscountAmount: manualDiffSepidar > 0 ? manualDiffSepidar : 0,
          AdditionAmount: manualDiffSepidar < 0 ? Math.abs(manualDiffSepidar) : 0,
          NetPrice: grossSepidar - (manualDiffSepidar > 0 ? manualDiffSepidar : 0) + (manualDiffSepidar < 0 ? Math.abs(manualDiffSepidar) : 0),
        },
      ],
    },
    ScrapBatteryReceipt: sale.has_scrap
      ? {
          WarehouseCode: scrapWarehouseCode,
          ScrapItemCode: scrapItemCode,
          ScrapCategory: sale.scrap_category_name || sale.category_name,
          ScrapAmperageUnit: sale.scrap_amperage,
          ScrapQuantity: sale.scrap_quantity,
          TotalScrapAmperage: sale.total_scrap_amps,
          FeePerScrapAmpere: sale.scrap_price_per_amp * multiplier,
          TotalScrapCredit: scrapSepidar,
        }
      : null,
    TreasuryReceipt: {
      SettlementType: settlementType,
      TargetCode: treasuryTargetCode,
      AccountDLCode: treasuryAccountCode,
      BankOrPosTitle: treasuryTitle,
      TrackingNumber: sale.payment_ref || String(sale.label_number),
      Amount: finalPaidSepidar,
    },
    VoucherPreview: {
      currency: currencyLabel,
      multiplier,
      totalDebit: voucherLines.reduce((acc, l) => acc + l.debit, 0),
      totalCredit: voucherLines.reduce((acc, l) => acc + l.credit, 0),
      lines: voucherLines,
    },
  };

  return apiPayload;
}

export async function syncSaleToSepidar(sale, adminUser) {
  const settings = getAllSettings();
  const mode = settings.sepidar_mode || 'simulation';
  const serverUrl = (settings.sepidar_server_url || '').replace(/\/+$/, '');
  const username = (settings.sepidar_username || '').trim();
  const password = settings.sepidar_password || '';

  const payload = buildSepidarPayload(sale);
  const nowIso = new Date().toISOString();

  if (!username || !password) {
    const errMsg = 'نام کاربری یا رمز عبور سپیدار در تنظیمات وارد نشده است.';
    logSepidarAction(sale.id, 'APPROVE_SYNC', 'error', JSON.stringify(payload), '', errMsg);
    throw new Error(errMsg);
  }

  // WINDOWS DESKTOP RPA BOT MODE (ثبت خودکار توسط نرم‌افزار ربات ویندوزی بدون وب‌سرویس یا اکسل دستی)
  if (mode === 'windows_bot') {
    const queuedResponse = {
      success: true,
      queuedForBot: true,
      mode: 'windows_bot',
      authenticatedAs: username,
      queuedAt: nowIso,
      message: `سند تایید شد و در صف «ربات ویندوزی سپیدار» قرار گرفت؛ نرم‌افزار دستیار ویندوز روی سرور طبقه بالا به صورت خودکار آن را با کاربر «${username}» در سپیدار ثبت می‌کند.`,
    };

    db.prepare(`
      UPDATE sales
      SET approved_by = ?,
          approved_by_name = ?,
          approved_at = ?,
          bot_queue_status = 'queued',
          sepidar_error_message = '',
          sepidar_payload_json = ?
      WHERE id = ?
    `).run(
      adminUser.id,
      adminUser.full_name,
      nowIso,
      JSON.stringify(payload),
      sale.id
    );

    logSepidarAction(
      sale.id,
      'QUEUE_WINDOWS_BOT',
      'success',
      JSON.stringify(payload),
      JSON.stringify(queuedResponse),
      queuedResponse.message
    );

    return {
      sale: db.prepare('SELECT * FROM sales WHERE id = ?').get(sale.id),
      sepidarResult: queuedResponse,
    };
  }

  if (mode === 'simulation') {
    const docNum = `SPD-INV-${4200 + sale.id}`;
    const voucherNum = `SPD-VCH-${900 + sale.id}`;
    const simulatedResponse = {
      success: true,
      mode: 'simulation',
      authenticatedAs: username,
      sepidarInvoiceNumber: docNum,
      sepidarVoucherNumber: voucherNum,
      registeredAt: nowIso,
      message: `احراز هویت با کاربر «${username}» انجام شد؛ فاکتور فروش، رسید خزانه‌داری و سند حسابداری در شبیه‌ساز سپیدار ثبت گردید.`,
    };

    db.prepare(`
      UPDATE sales
      SET sepidar_status = 'synced',
          approved_by = ?,
          approved_by_name = ?,
          approved_at = ?,
          sepidar_doc_number = ?,
          sepidar_voucher_number = ?,
          sepidar_error_message = '',
          sepidar_payload_json = ?
      WHERE id = ?
    `).run(
      adminUser.id,
      adminUser.full_name,
      nowIso,
      docNum,
      voucherNum,
      JSON.stringify(payload),
      sale.id
    );

    logSepidarAction(
      sale.id,
      'APPROVE_SYNC',
      'success',
      JSON.stringify(payload),
      JSON.stringify(simulatedResponse),
      simulatedResponse.message
    );

    return {
      sale: db.prepare('SELECT * FROM sales WHERE id = ?').get(sale.id),
      sepidarResult: simulatedResponse,
    };
  }

  // LIVE API MODE: Connects to Sepidar WebService on Windows Server over LAN
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const loginRes = await fetch(`${serverUrl}/Users/Login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Integration-Key': settings.sepidar_integration_key || 'KAVEH-SABA-POS-01',
      },
      body: JSON.stringify({
        UserName: username,
        Password: password,
      }),
      signal: controller.signal,
    });

    if (!loginRes.ok) {
      clearTimeout(timeout);
      throw new Error(`خطای احراز هویت وب‌سرویس سپیدار (کد ${loginRes.status}) در آدرس ${serverUrl}`);
    }

    const loginData = await loginRes.json();
    const bearerToken = loginData.Token || loginData.token || loginData.access_token || '';

    const invoiceRes = await fetch(`${serverUrl}/SaleInvoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
        'X-Integration-Key': settings.sepidar_integration_key || 'KAVEH-SABA-POS-01',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!invoiceRes.ok) {
      const errBody = await invoiceRes.text();
      throw new Error(`خطا هنگام ثبت فاکتور در وب‌سرویس سپیدار (${invoiceRes.status}): ${errBody.slice(0, 200)}`);
    }

    const invoiceData = await invoiceRes.json();
    const docNum = String(invoiceData.Number || invoiceData.InvoiceNumber || `SPD-${sale.id}`);
    const voucherNum = String(invoiceData.VoucherNumber || invoiceData.AccountingVoucherNumber || `VCH-${sale.id}`);

    db.prepare(`
      UPDATE sales
      SET sepidar_status = 'synced',
          approved_by = ?,
          approved_by_name = ?,
          approved_at = ?,
          sepidar_doc_number = ?,
          sepidar_voucher_number = ?,
          sepidar_error_message = '',
          sepidar_payload_json = ?
      WHERE id = ?
    `).run(
      adminUser.id,
      adminUser.full_name,
      nowIso,
      docNum,
      voucherNum,
      JSON.stringify(payload),
      sale.id
    );

    logSepidarAction(
      sale.id,
      'APPROVE_SYNC_LIVE',
      'success',
      JSON.stringify(payload),
      JSON.stringify(invoiceData),
      `ثبت موفق در سرور واقعی سپیدار به شماره ${docNum}`
    );

    return {
      sale: db.prepare('SELECT * FROM sales WHERE id = ?').get(sale.id),
      sepidarResult: invoiceData,
    };
  } catch (err) {
    const errMsg =
      err.name === 'AbortError'
        ? `عدم پاسخگویی سرور ویندوزی سپیدار در آدرس ${serverUrl} (مطمئن شوید سرویس وب‌سرویس سپیدار در شبکه داخلی روشن است یا حالت شبیه‌ساز/خروجی اکسل را انتخاب کنید).`
        : err.message || 'خطای شبکه در ارتباط با سرور سپیدار';

    db.prepare(`
      UPDATE sales
      SET sepidar_status = 'error',
          sepidar_error_message = ?,
          sepidar_payload_json = ?
      WHERE id = ?
    `).run(errMsg, JSON.stringify(payload), sale.id);

    logSepidarAction(sale.id, 'APPROVE_SYNC_LIVE', 'error', JSON.stringify(payload), '', errMsg);
    throw new Error(errMsg);
  }
}

export async function testSepidarConnection(overrideSettings = {}) {
  const settings = { ...getAllSettings(), ...overrideSettings };
  const mode = settings.sepidar_mode || 'simulation';
  const serverUrl = (settings.sepidar_server_url || '').replace(/\/+$/, '');
  const username = (settings.sepidar_username || '').trim();
  const password = settings.sepidar_password || '';

  if (!username || !password) {
    return {
      ok: false,
      message: 'لطفاً نام کاربری و رمز عبور کاربر سپیدار را وارد نمایید.',
    };
  }

  if (mode === 'windows_bot') {
    const lastBeat = settings.sepidar_bot_last_heartbeat || '';
    const isRecent = lastBeat && Date.now() - new Date(lastBeat).getTime() < 60000;
    const queuedCount = db
      .prepare("SELECT COUNT(*) as c FROM sales WHERE bot_queue_status = 'queued' AND sepidar_status != 'synced'")
      .get().c;
    return {
      ok: true,
      mode: 'windows_bot',
      botOnline: Boolean(isRecent),
      message: isRecent
        ? `ربات ویندوزی سپیدار (${settings.sepidar_bot_host || 'Windows-Server'}) هم‌اکنون آنلاین است! اسناد در صف: ${queuedCount}`
        : `صف ربات ویندوزی سپیدار آماده است (${queuedCount} سند منتظر اجرا). با اجرای نرم‌افزار kaveh_sepidar_bot.py روی سرور ویندوز طبقه بالا، اسناد به صورت خودکار با کاربر «${username}» در سپیدار ثبت می‌شوند.`,
    };
  }

  if (mode === 'simulation') {
    logSepidarAction(null, 'TEST_CONNECTION', 'success', JSON.stringify({ serverUrl, username, mode }), '', 'تست اتصال در حالت شبیه‌ساز موفقیت‌آمیز بود.');
    return {
      ok: true,
      mode: 'simulation',
      message: `اتصال آزمایشی با نام کاربری «${username}» برقرار شد (حالت شبیه‌ساز فعال است؛ در شبکه داخلی فروشگاه می‌توانید حالت وب‌سرویس واقعی را روی IP سرور طبقه بالا تنظیم کنید).`,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${serverUrl}/Users/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserName: username, Password: password }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return {
        ok: false,
        mode: 'live_api',
        message: `سرور پاسخ داد اما کد وضعیت ${res.status} برگشت داده شد. نام کاربری/رمز یا آدرس سرویس سپیدار را بررسی کنید.`,
      };
    }
    return {
      ok: true,
      mode: 'live_api',
      message: `اتصال واقعی به وب‌سرویس سپیدار (${serverUrl}) با کاربر «${username}» با موفقیت تایید شد!`,
    };
  } catch (err) {
    return {
      ok: false,
      mode: 'live_api',
      message: `امکان برقراری ارتباط شبکه‌ای با ${serverUrl} وجود ندارد (${err.message}). در محیط خارج از شبکه محلی فروشگاه، از «حالت شبیه‌ساز» یا «خروجی استاندارد اکسل سپیدار» استفاده نمایید.`,
    };
  }
}

export function generateSepidarCsv(sales) {
  const settings = getAllSettings();
  const multiplier = Number(settings.sepidar_currency_multiplier || 10) || 1;
  const currencyLabel = multiplier === 10 ? 'ریال' : 'تومان';

  const headers = [
    'شماره فاکتور',
    'شماره لیبل باتری',
    'تاریخ و ساعت (تهران)',
    'کد مشتری سپیدار',
    'نام مشتری',
    'کد انبار',
    'کد کالا در سپیدار',
    'شرح باتری',
    'تعداد',
    'جمع آمپراژ فروخته شده',
    `فی هر آمپر (${currencyLabel})`,
    `مبلغ ناخالص (${currencyLabel})`,
    'جمع آمپراژ داغی',
    `مبلغ کسر داغی (${currencyLabel})`,
    `خالص دریافتی (${currencyLabel})`,
    'روش پرداخت',
    'بانک / کارتخوان',
    'کد حساب / پایانه سپیدار',
    'شماره پیگیری',
    'صندوقدار ثبت کننده',
    'وضعیت سپیدار',
    'شماره سند سپیدار',
  ];

  const escapeCsv = (val) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const payMethodFa = {
    pos: 'کارتخوان',
    transfer: 'واریز به حساب',
    cash: 'نقد',
  };

  const statusFa = {
    pending: 'در انتظار تایید',
    synced: 'ثبت شده در سپیدار',
    rejected: 'رد/ابطال شده',
    error: 'خطای ارتباط',
  };

  const rows = sales.map((s) => {
    const payload = buildSepidarPayload(s);
    const jalaliStr = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tehran',
    }).format(new Date(s.created_at));

    return [
      s.invoice_number,
      s.label_number,
      jalaliStr,
      payload.SaleInvoice.CustomerCode,
      payload.SaleInvoice.CustomerName,
      payload.SaleInvoice.Items[0].WarehouseCode,
      payload.SaleInvoice.Items[0].ItemCode,
      payload.SaleInvoice.Items[0].ItemTitle,
      s.quantity,
      s.total_sold_amps,
      s.unit_price_per_amp * multiplier,
      s.gross_amount * multiplier,
      s.total_scrap_amps,
      s.scrap_deduction_amount * multiplier,
      s.final_sale_amount * multiplier,
      payMethodFa[s.payment_method] || s.payment_method,
      s.pos_bank_name || '-',
      payload.TreasuryReceipt.TargetCode,
      s.payment_ref || '-',
      s.cashier_name,
      statusFa[s.sepidar_status] || s.sepidar_status,
      s.sepidar_doc_number || '-',
    ].map(escapeCsv).join(',');
  });

  // Prefix UTF-8 BOM (\uFEFF) so Microsoft Excel on Windows Server opens Persian columns cleanly
  return '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
}

export function getBotPendingJobs() {
  const settings = getAllSettings();
  const rows = db
    .prepare("SELECT * FROM sales WHERE bot_queue_status = 'queued' AND sepidar_status != 'synced' ORDER BY id ASC")
    .all();

  return {
    sepidarConfig: {
      exePath: settings.sepidar_exe_path || 'C:\\Program Files (x86)\\Sepidar System\\Sepidar\\Sepidar.exe',
      username: settings.sepidar_username || '',
      password: settings.sepidar_password || '',
      fiscalYear: settings.sepidar_fiscal_year || '1405',
    },
    jobs: rows.map((sale) => ({
      saleId: sale.id,
      invoiceNumber: sale.invoice_number,
      labelNumber: sale.label_number,
      approvedBy: sale.approved_by_name,
      approvedAt: sale.approved_at,
      payload: buildSepidarPayload(sale),
    })),
  };
}

export function completeBotJob(saleId, { success = true, sepidarDocNumber = '', sepidarVoucherNumber = '', botHost = 'Windows-RPA-Bot', errorMessage = '' } = {}) {
  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(Number(saleId));
  if (!sale) throw new Error('فاکتور مورد نظر یافت نشد.');

  const nowIso = new Date().toISOString();
  if (success) {
    const docNum = sepidarDocNumber || `SPD-BOT-${4500 + sale.id}`;
    const vchNum = sepidarVoucherNumber || `VCH-BOT-${950 + sale.id}`;
    db.prepare(`
      UPDATE sales
      SET sepidar_status = 'synced',
          bot_queue_status = 'completed',
          sepidar_doc_number = ?,
          sepidar_voucher_number = ?,
          sepidar_error_message = ''
      WHERE id = ?
    `).run(docNum, vchNum, sale.id);

    logSepidarAction(
      sale.id,
      'WINDOWS_BOT_REGISTERED',
      'success',
      '',
      JSON.stringify({ docNum, vchNum, botHost, completedAt: nowIso }),
      `ربات ویندوزی (${botHost}) فاکتور را به صورت خودکار جای حسابدار در سپیدار ثبت کرد: شماره ${docNum}`
    );
  } else {
    db.prepare(`
      UPDATE sales
      SET sepidar_status = 'error',
          bot_queue_status = 'failed',
          sepidar_error_message = ?
      WHERE id = ?
    `).run(errorMessage || 'خطا در اجرای ربات ویندوزی روی فرم سپیدار', sale.id);

    logSepidarAction(
      sale.id,
      'WINDOWS_BOT_ERROR',
      'error',
      '',
      '',
      errorMessage || 'خطا در ربات ویندوزی سپیدار'
    );
  }

  return db.prepare('SELECT * FROM sales WHERE id = ?').get(sale.id);
}

function logSepidarAction(saleId, action, status, reqPayload, resPayload, message) {
  db.prepare(`
    INSERT INTO sepidar_logs (sale_id, action, status, request_payload, response_payload, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(saleId || null, action, status, reqPayload || '', resPayload || '', message || '', new Date().toISOString());
}
