# LKW-Wartung App - Project Context

> Diese Datei wird beim Start eines neuen Chats automatisch gelesen.

## Projekt-Übersicht

Mobile Web-App für monatliche LKW-Wartungskontrollen basierend auf dem GeoTransEurope Formular.

## Tech Stack

- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Language**: JavaScript (ES Modules)
- **Styling**: CSS (kein Framework)
- **Package Manager**: yarn

## Projektstruktur

```
lkw-wartung/
├── src/
│   ├── App.jsx              # Hauptkomponente (~31KB) - State, localStorage, Export
│   ├── main.jsx             # Entry point
│   ├── data/
│   │   └── checklistData.js # Alle Formular-Daten & Sektionen
│   ├── screens/             # (leer)
│   └── styles/
│       └── index.css        # Haupt-CSS (mobile-first, max-width 430px)
├── public/
│   └── default-data.json    # Default-Werte für Initialisierung
├── index.html               # Vite entry
├── index-static.html        # Standalone HTML-Version
├── vite.config.js
└── package.json
```

## Wichtige Dateien

### 1. checklistData.js

Enthält alle Formular-Sektionen mit:

- Items mit IDs und Labels
- Soll-Werten (Vorgaben)
- Spezial-Flags für Rendering

**Sektionen:**
| ID | Titel | Seite | Besonderheit |
|---|---|---|---|
| fahrzeugdaten | Fahrzeugdaten | 1 | isHeader, hasFixedFields |
| vollstaendigkeit | Kontrollobjekte auf Vollständigkeit | 1 | hasIstSoll, hasAblaufdatum |
| profiltiefen_tabelle | Profiltiefen (mm) | 1 | hasProfiltiefen |
| zustand_seite1 | Kontrollobjekte auf Zustand | 1 | hasOkWann |
| zustand_seite2 | Kontrollobjekte auf Zustand (Fortsetzung) | 2 | hasOkWann |
| reifenprofile_pgp | Reifenprofile des Staplers (nur PGP) | 2 | hasRechtsLinks, hasOkWann |
| wartungsarbeiten | Durchgeführte Wartungsarbeiten | 2 | hasDatumSZM, hasDatumAHAL |
| maengel | Festgestellte Mängel | 2 | isTextArea |
| unterschriften | Unterschriften | 2 | isSignature |

**Helper-Funktionen:**

- `getPage1Sections()` → ['fahrzeugdaten', 'vollstaendigkeit', 'profiltiefen_tabelle', 'zustand_seite1']
- `getPage2Sections()` → ['zustand_seite2', 'reifenprofile_pgp', 'wartungsarbeiten', 'maengel', 'unterschriften']

### 2. default-data.json

Default-Werte für Erstinitialisierung:

```json
{
  "kennzeichen_zug": "HN-S 5928",
  "anhaenger_auflieger": "SZ-L 2099",
  "fahrer": "Schmidt Alexander",
  "monat": "Februar",
  "augenspuelflasche_ist": "1",
  ...
}
```

### 3. App.jsx

Hauptlogik:

- State: `formData`, `currentPage`, `defaultDataLoaded`
- localStorage-Keys: `lkwWartungData`, `lkwWartungFixedValues`
- Export: `exportToHTML()`, `exportToJSON()`
- Funktionen: `updateField()`, `saveFixedValues()`, `clearAll()`

## Datenfluss

1. App startet → Prüft localStorage
2. Wenn leer → Lädt `/default-data.json`
3. Setzt aktuelles Datum (`datum_am`)
4. Jede Änderung → Auto-save zu localStorage

## Rendering-Flags (Section Types)

| Flag              | Beschreibung                                    |
| ----------------- | ----------------------------------------------- |
| `isHeader`        | Fahrzeugdaten-Header mit speziellem Grid-Layout |
| `hasFixedFields`  | Felder mit `fixed: true` werden hervorgehoben   |
| `fixed: true`     | Markiert feste Werte (Kennzeichen, Anhänger)    |
| `isMonthSelector` | Monats-Auswahl mit ← → Pfeilen                  |
| `hasIstSoll`      | Tabelle mit Ist/Soll/Ablaufdatum-Spalten        |
| `hasProfiltiefen` | Profiltiefen-Tabelle mit RE/LI Eingaben         |
| `hasOkWann`       | OK-Button + Datum-Spalte                        |
| `hasRechtsLinks`  | Rechts/Links-Spalten                            |
| `hasDatumSZM`     | Datum SZM-Spalte für Wartungsarbeiten           |
| `hasDatumAHAL`    | Datum AH/AL-Spalte für Wartungsarbeiten         |
| `isTextArea`      | Freitext-Eingaben (Mängel)                      |
| `isSignature`     | Unterschriften-Felder                           |
| `highlight: true` | Gelbe Hintergrund-Hervorhebung                  |

## CSS Architecture

- Mobile-first
- Max-Width: 430px (iPhone 16 Pro Max)
- `.app` Container mit box-shadow für Desktop-Ansicht
- Fixed `.button-container` am unteren Rand
- Header-Grid: 1 Spalte (untereinander)

## Häufige Änderungen

### Felder hinzufügen/entfernen

1. In `checklistData.js` die Sektion finden
2. Items-Array bearbeiten
3. Bei Bedarf auch `index-static.html` anpassen

### Neue Sektion hinzufügen

1. In `checklistData.js` neue Sektion definieren
2. Rendering-Flags setzen
3. In `getPage1Sections()` oder `getPage2Sections()` aufnehmen

### Default-Daten ändern

1. `public/default-data.json` bearbeiten
2. Keys müssen mit Item-IDs aus checklistData.js übereinstimmen

## Build & Dev

```bash
cd lkw-wartung
yarn install
yarn dev      # Dev-Server
yarn build    # Production-Build
yarn preview  # Preview production build
```

## Wichtige Hinweise

- localStorage wird für Datenpersistenz verwendet
- `index-static.html` ist eine standalone-Version ohne Build-Prozess
- App ist als PWA installierbar (Add to Home Screen)
- Export erzeugt HTML-Datei mit allen eingetragenen Daten
