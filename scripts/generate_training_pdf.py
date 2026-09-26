import os
import sys
import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Fonts
FONTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'client', 'node_modules', 'vazirmatn', 'fonts', 'ttf')
pdfmetrics.registerFont(TTFont('Vazir', os.path.join(FONTS_DIR, 'Vazirmatn-Regular.ttf')))
pdfmetrics.registerFont(TTFont('Vazir-Bold', os.path.join(FONTS_DIR, 'Vazirmatn-Bold.ttf')))
pdfmetrics.registerFont(TTFont('Vazir-Black', os.path.join(FONTS_DIR, 'Vazirmatn-Black.ttf')))
pdfmetrics.registerFont(TTFont('Vazir-Medium', os.path.join(FONTS_DIR, 'Vazirmatn-Medium.ttf')))

def fa(text):
    if not text:
        return ""
    # Support inline breaks
    lines = str(text).split('\n')
    reshaped_lines = [get_display(arabic_reshaper.reshape(l)) for l in lines]
    return '\n'.join(reshaped_lines)

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        # Skip header and footer on page 1 (Cover page)
        if self._pageNumber == 1:
            return

        self.saveState()
        w, h = A4

        # Header bar
        self.setFillColor(colors.HexColor('#0f172a')) # Dark Navy
        self.rect(0, h - 1.2 * cm, w, 1.2 * cm, fill=1, stroke=0)
        self.setFillColor(colors.HexColor('#f59e0b')) # Amber accent line
        self.rect(0, h - 1.25 * cm, w, 0.05 * cm, fill=1, stroke=0)

        # Header Text
        self.setFont('Vazir-Bold', 8.5)
        self.setFillColor(colors.white)
        self.drawRightString(w - 1.5 * cm, h - 0.75 * cm, fa("اتوماسیون تولید شرکت آرمان امیران (MIS) | راهنمای جامع پرسنل"))
        self.setFont('Vazir', 8)
        self.setFillColor(colors.HexColor('#94a3b8'))
        self.drawString(1.5 * cm, h - 0.75 * cm, "Arman Amiran Packaging Factory MIS")

        # Footer bar
        self.setFillColor(colors.HexColor('#f8fafc'))
        self.rect(0, 0, w, 1.2 * cm, fill=1, stroke=0)
        self.setFillColor(colors.HexColor('#cbd5e1'))
        self.rect(0, 1.2 * cm, w, 0.03 * cm, fill=1, stroke=0)

        # Footer Confidentiality & Programmer
        self.setFont('Vazir-Medium', 7.5)
        self.setFillColor(colors.HexColor('#334155'))
        self.drawRightString(w - 1.5 * cm, 0.5 * cm, fa("همکار گرامی! تمامی اطلاعات این اتوماسیون محرمانه و امانت در اختیار شماست | برنامه‌نویس: مسعود شعبانی"))

        # Page Number
        self.setFont('Vazir-Bold', 8)
        self.setFillColor(colors.HexColor('#475569'))
        page_str = fa(f"صفحه {self._pageNumber} از {total_pages}")
        self.drawString(1.5 * cm, 0.5 * cm, page_str)

        self.restoreState()

def build_pdf(filename="TRAINING_MANUAL.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm
    )

    styles = getSampleStyleSheet()
    
    # Custom Persian Styles
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        fontName='Vazir-Black',
        fontSize=21,
        leading=32,
        alignment=1, # Center
        textColor=colors.HexColor('#0f172a')
    )
    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        fontName='Vazir-Bold',
        fontSize=12,
        leading=20,
        alignment=1,
        textColor=colors.HexColor('#0d9488')
    )
    style_h1 = ParagraphStyle(
        'PersianH1',
        fontName='Vazir-Black',
        fontSize=13,
        leading=20,
        alignment=2, # Right
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=6
    )
    style_h2 = ParagraphStyle(
        'PersianH2',
        fontName='Vazir-Bold',
        fontSize=10.5,
        leading=16,
        alignment=2,
        textColor=colors.HexColor('#1e40af'),
        spaceBefore=10,
        spaceAfter=4
    )
    style_body = ParagraphStyle(
        'PersianBody',
        fontName='Vazir',
        fontSize=8.8,
        leading=15,
        alignment=2, # Right
        textColor=colors.HexColor('#1e293b')
    )
    style_bullet = ParagraphStyle(
        'PersianBullet',
        fontName='Vazir',
        fontSize=8.5,
        leading=14,
        alignment=2,
        textColor=colors.HexColor('#334155'),
        leftIndent=12
    )
    style_callout = ParagraphStyle(
        'PersianCallout',
        fontName='Vazir-Medium',
        fontSize=8.5,
        leading=14,
        alignment=2,
        textColor=colors.HexColor('#0f766e')
    )
    style_table_header = ParagraphStyle(
        'TableHeader',
        fontName='Vazir-Bold',
        fontSize=8,
        leading=11,
        alignment=1,
        textColor=colors.white
    )
    style_table_cell = ParagraphStyle(
        'TableCell',
        fontName='Vazir',
        fontSize=7.8,
        leading=11,
        alignment=1,
        textColor=colors.HexColor('#1e293b')
    )

    story = []

    # ================= COVER PAGE =================
    story.append(Spacer(1, 1.5 * cm))
    
    # Header Badge Box
    cover_badge = Table(
        [[Paragraph(fa("سامانه یکپارچه مدیریت فرآیند تولید و اتوماسیون صنعتی کارخانه (MIS)"), ParagraphStyle('CB', fontName='Vazir-Bold', fontSize=10, leading=14, alignment=1, textColor=colors.HexColor('#b45309')))]],
        colWidths=[17.5 * cm]
    )
    cover_badge.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fef3c7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#f59e0b')),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(cover_badge)
    story.append(Spacer(1, 1.2 * cm))

    # Main Title
    story.append(Paragraph(fa("دفترچه راهنمای جامع و آموزش کاربردی\nاتوماسیون تولید کارخانه جعبه‌سازی و کارتن‌سازی"), style_cover_title))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(fa("شرکت صنایع چاپ و بسته‌بندی آرمان امیران"), ParagraphStyle('CTCompany', fontName='Vazir-Black', fontSize=15, leading=22, alignment=1, textColor=colors.HexColor('#1e40af'))))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(fa("راهنمای گام‌به‌گام و مصور ویژه آموزش پرسنل خط تولید، انبار، طراحی، بازاریابی، مالی و مدیریت"), style_cover_subtitle))
    
    story.append(Spacer(1, 1.8 * cm))

    # Cover Meta Box
    meta_data = [
        [Paragraph(fa("نسخه نرم‌افزار:"), style_table_header), Paragraph(fa("نگارش ۲.۰ سازمانی (Enterprise Edition)"), style_table_cell)],
        [Paragraph(fa("طراح و برنامه‌نویس:"), style_table_header), Paragraph(fa("مهندس مسعود شعبانی"), style_table_cell)],
        [Paragraph(fa("کارفرما و مالک:"), style_table_header), Paragraph(fa("شرکت آرمان امیران"), style_table_cell)],
        [Paragraph(fa("محیط استقرار:"), style_table_header), Paragraph(fa("ویندوز سرور / شبکه محلی کارخانه (LAN / Intranet)"), style_table_cell)],
        [Paragraph(fa("پایگاه داده:"), style_table_header), Paragraph(fa("SQLite 3 (WAL Mode) با قابلیت وب‌سرویس به سپیدار"), style_table_cell)],
        [Paragraph(fa("تاریخ انتشار:"), style_table_header), Paragraph(fa("پاییز ۱۴۰۵ (سپتامبر ۲۰۲۶)"), style_table_cell)],
    ]
    meta_table = Table(meta_data, colWidths=[4.5 * cm, 10.5 * cm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#0f172a')),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.8, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 1.5 * cm))
    
    # Security Note Box
    sec_box = Table(
        [[Paragraph(fa("⚠️ تذکر امنیتی و محرمانگی:\nکلیه محتویات، فرمول‌های محاسبه قیمت، کدهای آرشیو و مشخصات فنی مشتریان این سامانه محرمانه بوده و کپی‌برداری یا انتشار آن پیگرد قانونی دارد."), ParagraphStyle('SB', fontName='Vazir-Medium', fontSize=8, leading=13, alignment=1, textColor=colors.HexColor('#991b1b')))]],
        colWidths=[17.5 * cm]
    )
    sec_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fee2e2')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#f87171')),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sec_box)

    story.append(PageBreak())

    # ================= SECTION 1: OVERVIEW & ARCHITECTURE =================
    story.append(Paragraph(fa("۱. مقدمه و ساختار کلان اتوماسیون کارخانه"), style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceAfter=8))
    story.append(Paragraph(fa("اتوماسیون تخصصی شرکت آرمان امیران، یک سامانه جامع مدیریت فرآیندهای صنعتی (MIS / ERP) است که به طور اختصاصی جهت یکپارچه‌سازی خطوط تولید کارتن، جعبه‌های مقوایی، چاپ افست، دیجیتال و خدمات پس از چاپ پیاده‌سازی شده است."), style_body))
    story.append(Spacer(1, 0.2 * cm))

    # Architecture Cards Table
    arch_data = [
        [Paragraph(fa("بخش / ماژول"), style_table_header), Paragraph(fa("نقش و کاربرد در خط تولید کارخانه"), style_table_header)],
        [Paragraph(fa("دستور تولید ۳ مرحله‌ای"), style_table_cell), Paragraph(fa("مدیریت سالن با سیستم رنگی: سفید (صف تولید)، زرد (مالی)، سبز (بایگانی)"), style_table_cell)],
        [Paragraph(fa("انبارداری ۶ گانه متریال"), style_table_cell), Paragraph(fa("دفاتر ورود و مصرف مقوا (پارت ۱ و ۲)، ورق، سینگل، سلفون، طلق و مرکب"), style_table_cell)],
        [Paragraph(fa("استودیو طراحی امیران"), style_table_cell), Paragraph(fa("طراحی پارامتریک ۷ مدل جعبه، خروجی DXF لیزر دایکات، AI و شبیه‌ساز ۳D"), style_table_cell)],
        [Paragraph(fa("کارتابل بازاریابی و تارگت"), style_table_cell), Paragraph(fa("ثبت استعلام، کنترل تارگت ماهانه بازاریاب‌ها و شاخص پیشرفت فروش"), style_table_cell)],
        [Paragraph(fa("سیستم منابع انسانی (HR)"), style_table_cell), Paragraph(fa("ارزیابی ۵ محوره عملکرد، محاسبه خودکار گرید A+/A/B و پاداش بهره‌وری"), style_table_cell)],
        [Paragraph(fa("دستیار هوش مصنوعی"), style_table_cell), Paragraph(fa("استخراج هوشمند NLP، بهینه‌سازی چیدمان فرم (Nesting) و بازرسی خط تیغ"), style_table_cell)],
        [Paragraph(fa("مرکز پیامک و بله"), style_table_cell), Paragraph(fa("ارسال رویدادها به پیام‌رسان بله و پیامک وضعیت ۳ مرحله‌ای به مشتری"), style_table_cell)]
    ]
    t_arch = Table(arch_data, colWidths=[5 * cm, 12.5 * cm])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e40af')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 0.4 * cm))

    # ================= SECTION 2: WINDOWS SERVER INSTALLATION =================
    story.append(Paragraph(fa("۲. راهنمای نصب و راه‌اندازی روی ویندوز سرور (LAN / Intranet)"), style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceAfter=8))
    story.append(Paragraph(fa("پکیج ستاپ کارخانه (box-factory-windows-setup.zip) کاملاً پرتابل و بدون وابستگی‌های اینترنتی طراحی شده است:"), style_body))
    story.append(Spacer(1, 0.15 * cm))

    steps_text = [
        "۱. فایل زیپ را روی درایو دلخواه سرور کارخانه (مانند D:\\BoxFactoryERP) استخراج (Extract) نمایید.",
        "۲. روی فایل install.bat راست‌کلیک کرده و گزینه Run as administrator را انتخاب کنید.",
        "۳. جهت تست و اجرای دستی، start-server.bat را اجرا کنید. آی‌پی سرور (مانند http://192.168.1.100:3001) نمایش داده می‌شود.",
        "۴. جهت راه‌اندازی دائمی، روی install-as-windows-service.bat کلیک کنید تا سیستم به عنوان سرویس ویندوز ثبت شود.",
        "۵. دسترسی کلاینت‌ها: در تمامی کامپیوترها و تبلت‌های سالن تولید، کافیست IP سرور را در مرورگر (Chrome/Edge) باز کنید."
    ]
    for s in steps_text:
        story.append(Paragraph(fa(s), style_bullet))
    story.append(Spacer(1, 0.4 * cm))

    # ================= SECTION 3: ROLES & RBAC ISOLATION =================
    story.append(Paragraph(fa("۳. نقش‌های کاربری و ایزوله‌سازی دسترسی‌ها (RBAC)"), style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceAfter=8))
    story.append(Paragraph(fa("جهت رعایت الزامات امنیتی، هر کاربر تنها به امکانات متناسب با سمت خود دسترسی دارد:"), style_body))
    story.append(Spacer(1, 0.2 * cm))

    roles_data = [
        [Paragraph(fa("نقش کاربری"), style_table_header), Paragraph(fa("دسترسی‌های مجاز"), style_table_header), Paragraph(fa("بخش‌های مسدود شده (حفظ محرمانگی)"), style_table_header)],
        [Paragraph(fa("طراح (Designer)"), style_table_cell), Paragraph(fa("استودیو طراحی امیران، هوش مصنوعی، وظایف طراحی"), style_table_cell), Paragraph(fa("قیمت‌ها، انبار، گزارش مالی، مشتریان و پرسنل"), style_table_cell)],
        [Paragraph(fa("بازاریاب (Marketer)"), style_table_cell), Paragraph(fa("کارتابل استعلام بازاریابی، تارگت ماهانه، ثبت سرنخ"), style_table_cell), Paragraph(fa("کانبان تولید، انبار، فرمول قیمت، مدیریت پرسنل"), style_table_cell)],
        [Paragraph(fa("مسئول دفتر (Secretary)"), style_table_cell), Paragraph(fa("ثبت سفارش جدید، بایگانی مشتریان، امور اداری"), style_table_cell), Paragraph(fa("محاسبات مالی، تایید مدیرعامل، مدیریت لایسنس"), style_table_cell)],
        [Paragraph(fa("انباردار (Warehouse)"), style_table_cell), Paragraph(fa("دفاتر ۶ گانه انبار، ثبت رسید پارت ۱ و ۲، متریال"), style_table_cell), Paragraph(fa("قیمت‌گذاری فاکتورها، طراحی، مدیریت دسترسی‌ها"), style_table_cell)],
        [Paragraph(fa("مدیرعامل (CEO)"), style_table_cell), Paragraph(fa("دسترسی کامل، تایید مالی، لایسنس، HR و کاربران"), style_table_cell), Paragraph(fa("هیچ بخشی مسدود نیست (دسترسی نامحدود)"), style_table_cell)]
    ]
    t_roles = Table(roles_data, colWidths=[3.5 * cm, 7.5 * cm, 6.5 * cm])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f766e')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#f0fdf4'), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_roles)

    story.append(PageBreak())

    # ================= SECTION 4: PRODUCTION ORDERS (3-COLOR SYSTEM) =================
    story.append(Paragraph(fa("۴. ماژول دستور تولید ۳ مرحله‌ای و سیستم وضعیت ۳ رنگ"), style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceAfter=8))
    story.append(Paragraph(fa("ماژول دستور تولید منطبق با نرم‌افزار قدیمی کارخانه طراحی شده و شامل ۳ زیرمجموعه اصلی است:"), style_body))
    story.append(Spacer(1, 0.2 * cm))

    story.append(Paragraph(fa("۱. تولید (افست کارخانه):"), style_h2))
    story.append(Paragraph(fa("• سفید (صف تولید سالن): کارهای در حال لامینت، دایکات و جعبه‌چسبانی در سالن کارخانه."), style_bullet))
    story.append(Paragraph(fa("• زرد (مالی و اداری): پرونده‌های در انتظار تسویه حساب، بیعانه یا چک مشتری."), style_bullet))
    story.append(Paragraph(fa("• سبز (بایگانی و تکمیل): سفارش‌های تحویل داده شده و تسویه‌شده نهایی."), style_bullet))
    story.append(Paragraph(fa("• قرمز: سفارش‌های کنسل شده."), style_bullet))
    story.append(Spacer(1, 0.15 * cm))

    story.append(Paragraph(fa("۲. دیجیتال:"), style_h2))
    story.append(Paragraph(fa("مختص کارهای فوری، نمونه‌گیری دیجیتال و چاپ‌های در تیراژ کم با دستگاه‌های دیجیتال کارخانه."), style_body))
    story.append(Spacer(1, 0.15 * cm))

    story.append(Paragraph(fa("۳. خدماتی (کارمزدی):"), style_h2))
    story.append(Paragraph(fa("مختص سفارش‌هایی که مشتری مقوا و شیت چاپی را ارسال کرده و کارخانه تنها خدمات دایکات، سلفون‌کشی، لامینت یا یووی را انجام می‌دهد."), style_body))
    story.append(Spacer(1, 0.3 * cm))

    # Callout: Excel Export
    excel_box = Table(
        [[Paragraph(fa("📊 قابلیت اکسل چند شیتی: با کلیک روی «خروجی فایل اکسل» در بالای صفحه دستور تولید، یک فایل اکسل هوشمند شامل ۳ شیت مجزا (سفید، زرد، سبز) با فرمت ستون‌های چاپخانه تولید و دانلود می‌شود."), style_callout)]],
        colWidths=[17.5 * cm]
    )
    excel_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ecfdf5')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#10b981')),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(excel_box)
    story.append(Spacer(1, 0.4 * cm))

    # ================= SECTION 5: WAREHOUSE INVENTORY =================
    story.append(Paragraph(fa("۵. ماژول انبارداری ۶ گانه متریال کارخانه"), style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceAfter=8))
    story.append(Paragraph(fa("مدیریت دفاتر ورودی و مصرف متریال در ۶ دسته مجزا:"), style_body))
    story.append(Spacer(1, 0.15 * cm))

    wh_categories = [
        ("۱. مقوا (Cardboard):", "ایندربرد، پشت طوسی، کرافت با ثبت پارت ۱ و ۲، گرماژ، ابعاد شیت و انبار تخلیه."),
        ("۲. ورق (Sheet Carton):", "ورق ۳ لایه و ۵ لایه کارتن (فلوتینگ E/B/C) با محاسبه متراژ مربع و موجودی بند."),
        ("۳. سینگل (Single Face):", "سینگل فلوت رول و شیت بهداشتی، لمینتی و صنعتی."),
        ("۴. سلفون (Cellophane):", "سلفون حرارتی مات، براق، مخملی، شنی و واتربیس بر حسب عرض رول و وزن کیلوگرم."),
        ("۵. طلق (PVC Film):", "طلق‌های شفاف PVC و PET سخت جهت پنجره جعبه بر حسب ضخامت به میکرون."),
        ("۶. مرکب و ملزومات (Ink):", "رنگ‌های افست CMYK، رنگ‌های ساختگی پنتون، طلایی، نقره‌ای، چسب و ورنی.")
    ]
    for title, desc in wh_categories:
        story.append(Paragraph(fa(f"• <b>{title}</b> {desc}"), style_bullet))

    story.append(Spacer(1, 0.4 * cm))

    # ================= SECTION 6: AMIRAN DESIGN STUDIO =================
    story.append(Paragraph(fa("۶. استودیو طراحی امیران و موتور خط تیغ پارامتریک"), style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceAfter=8))
    story.append(Paragraph(fa("استودیو طراحی امیران یک موتور مهندسی وکتور است که خط تیغ استاندارد را با دقت صدم میلی‌متر ترسیم می‌کند:"), style_body))
    story.append(Spacer(1, 0.15 * cm))

    dieline_points = [
        "پشتیبانی از ۷ مدل جعبه استاندارد (درب دارویی Tuck End، ته قفلی، قفل اتوماتیک، کیبوردی Mailer و کشویی).",
        "ابعاد منحصراً در مقیاس میلی‌متر (mm) با امکان تایپ آزادانه و بلادرنگ طول، عرض و ارتفاع.",
        "خروجی AutoCAD DXF R12 با تفکیک لایه‌های CUT_LINE (برش) و CREASE_LINE (خط تا) جهت دستگاه لیزر.",
        "خروجی Adobe Illustrator (.AI) و PDF برداری ۱:۱ با کادر مشخصات فنی چاپخانه.",
        "شبیه‌ساز سه‌بعدی ۳D WebGL با قابلیت تاشوندگی ۰ تا ۱۰۰ درصد و متریال واقعی مقوای ایندربرد و کرافت."
    ]
    for dp in dieline_points:
        story.append(Paragraph(fa(f"• {dp}"), style_bullet))

    story.append(PageBreak())

    # ================= SECTION 7: HR & PERFORMANCE SYSTEM =================
    story.append(Paragraph(fa("۷. سامانه منابع انسانی و ارزیابی ۵ محوره عملکرد (HR)"), style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceAfter=8))
    story.append(Paragraph(fa("ارزیابی عملکرد ماهانه پرسنل بر اساس ۵ شاخص تخصصی صنعتی صورت می‌گیرد:"), style_body))
    story.append(Spacer(1, 0.2 * cm))

    hr_axes = [
        [Paragraph(fa("محور ارزیابی"), style_table_header), Paragraph(fa("شاخص‌های اندازه‌گیری"), style_table_header), Paragraph(fa("تاثیر در امتیاز"), style_table_header)],
        [Paragraph(fa("۱. کیفیت کار و دقت فنی"), style_table_cell), Paragraph(fa("کاهش ضایعات و باطله، دقت در خط تیغ، فرمول و چاپ بدون خطای فنی"), style_table_cell), Paragraph(fa("۲۰٪"), style_table_cell)],
        [Paragraph(fa("۲. سرعت عمل و تحویل"), style_table_cell), Paragraph(fa("رعایت موعد تحویل در چرخه ۱۰ مرحله‌ای و پاسخگویی به موقع"), style_table_cell), Paragraph(fa("۲۰٪"), style_table_cell)],
        [Paragraph(fa("۳. تحقق تارگت ماهانه"), style_table_cell), Paragraph(fa("تحقق تارگت استعلام بازاریاب، تیراژ چاپ، ثبت رسید انبار و برآورد"), style_table_cell), Paragraph(fa("۲۰٪"), style_table_cell)],
        [Paragraph(fa("۴. انضباط و حضور کاری"), style_table_cell), Paragraph(fa("حضور به موقع در شیفت، رعایت پروتکل‌های ایمنی، آراستگی محیط کار"), style_table_cell), Paragraph(fa("۲۰٪"), style_table_cell)],
        [Paragraph(fa("۵. کار تیمی و اخلاق"), style_table_cell), Paragraph(fa("تعامل سازنده با همکاران و سرپرستان، مسئولیت‌پذیری و حفظ محرمانگی"), style_table_cell), Paragraph(fa("۲۰٪"), style_table_cell)]
    ]
    t_hr = Table(hr_axes, colWidths=[4 * cm, 11 * cm, 2.5 * cm])
    t_hr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#b45309')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#fffbeb'), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_hr)
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph(fa("فرمول پاداش و رتبه‌بندی عملکرد:"), style_h2))
    story.append(Paragraph(fa("• رتبه A+ (امتیاز ۹۰ تا ۱۰۰): عملکرد عالی 🌟 | پاداش ۱۰ تا ۱۵ درصد حقوق پایه."), style_bullet))
    story.append(Paragraph(fa("• رتبه A (امتیاز ۷۵ تا ۸۹): عملکرد خیلی خوب 🟢 | پاداش ۵ تا ۱۰ درصد حقوق پایه."), style_bullet))
    story.append(Paragraph(fa("• رتبه B (امتیاز ۶۰ تا ۷۴): عملکرد متوسط 🟡 | بدون پاداش، همراه با راهنمایی مدیریتی."), style_bullet))
    story.append(Paragraph(fa("• رتبه C (امتیاز زیر ۶۰): عملکرد ضعیف 🔴 | لزوم شرکت در دوره آموزشی و بازنگری فرآیندها."), style_bullet))
    story.append(Spacer(1, 0.4 * cm))

    # ================= SECTION 8: AI ASSISTANT & PREFLIGHT =================
    story.append(Paragraph(fa("۸. دستیار هوش مصنوعی و بهینه‌ساز فرم‌بندی (AI Engine)"), style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceAfter=8))
    story.append(Paragraph(fa("هوش مصنوعی اتوماسیون دارای ۳ قابلیت کاربردی است:"), style_body))
    story.append(Spacer(1, 0.15 * cm))

    ai_features = [
        ("۱. استخراج هوشمند استعلام (NLP):", "تبدیل متن عامیانه و چت مشتری به داده‌های ساختاریافته (ابعاد جعبه، گرماژ مقوا، تیراژ و نوع سلفون)."),
        ("۲. بهینه‌ساز چیدمان شیت (Sheet Nesting):", "محاسبه دقیق بیشترین تعداد لت در شیت‌های استاندارد (۷۰×۱۰۰، ۶۰×۹۰ و...) و محاسبه کمترین درصد دورریز مقوا."),
        ("۳. بازرسی خط تیغ (Preflight Audit):", "بررسی قوانین فنی، ضخامت زبانه چسب، زاویه قفل و جلوگیری از تداخل لبه‌ها قبل از ساخت قالب لیزری.")
    ]
    for af_title, af_desc in ai_features:
        story.append(Paragraph(fa(f"• <b>{af_title}</b> {af_desc}"), style_bullet))
    story.append(Spacer(1, 0.4 * cm))

    # ================= SECTION 9: SEPIDAR INTEGRATION =================
    story.append(Paragraph(fa("۹. یکپارچه‌سازی با نرم‌افزار حسابداری سپیدار سیستم"), style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceAfter=8))
    story.append(Paragraph(fa("اتوماسیون به گونه‌ای طراحی شده که با همین دیتابیس سریع و بهینه SQLite، از طریق وب‌سرویس به نرم‌افزار سپیدار متصل می‌شود:"), style_body))
    story.append(Spacer(1, 0.15 * cm))

    story.append(Paragraph(fa("• ثبت خودکار مشتریان جدید به عنوان «طرف‌حساب» در سپیدار."), style_bullet))
    story.append(Paragraph(fa("• ارسال پیش‌فاکتورهای تایید شده به سیستم فروش سپیدار."), style_bullet))
    story.append(Paragraph(fa("• صدور حواله خروج انبار محصول در سپیدار همزمان با تحویل بار به مشتری."), style_bullet))
    story.append(Paragraph(fa("• عدم وابستگی: در صورت خاموش بودن سرور سپیدار، خط تولید کارخانه متوقف نشده و داده‌ها پس از اتصال همگام می‌شوند."), style_bullet))

    story.append(Spacer(1, 0.6 * cm))

    # Final Signature Box
    sign_table = Table(
        [
            [Paragraph(fa("تاییدیه مدیریت فنی و برنامه‌نویسی"), style_table_header), Paragraph(fa("تاییدیه مدیریت عامل شرکت آرمان امیران"), style_table_header)],
            [Paragraph(fa("مهندس مسعود شعبانی\nطراح و توسعه‌دهنده سیستم"), style_table_cell), Paragraph(fa("مدیریت عامل و هیئت مدیره\nشرکت صنایع چاپ و بسته‌بندی آرمان امیران"), style_table_cell)]
        ],
        colWidths=[8.75 * cm, 8.75 * cm]
    )
    sign_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.8, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sign_table)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generated successfully: {filename} (Size: {os.path.getsize(filename)} bytes)")

if __name__ == '__main__':
    out_pdf = os.path.join(os.path.dirname(__file__), '..', 'TRAINING_MANUAL.pdf')
    build_pdf(out_pdf)
