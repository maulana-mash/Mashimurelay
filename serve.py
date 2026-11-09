import http.server
import socketserver
import webbrowser
import os
import sys
import socket

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        lower_path = self.path.lower()
        # Hard-block direct audio file requests to prevent IDM interception
        if lower_path.endswith('.mp3') or lower_path.endswith('.wav') or lower_path.endswith('.ogg') or '/assets/sounds/' in lower_path:
            self.send_response(204)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", "0")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            return
        super().do_GET()

    def do_HEAD(self):
        lower_path = self.path.lower()
        # Hard-block direct audio file requests to prevent IDM interception
        if lower_path.endswith('.mp3') or lower_path.endswith('.wav') or lower_path.endswith('.ogg') or '/assets/sounds/' in lower_path:
            self.send_response(204)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", "0")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            return
        super().do_HEAD()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format, *args):
        # suppress excessive log noise
        pass

def find_free_port(start_port):
    port = start_port
    while port < start_port + 100:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
        port += 1
    return start_port

def get_lan_ip():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"

if __name__ == '__main__':
    port = find_free_port(PORT)
    lan_ip = get_lan_ip()
    local_url = f"http://localhost:{port}/index.html"
    mobile_url = f"http://{lan_ip}:{port}/index.html"

    print("=" * 68)
    print("   [SIMURELAY CAD & ENGINE - ELECTROMECHANICAL SIMULATOR]")
    print("=" * 68)
    print(f"Local PC Access:")
    print(f"    {local_url}")
    print()
    print(f"Android / Mobile Device Access (Same Wi-Fi network):")
    print(f"    {mobile_url}")
    print()
    print("Petunjuk Penggunaan di Android:")
    print("    1. Pastikan HP Android terhubung ke Wi-Fi yang sama dengan PC.")
    print(f"    2. Buka browser Chrome / Edge di HP, buka: {mobile_url}")
    print("    3. Tekan menu browser (...) -> Pilih 'Tambahkan ke Layar Utama'")
    print("       atau 'Install App'.")
    print("    4. Aplikasi Simurelay siap digunakan offline layaknya aplikasi native!")
    print("=" * 68)
    print("Membuka browser di komputer...")
    
    # Only open browser on PC if not explicitly running headlessly
    if "--no-browser" not in sys.argv:
        webbrowser.open(local_url)
        
    print("Tekan Ctrl+C untuk menghentikan server.")
    print("=" * 68)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", port), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer Simurelay dihentikan.")
