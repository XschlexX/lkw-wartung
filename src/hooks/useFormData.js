import { useState, useEffect, useCallback } from "react";
import { formatGermanDate } from "../utils/htmlUtils";

/**
 * Custom Hook für Formular-Daten-Management.
 *
 * Warum: Logik aus der Komponente extrahieren macht diese übersichtlicher
 * und die Logik wiederverwendbar und testbar.
 *
 * Best Practice: Custom Hooks für zusammengehörige State-Logik verwenden.
 */
export const useFormData = () => {
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem("lkwWartungData");
        return saved ? JSON.parse(saved) : {};
    });

    const [defaultDataLoaded, setDefaultDataLoaded] = useState(false);

    // Speichere in localStorage bei Änderungen
    useEffect(() => {
        localStorage.setItem("lkwWartungData", JSON.stringify(formData));
    }, [formData]);

    // Lade Default-Daten wenn keine lokalen Daten vorhanden
    useEffect(() => {
        const loadDefaultData = async () => {
            const saved = localStorage.getItem("lkwWartungData");
            if (!saved && !defaultDataLoaded) {
                try {
                    const response = await fetch("/default-data.json");
                    if (response.ok) {
                        const defaultData = await response.json();
                        // Filtere nur die relevanten Felder (ohne _comment)
                        const filteredData = Object.fromEntries(
                            Object.entries(defaultData).filter(
                                ([key]) => !key.startsWith("_")
                            )
                        );
                        setFormData(filteredData);
                        localStorage.setItem(
                            "lkwWartungData",
                            JSON.stringify(filteredData)
                        );
                        setDefaultDataLoaded(true);
                    }
                } catch (error) {
                    console.error("Fehler beim Laden der Default-Daten:", error);
                }
            }
        };
        loadDefaultData();
    }, [defaultDataLoaded]);

    // Aktuelles Datum automatisch setzen beim Laden (nur wenn nicht vorhanden)
    useEffect(() => {
        if (!formData["datum_am"]) {
            setFormData((prev) => ({
                ...prev,
                datum_am: formatGermanDate(),
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Aktualisiert ein einzelnes Feld im Formular.
     * useCallback verhindert unnötige Neu-Erstellung der Funktion.
     */
    const updateField = useCallback((id, value) => {
        setFormData((prev) => ({ ...prev, [id]: value }));
    }, []);

    /**
     * Setzt alle OK-Checkboxen einer Sektion auf true mit aktuellem Datum.
     */
    const setAllOkWithDate = useCallback((section) => {
        const formattedDate = formatGermanDate();

        const updates = {};
        section.items.forEach((item) => {
            // Überspringe optionale Felder
            if (item.id === "modulasi_system") return;

            updates[`${item.id}_ok`] = true;
            updates[`${item.id}_wann`] = formattedDate;
        });

        setFormData((prev) => ({ ...prev, ...updates }));
    }, []);

    /**
     * Löscht alle Formulardaten.
     */
    const clearAll = useCallback(() => {
        if (confirm("Alle Werte löschen?")) {
            setFormData({});
            localStorage.removeItem("lkwWartungData");
        }
    }, []);

    /**
     * Speichert feste Werte separat.
     */
    const saveFixedValues = useCallback(() => {
        localStorage.setItem("lkwWartungFixedValues", JSON.stringify(formData));
        alert("Feste Werte wurden gespeichert!");
    }, [formData]);

    return {
        formData,
        setFormData,
        updateField,
        setAllOkWithDate,
        clearAll,
        saveFixedValues,
    };
};
