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

## Aktueller Umfang (Phase 1)

- 5 Helden mit je 1 Spezialfähigkeit, grob an Deadlock-Abilities angelehnt
  (Infernus, Vindicta, Abrams, Seven, Wraith)
- Lokaler 2-Spieler-Modus, Bewegen/Springen/Blocken/Leicht/Schwer/Spezial
- Health-Bars, Rundentimer, K.O.- und Unentschieden-Erkennung
- Kein Build-Schritt: reines HTML/CSS/JS + lokal eingebundenes Phaser 3

## Tech-Stack

- [Phaser 3](https://phaser.io/) (liegt lokal in `lib/phaser.min.js`, kein CDN/Build nötig)
- Statische Dateien, laufen direkt im Browser oder via GitHub Pages

## Struktur

```
index.html            Einstiegspunkt
lib/phaser.min.js      Phaser-Engine (lokal eingebunden)
src/heroes.js          Heldendaten (Werte, Spezialfähigkeit)
src/controls.js        Tastatur-Layout für P1/P2
src/fighter.js          Fighter-Klasse (Zustandsmaschine, Angriffe)
src/scenes/CharSelectScene.js   Heldenauswahl
src/scenes/FightScene.js        Kampf-Szene, HUD, Hitbox-Logik
src/main.js             Phaser-Spielkonfiguration
```

## Auf GitHub Pages veröffentlichen

1. Im Repo unter **Settings → Pages** als Quelle den Branch wählen (z.B.
   `main` oder diesen Feature-Branch) mit Ordner `/ (root)`.
2. Nach dem Speichern ist das Spiel unter
   `https://<user>.github.io/<repo>/` erreichbar.
3. Da alles statisch ist (kein Server, kein Build), reicht das aus — jeder
   Push aktualisiert die Seite automatisch.

## Geplant (Phase 2)

Online-Zusammenspiel per Link über eine Peer-to-Peer-Verbindung (WebRTC,
z.B. via PeerJS), sodass GitHub Pages weiterhin ohne eigenen Server
ausreicht — siehe Projekt-Historie/Issues für Details.
