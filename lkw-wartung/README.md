# LKW Wartung App

Eine mobile App zur Erfassung der monatlichen LKW-Wartung.

## Features

- Checkliste mit allen Prüfpunkten
- Speicherung "fester" Werte (werden automatisch geladen)
- Bemerkungsfelder für jeden Punkt
- Export als HTML (später DOCX)
- Offline-fähig

## Installation

1. **Node.js installieren** (falls noch nicht vorhanden)

   - Lade von https://nodejs.org/ herunter (LTS-Version)

2. **Expo CLI installieren**

   ```bash
   npm install -g expo-cli
   ```

3. **Abhängigkeiten installieren**

   ```bash
   cd lkw-wartung
   npm install
   ```

4. **App starten**
   ```bash
   npm start
   # oder
   expo start
   ```

## Entwicklung auf Windows, Build auf Mac

### Windows (Entwicklung)

- Code schreiben in VS Code
- Testen im Browser oder Expo Go App
- Git push zu GitHub

### MacBook (Build)

- Git pull vom Repository
- `npm install` ausführen
- `expo build:ios` oder Xcode öffnen
- IPA-Datei erstellen

### Installation auf iPhone

- IPA via SideStore auf iPhone laden

## Projektstruktur

```
lkw-wartung/
├── App.js                 # Hauptkomponente
├── package.json           # Abhängigkeiten
├── app.json              # Expo-Konfiguration
├── src/
│   ├── components/
│   │   └── ChecklistItem.js   # Einzelner Checklisten-Punkt
│   ├── data/
│   │   └── checklistData.js   # Checklisten-Definition
│   └── utils/
│       └── exportDocx.js      # Export-Funktionen
└── assets/               # Bilder, Icons
```

## Anpassen der Checkliste

Die Checklisten-Punkte sind in `src/data/checklistData.js` definiert.
Du kannst sie an deine Word-Vorlage anpassen.

## Nächste Schritte

1. [ ] Checkliste an Word-Vorlage anpassen
2. [ ] DOCX-Export auf Mac implementieren
3. [ ] Design verfeinern
4. [ ] IPA erstellen und testen
