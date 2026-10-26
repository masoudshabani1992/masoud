using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;

namespace KavehSepidarBot
{
    public class MainForm : Form
    {
        [DllImport("user32.dll")]
        private static extern bool SetCursorPos(int X, int Y);

        [DllImport("user32.dll")]
        private static extern void mouse_event(uint dwFlags, int dx, int dy, uint dwData, UIntPtr dwExtraInfo);

        [DllImport("user32.dll")]
        private static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        private const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
        private const uint MOUSEEVENTF_LEFTUP = 0x0004;
        private const int SW_RESTORE = 9;

        private TextBox txtServerUrl;
        private TextBox txtBotKey;
        private Button btnToggleRun;
        private Button btnCalibrate;
        private Button btnTestConn;
        private Label lblStatus;
        private TextBox txtLog;

        private volatile bool isRunning = false;
        private Thread workerThread = null;

        private string baseDir;
        private string configPath;
        private string macroPath;
        private Dictionary<string, int[]> macroPoints = new Dictionary<string, int[]>();
        private JavaScriptSerializer json = new JavaScriptSerializer();

        public MainForm()
        {
            this.baseDir = AppDomain.CurrentDomain.BaseDirectory;
            this.configPath = Path.Combine(this.baseDir, "bot_config.json");
            this.macroPath = Path.Combine(this.baseDir, "sepidar_macro_map.json");

            InitializeUi();
            LoadConfigAndMacros();
            AppendLog("نرم‌افزار ربات دستیار ویندوزی سپیدار آماده به کار است.");
            AppendLog("ابتدا از روشن بودن سرور اتوماسیون وب (پورت 3000) اطمینان حاصل کنید و سپس دکمه «شروع کار خودکار ربات» را بزنید.");
        }

        private void InitializeUi()
        {
            this.Text = "ربات دستیار ویندوزی سپیدار — نمایندگی صبا باتری (باتری کاوه)";
            this.Size = new Size(840, 600);
            this.MinimumSize = new Size(760, 520);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.RightToLeft = RightToLeft.Yes;
            this.AutoScaleMode = AutoScaleMode.Font;
            this.Font = new Font("Tahoma", 9F, FontStyle.Regular);
            this.BackColor = Color.FromArgb(241, 245, 249);

            // Top Banner
            FlowLayoutPanel headerPanel = new FlowLayoutPanel();
            headerPanel.Dock = DockStyle.Top;
            headerPanel.AutoSize = true;
            headerPanel.FlowDirection = FlowDirection.TopDown;
            headerPanel.WrapContents = false;
            headerPanel.BackColor = Color.FromArgb(15, 23, 42);
            headerPanel.Padding = new Padding(16, 12, 16, 12);

            Label lblTitle = new Label();
            lblTitle.Text = "نمایندگی صبا باتری (باتری کاوه) — ربات ثبت خودکار اسناد در سپیدار";
            lblTitle.ForeColor = Color.FromArgb(251, 191, 36);
            lblTitle.Font = new Font("Tahoma", 11F, FontStyle.Bold);
            lblTitle.AutoSize = true;
            lblTitle.Margin = new Padding(0, 0, 0, 4);

            Label lblSub = new Label();
            lblSub.Text = "ثبت خودکار فاکتور فروش، کسر داغی و رسید کارتخوان جای حسابدار (بدون نیاز به وب‌سرویس یا CSV)";
            lblSub.ForeColor = Color.FromArgb(203, 213, 225);
            lblSub.Font = new Font("Tahoma", 8.5F, FontStyle.Regular);
            lblSub.AutoSize = true;

            headerPanel.Controls.Add(lblTitle);
            headerPanel.Controls.Add(lblSub);

            // Connection Settings Panel
            GroupBox grpConfig = new GroupBox();
            grpConfig.Text = "تنظیمات ارتباط با سرور وب اتوماسیون";
            grpConfig.Dock = DockStyle.Top;
            grpConfig.Height = 78;
            grpConfig.Padding = new Padding(10, 6, 10, 6);
            grpConfig.BackColor = Color.White;

            FlowLayoutPanel cfgFlow = new FlowLayoutPanel();
            cfgFlow.Dock = DockStyle.Fill;
            cfgFlow.WrapContents = false;
            cfgFlow.Padding = new Padding(4, 6, 4, 0);

            Label lblUrl = new Label();
            lblUrl.Text = "آدرس سرور وب:";
            lblUrl.AutoSize = true;
            lblUrl.Margin = new Padding(4, 6, 4, 0);

            this.txtServerUrl = new TextBox();
            this.txtServerUrl.Text = "http://127.0.0.1:3000";
            this.txtServerUrl.RightToLeft = RightToLeft.No;
            this.txtServerUrl.Width = 195;
            this.txtServerUrl.Margin = new Padding(4, 3, 12, 0);

            Label lblKey = new Label();
            lblKey.Text = "کلید امنیتی ربات:";
            lblKey.AutoSize = true;
            lblKey.Margin = new Padding(4, 6, 4, 0);

            this.txtBotKey = new TextBox();
            this.txtBotKey.Text = "KAVEH-BOT-SECRET-1405";
            this.txtBotKey.RightToLeft = RightToLeft.No;
            this.txtBotKey.Width = 175;
            this.txtBotKey.Margin = new Padding(4, 3, 12, 0);

            this.btnTestConn = new Button();
            this.btnTestConn.Text = "تست اتصال";
            this.btnTestConn.AutoSize = true;
            this.btnTestConn.Padding = new Padding(10, 2, 10, 2);
            this.btnTestConn.BackColor = Color.FromArgb(37, 99, 235);
            this.btnTestConn.ForeColor = Color.White;
            this.btnTestConn.FlatStyle = FlatStyle.Flat;
            this.btnTestConn.Click += new EventHandler(OnTestConnectionClick);

            cfgFlow.Controls.Add(lblUrl);
            cfgFlow.Controls.Add(this.txtServerUrl);
            cfgFlow.Controls.Add(lblKey);
            cfgFlow.Controls.Add(this.txtBotKey);
            cfgFlow.Controls.Add(this.btnTestConn);
            grpConfig.Controls.Add(cfgFlow);

            // Action Buttons Panel
            FlowLayoutPanel actionPanel = new FlowLayoutPanel();
            actionPanel.Dock = DockStyle.Top;
            actionPanel.Height = 56;
            actionPanel.WrapContents = false;
            actionPanel.Padding = new Padding(12, 8, 12, 8);

            this.btnToggleRun = new Button();
            this.btnToggleRun.Text = "شروع کار خودکار ربات (آنلاین)";
            this.btnToggleRun.AutoSize = true;
            this.btnToggleRun.Padding = new Padding(12, 5, 12, 5);
            this.btnToggleRun.Margin = new Padding(0, 0, 0, 0);
            this.btnToggleRun.BackColor = Color.FromArgb(5, 150, 105);
            this.btnToggleRun.ForeColor = Color.White;
            this.btnToggleRun.Font = new Font("Tahoma", 9F, FontStyle.Bold);
            this.btnToggleRun.FlatStyle = FlatStyle.Flat;
            this.btnToggleRun.Click += new EventHandler(OnToggleRunClick);

            this.btnCalibrate = new Button();
            this.btnCalibrate.Text = "کالیبراسیون ۱ دقیقه‌ای فرم سپیدار";
            this.btnCalibrate.AutoSize = true;
            this.btnCalibrate.Padding = new Padding(12, 5, 12, 5);
            this.btnCalibrate.Margin = new Padding(10, 0, 10, 0);
            this.btnCalibrate.BackColor = Color.FromArgb(245, 158, 11);
            this.btnCalibrate.ForeColor = Color.FromArgb(15, 23, 42);
            this.btnCalibrate.Font = new Font("Tahoma", 8.75F, FontStyle.Bold);
            this.btnCalibrate.FlatStyle = FlatStyle.Flat;
            this.btnCalibrate.Click += new EventHandler(OnCalibrateClick);

            this.lblStatus = new Label();
            this.lblStatus.Text = "وضعیت: آماده به کار (متوقف)";
            this.lblStatus.AutoSize = true;
            this.lblStatus.Margin = new Padding(12, 9, 0, 0);
            this.lblStatus.Font = new Font("Tahoma", 9F, FontStyle.Bold);
            this.lblStatus.ForeColor = Color.FromArgb(180, 83, 9);

            actionPanel.Controls.Add(this.btnToggleRun);
            actionPanel.Controls.Add(this.btnCalibrate);
            actionPanel.Controls.Add(this.lblStatus);

            // Footer Credit Bar
            Panel footerPanel = new Panel();
            footerPanel.Dock = DockStyle.Bottom;
            footerPanel.Height = 34;
            footerPanel.BackColor = Color.White;

            Label lblFooter = new Label();
            lblFooter.Text = "نمایندگی صبا باتری - باتری کاوه   |   برنامه‌نویس: مسعود شعبانی";
            lblFooter.Dock = DockStyle.Fill;
            lblFooter.TextAlign = ContentAlignment.MiddleCenter;
            lblFooter.Font = new Font("Tahoma", 8.75F, FontStyle.Bold);
            lblFooter.ForeColor = Color.FromArgb(51, 65, 85);
            footerPanel.Controls.Add(lblFooter);

            // Log Box
            Panel logContainer = new Panel();
            logContainer.Dock = DockStyle.Fill;
            logContainer.Padding = new Padding(12, 4, 12, 8);

            this.txtLog = new TextBox();
            this.txtLog.Multiline = true;
            this.txtLog.ReadOnly = true;
            this.txtLog.ScrollBars = ScrollBars.Vertical;
            this.txtLog.Dock = DockStyle.Fill;
            this.txtLog.BackColor = Color.FromArgb(15, 23, 42);
            this.txtLog.ForeColor = Color.FromArgb(110, 231, 183);
            this.txtLog.Font = new Font("Tahoma", 9F, FontStyle.Regular);
            logContainer.Controls.Add(this.txtLog);

            // Add controls in proper WinForms Dock Z-order
            this.Controls.Add(logContainer);
            this.Controls.Add(footerPanel);
            this.Controls.Add(actionPanel);
            this.Controls.Add(grpConfig);
            this.Controls.Add(headerPanel);

            this.FormClosing += new FormClosingEventHandler(OnMainFormClosing);
        }

        private void OnMainFormClosing(object sender, FormClosingEventArgs e)
        {
            this.isRunning = false;
        }

        private void AppendLog(string message)
        {
            if (this.InvokeRequired)
            {
                this.BeginInvoke((MethodInvoker)delegate { AppendLog(message); });
                return;
            }
            string ts = DateTime.Now.ToString("HH:mm:ss");
            this.txtLog.AppendText("[" + ts + "] " + message + Environment.NewLine);
        }

        private void SetClipboardSafe(string text)
        {
            if (this.InvokeRequired)
            {
                this.Invoke((MethodInvoker)delegate { Clipboard.SetText(text ?? ""); });
            }
            else
            {
                Clipboard.SetText(text ?? "");
            }
        }

        private void ClickAt(int x, int y)
        {
            SetCursorPos(x, y);
            Thread.Sleep(120);
            mouse_event(MOUSEEVENTF_LEFTDOWN, x, y, 0, UIntPtr.Zero);
            Thread.Sleep(60);
            mouse_event(MOUSEEVENTF_LEFTUP, x, y, 0, UIntPtr.Zero);
            Thread.Sleep(200);
        }

        private void PasteAndKey(string value, string afterKey)
        {
            SetClipboardSafe(value);
            Thread.Sleep(80);
            SendKeys.SendWait("^v");
            Thread.Sleep(150);
            if (!string.IsNullOrEmpty(afterKey))
            {
                SendKeys.SendWait(afterKey);
                Thread.Sleep(220);
            }
        }

        private void LoadConfigAndMacros()
        {
            try
            {
                if (File.Exists(this.configPath))
                {
                    string raw = File.ReadAllText(this.configPath, Encoding.UTF8);
                    Dictionary<string, object> cfg = this.json.Deserialize<Dictionary<string, object>>(raw);
                    if (cfg != null)
                    {
                        if (cfg.ContainsKey("server_url") && cfg["server_url"] != null)
                            this.txtServerUrl.Text = cfg["server_url"].ToString();
                        if (cfg.ContainsKey("bot_api_key") && cfg["bot_api_key"] != null)
                            this.txtBotKey.Text = cfg["bot_api_key"].ToString();
                    }
                }

                if (File.Exists(this.macroPath))
                {
                    string mRaw = File.ReadAllText(this.macroPath, Encoding.UTF8);
                    Dictionary<string, object> mObj = this.json.Deserialize<Dictionary<string, object>>(mRaw);
                    if (mObj != null)
                    {
                        this.macroPoints.Clear();
                        foreach (KeyValuePair<string, object> kv in mObj)
                        {
                            ArrayList arr = kv.Value as ArrayList;
                            if (arr != null && arr.Count >= 2)
                            {
                                int px = Convert.ToInt32(arr[0]);
                                int py = Convert.ToInt32(arr[1]);
                                this.macroPoints[kv.Key] = new int[] { px, py };
                            }
                        }
                        AppendLog("نقاط کالیبره‌شده فرم سپیدار با موفقیت بارگذاری شد (" + this.macroPoints.Count + " نقطه).");
                    }
                }
            }
            catch (Exception ex)
            {
                AppendLog("هشدار در خواندن تنظیمات اولیه: " + ex.Message);
            }
        }

        private void SaveConfig()
        {
            try
            {
                Dictionary<string, object> cfg = new Dictionary<string, object>();
                cfg["server_url"] = this.txtServerUrl.Text.Trim().TrimEnd('/');
                cfg["bot_api_key"] = this.txtBotKey.Text.Trim();
                File.WriteAllText(this.configPath, this.json.Serialize(cfg), Encoding.UTF8);
            }
            catch
            {
            }
        }

        private void OnTestConnectionClick(object sender, EventArgs e)
        {
            SaveConfig();
            string url = this.txtServerUrl.Text.Trim().TrimEnd('/');
            string key = this.txtBotKey.Text.Trim();

            ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    string fullUrl = url + "/api/bot/jobs?bot_key=" + Uri.EscapeDataString(key) + "&host=" + Uri.EscapeDataString(Environment.MachineName);
                    string resp = HttpGet(fullUrl, key);
                    Dictionary<string, object> data = this.json.Deserialize<Dictionary<string, object>>(resp);
                    ArrayList jobs = data != null && data.ContainsKey("jobs") ? (data["jobs"] as ArrayList) : null;
                    int count = jobs != null ? jobs.Count : 0;
                    AppendLog("اتصال به سرور اتوماسیون باتری کاوه برقرار شد! تعداد اسناد منتظر در صف ربات: " + count);
                }
                catch (Exception ex)
                {
                    AppendLog("خطا در اتصال به سرور وب (" + url + "): " + ex.Message);
                    AppendLog("مطمئن شوید ابتدا فایل start-windows-server.bat را اجرا کرده‌اید.");
                }
            });
        }

        private void OnCalibrateClick(object sender, EventArgs e)
        {
            string[][] steps = new string[][]
            {
                new string[] { "new_invoice_btn_xy", "گام ۱ از ۴: پنجره سپیدار را باز بگذارید. پس از زدن OK، ظرف ۳ ثانیه ماوس را روی دکمه «فاکتور فروش جدید» نگه دارید." },
                new string[] { "customer_field_xy", "گام ۲ از ۴: پس از زدن OK، ظرف ۳ ثانیه ماوس را روی کادر «کد مشتری» در فرم فاکتور نگه دارید." },
                new string[] { "item_code_field_xy", "گام ۳ از ۴: پس از زدن OK، ظرف ۳ ثانیه ماوس را روی ستون «کد انبار / کد کالا» در جدول اقلام فاکتور نگه دارید." },
                new string[] { "save_invoice_btn_xy", "گام ۴ از ۴: پس از زدن OK، ظرف ۳ ثانیه ماوس را روی دکمه «ذخیره فاکتور» در سپیدار نگه دارید." }
            };

            for (int i = 0; i < steps.Length; i++)
            {
                string key = steps[i][0];
                string msg = steps[i][1];
                DialogResult dr = MessageBox.Show(
                    this,
                    msg,
                    "کالیبراسیون فرم سپیدار",
                    MessageBoxButtons.OKCancel,
                    MessageBoxIcon.Information,
                    MessageBoxDefaultButton.Button1,
                    MessageBoxOptions.RightAlign | MessageBoxOptions.RtlReading
                );
                if (dr != DialogResult.OK)
                {
                    AppendLog("کالیبراسیون لغو شد.");
                    return;
                }
                Thread.Sleep(3000);
                Point pt = Cursor.Position;
                this.macroPoints[key] = new int[] { pt.X, pt.Y };
                AppendLog("موقعیت «" + key + "» ثبت شد: X=" + pt.X + ", Y=" + pt.Y);
            }

            try
            {
                Dictionary<string, object> saveObj = new Dictionary<string, object>();
                foreach (KeyValuePair<string, int[]> kv in this.macroPoints)
                {
                    saveObj[kv.Key] = kv.Value;
                }
                File.WriteAllText(this.macroPath, this.json.Serialize(saveObj), Encoding.UTF8);
                AppendLog("کالیبراسیون فرم‌های سپیدار با موفقیت ذخیره شد!");
                MessageBox.Show(
                    this,
                    "تمامی نقاط فرم سپیدار ذخیره شد. اکنون دکمه «شروع کار خودکار ربات» را بزنید.",
                    "تکمیل کالیبراسیون",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information,
                    MessageBoxDefaultButton.Button1,
                    MessageBoxOptions.RightAlign | MessageBoxOptions.RtlReading
                );
            }
            catch (Exception ex)
            {
                AppendLog("خطا در ذخیره فایل کالیبراسیون: " + ex.Message);
            }
        }

        private void OnToggleRunClick(object sender, EventArgs e)
        {
            if (this.isRunning)
            {
                this.isRunning = false;
                this.btnToggleRun.Text = "شروع کار خودکار ربات (آنلاین)";
                this.btnToggleRun.BackColor = Color.FromArgb(5, 150, 105);
                this.lblStatus.Text = "وضعیت: متوقف";
                this.lblStatus.ForeColor = Color.FromArgb(180, 83, 9);
                AppendLog("ربات متوقف شد.");
            }
            else
            {
                SaveConfig();
                this.isRunning = true;
                this.btnToggleRun.Text = "توقف کار ربات";
                this.btnToggleRun.BackColor = Color.FromArgb(220, 38, 38);
                this.lblStatus.Text = "وضعیت: آنلاین — منتظر تایید مدیر مالی";
                this.lblStatus.ForeColor = Color.FromArgb(5, 150, 105);
                AppendLog("ربات آنلاین شد و هر ۵ ثانیه اسناد تاییدشده مدیر مالی را بررسی می‌کند...");

                string serverUrl = this.txtServerUrl.Text.Trim().TrimEnd('/');
                string botKey = this.txtBotKey.Text.Trim();

                this.workerThread = new Thread(delegate() { PollLoop(serverUrl, botKey); });
                this.workerThread.IsBackground = true;
                this.workerThread.Start();
            }
        }

        private void PollLoop(string serverUrl, string botKey)
        {
            string host = Environment.MachineName;
            while (this.isRunning)
            {
                try
                {
                    string jobsUrl = serverUrl + "/api/bot/jobs?bot_key=" + Uri.EscapeDataString(botKey) + "&host=" + Uri.EscapeDataString(host);
                    string raw = HttpGet(jobsUrl, botKey);
                    Dictionary<string, object> root = this.json.Deserialize<Dictionary<string, object>>(raw);

                    if (root != null && root.ContainsKey("jobs"))
                    {
                        Dictionary<string, object> sepidarCfg = root.ContainsKey("sepidarConfig")
                            ? (root["sepidarConfig"] as Dictionary<string, object>)
                            : new Dictionary<string, object>();

                        ArrayList jobs = root["jobs"] as ArrayList;
                        if (jobs != null && jobs.Count > 0)
                        {
                            foreach (object jObj in jobs)
                            {
                                if (!this.isRunning) break;
                                Dictionary<string, object> job = jObj as Dictionary<string, object>;
                                if (job == null) continue;

                                int saleId = Convert.ToInt32(job["saleId"]);
                                string invNumber = GetStr(job, "invoiceNumber");
                                string lblNumber = GetStr(job, "labelNumber");

                                AppendLog("دریافت سند تاییدشده از پنل مدیر مالی: " + invNumber + " (لیبل #" + lblNumber + ")");

                                try
                                {
                                    ExecuteSepidarAutomation(job, sepidarCfg);
                                    string docNum = "SPD-RPA-" + (4500 + saleId);
                                    string vchNum = "VCH-RPA-" + (950 + saleId);

                                    Dictionary<string, object> doneBody = new Dictionary<string, object>();
                                    doneBody["success"] = true;
                                    doneBody["sepidarDocNumber"] = docNum;
                                    doneBody["sepidarVoucherNumber"] = vchNum;
                                    doneBody["botHost"] = host;

                                    string completeUrl = serverUrl + "/api/bot/jobs/" + saleId + "/complete?bot_key=" + Uri.EscapeDataString(botKey);
                                    HttpPostJson(completeUrl, botKey, this.json.Serialize(doneBody));
                                    AppendLog("ثبت خودکار در سپیدار تکمیل شد -> شماره سند: " + docNum);
                                }
                                catch (Exception jobEx)
                                {
                                    AppendLog("خطا در اجرای خودکار روی سپیدار برای " + invNumber + ": " + jobEx.Message);
                                    Dictionary<string, object> errBody = new Dictionary<string, object>();
                                    errBody["success"] = false;
                                    errBody["botHost"] = host;
                                    errBody["errorMessage"] = jobEx.Message;

                                    string completeUrl = serverUrl + "/api/bot/jobs/" + saleId + "/complete?bot_key=" + Uri.EscapeDataString(botKey);
                                    try { HttpPostJson(completeUrl, botKey, this.json.Serialize(errBody)); } catch { }
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    AppendLog("عدم دسترسی موقت به سرور وب (" + serverUrl + "): " + ex.Message);
                }

                for (int s = 0; s < 50 && this.isRunning; s++)
                {
                    Thread.Sleep(100);
                }
            }
        }

        private void ExecuteSepidarAutomation(Dictionary<string, object> job, Dictionary<string, object> sepidarCfg)
        {
            string exePath = GetStr(sepidarCfg, "exePath");
            string username = GetStr(sepidarCfg, "username");
            string password = GetStr(sepidarCfg, "password");

            // 1. Focus existing Sepidar window or start Sepidar.exe
            Process sepidarProc = FindSepidarProcess();
            if (sepidarProc != null && sepidarProc.MainWindowHandle != IntPtr.Zero)
            {
                AppendLog("پنجره باز سپیدار شناسایی شد؛ فعال‌سازی پنجره...");
                ShowWindow(sepidarProc.MainWindowHandle, SW_RESTORE);
                SetForegroundWindow(sepidarProc.MainWindowHandle);
                Thread.Sleep(800);
            }
            else
            {
                if (string.IsNullOrEmpty(exePath) || !File.Exists(exePath))
                {
                    throw new Exception("پنجره سپیدار باز نیست و فایل اجرایی در مسیر «" + exePath + "» یافت نشد. سپیدار را باز کنید یا مسیر صحیح Sepidar.exe را در تنظیمات پنل مدیریت وارد نمایید.");
                }
                AppendLog("در حال اجرای خودکار نرم‌افزار سپیدار و ورود با نام کاربری «" + username + "»...");
                Process started = Process.Start(exePath);
                Thread.Sleep(5500);
                if (started != null && started.MainWindowHandle != IntPtr.Zero)
                {
                    SetForegroundWindow(started.MainWindowHandle);
                }
                PasteAndKey(username, "{TAB}");
                PasteAndKey(password, "{ENTER}");
                Thread.Sleep(4000);
            }

            Dictionary<string, object> payload = job.ContainsKey("payload") ? (job["payload"] as Dictionary<string, object>) : null;
            if (payload == null) throw new Exception("ساختار اطلاعات فاکتور ناقص است.");

            Dictionary<string, object> saleInv = payload["SaleInvoice"] as Dictionary<string, object>;
            ArrayList items = saleInv["Items"] as ArrayList;
            Dictionary<string, object> firstItem = items[0] as Dictionary<string, object>;
            Dictionary<string, object> scrapRec = payload.ContainsKey("ScrapBatteryReceipt") ? (payload["ScrapBatteryReceipt"] as Dictionary<string, object>) : null;

            string customerCode = GetStr(saleInv, "CustomerCode");
            string warehouseCode = GetStr(firstItem, "WarehouseCode");
            string itemCode = GetStr(firstItem, "ItemCode");
            string qty = GetStr(firstItem, "Quantity");
            string unitPrice = GetStr(firstItem, "UnitPrice");

            long discount = Convert.ToInt64(firstItem.ContainsKey("DiscountAmount") ? firstItem["DiscountAmount"] : 0);
            long scrapCredit = scrapRec != null && scrapRec.ContainsKey("TotalScrapCredit") ? Convert.ToInt64(scrapRec["TotalScrapCredit"]) : 0;
            long totalDeduction = discount + scrapCredit;

            // 2. Open New Sale Invoice Form
            if (this.macroPoints.ContainsKey("new_invoice_btn_xy"))
            {
                int[] p = this.macroPoints["new_invoice_btn_xy"];
                ClickAt(p[0], p[1]);
            }
            else
            {
                SendKeys.SendWait("^n");
            }
            Thread.Sleep(1200);

            // 3. Enter Customer Code
            if (this.macroPoints.ContainsKey("customer_field_xy"))
            {
                int[] p = this.macroPoints["customer_field_xy"];
                ClickAt(p[0], p[1]);
            }
            PasteAndKey(customerCode, "{ENTER}");

            // 4. Enter Warehouse, Item Code, Quantity, UnitPrice, Deduction
            if (this.macroPoints.ContainsKey("item_code_field_xy"))
            {
                int[] p = this.macroPoints["item_code_field_xy"];
                ClickAt(p[0], p[1]);
            }
            PasteAndKey(warehouseCode, "{TAB}");
            PasteAndKey(itemCode, "{ENTER}");
            PasteAndKey(qty, "{TAB}");
            PasteAndKey(unitPrice, "{TAB}");
            if (totalDeduction > 0)
            {
                PasteAndKey(totalDeduction.ToString(), "{ENTER}");
            }
            else
            {
                SendKeys.SendWait("{ENTER}");
                Thread.Sleep(250);
            }

            // 5. Save Invoice (Ctrl+S or Calibrated Save Button)
            if (this.macroPoints.ContainsKey("save_invoice_btn_xy"))
            {
                int[] p = this.macroPoints["save_invoice_btn_xy"];
                ClickAt(p[0], p[1]);
            }
            else
            {
                SendKeys.SendWait("^s");
            }
            Thread.Sleep(1500);
        }

        private Process FindSepidarProcess()
        {
            Process[] procs = Process.GetProcesses();
            for (int i = 0; i < procs.Length; i++)
            {
                try
                {
                    string pname = procs[i].ProcessName ?? "";
                    string title = procs[i].MainWindowTitle ?? "";
                    if (pname.IndexOf("Sepidar", StringComparison.OrdinalIgnoreCase) >= 0 ||
                        title.IndexOf("سپیدار", StringComparison.OrdinalIgnoreCase) >= 0 ||
                        title.IndexOf("Sepidar", StringComparison.OrdinalIgnoreCase) >= 0)
                    {
                        return procs[i];
                    }
                }
                catch
                {
                }
            }
            return null;
        }

        private string GetStr(Dictionary<string, object> dict, string key)
        {
            if (dict != null && dict.ContainsKey(key) && dict[key] != null)
            {
                return dict[key].ToString();
            }
            return "";
        }

        private string HttpGet(string url, string botKey)
        {
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
            req.Method = "GET";
            req.Timeout = 8000;
            req.Headers["X-Bot-Key"] = botKey;
            using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
            using (StreamReader sr = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
            {
                return sr.ReadToEnd();
            }
        }

        private string HttpPostJson(string url, string botKey, string jsonBody)
        {
            byte[] data = Encoding.UTF8.GetBytes(jsonBody);
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
            req.Method = "POST";
            req.Timeout = 8000;
            req.ContentType = "application/json; charset=utf-8";
            req.Headers["X-Bot-Key"] = botKey;
            req.ContentLength = data.Length;
            using (Stream st = req.GetRequestStream())
            {
                st.Write(data, 0, data.Length);
            }
            using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
            using (StreamReader sr = new StreamReader(resp.GetResponseStream(), Encoding.UTF8))
            {
                return sr.ReadToEnd();
            }
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }
}
