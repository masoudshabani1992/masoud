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

# Register Vazirmatn TTF Fonts
FONTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'node_modules', 'vazirmatn', 'fonts', 'ttf')
pdfmetrics.registerFont(TTFont('Vazir', os.path.join(FONTS_DIR, 'Vazirmatn-Regular.ttf')))
pdfmetrics.registerFont(TTFont('Vazir-Bold', os.path.join(FONTS_DIR, 'Vazirmatn-Bold.ttf')))
pdfmetrics.registerFont(TTFont('Vazir-Black', os.path.join(FONTS_DIR, 'Vazirmatn-Black.ttf')))
pdfmetrics.registerFont(TTFont('Vazir-Medium', os.path.join(FONTS_DIR, 'Vazirmatn-Medium.ttf')))

def fa(text):
    if not text:
        return ""
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
        self.drawRightString(w - 1.5 * cm, h - 0.75 * cm, fa("صنایع چاپ و بسته‌بندی امیران | شناسنامه و خلاصه امکانات اتوماسیون (ERP/MIS)"))
        self.setFont('Vazir', 8)
        self.setFillColor(colors.HexColor('#94a3b8'))
        self.drawString(1.5 * cm, h - 0.75 * cm, "Amiran Packaging Automation v3.0")

        # Footer bar
        self.setFillColor(colors.HexColor('#f8fafc'))
        self.rect(0, 0, w, 1.2 * cm, fill=1, stroke=0)
        self.setFillColor(colors.HexColor('#e2e8f0'))
        self.rect(0, 1.2 * cm, w, 0.05 * cm, fill=1, stroke=0)

        # Footer Text
        self.setFont('Vazir-Medium', 8)
        self.setFillColor(colors.HexColor('#64748b'))
        self.drawRightString(w - 1.5 * cm, 0.45 * cm, fa("توسعه و سفارشی‌سازی: مهندس مسعود شعبانی | نسخه سازمانی و اختصاصی کارخانه"))
        self.drawString(1.5 * cm, 0.45 * cm, f"Page {self._pageNumber} of {total_pages}")

        self.restoreState()

def build_pdf(filename="AUTOMATION_FEATURES_SUMMARY.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Vazir-Black',
        fontSize=18,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        alignment=1, # Center
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Vazir-Bold',
        fontSize=11,
        leading=16,
        textColor=colors.HexColor('#d97706'),
        alignment=1, # Center
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Vazir-Black',
        fontSize=12,
        leading=17,
        textColor=colors.HexColor('#1e1b4b'),
        alignment=2, # Right
        spaceBefore=8,
        spaceAfter=5
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Vazir-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1e3a8a'),
        alignment=2, # Right
        spaceBefore=2,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Vazir',
        fontSize=9,
        leading=14.5,
        textColor=colors.HexColor('#1e293b'),
        alignment=2, # Right
        spaceAfter=3
    )

    body_bold_style = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Vazir-Bold',
        fontSize=9,
        leading=14.5,
        textColor=colors.HexColor('#0f172a'),
        alignment=2, # Right
        spaceAfter=3
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Vazir',
        fontSize=8.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        alignment=2, # Right
        spaceAfter=2.5
    )

    story = []

    # Title & Branding Header
    story.append(Paragraph(fa("صنایع چاپ و بسته‌بندی امیران"), title_style))
    story.append(Paragraph(fa("شناسنامه جامع و خلاصه امکانات اتوماسیون صنعتی و مدیریت تولید (ERP / MIS)"), subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#e2e8f0'), spaceBefore=2, spaceAfter=8))

    # Executive Summary Card
    intro_p = Paragraph(
        fa("سامانه اتوماسیون صنعتی شرکت صنایع چاپ و بسته‌بندی امیران، یک پلتفرم جامع تحت وب و تحت شبکه داخلی (LAN) است که به طور تخصصی برای کارخانجات تولید کارتن، جعبه‌های مقوایی، لمینتی، دارویی، بهداشتی و هاردباکس طراحی شده است. این سیستم کل چرخه حیات محصول از اولین استعلام بازاریابی تا تحویل کالا و تسویه مالی را در قالب ۱۰ مرحله استاندارد تولید مکانیزه مدیریت می‌نماید."),
        body_style
    )
    intro_table = Table([[intro_p]], colWidths=[18.0 * cm])
    intro_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(intro_table)
    story.append(Spacer(1, 8))

    # Features Grid (9 Key Pillars)
    modules_data = [
        ("۱. خط تولید ۱۰ مرحله‌ای استاندارد و پایپ‌لاین گرافیکی", [
            "گردش کار کامل ۱۰ مرحله‌ای: ۱. استعلام و بازاریابی  ۲. برآورد قیمت  ۳. طراحی و خط تیغ  ۴. ماکت و نمونه  ۵. تامین متریال  ۶. چاپ افست  ۷. لترپرس و دایکات  ۸. جعبه‌چسبانی  ۹. کنترل کیفی و بسته‌بندی  ۱۰. تحویل و تسویه مالی.",
            "داشبورد کانبان پویا با قابلیت ارجاع کار و لاگ دقیق گردش کار با ثبت کاربر، نقش و زمان دقیق.",
            "بوم گرافیکی پایپ‌لاین تعاملی (مشابه n8n) جهت پایش زنده مسیر عبور هر سفارش در خطوط تولید کارخانه."
        ]),
        ("۲. کارتابل بازاریابی، فرم استعلام صنعتی و ماشین‌حساب برآورد قیمت", [
            "فرم استعلام صنعتی جامع مطابق نرم‌افزار دسکتاپ با تفکیک انواع مقوا (ایندربرد، پشت طوسی، گلاسه، کرافت).",
            "ماشین‌حساب هوشمند صنعتی با محاسبه دقیق متریال، اجرت چاپ، زینک، سلفون، یووی، لترپرس، چسب و حاشیه سود.",
            "سیستم تارگت‌گذاری و هدف‌گذاری ماهانه تعداد استعلام و مبلغ فروش به تفکیک کارشناسان بازاریابی."
        ]),
        ("۳. استودیو خط تیغ پارامتریک و موکاپ ۳ بعدی", [
            "تولید خودکار نقشه گسترده و خط تیغ برای ۷ مدل استاندارد جعبه (درب دارویی، کیبوردی، ته‌قفلی، کشویی و ...).",
            "خروجی استاندارد و مهندسی خط تیغ برای CorelDRAW (.cdr)، ایلوستریتور (.ai)، اتوکد (.dxf) و PDF برداری.",
            "استودیو مدل‌سازی ۳D با انیمیشن تاخوردگی، شیدرهای فیزیکی PBR (سلفون مات/براق، طلاکوب، UV) و رندر 4K."
        ]),
        ("۴. دستیار هوش مصنوعی و موتور چیدمان بهینه شیت (Sheet Nesting)", [
            "استخراج خودکار ابعاد، تیراژ و مشخصات فنی از متن پیام‌های مشتریان با پردازش زبان طبیعی (NLP).",
            "موتور چیدمان و مونتاژ هوشمند شیت با کمترین درصد دورریز و انتخاب بهینه‌ترین ابعاد مقوا و ورق.",
            "سیستم بازرسی پیش از چاپ (Preflight Audit) جهت شناسایی ناهماهنگی ابعاد و هشدارهای فنی."
        ]),
        ("۵. سیستم انبارداری ۶ گانه تخصصی کارخانه", [
            "مدیریت دفاتر ورود و خروج متریال به تفکیک ۶ انبار: ۱. مقوا ۲. ورق کارتن ۳. سینگل ۴. سلفون ۵. طلق ۶. مرکب.",
            "پایش لحظه‌ای موجودی، هشدارهای کسری کالا و صدور گزارش اکسل با کاردکس پارت‌های ورودی."
        ]),
        ("۶. امنیت سخت‌افزاری، لایسنس آفلاین و ورود بیومتریک", [
            "قفل نرم‌افزاری آفلاین مبتنی بر امضای دیجیتال RSA-SHA256 مقید به شناسه سخت‌افزاری سرور (CPU/UUID).",
            "احراز هویت بیومتریک بدون نیاز به کلمه عبور با استفاده از سنسور اثر انگشت و تشخیص چهره WebAuthn / Passkeys."
        ]),
        ("۷. اطلاع‌رسانی چندکاناله پیامک و پیام‌رسان بله", [
            "ارسال نوتیفیکیشن خودکار روی پیام‌رسان بله به پرسنل و مسئول هر دپارتمان پس از ارجاع کار.",
            "ارسال پیامک وب‌سرویس به کارفرما در ۳ نقطه کلیدی: صدور پیش‌فاکتور، تایید طرح و ورود به سالن تولید."
        ]),
        ("۸. مدیریت پرسنل، ماتریس ۲۵ گانه دسترسی‌ها و ارزیابی عملکرد HR", [
            "تعریف کاربران با ماتریس دسترسی ۲۵ گانه فوق‌دقیق و تفکیک انحصاری اختیارات مدیر ارشد و مدیرعامل.",
            "سیستم ارزیابی عملکرد ماهانه ۵ محوره پرسنل با محاسبه امتیاز، کارانه و لاگ ممیزی تمامی رویدادها."
        ]),
        ("۹. ویرایشگر زنده درون‌برنامه‌ای و مدیریت جامع تایپوگرافی", [
            "ویرایشگر زنده درون‌برنامه‌ای (مشابه المنتور وردپرس) جهت بازنویسی تمامی عناوین و متون بدون تغییر سورس.",
            "مدیریت جامع فونت‌ها با ۱۶ فونت استاندارد فارسی، تنظیم مقیاس اندازه قلم (۸۰٪ تا ۱۴۰٪) و آپلود فونت سفارشی."
        ])
    ]

    for title, points in modules_data:
        card_content = []
        card_content.append(Paragraph(fa(title), h2_style))
        for p in points:
            card_content.append(Paragraph(fa(f"• {p}"), bullet_style))

        card_table = Table([[card_content]], colWidths=[18.0 * cm])
        card_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ffffff')),
            ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor('#e2e8f0')),
            ('LINELEFT', (0, 0), (0, -1), 3.0, colors.HexColor('#4f46e5')), # Indigo left border accent
            ('ROUNDEDCORNERS', [4, 4, 4, 4]),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 7),
            ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ]))
        story.append(card_table)
        story.append(Spacer(1, 3))

    # Architecture & Deployment Specifications
    story.append(Spacer(1, 5))
    story.append(Paragraph(fa("مشخصات فنی و بستر استقرار (Technical Architecture)"), h1_style))
    
    spec_data = [
        [Paragraph(fa("پایگاه داده: SQLite پایدار محلی"), body_bold_style), Paragraph(fa("هسته سرور: Node.js & Express"), body_bold_style)],
        [Paragraph(fa("رابط کاربری: React & Tailwind CSS"), body_style), Paragraph(fa("دسترسی شبکه: پورت 3001 در شبکه محلی (LAN)"), body_style)],
        [Paragraph(fa("بسته نصبی: فایل ZIP با راه‌انداز Service ویندوز"), body_style), Paragraph(fa("به‌روزرسانی: آپدیت زنده با ۱ کلیک و بکاپ خودکار"), body_style)]
    ]
    spec_table = Table(spec_data, colWidths=[9.0 * cm, 9.0 * cm])
    spec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f1f5f9')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
    ]))
    story.append(spec_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF Generated Successfully: {filename}")

if __name__ == '__main__':
    build_pdf()
