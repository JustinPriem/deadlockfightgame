// Duenner Wrapper um PeerJS fuer die Peer-to-Peer-Verbindung zwischen zwei Browsern.
// Nutzt den kostenlosen oeffentlichen PeerJS-Signaling-Server nur fuer den
// initialen Handshake; danach laeuft alles direkt (WebRTC-Datenkanal) zwischen
// den beiden Spielern, ohne eigenen Server.
class NetManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.role = null; // 'host' | 'guest'
    this.onData = null;
    this.onOpen = null;
    this.onClose = null;
    this.onError = null;
  }

  hostRoom(code) {
    this.destroy();
    this.role = 'host';
    return new Promise((resolve, reject) => {
      this.peer = new Peer('dlk-' + code, { debug: 0 });
      this.peer.on('open', (id) => resolve(id));
      this.peer.on('error', (err) => {
        if (this.onError) this.onError(err);
        reject(err);
      });
      this.peer.on('connection', (conn) => {
        this.conn = conn;
        this._bindConn();
      });
    });
  }

  joinRoom(code) {
    this.destroy();
    this.role = 'guest';
    return new Promise((resolve, reject) => {
      let settled = false;
      this.peer = new Peer({ debug: 0 });
      this.peer.on('open', () => {
        this.conn = this.peer.connect('dlk-' + code, { reliable: true });
        this._bindConn();
        this.conn.on('open', () => {
          if (!settled) {
            settled = true;
            resolve();
          }
        });
        setTimeout(() => {
          if (!settled) {
            settled = true;
            reject(new Error('timeout'));
          }
        }, 10000);
      });
      this.peer.on('error', (err) => {
        if (!settled) {
          settled = true;
          if (this.onError) this.onError(err);
          reject(err);
        }
      });
    });
  }

  _bindConn() {
    this.conn.on('data', (data) => {
      if (this.onData) this.onData(data);
    });
    this.conn.on('close', () => {
      if (this.onClose) this.onClose();
    });
    this.conn.on('error', (err) => {
      if (this.onError) this.onError(err);
    });
  }

  send(data) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(data);
      } catch (e) {
        // Sendefehler auf einem einzelnen Paket sind bei einem Fun-Prototyp unkritisch.
      }
    }
  }

  destroy() {
    if (this.conn) {
      try {
        this.conn.close();
      } catch (e) {
        /* noop */
      }
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {
        /* noop */
      }
    }
    this.conn = null;
    this.peer = null;
    this.role = null;
  }
}

// Ein Singleton reicht: es gibt pro Browser-Tab immer hoechstens eine aktive
// Online-Partie.
const NET = new NetManager();
