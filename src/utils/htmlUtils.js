/**
 * HTML-Escape-Funktion zum Schutz vor XSS-Angriffen.
 * Wandelt potenziell gefährliche Zeichen in HTML-Entities um.
 *
 * Warum: Benutzereingaben dürfen niemals direkt in HTML eingefügt werden,
 * da dies XSS-Lücken (Cross-Site Scripting) ermöglicht.
 *
 * Best Practice: Immer sanitizen, wenn Daten aus unsicheren Quellen (User-Input)
 * in HTML eingefügt werden.
 */
export const escapeHtml = (unsafe) => {
    if (!unsafe) return "";
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

/**
 * Formatiert ein Datum im deutschen Format (TT.MM.JJJJ).
 *
 * Warum: Konsistente Datumsformatierung über die gesamte App hinweg.
 * Zentrale Funktion erleichtert spätere Änderungen (z.B. auf ISO-Format).
 */
export const formatGermanDate = (date = new Date()) =>
    date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
