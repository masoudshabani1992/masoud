#!/usr/bin/env python3
"""ساخت کاتالوگ PDF فارسی محصولات کوشا خودرو

خروجی: public/catalogs/<slug>.pdf  و ثبت خودکار فایل در جدول media
(قطعه‌ی brochure_id محصول هم به‌روز می‌شود تا لینک صفحه محصول فعال شود)

نصب پیش‌نیازها (یک‌بار):
  python3 -m venv .venv && .venv/bin/pip install reportlab fonttools arabic-reshaper python-bidi
اجرا:
  .venv/bin/python scripts/build-catalogs.py            # همه محصولات
  .venv/bin/python scripts/build-catalogs.py kia-k5-turbo   # یک محصول
"""
import json
import os
import sqlite3
import sys

from bidi.algorithm import get_display
import arabic_reshaper
from fontTools.ttLib import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as PdfTTFont
from reportlab.pdfgen import canvas

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
DB_PATH = os.path.join(ROOT, "data", "cms.db")
OUT_DIR = os.path.join(PUBLIC, "catalogs")
FONT_CACHE = os.path.join(ROOT, "data", "Vazirmatn-catalog.ttf")

INK = HexColor("#141414")
SOFT = HexColor("#5f5f5f")
LINE = HexColor("#d9d9d9")
LIGHT = HexColor("#f5f5f5")

RESHAPER = arabic_reshaper.ArabicReshaper(
    configuration={"delete_harakat": False, "support_ligatures": True}
)

W, H = A4
MARGIN = 18 * mm


def fa(text):
    """متن فارسی با حروف متصل و ترتیب راست‌به‌چپ برای reportlab"""
    if text is None:
        return ""
    lines = []
    for line in str(text).split("\n"):
        lines.append(get_display(RESHAPER.reshape(line)))
    return "\n".join(lines)


def fa_num(value):
    digits = "۰۱۲۳۴۵۶۷۸۹"
    return "".join(digits[int(c)] if c.isdigit() else c for c in str(value))


def money(toman):
    if not toman:
        return "استعلام قیمت"
    grouped = f"{int(toman):,}".replace(",", "٬")
    return fa_num(grouped) + " تومان"


def register_font():
    """فونت متغیر woff2 را به TTF ایستا تبدیل و در reportlab ثبت می‌کند"""
    src = os.path.join(PUBLIC, "fonts", "Vazirmatn.woff2")
    os.makedirs(os.path.dirname(FONT_CACHE), exist_ok=True)
    if not os.path.exists(FONT_CACHE) or os.path.getmtime(FONT_CACHE) < os.path.getmtime(src):
        font = TTFont(src)
        font.flavor = None
        font.save(FONT_CACHE)
    pdfmetrics.registerFont(PdfTTFont("Vazirmatn", FONT_CACHE))
    return "Vazirmatn"


def put_right(c, text, right_x, y, font, size, color=INK):
    s = fa(text)
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(right_x - pdfmetrics.stringWidth(s, font, size), y, s)


def put_left(c, text, x, y, font, size, color=INK):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, fa(text))


def wrap(c, text, right_x, y, max_width, font, size, leading, color=SOFT):
    """پاراگراف راست‌چین؛ y نهایی را برمی‌گرداند"""
    c.setFillColor(color)
    c.setFont(font, size)
    for paragraph in fa(text).split("\n"):
        words = paragraph.split(" ")
        line = ""
        for word in words:
            candidate = (line + " " + word).strip()
            if pdfmetrics.stringWidth(candidate, font, size) <= max_width or not line:
                line = candidate
            else:
                put_right(c, "", right_x, y, font, size)
                c.drawString(right_x - pdfmetrics.stringWidth(line, font, size), y, line)
                y -= leading
                line = word
        if line:
            c.drawString(right_x - pdfmetrics.stringWidth(line, font, size), y, line)
            y -= leading
    return y


def top_bar(c, font, left_text, right_text):
    c.setFillColor(INK)
    c.rect(0, H - 9 * mm, W, 9 * mm, stroke=0, fill=1)
    put_right(c, right_text, W - MARGIN, H - 6 * mm, font, 9.5, HexColor("#ffffff"))
    put_left(c, left_text, MARGIN, H - 6 * mm, font, 8, HexColor("#bfbfbf"))


def footer(c, font, left_text, right_text):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(MARGIN, 16 * mm, W - MARGIN, 16 * mm)
    put_left(c, left_text, MARGIN, 11 * mm, font, 8, SOFT)
    put_right(c, right_text, W - MARGIN, 11 * mm, font, 8, SOFT)


def draw_cover_image(c, path, x, y, w, h):
    """درج تصویر با برش مرکزی تا کادر کامل پر شود"""
    from reportlab.lib.utils import ImageReader
    img = ImageReader(path)
    iw, ih = img.getSize()
    scale = max(w / iw, h / ih)
    c.saveState()
    clip = c.beginPath()
    clip.rect(x, y, w, h)
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(img, x + (w - iw * scale) / 2, y + (h - ih * scale) / 2,
                iw * scale, ih * scale, mask=None)
    c.restoreState()


def cover(c, product, font):
    top_bar(c, font, "kooshakhodro.com", "کوشا خودرو")
    title_y = H - 32 * mm
    put_right(c, product["name"], W - MARGIN, title_y, font, 25, INK)
    if product.get("model"):
        put_right(c, product["model"], W - MARGIN, title_y - 9 * mm, font, 11, SOFT)

    # تصویر
    box_h = 92 * mm
    box_y = title_y - 12 * mm - box_h
    c.setFillColor(HexColor("#ededed"))
    c.rect(MARGIN, box_y, W - 2 * MARGIN, box_h, stroke=0, fill=1)
    img = product.get("cover_path")
    if img and os.path.exists(img):
        draw_cover_image(c, img, MARGIN, box_y, W - 2 * MARGIN, box_h)

    # شعار و ویژگی‌ها
    y = box_y - 16 * mm
    tagline = (product.get("brochure") or {}).get("tagline") or "کاتالوگ رسمی محصول"
    put_right(c, tagline, W - MARGIN, y, font, 13.5, INK)
    y -= 10 * mm
    highlights = (product.get("brochure") or {}).get("highlights") or \
        [sp.get("value", "") for sp in (product.get("specs") or [])][:4]
    for h in highlights[:4]:
        c.setFillColor(INK)
        c.rect(W - MARGIN - 2.2 * mm, y + 1.2 * mm, 2.2 * mm, 2.2 * mm, stroke=0, fill=1)
        put_right(c, h, W - MARGIN - 6 * mm, y, font, 10.5, INK)
        y -= 8 * mm

    # قیمت
    y -= 4 * mm
    c.setStrokeColor(LINE)
    c.line(MARGIN, y + 5 * mm, W - MARGIN, y + 5 * mm)
    y -= 3 * mm
    put_right(c, "قیمت", W - MARGIN, y, font, 8.5, SOFT)
    y -= 8 * mm
    put_right(c, money(product.get("price")), W - MARGIN, y, font, 14, INK)
    if product.get("price_note"):
        wrap(c, product["price_note"], W - MARGIN, y - 8 * mm, W - 2 * MARGIN - 70 * mm, font, 9, 5.4 * mm)

    footer(c, font, "sale.kooshakhodro.com", "مشخصات ممکن است تغییر کند — آخرین اطلاعات در سایت")


def specs_page(c, product, font):
    top_bar(c, font, "kooshakhodro.com", "کاتالوگ رسمی محصول")
    put_right(c, "مشخصات فنی", W - MARGIN, H - 30 * mm, font, 19, INK)
    put_right(c, product["name"], W - MARGIN, H - 40 * mm, font, 10.5, SOFT)

    img = product.get("cover_path")
    y = H - 46 * mm
    if img and os.path.exists(img):
        img_h = 54 * mm
        c.setFillColor(HexColor("#ededed"))
        c.rect(MARGIN, y - img_h, W - 2 * MARGIN, img_h, stroke=0, fill=1)
        draw_cover_image(c, img, MARGIN, y - img_h, W - 2 * MARGIN, img_h)
        y -= img_h + 12 * mm

    specs = (product.get("specs") or [])[:15]
    row_h = 8 * mm
    label_w = 66 * mm
    for i, sp in enumerate(specs):
        if i % 2 == 0:
            c.setFillColor(LIGHT)
            c.rect(MARGIN, y - 2.2 * mm, W - 2 * MARGIN, row_h, stroke=0, fill=1)
        put_right(c, sp.get("label", ""), W - MARGIN - 3 * mm, y, font, 9, SOFT)
        put_right(c, sp.get("value", ""), W - MARGIN - label_w, y, font, 9.5, INK)
        y -= row_h

    y -= 8 * mm
    c.setStrokeColor(LINE)
    c.line(MARGIN, y + 6 * mm, W - MARGIN, y + 6 * mm)
    put_right(c, "شرایط خرید و استعلام", W - MARGIN, y - 4 * mm, font, 11.5, INK)
    body = ("برای دریافت شرایط فروش، رنگ‌های موجود و زمان تحویل با کارشناسان کوشا خودرو تماس بگیرید. "
            "ثبت‌نام طرح‌های فروش از طریق سامانه اینترنتی sale.kooshakhodro.com و عاملیت‌های مجاز انجام می‌شود.")
    wrap(c, body, W - MARGIN, y - 14 * mm, W - 2 * MARGIN, font, 9.5, 6 * mm)

    footer(c, font, "sale.kooshakhodro.com", product["name"])


def build(product, font):
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, product["slug"] + ".pdf")
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle(fa(product["name"]))
    c.setAuthor("Koosha Khodro")
    c.setSubject("Product catalog")
    c.setCreator("Koosha CMS")
    cover(c, product, font)
    c.showPage()
    specs_page(c, product, font)
    c.showPage()
    c.save()
    return path


def load_products(slugs):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """SELECT p.*, m.url AS cover_url FROM products p
           LEFT JOIN media m ON m.id = p.cover_id ORDER BY p.sort, p.id"""
    ).fetchall()
    out = []
    for r in rows:
        if slugs and r["slug"] not in slugs:
            continue
        cover_path = None
        if r["cover_url"]:
            candidate = os.path.join(PUBLIC, r["cover_url"].lstrip("/"))
            if os.path.exists(candidate):
                cover_path = candidate
        out.append({
            "id": r["id"],
            "slug": r["slug"],
            "name": r["name"],
            "model": r["model"],
            "price": r["price"],
            "price_note": r["price_note"],
            "cover_path": cover_path,
            "cover_url": r["cover_url"],
            "specs": json.loads(r["specs_json"] or "[]"),
            "brochure": json.loads(r["brochure_json"] or "{}"),
        })
    conn.close()
    return out


def register_media(products, built):
    """ثبت فایل PDF در کتابخانه رسانه و اتصال به محصول"""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    for product, path in zip(products, built):
        url = "/catalogs/" + os.path.basename(path)
        size = os.path.getsize(path)
        row = cur.execute("SELECT id FROM media WHERE url = ?", (url,)).fetchone()
        if row:
            media_id = row[0]
            cur.execute("UPDATE media SET size = ?, mime = ? WHERE id = ?",
                        (size, "application/pdf", media_id))
        else:
            cur.execute(
                """INSERT INTO media (filename, original_name, url, mime, size, alt)
                   VALUES (?,?,?,?,?,?)""",
                (os.path.basename(path), f"کاتالوگ {product['name']}.pdf", url,
                 "application/pdf", size, f"کاتالوگ {product['name']}"),
            )
            media_id = cur.lastrowid
        cur.execute("UPDATE products SET brochure_id = ? WHERE id = ?", (media_id, product["id"]))
    conn.commit()
    conn.close()


def main():
    if not os.path.exists(DB_PATH):
        print(f"دیتابیس پیدا نشد: {DB_PATH}")
        return 1
    slugs = set(sys.argv[1:])
    products = load_products(slugs)
    if not products:
        print("محصولی برای ساخت کاتالوگ پیدا نشد.")
        return 1
    font = register_font()
    built = [build(p, font) for p in products]
    register_media(products, built)
    print(f"{len(built)} کاتالوگ ساخته و در کتابخانه رسانه ثبت شد:")
    for path in built:
        print(f"  {os.path.relpath(path, ROOT)}  ({os.path.getsize(path) // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
