#!/usr/bin/env python3
"""پیش‌نمایش + لینک دانلود فایل‌های المنتور بکردانه"""
import http.server
import os
import socketserver
import urllib.parse

BASE = os.path.dirname(os.path.abspath(__file__))
PREVIEW = os.path.join(BASE, "preview")
ELEMENTOR = os.path.join(BASE, "elementor")
PORT = 8080


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PREVIEW, **kwargs)

    def _serve_download(self, name, send_body=True):
        fpath = os.path.join(ELEMENTOR, name)
        if name and os.path.isfile(fpath):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Disposition", 'attachment; filename="%s"' % name)
            self.send_header("Content-Length", str(os.path.getsize(fpath)))
            self.end_headers()
            if send_body:
                with open(fpath, "rb") as f:
                    self.wfile.write(f.read())
            return True
        return False

    def _serve_zip(self, send_body=True):
        fpath = os.path.join(PREVIEW, "bekrdaneh-elementor-blocks.zip")
        if os.path.isfile(fpath):
            self.send_response(200)
            self.send_header("Content-Type", "application/zip")
            self.send_header(
                "Content-Disposition",
                'attachment; filename="bekrdaneh-elementor-blocks.zip"',
            )
            self.send_header("Content-Length", str(os.path.getsize(fpath)))
            self.end_headers()
            if send_body:
                with open(fpath, "rb") as f:
                    self.wfile.write(f.read())
            return True
        return False

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path == "/bekrdaneh-elementor-blocks.zip" or path.startswith("/dlzip"):
            if not self._serve_zip():
                self.send_error(404, "File not found")
            return
        if path.startswith("/dl/"):
            name = urllib.parse.unquote(os.path.basename(path))
            if not self._serve_download(name):
                self.send_error(404, "File not found")
            return
        super().do_GET()

    def do_HEAD(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path == "/bekrdaneh-elementor-blocks.zip" or path.startswith("/dlzip"):
            if not self._serve_zip(send_body=False):
                self.send_error(404, "File not found")
            return
        if path.startswith("/dl/"):
            name = urllib.parse.unquote(os.path.basename(path))
            if not self._serve_download(name, send_body=False):
                self.send_error(404, "File not found")
            return
        super().do_HEAD()


class ThreadingServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    with ThreadingServer(("0.0.0.0", PORT), Handler) as httpd:
        print("serving preview on", PORT)
        httpd.serve_forever()
