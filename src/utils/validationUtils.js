import { REQUIRED_FIELDS } from "../constants";

/**
 * Konvertiert deutsches Datumsformat (TT.MM.JJJJ) zu ISO-Format (JJJJ-MM-TT)
 * für HTML5 date inputs.
 */
export const convertGermanDateToISO = (germanDate) => {
    if (!germanDate || typeof germanDate !== "string") return "";
    const parts = germanDate.split(".");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    // Jahr auf 4 Stellen erweitern falls nötig
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

/**
 * Konvertiert ISO-Datumsformat (JJJJ-MM-TT) zu deutschem Format (TT.MM.JJJJ)
 * für die interne Speicherung.
 */
export const convertISODateToGerman = (isoDate) => {
    if (!isoDate || typeof isoDate !== "string") return "";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    return `${day}.${month}.${year}`;
};

/**
 * Prüft, ob ein Feld ein Pflichtfeld ist.
 */
export const isRequiredField = (itemId) => REQUIRED_FIELDS.includes(itemId);

/**
 * Gibt eine Liste der fehlenden Pflichtfelder zurück.
 *
 * Warum: Hilft dem Nutzer zu verstehen, welche Felder noch ausgefüllt werden müssen.
 */
export const getMissingFields = (formData, checklistData) => {
    const missing = [];

    // Prüfe Header-Felder
    const headerLabels = {
        kennzeichen_zug: "Kennzeichen Zugmaschine",
        anhaenger_auflieger: "Anhänger/Auflieger",
        fahrer: "Fahrer",
        monat: "Monat",
        datum_am: "Datum (am)",
        km_stand: "Km-Stand",
    };

    for (const field of REQUIRED_FIELDS) {
        const value = formData[field];
        if (!value || (typeof value === "string" && value.trim() === "")) {
            missing.push(headerLabels[field] || field);
        }
    }

    // Prüfe Vollständigkeit (Ist-Werte)
    const vollstaendigkeit = checklistData.find(
        (s) => s.id === "vollstaendigkeit"
    );
    if (vollstaendigkeit) {
        const missingIst = [];
        for (const item of vollstaendigkeit.items) {
            // Atemschutzmaske und Fluchthaube sind optional
            if (item.id === "atemschutzmaske" || item.id === "fluchthaube") {
                continue;
            }
            const istValue = formData[`${item.id}_ist`];
            if (!istValue || istValue.trim() === "") {
                missingIst.push(item.label);
            }
        }
        if (missingIst.length > 0) {
            missing.push(`Vollständigkeit: ${missingIst.length} Einträge fehlen`);
        }
    }

    // Prüfe Zustand (OK-Status)
    const zustandSections = checklistData.filter((s) => s.hasOkWann);
    let missingOk = 0;
    for (const section of zustandSections) {
        for (const item of section.items) {
            // modulasi_system ist optional (nur für PGP relevant)
            if (item.id === "modulasi_system") {
                continue;
            }
            if (!formData[`${item.id}_ok`]) {
                missingOk++;
            }
        }
    }
    if (missingOk > 0) {
        missing.push(`Zustand: ${missingOk} OK-Button(s) nicht gesetzt`);
    }

    // Unterschriften sind optional und werden nicht geprüft

    return missing;
};

/**
 * Prüft, ob alle Pflichtfelder ausgefüllt sind.
 *
 * Warum: Zentrale Validierungslogik für das Formular.
 * Ermöglicht einfache Erweiterung um weitere Validierungsregeln.
 */
export const isFormComplete = (formData, checklistData) => {
    // Prüfe Header-Felder
    for (const field of REQUIRED_FIELDS) {
        const value = formData[field];
        if (!value || (typeof value === "string" && value.trim() === "")) {
            return false;
        }
    }

    // Prüfe Vollständigkeit (Ist-Werte)
    const vollstaendigkeit = checklistData.find(
        (s) => s.id === "vollstaendigkeit"
    );
    if (vollstaendigkeit) {
        for (const item of vollstaendigkeit.items) {
            // Atemschutzmaske und Fluchthaube sind optional
            if (item.id === "atemschutzmaske" || item.id === "fluchthaube") {
                continue;
            }
            const istValue = formData[`${item.id}_ist`];
            if (!istValue || istValue.trim() === "") {
                return false;
            }
        }
    }

    // Prüfe Zustand (OK-Status)
    const zustandSections = checklistData.filter((s) => s.hasOkWann);
    for (const section of zustandSections) {
        for (const item of section.items) {
            // modulasi_system ist optional (nur für PGP relevant)
            if (item.id === "modulasi_system") {
                continue;
            }
            if (!formData[`${item.id}_ok`]) {
                return false;
            }
        }
    }

    // Unterschriften sind optional
    // (früher waren sie pflicht, aber jetzt nicht mehr)

    return true;
};
