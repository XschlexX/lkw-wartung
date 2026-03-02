import { REQUIRED_FIELDS } from "../constants";

/**
 * Prüft, ob ein Feld ein Pflichtfeld ist.
 */
export const isRequiredField = (itemId) => REQUIRED_FIELDS.includes(itemId);

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
            if (!formData[`${item.id}_ok`]) {
                return false;
            }
        }
    }

    // Prüfe Unterschriften
    const unterschriften = checklistData.find((s) => s.id === "unterschriften");
    if (unterschriften) {
        for (const item of unterschriften.items) {
            const value = formData[item.id];
            if (!value || value.trim() === "") {
                return false;
            }
        }
    }

    return true;
};
