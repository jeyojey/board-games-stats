import http.server
import socketserver
import json
import os
from urllib.parse import parse_qs, urlparse

# Create data directory if it doesn't exist
DATA_DIR = 'data'
GAMES_FILE = os.path.join(DATA_DIR, 'games.json')

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)
    os.chmod(DATA_DIR, 0o777)

if not os.path.exists(GAMES_FILE):
    with open(GAMES_FILE, 'w') as f:
        json.dump([], f)
    os.chmod(GAMES_FILE, 0o666)

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/data/games.json':
            try:
                with open(GAMES_FILE, 'r') as f:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(f.read().encode())
            except Exception as e:
                self.send_error(500, str(e))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/data/games.json':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                games = json.loads(post_data.decode())
                with open(GAMES_FILE, 'w') as f:
                    json.dump(games, f, indent=2)
                os.chmod(GAMES_FILE, 0o666)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode())
            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(404)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

PORT = 8000
Handler = RequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    httpd.serve_forever() 