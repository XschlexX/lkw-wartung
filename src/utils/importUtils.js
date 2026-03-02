/**
 * Importiert Daten aus einer JSON-Datei.
 *
 * Warum: Zentrale Import-Logik mit verbessertem Error Handling.
 * console.error für Debugging, user-friendly Alert für den Nutzer.
 */
export const importFromJSON = (event, setFormData) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            setFormData(data);
            localStorage.setItem("lkwWartungData", JSON.stringify(data));
            alert("Daten erfolgreich importiert!");
        } catch (error) {
            console.error("Fehler beim JSON-Import:", error);
            alert("Fehler beim Import: Ungültige JSON-Datei");
        }
    };
    reader.onerror = (error) => {
        console.error("Fehler beim Lesen der Datei:", error);
        alert("Fehler beim Lesen der Datei");
    };
    reader.readAsText(file);
    event.target.value = "";
};

/**
 * Kopiert Formulardaten in die Zwischenablage.
 */
export const copyToClipboard = (formData) => {
    const dataStr = JSON.stringify(formData);
    navigator.clipboard
        .writeText(dataStr)
        .then(() => {
            alert("Daten in Zwischenablage kopiert! Auf dem Handy einfügen.");
        })
        .catch((error) => {
            console.error("Fehler beim Kopieren in Zwischenablage:", error);
            alert("Fehler beim Kopieren");
        });
};

/**
 * Fügt Daten aus der Zwischenablage ein.
 */
export const pasteFromClipboard = async (setFormData) => {
    try {
        const text = await navigator.clipboard.readText();
        const data = JSON.parse(text);
        setFormData(data);
        localStorage.setItem("lkwWartungData", JSON.stringify(data));
        alert("Daten aus Zwischenablage importiert!");
    } catch (error) {
        console.error("Fehler beim Einfügen aus Zwischenablage:", error);
        alert("Fehler: Keine gültigen Daten in Zwischenablage");
    }
};
