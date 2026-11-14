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


# ---------------- feedback, updates and the game maker's admin ----------------
# Players send feedback (a bug, a glitch, an idea or something else) with 0-5 stars and maybe a picture, for
# everyone or only for the maker. Everyone sees all public feedback and their own private feedback. The maker logs
# in with a password that only the server knows (Render setting EIK_ADMIN_PASSWORD, or EIK_ADMIN_HASH = sha256 of
# it): then he sees everything, can delete feedback, ban a player from sending more, and post updates.
# Everything is saved in data/ next to this file. On Render that folder is wiped at every restart, so if
# EIK_GH_REPO (a PRIVATE GitHub repository, e.g. "name/eikendal-data") and EIK_GH_TOKEN are set, it is also kept there.
import hmac, secrets, time, urllib.request
DATA = os.environ.get('EIK_DATA_DIR') or os.path.join(HERE, 'data')
FB_LOCK = threading.Lock()
FB = {'items': [], 'updates': [], 'bans': []}
TOKENS = {}
RATE = {}
GH_REPO = os.environ.get('EIK_GH_REPO', '').strip()
GH_TOKEN = os.environ.get('EIK_GH_TOKEN', '').strip()
SALT = os.environ.get('EIK_SALT', 'eikendal')
TYPES = ('bug', 'glitch', 'idee', 'anders')
SAVE_T = [None]
IMG_CACHE = {}


def gh(method, path, body=None, raw=False):
    req = urllib.request.Request('https://api.github.com/repos/%s/contents/%s' % (GH_REPO, path), method=method,
                                 data=json.dumps(body).encode() if body is not None else None)
    req.add_header('Authorization', 'Bearer ' + GH_TOKEN)
    req.add_header('Accept', 'application/vnd.github.raw' if raw else 'application/vnd.github+json')
    req.add_header('User-Agent', 'eikendal-server')
    if body is not None:
        req.add_header('Content-Type', 'application/json')
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()


def gh_put(path, data_bytes):
    sha = None
    try:
        sha = json.loads(gh('GET', path)).get('sha')
    except Exception:
        pass
    body = {'message': 'feedback ' + path, 'content': base64.b64encode(data_bytes).decode()}
    if sha:
        body['sha'] = sha
    gh('PUT', path, body)


def fb_load():
    global FB
    os.makedirs(os.path.join(DATA, 'img'), exist_ok=True)
    raw = None
    if GH_REPO and GH_TOKEN:
        try:
            raw = gh('GET', 'feedback.json', raw=True)
        except Exception as e:
            print('feedback: niet geladen van GitHub:', e)
    if raw is None:
        try:
            with open(os.path.join(DATA, 'feedback.json'), 'rb') as f:
                raw = f.read()
        except Exception:
            raw = None
    if raw:
        try:
            d = json.loads(raw.decode('utf-8'))
            for k in FB:
                FB[k] = d.get(k, [])
        except Exception as e:
            print('feedback: bestand kapot:', e)


def fb_save_now():
    with FB_LOCK:
        data = json.dumps(FB, ensure_ascii=False).encode('utf-8')
    try:
        with open(os.path.join(DATA, 'feedback.json'), 'wb') as f:
            f.write(data)
    except Exception as e:
        print('feedback: niet bewaard:', e)
    if GH_REPO and GH_TOKEN:
        try:
            gh_put('feedback.json', data)
        except Exception as e:
            print('feedback: niet naar GitHub:', e)


def fb_save():
    if SAVE_T[0]:
        SAVE_T[0].cancel()
    SAVE_T[0] = threading.Timer(2.0, fb_save_now)
    SAVE_T[0].daemon = True
    SAVE_T[0].start()


def img_put(iid, data_bytes):
    IMG_CACHE[iid] = data_bytes
    try:
        with open(os.path.join(DATA, 'img', iid + '.jpg'), 'wb') as f:
            f.write(data_bytes)
    except Exception:
        pass
    if GH_REPO and GH_TOKEN:
        threading.Thread(target=lambda: _safe(lambda: gh_put('img/%s.jpg' % iid, data_bytes)), daemon=True).start()


def img_get(iid):
    if iid in IMG_CACHE:
        return IMG_CACHE[iid]
    try:
        with open(os.path.join(DATA, 'img', iid + '.jpg'), 'rb') as f:
            b = f.read()
    except Exception:
        b = None
    if b is None and GH_REPO and GH_TOKEN:
        try:
            b = gh('GET', 'img/%s.jpg' % iid, raw=True)
        except Exception:
            b = None
    if b:
        IMG_CACHE[iid] = b
    return b


def _safe(fn):
    try:
        fn()
    except Exception as e:
        print('feedback:', e)


def admin_ok(pw):
    want = os.environ.get('EIK_ADMIN_PASSWORD', '')
    want_hash = os.environ.get('EIK_ADMIN_HASH', '').strip().lower()
    if not pw:
        return False
    if want:
        return hmac.compare_digest(pw.encode('utf-8'), want.encode('utf-8'))
    if want_hash:
        return hmac.compare_digest(hashlib.sha256(pw.encode('utf-8')).hexdigest(), want_hash)
    return False


def rate(key, n, secs):
    now = time.time()
    L = [t for t in RATE.get(key, []) if now - t < secs]
    if len(L) >= n:
        RATE[key] = L
        return False
    L.append(now)
    RATE[key] = L
    return True


def clean(s, n):
    return ''.join(ch for ch in str(s or '') if ch == '\n' or ord(ch) >= 32)[:n].strip()


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
        if url.path.startswith('/api/'):
            return self.api_get(url)
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


    # ---------------- the feedback api ----------------
    def ip_hash(self):
        ip = (self.headers.get('X-Forwarded-For', '') or self.client_address[0]).split(',')[0].strip()
        return hashlib.sha256((SALT + ip).encode()).hexdigest()[:16]

    def is_admin(self, q=None):
        tok = self.headers.get('X-Admin-Token', '') or ((q or {}).get('tok') or [''])[0]
        exp = TOKENS.get(tok)
        return bool(tok and exp and exp > time.time())

    def cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')

    def reply(self, code, obj=None, body=None, ctype='application/json'):
        if body is None:
            body = json.dumps(obj if obj is not None else {}, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Cache-Control', 'no-store')
        self.cors()
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def body_json(self):
        n = int(self.headers.get('Content-Length', '0') or 0)
        if n > 1800000:
            raise ValueError('te groot')
        return json.loads(self.rfile.read(n).decode('utf-8') or '{}') if n else {}

    def do_OPTIONS(self):
        self.send_response(204)
        self.cors()
        self.send_header('Content-Length', '0')
        self.end_headers()

    def api_get(self, url):
        q = urllib.parse.parse_qs(url.query)
        adm = self.is_admin(q)
        cid = (q.get('cid') or [''])[0]
        if url.path == '/api/feedback':
            with FB_LOCK:
                items = [dict(i) for i in FB['items'] if adm or not i.get('private') or (cid and i.get('cid') == cid)]
                banned = set(FB['bans'])
            for i in items:
                i['mine'] = bool(cid and i.get('cid') == cid)
                if adm:
                    i['banned'] = i.get('cid') in banned
                i.pop('cid', None)
                i.pop('iph', None)
            return self.reply(200, {'items': items[::-1][:300], 'admin': adm})
        if url.path == '/api/updates':
            with FB_LOCK:
                ups = list(FB['updates'])
            return self.reply(200, {'items': ups[::-1][:100]})
        if url.path.startswith('/api/img/'):
            iid = url.path.rsplit('/', 1)[-1].replace('.jpg', '')
            if not iid.isalnum():
                return self.reply(404)
            with FB_LOCK:
                owner = next((i for i in FB['items'] if i.get('img') == iid), None)
                upd = next((u for u in FB['updates'] if u.get('img') == iid), None)
            if owner and owner.get('private') and not adm and owner.get('cid') != cid:
                return self.reply(403)
            if not owner and not upd:
                return self.reply(404)
            b = img_get(iid)
            return self.reply(200, body=b, ctype='image/jpeg') if b else self.reply(404)
        return self.reply(404)

    def do_DELETE(self):
        url = urllib.parse.urlparse(self.path)
        if not self.is_admin():
            return self.reply(403, {'error': 'geen beheerder'})
        kind, _, iid = url.path[len('/api/'):].partition('/')
        key = {'feedback': 'items', 'updates': 'updates'}.get(kind)
        if not key:
            return self.reply(404)
        with FB_LOCK:
            FB[key] = [i for i in FB[key] if i.get('id') != iid]
        fb_save()
        return self.reply(200, {'ok': True})

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        try:
            d = self.body_json()
        except Exception:
            return self.reply(400, {'error': 'onleesbaar'})
        iph = self.ip_hash()
        if url.path == '/api/admin/login':
            if not rate('login' + iph, 6, 600):
                return self.reply(429, {'error': 'Te vaak geprobeerd. Wacht 10 minuten.'})
            if not admin_ok(str(d.get('password', ''))):
                return self.reply(403, {'error': 'Fout wachtwoord.'})
            tok = secrets.token_hex(24)
            TOKENS[tok] = time.time() + 12 * 3600
            return self.reply(200, {'token': tok})
        if url.path == '/api/feedback':
            cid = clean(d.get('cid'), 64)
            if not cid:
                return self.reply(400, {'error': 'geen speler'})
            with FB_LOCK:
                banned = cid in FB['bans'] or ('ip:' + iph) in FB['bans']
            if banned:
                return self.reply(403, {'error': 'Je mag geen feedback meer sturen.'})
            if not rate('fb' + cid, 4, 300) or not rate('fbip' + iph, 8, 300):
                return self.reply(429, {'error': 'Rustig aan! Probeer het over een paar minuten opnieuw.'})
            text = clean(d.get('text'), 2000)
            if len(text) < 3:
                return self.reply(400, {'error': 'Schrijf iets meer.'})
            typ = d.get('type') if d.get('type') in TYPES else 'anders'
            stars = max(0, min(5, int(d.get('stars') or 0)))
            iid = None
            img = str(d.get('img') or '')
            if img.startswith('data:image/'):
                try:
                    raw = base64.b64decode(img.split(',', 1)[1])
                    if len(raw) <= 600000 and raw[:3] in (b'\xff\xd8\xff', b'\x89PN'):
                        iid = secrets.token_hex(8)
                        img_put(iid, raw)
                except Exception:
                    iid = None
            item = {'id': secrets.token_hex(6), 't': int(time.time()), 'cid': cid, 'iph': iph, 'name': clean(d.get('name'), 30) or 'Speler',
                    'type': typ, 'stars': stars, 'text': text, 'img': iid, 'private': bool(d.get('private'))}
            with FB_LOCK:
                FB['items'].append(item)
                FB['items'] = FB['items'][-600:]
            fb_save()
            return self.reply(200, {'ok': True, 'id': item['id']})
        if not self.is_admin():
            return self.reply(403, {'error': 'geen beheerder'})
        if url.path == '/api/updates':
            title, text = clean(d.get('title'), 120), clean(d.get('text'), 4000)
            if not title and not text:
                return self.reply(400, {'error': 'leeg'})
            iid = None
            img = str(d.get('img') or '')
            if img.startswith('data:image/'):
                try:
                    raw = base64.b64decode(img.split(',', 1)[1])
                    if len(raw) <= 900000:
                        iid = secrets.token_hex(8)
                        img_put(iid, raw)
                except Exception:
                    iid = None
            with FB_LOCK:
                FB['updates'].append({'id': secrets.token_hex(6), 't': int(time.time()), 'title': title, 'text': text, 'img': iid})
            fb_save()
            return self.reply(200, {'ok': True})
        if url.path in ('/api/ban', '/api/unban'):
            fid = str(d.get('id', ''))
            with FB_LOCK:
                it = next((i for i in FB['items'] if i.get('id') == fid), None)
                if not it:
                    return self.reply(404, {'error': 'niet gevonden'})
                keys = [it.get('cid'), 'ip:' + it.get('iph', '')]
                if url.path == '/api/ban':
                    for k in keys:
                        if k and k not in FB['bans']:
                            FB['bans'].append(k)
                else:
                    FB['bans'] = [b for b in FB['bans'] if b not in keys]
            fb_save()
            return self.reply(200, {'ok': True})
        return self.reply(404)

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
    fb_load()
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
