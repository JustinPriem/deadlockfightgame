# Deadlock Arena (Fan-Minispiel)

Ein inoffizielles 2D-Fighting-Game-Prototyp im Browser, lose inspiriert von
[Deadlock](https://playdeadlock.com) (Valve). Ziel ist Prinzip und Spass,
**keine** exakte Nachbildung der Original-Helden/Fähigkeiten/Balance.

Nicht mit Valve verbunden, von Valve gesponsert oder autorisiert. Nur für
private, nicht-kommerzielle Zwecke gedacht.

## Spielen

Einfach `index.html` im Browser öffnen (Doppelklick reicht, kein Server
nötig) oder die gehostete GitHub-Pages-Version aufrufen.

### Steuerung (lokal, 2 Spieler an einer Tastatur)

| Aktion        | Spieler 1 | Spieler 2 |
|---------------|-----------|-----------|
| Bewegen       | A / D     | ←/→       |
| Springen      | W         | ↑         |
| Blocken       | S         | ↓         |
| Leichter Angriff | F      | K         |
| Schwerer Angriff | G      | L         |
| Spezialfähigkeit | H      | ;         |

In der Heldenauswahl wählen beide Spieler gleichzeitig mit ihren
Bewegungstasten und bestätigen mit ihrer "Leichter Angriff"-Taste.

## Aktueller Umfang

- 5 Helden mit je 1 Spezialfähigkeit, grob an Deadlock-Abilities angelehnt
  (Infernus, Vindicta, Abrams, Seven, Wraith)
- **Lokaler 2-Spieler-Modus** (ein Keyboard), Bewegen/Springen/Blocken/Leicht/Schwer/Spezial
- **Online-Modus**: Raum erstellen, Link an eine zweite Person schicken, per
  WebRTC (PeerJS) direkt verbinden — kein eigener Server nötig. Host simuliert
  die Physik für beide Seiten, der Gast sendet nur seine Eingaben und
  bekommt den Zustand gespiegelt (host-authoritative, robust statt
  perfekt-latenzfrei)
- Health-Bars, Rundentimer, K.O.- und Unentschieden-Erkennung, Rematch-Flow
- Kein Build-Schritt: reines HTML/CSS/JS + lokal eingebundenes Phaser 3 + PeerJS

## Tech-Stack

- [Phaser 3](https://phaser.io/) (liegt lokal in `lib/phaser.min.js`, kein CDN/Build nötig)
- [PeerJS](https://peerjs.com/) (liegt lokal in `lib/peerjs.min.js`) für die
  WebRTC-Peer-to-Peer-Verbindung im Online-Modus. Nutzt den kostenlosen
  öffentlichen PeerJS-Signaling-Server nur für den kurzen Verbindungsaufbau —
  danach läuft alles direkt zwischen den beiden Browsern
- Statische Dateien, laufen direkt im Browser oder via GitHub Pages

## Struktur

```
index.html                          Einstiegspunkt
lib/phaser.min.js                   Phaser-Engine (lokal eingebunden)
lib/peerjs.min.js                   PeerJS (lokal eingebunden)
src/heroes.js                       Heldendaten (Werte, Spezialfähigkeit)
src/controls.js                     Tastatur-Layout + Netzwerk-Eingabe-Adapter
src/heroCard.js                     Gemeinsame Karten-Darstellung für Auswahl-Screens
src/net/netManager.js               PeerJS-Wrapper (Raum erstellen/beitreten, Senden/Empfangen)
src/fighter.js                      Fighter-Klasse (Zustandsmaschine, Angriffe, Remote-Rendering)
src/scenes/MainMenuScene.js         Startbildschirm (lokal/online)
src/scenes/CharSelectScene.js       Lokale Heldenauswahl (ein Keyboard)
src/scenes/OnlineLobbyScene.js      Raum erstellen/beitreten
src/scenes/OnlineCharSelectScene.js Heldenauswahl im Online-Modus
src/scenes/FightScene.js            Kampf-Szene, HUD, Hitbox-Logik, Netcode
src/main.js                         Phaser-Spielkonfiguration
```

### Online-Modus: wie funktioniert das Netzwerk?

- **Host** erstellt einen Raum (kurzer Code), bekommt einen teilbaren Link
  (`?room=CODE`).
- **Gast** öffnet den Link, verbindet sich automatisch per WebRTC-Datenkanal.
- Beide wählen unabhängig ihren Helden; sobald beide bereit sind, startet der
  Host den Kampf für beide Seiten synchron.
- Im Kampf simuliert **nur der Host** die eigentliche Physik/Logik (auch für
  den entfernten Spieler, gespeist aus dessen Eingaben). Der **Gast** ist ein
  reiner Renderer: er schickt nur seine Tasteneingaben und übernimmt
  periodisch den vom Host gesendeten Zustand (Position, HP, aktive
  Trefferzonen). Das ist bewusst einfach gehalten (kein Rollback-Netcode) —
  robust und ausreichend für ein Fun-Projekt, auf Kosten von etwas
  Eingabeverzögerung beim Gast.

## Auf GitHub Pages veröffentlichen

1. Im Repo unter **Settings → Pages** als Quelle den Branch wählen (z.B.
   `main` oder diesen Feature-Branch) mit Ordner `/ (root)`.
2. Nach dem Speichern ist das Spiel unter
   `https://<user>.github.io/<repo>/` erreichbar.
3. Da alles statisch ist (kein Server, kein Build), reicht das aus — jeder
   Push aktualisiert die Seite automatisch.

## Steuerung im Online-Modus

Jede Person hat ihre eigene volle Tastatur, daher nutzt online **jeder**
dasselbe Layout: A/D bewegen, W springen, S blocken, F leichter Angriff,
G schwerer Angriff, H Spezial.
