import { escapeHtml } from "./htmlUtils";
import { ACHSE_LABELS, DEFAULT_FIELDS } from "../constants";

/**
 * Generiert den HTML-Export für das Formular.
 *
 * Warum: Zentrale Funktion für HTML-Generierung mit XSS-Schutz.
 * Alle Benutzereingaben werden durch escapeHtml() gesichert.
 *
 * Security: XSS-Prävention durch HTML-Escaping aller dynamischen Inhalte.
 */
export const generateHTML = (formData, checklistData) => {
    const date = new Date().toLocaleDateString("de-DE");

    // Finde Sektionen direkt aus checklistData
    const fahrzeugdaten = checklistData.find((s) => s.id === "fahrzeugdaten");
    const vollstaendigkeit = checklistData.find(
        (s) => s.id === "vollstaendigkeit"
    );
    const zustand_seite1 = checklistData.find((s) => s.id === "zustand_seite1");
    const zustand_seite2 = checklistData.find((s) => s.id === "zustand_seite2");
    const wartungsarbeiten = checklistData.find(
        (s) => s.id === "wartungsarbeiten"
    );

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Formblatt - Nachweis monatliche Wartung</title>
    <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: Arial, sans-serif; font-size: 10pt; margin: 0; padding: 20px; max-width: 210mm; }
        .header { text-align: center; margin-bottom: 15px; border-bottom: 3px solid #2c5aa0; padding-bottom: 10px; }
        .header h1 { font-size: 18pt; margin: 0; color: #2c3e50; }
        .header p { font-size: 11pt; margin: 5px 0 0 0; color: #555; }
        .fahrzeugdaten { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; border: 1px solid #000; padding: 10px; }
        .data-row { display: flex; border-bottom: 1px solid #ccc; padding: 4px 0; }
        .data-label { font-weight: bold; width: 50%; }
        .data-value { width: 50%; border-bottom: 1px solid #333; min-height: 16px; }
        h2 { font-size: 11pt; margin: 15px 0 8px 0; color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9pt; }
        th, td { border: 1px solid #000; padding: 5px; text-align: left; }
        th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
        .col-item { width: 45%; }
        .col-ist, .col-soll, .col-ok { width: 8%; text-align: center; }
        .col-ablauf, .col-wann, .col-datum { width: 15%; text-align: center; }
        .col-rechts, .col-links { width: 12%; text-align: center; }
        .highlight { background-color: #ffff00; }
        .maengel { border: 1px solid #000; min-height: 120px; padding: 10px; margin: 15px 0; }
        .signature-section { margin-top: 30px; }
        .signature-row { display: flex; justify-content: space-between; margin-top: 20px; }
        .signature-field { width: 45%; }
        .signature-line { border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 8pt; border-top: 1px solid #ccc; padding-top: 10px; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Formblatt</h1>
        <p>Nachweis monatliche Wartung Kfz-Technik und Zubehör</p>
    </div>
    
    <div class="fahrzeugdaten">
        <div>
            <div class="data-row"><span class="data-label">Kennzeichen Zugmaschine / Motorwagen:</span><span class="data-value">${escapeHtml(
        formData["kennzeichen_zug"]
    )}</span></div>
            <div class="data-row"><span class="data-label">G-Nummer:</span><span class="data-value">${escapeHtml(
        formData["g_nummer"]
    )}</span></div>
            <div class="data-row"><span class="data-label">Fahrer:</span><span class="data-value">${escapeHtml(
        formData["fahrer"]
    )}</span></div>
        </div>
        <div>
            <div class="data-row"><span class="data-label">Anhänger/Auflieger:</span><span class="data-value">${escapeHtml(
        formData["anhaenger_auflieger"]
    )}</span></div>
            <div class="data-row"><span class="data-label">Monat:</span><span class="data-value">${escapeHtml(
        formData["monat"]
    )}</span></div>
            <div class="data-row"><span class="data-label">am:</span><span class="data-value">${escapeHtml(
        formData["datum_am"]
    )}</span></div>
            <div class="data-row"><span class="data-label">Km-Stand:</span><span class="data-value">${escapeHtml(
        formData["km_stand"]
    )}</span></div>
        </div>
    </div>

    <h2>1. Durchgeführte Kontrollen</h2>
    ${renderVollstaendigkeitHTML(vollstaendigkeit, formData)}
    ${renderZustandHTML(zustand_seite1, formData)}
    
    <div class="footer">
        <span>monatliche Wartung</span>
        <span>Seite 1 von 2</span>
        <span>Revision: 4 / 06.2025</span>
    </div>

    <div class="page-break"></div>

    <div class="header">
        <h1>Formblatt</h1>
        <p>Nachweis monatliche Wartung Kfz-Technik und Zubehör</p>
    </div>

    ${renderZustandHTML(zustand_seite2, formData)}
    ${renderWartungHTML(wartungsarbeiten, formData)}
    
    <h3>Festgestellte Mängel, die eine Instandsetzung in der Werkstatt erforderlich machen:</h3>
    <div class="maengel">
        ${[1, 2, 3, 4, 5, 6]
            .map((i) => `<p>${escapeHtml(formData["maengel_" + i]) || "&nbsp;"}</p>`)
            .join("")}
    </div>

    <div class="signature-section">
        <div class="signature-row">
            <div class="signature-field">
                <div class="signature-line">${escapeHtml(
                formData["unterschrift_fahrer"]
            )}</div>
                <p>Unterschrift Fahrer</p>
            </div>
        </div>
        <div class="signature-row">
            <div class="signature-field">
                <div class="signature-line">${escapeHtml(
                formData["ausgewertet_durch"]
            )}</div>
                <p>Ausgewertet durch</p>
            </div>
            <div class="signature-field" style="width: 30%;">
                <div class="signature-line">${escapeHtml(
                formData["ausgewertet_am"]
            )}</div>
                <p>am</p>
            </div>
        </div>
    </div>

    <div class="footer">
        <span>monatliche Wartung</span>
        <span>Seite 2 von 2</span>
        <span>Revision: 4 / 06.2025</span>
    </div>
</body>
</html>`;
};

const renderVollstaendigkeitHTML = (section, formData) => {
    if (!section) return "";
    return `
    <h3>Kontrollobjekte auf Vollständigkeit</h3>
    <table>
      <thead>
        <tr><th class="col-item">Kontrollobjekt</th><th class="col-ist">Ist</th><th class="col-soll">Soll</th><th class="col-ablauf">Ablaufdatum</th></tr>
      </thead>
      <tbody>
        ${section.items
            .map(
                (item) => `
          <tr class="${item.highlight ? "highlight" : ""}">
            <td>${escapeHtml(item.label)}</td>
            <td class="col-ist">${escapeHtml(formData[`${item.id}_ist`])}</td>
            <td class="col-soll">${escapeHtml(item.soll)}</td>
            <td class="col-ablauf">${escapeHtml(formData[`${item.id}_ablauf`])}</td>
          </tr>
        `
            )
            .join("")}
      </tbody>
    </table>
  `;
};

const renderZustandHTML = (section, formData) => {
    if (!section) return "";
    return `
    <h3>${escapeHtml(section.title)}</h3>
    <table>
      <thead>
        <tr><th class="col-item">Kontrollobjekt</th><th class="col-ok">OK</th><th class="col-wann">Wann</th></tr>
      </thead>
      <tbody>
        ${section.items
            .map(
                (item) => `
          <tr class="${item.highlight ? "highlight" : ""}">
            <td>${escapeHtml(item.label)}</td>
            <td class="col-ok">${formData[`${item.id}_ok`] ? "✓" : ""}</td>
            <td class="col-wann">${escapeHtml(formData[`${item.id}_wann`])}</td>
          </tr>
        `
            )
            .join("")}
      </tbody>
    </table>
  `;
};

const renderWartungHTML = (section, formData) => {
    if (!section) return "";
    return `
    <h3>${escapeHtml(section.title)}</h3>
    <table>
      <thead>
        <tr><th class="col-item">Arbeit</th><th class="col-datum">Datum SZM/MW</th><th class="col-datum">Datum AH/AL</th></tr>
      </thead>
      <tbody>
        ${section.items
            .map(
                (item) => `
          <tr>
            <td>${escapeHtml(item.label)}</td>
            <td class="col-datum">${escapeHtml(formData[`${item.id}_szm`])}</td>
            <td class="col-datum">${escapeHtml(formData[`${item.id}_ahal`])}</td>
          </tr>
        `
            )
            .join("")}
      </tbody>
    </table>
  `;
};

/**
 * Exportiert Formulardaten als HTML-Datei.
 */
export const exportToHTML = (formData, checklistData) => {
    const html = generateHTML(formData, checklistData);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Formblatt-Wartung-${new Date().toISOString().split("T")[0]
        }.html`;
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * Exportiert Formulardaten als JSON-Datei.
 */
export const exportToJSON = (formData) => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lkw-wartung-daten-${new Date().toISOString().split("T")[0]
        }.json`;
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * Generiert Word-kompatible Export-Daten mit Platzhaltern.
 */
export const generateWordData = (formData, checklistData) => {
    return {
        _meta: {
            exportDatum: new Date().toLocaleDateString("de-DE"),
            exportZeit: new Date().toLocaleTimeString("de-DE"),
            version: "1.0",
        },

        KENNZEICHEN_ZUG: formData["kennzeichen_zug"] ?? "",
        KENNZEICHEN_ANHAENGER: formData["anhaenger_auflieger"] ?? "",
        G_NUMMER: formData["g_nummer"] ?? "",
        FAHRER: formData["fahrer"] ?? "",
        MONAT: formData["monat"] ?? "",
        DATUM_AM: formData["datum_am"] ?? "",
        KM_STAND: formData["km_stand"] ?? "",

        ...generateVollstaendigkeitData(formData, checklistData),
        ...generateProfiltiefenData(formData),
        ...generateZustandData(formData, checklistData),
        ...generateWartungsarbeitenData(formData, checklistData),
        ...generateMaengelData(formData),

        UNTERSCHRIFT_FAHRER: formData["unterschrift_fahrer"] ?? "",
        AUSGEWERTET_DURCH: formData["ausgewertet_durch"] ?? "",
        AUSGEWERTET_AM: formData["ausgewertet_am"] ?? "",
    };
};

const generateVollstaendigkeitData = (formData, checklistData) => {
    const data = {};
    const section = checklistData.find((s) => s.id === "vollstaendigkeit");
    if (!section) return data;

    section.items.forEach((item, index) => {
        const prefix = `VOLL_${String(index + 1).padStart(2, "0")}`;
        data[`${prefix}_LABEL`] = item.label;
        data[`${prefix}_IST`] = formData[`${item.id}_ist`] ?? "";
        data[`${prefix}_SOLL`] = item.soll ?? "";
        data[`${prefix}_ABLAUF`] = formData[`${item.id}_ablauf`] ?? "";
    });

    return data;
};

const generateProfiltiefenData = (formData) => {
    const data = {};

    Object.keys(ACHSE_LABELS).forEach((achse, index) => {
        const prefix = `PROFIL_${String(index + 1).padStart(2, "0")}`;
        data[`${prefix}_LABEL`] = ACHSE_LABELS[achse];
        data[`${prefix}_RE1`] = formData[`${achse}_re1`] ?? "";
        data[`${prefix}_RE2`] = formData[`${achse}_re2`] ?? "";
        data[`${prefix}_LI1`] = formData[`${achse}_li1`] ?? "";
        data[`${prefix}_LI2`] = formData[`${achse}_li2`] ?? "";
    });

    return data;
};

const generateZustandData = (formData, checklistData) => {
    const data = {};
    const sections = checklistData.filter((s) => s.hasOkWann);
    let counter = 1;

    sections.forEach((section) => {
        section.items.forEach((item) => {
            const prefix = `ZUSTAND_${String(counter).padStart(2, "0")}`;
            data[`${prefix}_LABEL`] = item.label;
            data[`${prefix}_OK`] = formData[`${item.id}_ok`] ? "Ja" : "Nein";
            data[`${prefix}_WANN`] = formData[`${item.id}_wann`] ?? "";
            counter++;
        });
    });

    return data;
};

const generateWartungsarbeitenData = (formData, checklistData) => {
    const data = {};
    const section = checklistData.find((s) => s.id === "wartungsarbeiten");
    if (!section) return data;

    section.items.forEach((item, index) => {
        const prefix = `WARTUNG_${String(index + 1).padStart(2, "0")}`;
        data[`${prefix}_LABEL`] = item.label;
        data[`${prefix}_SZM`] = formData[`${item.id}_szm`] ?? "";
        data[`${prefix}_AHAL`] = formData[`${item.id}_ahal`] ?? "";
    });

    return data;
};

const generateMaengelData = (formData) => {
    const data = {};

    for (let i = 1; i <= 6; i++) {
        data[`MAENGEL_${i}`] = formData[`maengel_${i}`] ?? "";
    }

    return data;
};

/**
 * Exportiert Daten für Word-Integration.
 */
export const exportForWord = (formData, checklistData, isFormComplete) => {
    if (!isFormComplete) {
        alert(
            "Bitte fülle alle Pflichtfelder aus:\n- Fahrzeugdaten (Kennzeichen, Anhänger, Fahrer, Monat, Datum, KM)\n- Alle Ist-Werte in der Vollständigkeits-Kontrolle\n- Alle OK-Checkboxen im Zustand\n- Alle Unterschriften"
        );
        return;
    }

    const wordData = generateWordData(formData, checklistData);

    const dataStr = JSON.stringify(wordData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `word-export-${formData["kennzeichen_zug"] || "lkw"}-${formData["monat"] || ""
        }.json`;
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * Speichert aktuelle Daten als Default-Datei.
 */
export const saveAsDefault = (formData) => {
    const defaultData = Object.fromEntries(
        DEFAULT_FIELDS.map((field) => [field, formData[field] ?? ""])
    );

    const dataStr = JSON.stringify(
        {
            _comment:
                "Diese Datei enthält die Default-Daten für die LKW-Wartungs-App. Trage hier deine festen Werte ein.",
            ...defaultData,
        },
        null,
        2
    );

    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "default-data.json";
    a.click();
    URL.revokeObjectURL(url);

    alert(
        "default-data.json heruntergeladen! Verschiebe diese Datei in den 'public'-Ordner des Projekts."
    );
};
