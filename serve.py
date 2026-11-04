#!/usr/bin/env python3
"""Eikendal local server: serves the game and runs multiplayer for everyone on the same network.

Start it with "Start Eikendal.command" (Mac) or "Start Eikendal.bat" (Windows), or: python3 serve.py
Friends on the same wifi open the address shown below and choose the same server name.
It also works next to Live Server in VS Code: the game looks for this server on ports 8000-8004
(the VS Code task "Eikendal multiplayer-server" starts it with --no-browser).
Only the Python standard library is used.
"""
import base64, hashlib, http.server, json, os, socket, struct, sys, threading, urllib.parse, webbrowser, itertools

HERE = os.path.dirname(os.path.abspath(__file__))
GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
ROOMS = {}            # room name -> {client id: Client}
LOCK = threading.Lock()
IDS = itertools.count(1)
LAN = ''


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))   # no packet is sent; this only picks the outgoing interface
        return s.getsockname()[0]
    except Exception:
        return '127.0.0.1'
    finally:
        s.close()


class Client:
    def __init__(self, handler, room):
        self.h = handler
        self.room = room
        self.id = 'p%d' % next(IDS)
        self.presence = {}
        self.wlock = threading.Lock()
        self.alive = True

    def send(self, obj):
        data = json.dumps(obj, separators=(',', ':')).encode('utf-8')
        n = len(data)
        if n < 126:
            head = struct.pack('!BB', 0x81, n)
        elif n < 65536:
            head = struct.pack('!BBH', 0x81, 126, n)
        else:
            head = struct.pack('!BBQ', 0x81, 127, n)
        try:
            with self.wlock:
                self.h.wfile.write(head + data)
                self.h.wfile.flush()
        except Exception:
            self.alive = False


def broadcast(room, obj, skip=None):
    with LOCK:
        targets = [c for c in ROOMS.get(room, {}).values() if c is not skip]
    for c in targets:
        c.send(obj)


class Handler(http.server.SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map, **{
        '.js': 'application/javascript', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
        '.glb': 'model/gltf-binary', '.bin': 'application/octet-stream', '.fbx': 'application/octet-stream'})

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=HERE, **kw)

    def log_message(self, fmt, *args):
        pass

    def end_headers(self):
        if self.path.split('?')[0].endswith(('.html', '.js', '/')):
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == '/mp' and self.headers.get('Upgrade', '').lower() == 'websocket':
            return self.websocket(urllib.parse.parse_qs(url.query))
        if url.path == '/health':                 # Render checks this (and the game uses it to wake the server)
            body = b'ok'
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    # ---------------- websocket ----------------
    def websocket(self, q):
        key = self.headers.get('Sec-WebSocket-Key', '')
        accept = base64.b64encode(hashlib.sha1((key + GUID).encode()).digest()).decode()
        self.send_response(101, 'Switching Protocols')
        self.send_header('Upgrade', 'websocket')
        self.send_header('Connection', 'Upgrade')
        self.send_header('Sec-WebSocket-Accept', accept)
        self.end_headers()
        self.close_connection = True
        if 'probe' in q:
            c = Client(self, None)
            c.send({'t': 'info', 'lan': LAN})
            self.close_frame()
            return
        room = (q.get('room', ['eikendal-1'])[0] or 'eikendal-1')[:40]
        c = Client(self, room)
        with LOCK:
            peers = [{'id': o.id, 'p': o.presence} for o in ROOMS.get(room, {}).values()]
            ROOMS.setdefault(room, {})[c.id] = c
        c.send({'t': 'hello', 'id': c.id, 'peers': peers})
        print('  + speler %s in wereld "%s" (%d online)' % (c.id, room, len(ROOMS.get(room, {}))))
        try:
            while c.alive:
                msg = self.read_message()
                if msg is None:
                    break
                try:
                    m = json.loads(msg)
                except ValueError:
                    continue
                if not isinstance(m, dict):
                    continue
                if m.get('t') == 'p' and isinstance(m.get('p'), dict):
                    if len(msg) > 16384:
                        continue
                    c.presence = m['p']
                    broadcast(room, {'t': 'p', 'id': c.id, 'p': c.presence}, skip=c)
                elif m.get('t') == 'e' and isinstance(m.get('topic'), str):
                    broadcast(room, {'t': 'e', 'id': c.id, 'topic': m['topic'][:48], 'data': m.get('data')}, skip=c)
        finally:
            with LOCK:
                ROOMS.get(room, {}).pop(c.id, None)
                if not ROOMS.get(room):
                    ROOMS.pop(room, None)
            broadcast(room, {'t': 'bye', 'id': c.id})
            print('  - speler %s vertrokken uit "%s"' % (c.id, room))

    def close_frame(self):
        try:
            self.wfile.write(b'\x88\x00')
            self.wfile.flush()
        except Exception:
            pass

    def read_exact(self, n):
        buf = b''
        while len(buf) < n:
            part = self.rfile.read(n - len(buf))
            if not part:
                return None
            buf += part
        return buf

    def read_message(self):
        parts = []
        while True:
            head = self.read_exact(2)
            if head is None:
                return None
            b1, b2 = head
            fin, op = b1 & 0x80, b1 & 0x0F
            n = b2 & 0x7F
            if n == 126:
                ext = self.read_exact(2)
                if ext is None:
                    return None
                n = struct.unpack('!H', ext)[0]
            elif n == 127:
                ext = self.read_exact(8)
                if ext is None:
                    return None
                n = struct.unpack('!Q', ext)[0]
            if n > 1 << 22:
                return None
            mask = self.read_exact(4) if b2 & 0x80 else b'\x00\x00\x00\x00'
            data = self.read_exact(n) if n else b''
            if mask is None or data is None:
                return None
            data = bytes(b ^ mask[i % 4] for i, b in enumerate(data))
            if op == 8:
                self.close_frame()
                return None
            if op == 9:                       # ping -> pong
                try:
                    self.wfile.write(struct.pack('!BB', 0x8A, len(data)) + data)
                    self.wfile.flush()
                except Exception:
                    return None
                continue
            if op == 10:
                continue
            parts.append(data)
            if fin:
                return b''.join(parts).decode('utf-8', 'replace')


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    global LAN
    port = int(os.environ.get('PORT', '8000'))
    for p in range(port, port + 20):
        try:
            srv = Server(('0.0.0.0', p), Handler)
            port = p
            break
        except OSError:
            continue
    else:
        print('Geen vrije poort gevonden.')
        sys.exit(1)
    LAN = 'http://%s:%d' % (lan_ip(), port)
    local = 'http://localhost:%d' % port
    print('')
    print('  Eikendal draait!')
    print('  Op deze computer:   ' + local)
    print('  Vrienden (zelfde wifi): ' + LAN)
    print('  Kies in het spel "Multiplayer" en dezelfde servernaam. Sluit dit venster om te stoppen.')
    print('  Speel je met Live Server in VS Code? Laat deze server gewoon aan staan: het spel vindt hem vanzelf.')
    print('')
    if '--no-browser' not in sys.argv:
        threading.Timer(.8, lambda: webbrowser.open(local)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
