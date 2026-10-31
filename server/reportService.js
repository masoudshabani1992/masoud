const tehranDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const jalaliPartsFormatter = new Intl.DateTimeFormat('en-u-ca-persian', {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const jalaliHumanFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const jalaliMonthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: 'long',
});

const jalaliDayMonthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: 'Asia/Tehran',
  month: 'long',
  day: 'numeric',
});

export function getTehranMeta(isoString) {
  const d = new Date(isoString);
  const parts = tehranDateFormatter.formatToParts(d);
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  const gregorianDate = `${map.year}-${map.month}-${map.day}`; // YYYY-MM-DD in Asia/Tehran
  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0;

  const jParts = jalaliPartsFormatter.formatToParts(d);
  const jMap = {};
  for (const p of jParts) jMap[p.type] = p.value;
  const jalaliKey = `${jMap.year}/${jMap.month}/${jMap.day}`;
  const jalaliMonthKey = `${jMap.year}/${jMap.month}`;

  return {
    dateObj: d,
    ts: d.getTime(),
    gregorianDate,
    hour,
    minute: parseInt(map.minute, 10) || 0,
    jalaliKey,
    jalaliMonthKey,
    jalaliLabel: jalaliHumanFormatter.format(d),
    jalaliMonthLabel: jalaliMonthFormatter.format(d),
  };
}

export function filterSalesList(allSales, query = {}) {
  const {
    period = 'all', // 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom'
    dateFrom = '',  // YYYY-MM-DD (Gregorian) optional
    dateTo = '',    // YYYY-MM-DD (Gregorian) optional
    hourFrom = '',
    hourTo = '',
    cashierId = '',
    brandId = '',
    categoryId = '',
    amperage = '',
    paymentMethod = '',
    posTerminalId = '',
    sepidarStatus = '',
    includeRejected = 'false',
    search = '',
  } = query;

  const nowMeta = getTehranMeta(new Date().toISOString());
  const todayStr = nowMeta.gregorianDate;

  const yesterdayDate = new Date(Date.now() - 24 * 3600 * 1000);
  const yesterdayStr = getTehranMeta(yesterdayDate.toISOString()).gregorianDate;

  const weekAgoTs = Date.now() - 7 * 24 * 3600 * 1000;
  const monthAgoTs = Date.now() - 30 * 24 * 3600 * 1000;

  const hFrom = hourFrom !== '' && hourFrom !== undefined ? Number(hourFrom) : null;
  const hTo = hourTo !== '' && hourTo !== undefined ? Number(hourTo) : null;
  const searchNeedle = String(search || '').trim().toLowerCase();

  return allSales.filter((sale) => {
    if (includeRejected !== 'true' && !sepidarStatus && sale.sepidar_status === 'rejected') {
      return false;
    }

    const meta = getTehranMeta(sale.created_at);

    if (period === 'today' && meta.gregorianDate !== todayStr) return false;
    if (period === 'yesterday' && meta.gregorianDate !== yesterdayStr) return false;
    if (period === 'week' && meta.ts < weekAgoTs) return false;
    if (period === 'month' && meta.ts < monthAgoTs) return false;
    if (period === 'custom') {
      if (dateFrom && meta.gregorianDate < dateFrom) return false;
      if (dateTo && meta.gregorianDate > dateTo) return false;
    }

    if (hFrom !== null && !Number.isNaN(hFrom) && meta.hour < hFrom) return false;
    if (hTo !== null && !Number.isNaN(hTo) && meta.hour > hTo) return false;

    if (cashierId && Number(sale.cashier_id) !== Number(cashierId)) return false;
    if (brandId && Number(sale.brand_id) !== Number(brandId)) return false;
    if (categoryId && Number(sale.category_id) !== Number(categoryId)) return false;
    if (amperage && Number(sale.amperage) !== Number(amperage)) return false;
    if (paymentMethod && sale.payment_method !== paymentMethod) return false;
    if (posTerminalId && Number(sale.pos_terminal_id) !== Number(posTerminalId)) return false;
    if (sepidarStatus && sale.sepidar_status !== sepidarStatus) return false;

    if (searchNeedle) {
      const hay = [
        sale.invoice_number,
        String(sale.label_number),
        sale.category_name,
        sale.brand_name,
        String(sale.amperage),
        sale.cashier_name,
        sale.customer_name,
        sale.customer_phone,
        sale.pos_bank_name,
        sale.sepidar_doc_number,
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(searchNeedle)) return false;
    }

    return true;
  });
}

export function buildComprehensiveReport(sales) {
  // KPI Summary
  const kpi = {
    totalInvoices: 0,
    totalBatteriesSold: 0,
    totalSoldAmps: 0,
    totalScrapCount: 0,
    totalScrapAmps: 0,
    grossSalesAmount: 0,
    scrapDeductionAmount: 0,
    finalNetAmount: 0,
    pendingSepidarCount: 0,
    syncedSepidarCount: 0,
  };

  // Hourly breakdown (0..23)
  const hourlyMap = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:۰۰ تا ${String((hour + 1) % 24).padStart(2, '0')}:۰۰`,
    shortLabel: `${String(hour).padStart(2, '0')}:۰۰`,
    invoiceCount: 0,
    batteryCount: 0,
    soldAmps: 0,
    scrapAmps: 0,
    grossAmount: 0,
    scrapAmount: 0,
    netAmount: 0,
  }));

  // Daily breakdown
  const dailyObj = {};
  // Weekly breakdown (grouped by 7-day Jalali week bucket)
  const weeklyObj = {};
  // Monthly breakdown (Jalali Year/Month)
  const monthlyObj = {};
  // Cashier breakdown
  const cashierObj = {};
  // Brand & Category breakdown
  const brandObj = {};
  const categoryObj = {};
  // Amperage breakdown
  const ampObj = {};
  // Payment & POS breakdown
  const paymentObj = {
    pos_total: { key: 'pos_total', title: 'کل کارتخوان‌ها', invoiceCount: 0, batteryCount: 0, netAmount: 0 },
    transfer: { key: 'transfer', title: 'واریز به حساب', invoiceCount: 0, batteryCount: 0, netAmount: 0 },
    cash: { key: 'cash', title: 'نقدی صندوق', invoiceCount: 0, batteryCount: 0, netAmount: 0 },
  };
  const posBankObj = {};

  for (const s of sales) {
    if (s.sepidar_status === 'rejected') continue;

    const meta = getTehranMeta(s.created_at);

    kpi.totalInvoices += 1;
    kpi.totalBatteriesSold += s.quantity;
    kpi.totalSoldAmps += s.total_sold_amps;
    kpi.totalScrapCount += s.has_scrap ? s.scrap_quantity : 0;
    kpi.totalScrapAmps += s.total_scrap_amps;
    kpi.grossSalesAmount += s.gross_amount;
    kpi.scrapDeductionAmount += s.scrap_deduction_amount;
    kpi.finalNetAmount += s.final_sale_amount;

    if (s.sepidar_status === 'pending') kpi.pendingSepidarCount += 1;
    if (s.sepidar_status === 'synced') kpi.syncedSepidarCount += 1;

    // 1. Hourly
    const hBucket = hourlyMap[meta.hour];
    if (hBucket) {
      hBucket.invoiceCount += 1;
      hBucket.batteryCount += s.quantity;
      hBucket.soldAmps += s.total_sold_amps;
      hBucket.scrapAmps += s.total_scrap_amps;
      hBucket.grossAmount += s.gross_amount;
      hBucket.scrapAmount += s.scrap_deduction_amount;
      hBucket.netAmount += s.final_sale_amount;
    }

    // 2. Daily
    if (!dailyObj[meta.jalaliKey]) {
      dailyObj[meta.jalaliKey] = {
        key: meta.jalaliKey,
        gregorianDate: meta.gregorianDate,
        label: meta.jalaliLabel,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        grossAmount: 0,
        scrapAmount: 0,
        netAmount: 0,
      };
    }
    dailyObj[meta.jalaliKey].invoiceCount += 1;
    dailyObj[meta.jalaliKey].batteryCount += s.quantity;
    dailyObj[meta.jalaliKey].soldAmps += s.total_sold_amps;
    dailyObj[meta.jalaliKey].scrapAmps += s.total_scrap_amps;
    dailyObj[meta.jalaliKey].grossAmount += s.gross_amount;
    dailyObj[meta.jalaliKey].scrapAmount += s.scrap_deduction_amount;
    dailyObj[meta.jalaliKey].netAmount += s.final_sale_amount;

    // 3. Weekly (Saturday-to-Friday Persian week start)
    const dLocal = new Date(`${meta.gregorianDate}T12:00:00Z`);
    const dayOfWeek = dLocal.getUTCDay(); // 0=Sun .. 6=Sat
    const daysSinceSaturday = (dayOfWeek + 1) % 7;
    const satDate = new Date(dLocal.getTime() - daysSinceSaturday * 86400 * 1000);
    const friDate = new Date(satDate.getTime() + 6 * 86400 * 1000);
    const satMeta = getTehranMeta(satDate.toISOString());
    const friMeta = getTehranMeta(friDate.toISOString());
    const weekKey = satMeta.gregorianDate;
    if (!weeklyObj[weekKey]) {
      weeklyObj[weekKey] = {
        key: weekKey,
        label: `هفته ${satMeta.jalaliLabel} تا ${friMeta.jalaliLabel}`,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        grossAmount: 0,
        scrapAmount: 0,
        netAmount: 0,
      };
    }
    weeklyObj[weekKey].invoiceCount += 1;
    weeklyObj[weekKey].batteryCount += s.quantity;
    weeklyObj[weekKey].soldAmps += s.total_sold_amps;
    weeklyObj[weekKey].scrapAmps += s.total_scrap_amps;
    weeklyObj[weekKey].grossAmount += s.gross_amount;
    weeklyObj[weekKey].scrapAmount += s.scrap_deduction_amount;
    weeklyObj[weekKey].netAmount += s.final_sale_amount;

    // 4. Monthly
    if (!monthlyObj[meta.jalaliMonthKey]) {
      monthlyObj[meta.jalaliMonthKey] = {
        key: meta.jalaliMonthKey,
        label: meta.jalaliMonthLabel,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        grossAmount: 0,
        scrapAmount: 0,
        netAmount: 0,
      };
    }
    monthlyObj[meta.jalaliMonthKey].invoiceCount += 1;
    monthlyObj[meta.jalaliMonthKey].batteryCount += s.quantity;
    monthlyObj[meta.jalaliMonthKey].soldAmps += s.total_sold_amps;
    monthlyObj[meta.jalaliMonthKey].scrapAmps += s.total_scrap_amps;
    monthlyObj[meta.jalaliMonthKey].grossAmount += s.gross_amount;
    monthlyObj[meta.jalaliMonthKey].scrapAmount += s.scrap_deduction_amount;
    monthlyObj[meta.jalaliMonthKey].netAmount += s.final_sale_amount;

    // 5. Cashier (کاربری که فاکتور زده کی بوده)
    const cKey = String(s.cashier_id);
    if (!cashierObj[cKey]) {
      cashierObj[cKey] = {
        cashierId: s.cashier_id,
        cashierName: s.cashier_name,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        grossAmount: 0,
        scrapAmount: 0,
        netAmount: 0,
        posAmount: 0,
        transferAmount: 0,
        cashAmount: 0,
      };
    }
    cashierObj[cKey].invoiceCount += 1;
    cashierObj[cKey].batteryCount += s.quantity;
    cashierObj[cKey].soldAmps += s.total_sold_amps;
    cashierObj[cKey].scrapAmps += s.total_scrap_amps;
    cashierObj[cKey].grossAmount += s.gross_amount;
    cashierObj[cKey].scrapAmount += s.scrap_deduction_amount;
    cashierObj[cKey].netAmount += s.final_sale_amount;
    if (s.payment_method === 'pos') cashierObj[cKey].posAmount += s.final_sale_amount;
    if (s.payment_method === 'transfer') cashierObj[cKey].transferAmount += s.final_sale_amount;
    if (s.payment_method === 'cash') cashierObj[cKey].cashAmount += s.final_sale_amount;

    // 6. Brand & Category
    if (!brandObj[s.brand_name]) {
      brandObj[s.brand_name] = {
        brandName: s.brand_name,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        grossAmount: 0,
        netAmount: 0,
      };
    }
    brandObj[s.brand_name].invoiceCount += 1;
    brandObj[s.brand_name].batteryCount += s.quantity;
    brandObj[s.brand_name].soldAmps += s.total_sold_amps;
    brandObj[s.brand_name].scrapAmps += s.total_scrap_amps;
    brandObj[s.brand_name].grossAmount += s.gross_amount;
    brandObj[s.brand_name].netAmount += s.final_sale_amount;

    if (!categoryObj[s.category_name]) {
      categoryObj[s.category_name] = {
        categoryName: s.category_name,
        invoiceCount: 0,
        batteryCount: 0,
        soldAmps: 0,
        scrapAmps: 0,
        netAmount: 0,
      };
    }
    categoryObj[s.category_name].invoiceCount += 1;
    categoryObj[s.category_name].batteryCount += s.quantity;
    categoryObj[s.category_name].soldAmps += s.total_sold_amps;
    categoryObj[s.category_name].scrapAmps += s.total_scrap_amps;
    categoryObj[s.category_name].netAmount += s.final_sale_amount;

    // 7. Amperage
    const aKey = String(s.amperage);
    if (!ampObj[aKey]) {
      ampObj[aKey] = {
        amperage: s.amperage,
        batteryCount: 0,
        soldAmps: 0,
        netAmount: 0,
      };
    }
    ampObj[aKey].batteryCount += s.quantity;
    ampObj[aKey].soldAmps += s.total_sold_amps;
    ampObj[aKey].netAmount += s.final_sale_amount;

    // 8. Payment & POS Bank
    if (s.payment_method === 'pos') {
      paymentObj.pos_total.invoiceCount += 1;
      paymentObj.pos_total.batteryCount += s.quantity;
      paymentObj.pos_total.netAmount += s.final_sale_amount;
      const bank = s.pos_bank_name || 'نامشخص';
      if (!posBankObj[bank]) {
        posBankObj[bank] = {
          bankName: bank,
          invoiceCount: 0,
          batteryCount: 0,
          netAmount: 0,
        };
      }
      posBankObj[bank].invoiceCount += 1;
      posBankObj[bank].batteryCount += s.quantity;
      posBankObj[bank].netAmount += s.final_sale_amount;
    } else if (s.payment_method === 'transfer') {
      paymentObj.transfer.invoiceCount += 1;
      paymentObj.transfer.batteryCount += s.quantity;
      paymentObj.transfer.netAmount += s.final_sale_amount;
    } else if (s.payment_method === 'cash') {
      paymentObj.cash.invoiceCount += 1;
      paymentObj.cash.batteryCount += s.quantity;
      paymentObj.cash.netAmount += s.final_sale_amount;
    }
  }

  return {
    kpi,
    hourly: hourlyMap,
    daily: Object.values(dailyObj).sort((a, b) => b.key.localeCompare(a.key)),
    weekly: Object.values(weeklyObj).sort((a, b) => b.key.localeCompare(a.key)),
    monthly: Object.values(monthlyObj).sort((a, b) => b.key.localeCompare(a.key)),
    byCashier: Object.values(cashierObj).sort((a, b) => b.netAmount - a.netAmount),
    byBrand: Object.values(brandObj).sort((a, b) => b.soldAmps - a.soldAmps),
    byCategory: Object.values(categoryObj).sort((a, b) => b.soldAmps - a.soldAmps),
    byAmperage: Object.values(ampObj).sort((a, b) => a.amperage - b.amperage),
    byPayment: Object.values(paymentObj),
    byPosBank: Object.values(posBankObj).sort((a, b) => b.netAmount - a.netAmount),
  };
}

function calcPctChange(current, baseline) {
  if (!baseline || baseline <= 0) return null;
  const pct = ((current - baseline) / baseline) * 100;
  return Math.round(pct * 10) / 10;
}

export function buildHiddifyDashboardData({
  allSales = [],
  cashiers = [],
  brands = [],
  rangeDays = 30,
  cashierId = 'all',
}) {
  const daysCount = [7, 30, 90, 180].includes(Number(rangeDays)) ? Number(rangeDays) : 30;
  const filterCashier = cashierId && cashierId !== 'all' ? Number(cashierId) : null;

  // Build day buckets for max(daysCount, 60) days so 30d vs prev30d trends are exact
  const historySpan = Math.max(daysCount, 60);
  const now = new Date();
  const nowMeta = getTehranMeta(now.toISOString());
  const todayAnchor = new Date(`${nowMeta.gregorianDate}T12:00:00Z`);

  const dayMap = new Map();
  const orderedDates = [];

  for (let i = historySpan - 1; i >= 0; i--) {
    const dt = new Date(todayAnchor.getTime() - i * 86400 * 1000);
    const meta = getTehranMeta(dt.toISOString());
    const gDate = meta.gregorianDate;
    orderedDates.push(gDate);
    dayMap.set(gDate, {
      date: gDate,
      label: jalaliDayMonthFormatter.format(dt),
      jalaliKey: meta.jalaliKey,
      netSales: 0,
      grossSales: 0,
      scrapDeduction: 0,
      soldAmps: 0,
      scrapAmps: 0,
      invoiceCount: 0,
      batteryCount: 0,
      cashierSet: new Set(),
      byCashier: {},
      byBrand: {},
    });
  }

  let sepidarSynced = 0;
  let sepidarPending = 0;
  let sepidarBotQueued = 0;
  let sepidarRejected = 0;

  const validSales = [];

  for (const s of allSales) {
    if (filterCashier !== null && Number(s.cashier_id) !== filterCashier) {
      continue;
    }

    if (s.sepidar_status === 'rejected') {
      sepidarRejected += 1;
      continue;
    }
    if (s.sepidar_status === 'synced') sepidarSynced += 1;
    else if (s.sepidar_status === 'bot_queued') sepidarBotQueued += 1;
    else sepidarPending += 1;

    validSales.push(s);

    const meta = getTehranMeta(s.created_at);
    const bucket = dayMap.get(meta.gregorianDate);
    if (!bucket) continue;

    bucket.netSales += s.final_sale_amount;
    bucket.grossSales += s.gross_amount;
    bucket.scrapDeduction += s.scrap_deduction_amount;
    bucket.soldAmps += s.total_sold_amps;
    bucket.scrapAmps += s.total_scrap_amps;
    bucket.invoiceCount += 1;
    bucket.batteryCount += s.quantity;
    if (s.cashier_id) bucket.cashierSet.add(Number(s.cashier_id));

    const cKey = String(s.cashier_id || 0);
    if (!bucket.byCashier[cKey]) {
      bucket.byCashier[cKey] = { netSales: 0, soldAmps: 0, invoiceCount: 0 };
    }
    bucket.byCashier[cKey].netSales += s.final_sale_amount;
    bucket.byCashier[cKey].soldAmps += s.total_sold_amps;
    bucket.byCashier[cKey].invoiceCount += 1;

    const bKey = s.brand_name || 'سایر';
    bucket.byBrand[bKey] = (bucket.byBrand[bKey] || 0) + s.final_sale_amount;
  }

  const allPoints = orderedDates.map((d) => {
    const b = dayMap.get(d);
    return {
      date: b.date,
      label: b.label,
      jalaliKey: b.jalaliKey,
      netSales: b.netSales,
      grossSales: b.grossSales,
      scrapDeduction: b.scrapDeduction,
      soldAmps: b.soldAmps,
      scrapAmps: b.scrapAmps,
      invoiceCount: b.invoiceCount,
      batteryCount: b.batteryCount,
      activeCashiers: b.cashierSet.size,
      byCashier: b.byCashier,
      byBrand: b.byBrand,
    };
  });

  const series = allPoints.slice(-daysCount);
  const todayPt = allPoints[allPoints.length - 1] || { netSales: 0, soldAmps: 0, scrapAmps: 0, invoiceCount: 0, batteryCount: 0, activeCashiers: 0 };
  const yesterdayPt = allPoints[allPoints.length - 2] || { netSales: 0, soldAmps: 0, scrapAmps: 0, invoiceCount: 0, batteryCount: 0, activeCashiers: 0 };

  const last7 = allPoints.slice(-7);
  const prev7 = allPoints.slice(-14, -7);
  const last30 = allPoints.slice(-30);
  const prev30 = allPoints.slice(-60, -30);

  const sumBy = (arr, key) => arr.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);

  const weekSales = sumBy(last7, 'netSales');
  const prevWeekSales = sumBy(prev7, 'netSales');
  const monthSales = sumBy(last30, 'netSales');
  const prevMonthSales = sumBy(prev30, 'netSales');
  const totalSalesInRange = sumBy(series, 'netSales');

  let peakPoint = series[0] || { netSales: 0, label: '—' };
  for (const pt of series) {
    if (pt.netSales >= peakPoint.netSales) peakPoint = pt;
  }

  const distinctCashiersIn = (pts) => {
    const s = new Set();
    for (const pt of pts) {
      for (const cid of Object.keys(pt.byCashier)) {
        if (pt.byCashier[cid].invoiceCount > 0) s.add(cid);
      }
    }
    return s.size;
  };

  const totalValid = sepidarSynced + sepidarPending + sepidarBotQueued;
  const syncedPct = totalValid > 0 ? Math.round((sepidarSynced / totalValid) * 100) : 100;

  return {
    rangeDays: daysCount,
    cashierId: filterCashier === null ? 'all' : String(filterCashier),
    nodes: cashiers.map((c) => ({
      id: String(c.id),
      name: c.full_name,
      station: c.station_name || '',
    })),
    brands: brands.map((b) => ({ id: b.id, name: b.name, code: b.code })),
    series,
    salesMetrics: {
      totals: {
        today: todayPt.netSales,
        yesterday: yesterdayPt.netSales,
        week: weekSales,
        month: monthSales,
        inRange: totalSalesInRange,
      },
      previous: {
        week: prevWeekSales,
        month: prevMonthSales,
      },
      averages: {
        dailyWeek: Math.round(weekSales / 7),
        dailyMonth: Math.round(monthSales / 30),
      },
      trends: {
        day: calcPctChange(todayPt.netSales, yesterdayPt.netSales),
        week: calcPctChange(weekSales, prevWeekSales),
        month: calcPctChange(monthSales, prevMonthSales),
      },
      peakDay: {
        value: peakPoint.netSales,
        label: peakPoint.label,
      },
    },
    operations: {
      cashiers: {
        activeToday: todayPt.activeCashiers,
        activeYesterday: yesterdayPt.activeCashiers,
        activeWeek: distinctCashiersIn(last7),
        activeMonth: distinctCashiersIn(last30),
        totalActive: cashiers.filter((c) => c.is_active).length || cashiers.length || 1,
      },
      amps: {
        todaySold: todayPt.soldAmps,
        yesterdaySold: yesterdayPt.soldAmps,
        weekSold: sumBy(last7, 'soldAmps'),
        monthSold: sumBy(last30, 'soldAmps'),
        inRangeSold: sumBy(series, 'soldAmps'),
        inRangeScrap: sumBy(series, 'scrapAmps'),
      },
      invoices: {
        today: todayPt.invoiceCount,
        yesterday: yesterdayPt.invoiceCount,
        week: sumBy(last7, 'invoiceCount'),
        month: sumBy(last30, 'invoiceCount'),
        inRange: sumBy(series, 'invoiceCount'),
        todayBatteries: todayPt.batteryCount,
      },
      sepidar: {
        synced: sepidarSynced,
        pending: sepidarPending,
        botQueued: sepidarBotQueued,
        rejected: sepidarRejected,
        totalValid,
        syncedPct,
      },
    },
    recentSales: validSales.slice(0, 8),
  };
}

