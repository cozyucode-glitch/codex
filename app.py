from html import escape
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs

HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", "8080"))

PAGE = """<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>이름 인사</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 560px; margin: 80px auto; padding: 0 20px; }
    form { display: flex; gap: 8px; }
    input, button { font: inherit; padding: 10px 12px; }
    input { flex: 1; }
    .hello { margin-top: 24px; font-size: 1.4rem; font-weight: 700; }
  </style>
</head>
<body>
  <h1>이름을 입력하세요</h1>
  <form method="post">
    <input name="name" required autofocus autocomplete="name" placeholder="이름">
    <button type="submit">확인</button>
  </form>
  __MESSAGE__
</body>
</html>
"""


class Handler(BaseHTTPRequestHandler):
    def render(self, message=""):
        body = PAGE.replace("__MESSAGE__", message).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self.render()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8", errors="replace")
        name = parse_qs(raw).get("name", [""])[0].strip()
        safe_name = escape(name)
        message = f'<p class="hello">안녕 {safe_name}</p>' if safe_name else ""
        self.render(message)

    def log_message(self, fmt, *args):
        print(f"{self.address_string()} - {fmt % args}")


if __name__ == "__main__":
    print(f"Serving on http://{HOST}:{PORT}", flush=True)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
