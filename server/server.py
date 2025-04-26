import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Добавляем заголовки для обхода CORS-ограничений
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # Перенаправляем корневой путь на index.html
        if self.path == '/':
            self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

# Переходим в корневую директорию проекта
os.chdir('..')

print(f"Сервер запущен на порту {PORT}")
print(f"Открой в браузере: http://localhost:{PORT}")
print(f"Чтобы остановить сервер, нажми Ctrl+C")

# Запускаем сервер
with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nСервер остановлен")
        httpd.server_close() 