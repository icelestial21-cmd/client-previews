#!/usr/bin/env python3
"""
Apex Athlete Exchange (AAX) - Local Telemetry & Development Server
Port: 8094
Sovereign Sports Tech Infrastructure
"""

import http.server
import socketserver
import os
import sys

PORT = 8094
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class AAXHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS for local testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        sys.stdout.write(f"[AAX Server :8094] {self.address_string()} - {format % args}\n")
        sys.stdout.flush()

def run_server():
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AAXHTTPRequestHandler) as httpd:
        print(f"[AAX Server Active] Serving Apex Athlete Exchange at http://localhost:{PORT}")
        print(f"[Document Root] {DIRECTORY}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[AAX Server Stopped] Shutting down cleanly.")
            httpd.server_close()

if __name__ == "__main__":
    run_server()
