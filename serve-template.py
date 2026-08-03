"""Proje kökünden statik sunucu: / -> /personel-portal-html/giris.html"""
from __future__ import annotations

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8080
HOME = "/personel-portal-html/giris.html"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self.send_response(302)
            self.send_header("Location", HOME)
            self.end_headers()
            return
        return super().do_GET()

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))


def main():
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print("Site  -> http://%s:%s%s" % (HOST, PORT, HOME))
    print("Kok   -> http://%s:%s/  (girise yonlendirir)" % (HOST, PORT))
    print("Durdurmak icin Ctrl+C")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
