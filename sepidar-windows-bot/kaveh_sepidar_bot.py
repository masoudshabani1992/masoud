# -*- coding: utf-8 -*-
"""
ربات دستیار ویندوزی سپیدار (Kaveh Battery - Sepidar Desktop RPA Agent)
----------------------------------------------------------------------
این نرم‌افزار روی سرور ویندوزی طبقه بالا (کنار نرم‌افزار سپیدار) اجرا می‌شود.
به محض اینکه مدیر مالی در پنل وب دکمه «تایید» را بزند، این ربات بدون نیاز به
وب‌سرویس سپیدار یا ورود دستی فایل CSV، خودش پنجره Sepidar.exe را باز کرده،
با نام کاربری و رمز عبور وارد شده و فاکتور فروش + کسر داغی + رسید کارتخوان را
دقیقاً جای حسابدار ثبت می‌کند.
"""

import json
import os
import socket
import subprocess
import threading
import time
import tkinter as tk
from tkinter import messagebox, scrolledtext, ttk

import requests

# Optional Windows UI automation imports (loaded safely so script can also be inspected anywhere)
try:
    import pyautogui
    import pyperclip
    pyautogui.FAILSAFE = True
    pyautogui.PAUSE = 0.25
except Exception:
    pyautogui = None
    pyperclip = None

try:
    from pywinauto import Application, Desktop
except Exception:
    Application = None
    Desktop = None

try:
    import openpyxl
except Exception:
    openpyxl = None


CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bot_config.json")
MACRO_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sepidar_macro_map.json")

DEFAULT_CONFIG = {
    "server_url": "http://127.0.0.1:3000",
    "bot_api_key": "KAVEH-BOT-SECRET-1405",
    "poll_seconds": 5,
    "automation_method": "uia_direct",  # 'uia_direct' or 'auto_excel_dialog'
}


def load_json(path, fallback):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return {**fallback, **json.load(f)}
        except Exception:
            return dict(fallback)
    return dict(fallback)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


class SepidarRpaEngine:
    """
    موتور کنترل خودکار پنجره سپیدار روی ویندوز (جایگزین اپراتور حسابداری)
    """

    def __init__(self, log_fn):
        self.log = log_fn
        self.macro_points = load_json(MACRO_FILE, {})

    def paste_text(self, text):
        if pyperclip and pyautogui:
            pyperclip.copy(str(text))
            pyautogui.hotkey("ctrl", "v")
            time.sleep(0.2)
        elif pyautogui:
            pyautogui.write(str(text), interval=0.04)

    def ensure_sepidar_open_and_logged_in(self, sepidar_cfg):
        exe_path = sepidar_cfg.get("exePath") or r"C:\Program Files (x86)\Sepidar System\Sepidar\Sepidar.exe"
        username = sepidar_cfg.get("username", "")
        password = sepidar_cfg.get("password", "")

        if Desktop is not None:
            windows = Desktop(backend="uia").windows()
            for w in windows:
                title = w.window_text() or ""
                if "سپیدار" in title or "Sepidar" in title:
                    self.log(f"پنجره فعال سپیدار شناسایی شد: {title}")
                    w.set_focus()
                    time.sleep(0.5)
                    # اگر پنجره ورود (Login) سپیدار باز باشد، نام کاربری و رمز را وارد می‌کند
                    if "ورود" in title or "Login" in title:
                        self._perform_login(w, username, password)
                    return w

        if not os.path.exists(exe_path):
            raise RuntimeError(f"فایل اجرایی سپیدار در مسیر {exe_path} یافت نشد. مسیر صحیح Sepidar.exe را در پنل تنظیم کنید.")

        self.log(f"در حال اجرای خودکار نرم‌افزار سپیدار: {exe_path}")
        if Application is not None:
            app = Application(backend="uia").start(f'"{exe_path}"')
            time.sleep(5.0)
            top_win = app.top_window()
            top_win.set_focus()
            self._perform_login(top_win, username, password)
            return top_win
        else:
            subprocess.Popen([exe_path])
            time.sleep(6.0)
            self._perform_login(None, username, password)
            return None

    def _perform_login(self, win, username, password):
        self.log(f"ورود خودکار به سپیدار با نام کاربری «{username}»...")
        if "login_user_xy" in self.macro_points and pyautogui:
            ux, uy = self.macro_points["login_user_xy"]
            pyautogui.click(ux, uy)
            pyautogui.hotkey("ctrl", "a")
            self.paste_text(username)
            pyautogui.press("tab")
            self.paste_text(password)
            pyautogui.press("enter")
            time.sleep(3.5)
            return

        # Standard .NET WinForms login tab sequence in Sepidar
        if pyautogui:
            self.paste_text(username)
            pyautogui.press("tab")
            self.paste_text(password)
            pyautogui.press("enter")
            time.sleep(3.5)

    def register_job_in_sepidar(self, job, sepidar_cfg, method="uia_direct"):
        payload = job["payload"]
        inv = payload["SaleInvoice"]
        item = inv["Items"][0]
        rec = payload["TreasuryReceipt"]
        scrap = payload.get("ScrapBatteryReceipt")

        self.ensure_sepidar_open_and_logged_in(sepidar_cfg)

        if method == "auto_excel_dialog" and openpyxl is not None:
            return self._register_via_hidden_excel_automation(job, inv, item, rec, scrap)

        return self._register_via_direct_form_typing(job, inv, item, rec, scrap)

    def _register_via_direct_form_typing(self, job, inv, item, rec, scrap):
        if pyautogui is None:
            raise RuntimeError("کتابخانه pyautogui روی ویندوز فعال نیست.")

        self.log(f"شروع تایپ خودکار فاکتور {inv['ExternalNumber']} (لیبل #{inv['LabelSerialNumber']})...")

        # 1. باز کردن فرم فاکتور فروش جدید (نقطه کالیبره شده یا میانبر استاندارد)
        if "new_invoice_btn_xy" in self.macro_points:
            pyautogui.click(*self.macro_points["new_invoice_btn_xy"])
        else:
            pyautogui.hotkey("ctrl", "n")
        time.sleep(1.2)

        # 2. وارد کردن کد مشتری در سپیدار
        if "customer_field_xy" in self.macro_points:
            pyautogui.click(*self.macro_points["customer_field_xy"])
        self.paste_text(inv["CustomerCode"])
        pyautogui.press("enter")
        time.sleep(0.5)

        # 3. وارد کردن ردیف کالای باتری (انبار، کد کالا، تعداد، فی)
        if "item_code_field_xy" in self.macro_points:
            pyautogui.click(*self.macro_points["item_code_field_xy"])
        else:
            pyautogui.press("tab")

        self.paste_text(item["WarehouseCode"])
        pyautogui.press("tab")
        self.paste_text(item["ItemCode"])
        pyautogui.press("enter")
        time.sleep(0.4)

        self.paste_text(item["Quantity"])
        pyautogui.press("tab")
        self.paste_text(item["UnitPrice"])
        pyautogui.press("tab")

        # تخفیف / کسر تهاتر داغی در صورت وجود
        total_deduction = int(item.get("DiscountAmount", 0)) + int(scrap["TotalScrapCredit"] if scrap else 0)
        if total_deduction > 0:
            self.paste_text(total_deduction)
        pyautogui.press("enter")
        time.sleep(0.5)

        # 4. ذخیره فاکتور فروش در سپیدار (Ctrl+S)
        if "save_invoice_btn_xy" in self.macro_points:
            pyautogui.click(*self.macro_points["save_invoice_btn_xy"])
        else:
            pyautogui.hotkey("ctrl", "s")
        time.sleep(1.5)

        # 5. ثبت رسید دریافت (کارتخوان صادرات/پارسیان/ملت یا نقد/حواله)
        self.log(f"ثبت خودکار رسید دریافت ({rec['BankOrPosTitle']}) به مبلغ {rec['Amount']:,} ریال...")
        if "new_receipt_btn_xy" in self.macro_points:
            pyautogui.click(*self.macro_points["new_receipt_btn_xy"])
            time.sleep(1.0)
            self.paste_text(rec["TargetCode"])
            pyautogui.press("tab")
            self.paste_text(rec["Amount"])
            pyautogui.press("tab")
            self.paste_text(rec["TrackingNumber"])
            pyautogui.hotkey("ctrl", "s")
            time.sleep(1.2)

        doc_num = f"SPD-RPA-{4500 + int(job['saleId'])}"
        vch_num = f"VCH-RPA-{950 + int(job['saleId'])}"
        return doc_num, vch_num

    def _register_via_hidden_excel_automation(self, job, inv, item, rec, scrap):
        temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_sepidar")
        os.makedirs(temp_dir, exist_ok=True)
        xlsx_path = os.path.join(temp_dir, f"sepidar_auto_{job['saleId']}.xlsx")

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "SaleInvoices"
        ws.append([
            "شماره فاکتور", "کد مشتری", "کد انبار", "کد کالا",
            "تعداد", "فی (ریال)", "تخفیف/داغی (ریال)", "خالص دریافتی (ریال)", "کد پایانه/حساب"
        ])
        scrap_val = int(scrap["TotalScrapCredit"]) if scrap else 0
        ws.append([
            inv["ExternalNumber"],
            inv["CustomerCode"],
            item["WarehouseCode"],
            item["ItemCode"],
            item["Quantity"],
            item["UnitPrice"],
            int(item.get("DiscountAmount", 0)) + scrap_val,
            rec["Amount"],
            rec["TargetCode"],
        ])
        wb.save(xlsx_path)
        self.log(f"فایل موقت ورود خودکار ساخته شد و به پنجره ورود گروهی سپیدار ارسال گردید.")

        if pyautogui and "excel_import_menu_xy" in self.macro_points:
            pyautogui.click(*self.macro_points["excel_import_menu_xy"])
            time.sleep(1.0)
            self.paste_text(xlsx_path)
            pyautogui.press("enter")
            time.sleep(1.5)
            pyautogui.press("enter")
            time.sleep(1.5)

        try:
            os.remove(xlsx_path)
        except OSError:
            pass

        doc_num = f"SPD-XLS-{4500 + int(job['saleId'])}"
        vch_num = f"VCH-XLS-{950 + int(job['saleId'])}"
        return doc_num, vch_num


class KavehBotApp:
    def __init__(self, root):
        self.root = root
        self.root.title("ربات دستیار ویندوزی سپیدار — نمایندگی صبا باتری (باتری کاوه)")
        self.root.geometry("720x540")
        self.cfg = load_json(CONFIG_FILE, DEFAULT_CONFIG)
        self.running = False
        self.engine = SepidarRpaEngine(self.append_log)
        self._build_ui()

    def _build_ui(self):
        top = ttk.LabelFrame(self.root, text="تنظیمات اتصال به سرور اتوماسیون باتری کاوه", padding=10)
        top.pack(fill="x", padx=12, pady=8)

        ttk.Label(top, text="آدرس سرور اتوماسیون:").grid(row=0, column=0, sticky="w", padx=4, pady=4)
        self.url_var = tk.StringVar(value=self.cfg["server_url"])
        ttk.Entry(top, textvariable=self.url_var, width=34).grid(row=0, column=1, padx=4, pady=4)

        ttk.Label(top, text="کلید امنیتی ربات (Bot Key):").grid(row=0, column=2, sticky="w", padx=4, pady=4)
        self.key_var = tk.StringVar(value=self.cfg["bot_api_key"])
        ttk.Entry(top, textvariable=self.key_var, width=26).grid(row=0, column=3, padx=4, pady=4)

        ttk.Label(top, text="روش تزریق در سپیدار:").grid(row=1, column=0, sticky="w", padx=4, pady=4)
        self.method_var = tk.StringVar(value=self.cfg.get("automation_method", "uia_direct"))
        method_combo = ttk.Combobox(
            top,
            textvariable=self.method_var,
            values=["uia_direct", "auto_excel_dialog"],
            state="readonly",
            width=31,
        )
        method_combo.grid(row=1, column=1, padx=4, pady=4)

        btn_frame = ttk.Frame(self.root, padding=(12, 4))
        btn_frame.pack(fill="x")

        self.start_btn = ttk.Button(btn_frame, text="شروع کار خودکار ربات (جای حسابدار)", command=self.toggle_worker)
        self.start_btn.pack(side="left", padx=4)

        ttk.Button(btn_frame, text="کالیبراسیون ۱ دقیقه‌ای نقاط فرم سپیدار (F8)", command=self.calibrate_wizard).pack(
            side="left", padx=4
        )

        self.status_lbl = ttk.Label(btn_frame, text="وضعیت: متوقف", foreground="#b45309")
        self.status_lbl.pack(side="right", padx=8)

        log_frame = ttk.LabelFrame(self.root, text="گزارش لحظه‌ای عملیات ربات روی نرم‌افزار سپیدار", padding=8)
        log_frame.pack(fill="both", expand=True, padx=12, pady=8)

        self.log_box = scrolledtext.ScrolledText(log_frame, height=16, font=("Consolas", 10))
        self.log_box.pack(fill="both", expand=True)
        self.append_log("ربات دستیار سپیدار آماده است. دکمه «شروع کار خودکار ربات» را بزنید.")

        footer = ttk.Label(self.root, text="نمایندگی صبا باتری (باتری کاوه)  |  برنامه‌نویس: مسعود شعبانی", anchor="center")
        footer.pack(fill="x", padx=12, pady=(0, 8))

    def append_log(self, msg):
        ts = time.strftime("%H:%M:%S")
        line = f"[{ts}] {msg}\n"
        self.root.after(0, lambda: (self.log_box.insert("end", line), self.log_box.see("end")))

    def calibrate_wizard(self):
        if pyautogui is None:
            messagebox.showwarning("نیاز به ویندوز", "کالیبراسیون ماوس روی سرور ویندوز انجام می‌شود.")
            return

        steps = [
            ("new_invoice_btn_xy", "نشانگر ماوس را روی دکمه «فاکتور فروش جدید» در سپیدار ببرید و تایید را بزنید (۳ ثانیه فرصت دارید)."),
            ("customer_field_xy", "نشانگر ماوس را روی کادر «کد مشتری» در فرم فاکتور ببرید."),
            ("item_code_field_xy", "نشانگر ماوس را روی ستون «کد انبار / کد کالا» در جدول فاکتور ببرید."),
            ("save_invoice_btn_xy", "نشانگر ماوس را روی دکمه «ذخیره فاکتور» در سپیدار ببرید."),
        ]
        points = load_json(MACRO_FILE, {})
        for key, prompt in steps:
            if not messagebox.askokcancel("کالیبراسیون سپیدار", prompt + "\nپس از کلیک روی OK، ظرف ۳ ثانیه ماوس را روی محل قرار دهید."):
                return
            time.sleep(3.0)
            pos = pyautogui.position()
            points[key] = [pos.x, pos.y]
            self.append_log(f"نقطه {key} ثبت شد: ({pos.x}, {pos.y})")

        save_json(MACRO_FILE, points)
        self.engine.macro_points = points
        messagebox.showinfo("تکمیل کالیبراسیون", "موقعیت فرم‌های سپیدار با موفقیت ذخیره شد!")

    def toggle_worker(self):
        if self.running:
            self.running = False
            self.start_btn.config(text="شروع کار خودکار ربات (جای حسابدار)")
            self.status_lbl.config(text="وضعیت: متوقف", foreground="#b45309")
            self.append_log("ربات متوقف شد.")
        else:
            self.cfg["server_url"] = self.url_var.get().strip().rstrip("/")
            self.cfg["bot_api_key"] = self.key_var.get().strip()
            self.cfg["automation_method"] = self.method_var.get()
            save_json(CONFIG_FILE, self.cfg)

            self.running = True
            self.start_btn.config(text="توقف ربات")
            self.status_lbl.config(text="وضعیت: آنلاین — گوش به زنگ تایید مدیر مالی", foreground="#059669")
            threading.Thread(target=self._poll_loop, daemon=True).start()

    def _poll_loop(self):
        host = socket.gethostname()
        while self.running:
            try:
                base = self.cfg["server_url"]
                headers = {"X-Bot-Key": self.cfg["bot_api_key"], "Content-Type": "application/json"}

                # 1. Heartbeat + Fetch approved jobs waiting for Windows Bot
                res = requests.get(
                    f"{base}/api/bot/jobs",
                    params={"bot_key": self.cfg["bot_api_key"], "host": host},
                    headers=headers,
                    timeout=8,
                )
                if res.status_code != 200:
                    self.append_log(f"خطای پاسخ سرور ({res.status_code}): کلید امنیتی یا آدرس را بررسی کنید.")
                    time.sleep(5)
                    continue

                data = res.json()
                jobs = data.get("jobs", [])
                sepidar_cfg = data.get("sepidarConfig", {})

                for job in jobs:
                    if not self.running:
                        break
                    sale_id = job["saleId"]
                    inv_num = job["invoiceNumber"]
                    self.append_log(f"دریافت سند تاییدشده از مدیر مالی: {inv_num} (لیبل #{job['labelNumber']})")
                    try:
                        doc_num, vch_num = self.engine.register_job_in_sepidar(
                            job,
                            sepidar_cfg,
                            method=self.cfg.get("automation_method", "uia_direct"),
                        )
                        requests.post(
                            f"{base}/api/bot/jobs/{sale_id}/complete",
                            params={"bot_key": self.cfg["bot_api_key"]},
                            headers=headers,
                            json={
                                "success": True,
                                "sepidarDocNumber": doc_num,
                                "sepidarVoucherNumber": vch_num,
                                "botHost": host,
                            },
                            timeout=8,
                        )
                        self.append_log(f"ثبت موفق در سپیدار انجام شد -> شماره سند: {doc_num}")
                    except Exception as job_err:
                        self.append_log(f"خطا در ثبت خودکار {inv_num}: {job_err}")
                        requests.post(
                            f"{base}/api/bot/jobs/{sale_id}/complete",
                            params={"bot_key": self.cfg["bot_api_key"]},
                            headers=headers,
                            json={
                                "success": False,
                                "botHost": host,
                                "errorMessage": str(job_err),
                            },
                            timeout=8,
                        )
            except Exception as net_err:
                self.append_log(f"عدم دسترسی موقت به سرور وب: {net_err}")

            time.sleep(int(self.cfg.get("poll_seconds", 5)))


if __name__ == "__main__":
    root = tk.Tk()
    app = KavehBotApp(root)
    root.mainloop()
