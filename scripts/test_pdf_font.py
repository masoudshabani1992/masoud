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

# 1. Register Vazirmatn Fonts
FONTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'client', 'node_modules', 'vazirmatn', 'fonts', 'ttf')
REG_FONT = os.path.join(FONTS_DIR, 'Vazirmatn-Regular.ttf')
BOLD_FONT = os.path.join(FONTS_DIR, 'Vazirmatn-Bold.ttf')
BLACK_FONT = os.path.join(FONTS_DIR, 'Vazirmatn-Black.ttf')
MEDIUM_FONT = os.path.join(FONTS_DIR, 'Vazirmatn-Medium.ttf')

pdfmetrics.registerFont(TTFont('Vazir', REG_FONT))
pdfmetrics.registerFont(TTFont('Vazir-Bold', BOLD_FONT))
pdfmetrics.registerFont(TTFont('Vazir-Black', BLACK_FONT))
pdfmetrics.registerFont(TTFont('Vazir-Medium', MEDIUM_FONT))

def fa(text):
    """Helper to reshape and bidi Persian text for ReportLab"""
    if not text:
        return ""
    reshaped = arabic_reshaper.reshape(str(text))
    return get_display(reshaped)

print("Vazir fonts registered successfully!")
