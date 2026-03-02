// Formblatt: Nachweis monatliche Wartung Kfz-Technik und Zubehör
// Basierend auf dem GeoTransEurope Formular

export const checklistData = [
    // === SEITE 1 ===
    {
        id: 'fahrzeugdaten',
        title: 'Fahrzeugdaten',
        isHeader: true,
        hasFixedFields: true,
        items: [
            { id: 'kennzeichen_zug', label: 'Kennzeichen Zugmaschine / Motorwagen', fixed: true },
            { id: 'g_nummer', label: 'G-Nummer' },
            { id: 'anhaenger_auflieger', label: 'Anhänger/Auflieger', fixed: true },
            { id: 'fahrer', label: 'Fahrer' },
            { id: 'monat', label: 'Monat', isMonthSelector: true },
            { id: 'datum_am', label: 'am' },
            { id: 'km_stand', label: 'Km-Stand' },
        ]
    },
    {
        id: 'vollstaendigkeit',
        title: '1. Durchgeführte Kontrollen – Kontrollobjekte auf Vollständigkeit',
        hasIstSoll: true,
        items: [
            { id: 'atemschutzmaske', label: 'Atemschutzmaske (Ablaufdatum – Filter)', soll: '' },
            { id: 'fluchthaube', label: 'Fluchthaube', soll: '' },
            { id: 'augenspuelflasche', label: 'Augenspülflasche (Ablaufdatum)', soll: '1', hasAblauf: true },
            { id: 'handlampen', label: 'Handlampen (gemäß ADR 8.3.4)', soll: '1' },
            { id: 'arbeitsschutzhelm', label: 'Arbeitsschutzhelm (Ablaufdatum)', soll: '1', hasAblauf: true },
            { id: 'schutzbrille', label: 'Schutzbrille', soll: '1' },
            { id: 'arbeitsschutzhandschuhe', label: 'Arbeitsschutzhandschuhe', soll: '1' },
            { id: 'warnweste', label: 'Warnweste', soll: '1' },
            { id: 'erste_hilfe', label: 'Erste Hilfe bzw. Verbandskasten (Ablaufdatum)', soll: '1', hasAblauf: true },
            { id: 'fahrermappe', label: 'Fahrermappe', soll: '1' },
            { id: 'kfz_zulassung', label: 'Kfz-Zulassung', soll: '1' },
            { id: 'gemeinschaftslizenz', label: 'Gemeinschaftslizenz', soll: '1' },
            { id: 'versicherung', label: 'Versicherungsbestätigung', soll: '1' },
            { id: 'adr_zulassung', label: 'ADR-Zulassungsbescheinigung 9.1.3 (T9)', soll: '1' },
            { id: 'warnzeichen', label: 'Selbststehende Warnzeichen (Warndreieck/Kegel – gem. StVZO)', soll: '2' },
            { id: 'warnblinkleuchte', label: 'Selbststehende Warnblinkleuchte gem. StVZO', soll: '1' },
            { id: 'unterlegkeile', label: 'Unterlegkeile', soll: '2' },
            { id: 'feuerloescher', label: 'Feuerlöscher (Unversehrtheit der Plomben)', soll: '2', hasAblauf: true },
            { id: 'adr_weisung', label: 'Schriftliche Weisung (ADR) vorhanden (aktueller Stand)', soll: '1' },
        ]
    },
    {
        id: 'profiltiefen_rechts',
        title: 'Kontrollobjekte auf Zustand - Profiltiefen rechts (mm)',
        hasProfiltiefenRechts: true,
        items: [
            { id: 'lkw_a_achse', label: 'LKW A-Achse' },
            { id: 'lkw_b_achse', label: 'LKW B-Achse' },
            { id: 'lkw_c_achse', label: 'LKW C-Achse' },
            { id: 'ah_al_a_achse', label: 'AH/AL A-Achse' },
            { id: 'ah_al_b_achse', label: 'AH/AL B-Achse' },
            { id: 'ah_al_c_achse', label: 'AH/AL C-Achse' },
        ]
    },
    {
        id: 'profiltiefen_links',
        title: 'Kontrollobjekte auf Zustand - Profiltiefen links (mm)',
        hasProfiltiefenLinks: true,
        items: [
            { id: 'lkw_a_achse', label: 'LKW A-Achse' },
            { id: 'lkw_b_achse', label: 'LKW B-Achse' },
            { id: 'lkw_c_achse', label: 'LKW C-Achse' },
            { id: 'ah_al_a_achse', label: 'AH/AL A-Achse' },
            { id: 'ah_al_b_achse', label: 'AH/AL B-Achse' },
            { id: 'ah_al_c_achse', label: 'AH/AL C-Achse' },
        ]
    },
    {
        id: 'zustand_seite1',
        title: 'Kontrollobjekte auf Zustand',
        hasOkWann: true,
        items: [
            { id: 'reifeninnendruck', label: 'Reifeninnendruck' },
            { id: 'fremdkoerper', label: 'Kontrolle auf Fremdkörper' },
            { id: 'spritzlappen', label: 'Zustand Befestigung Spritzlappen' },
            { id: 'beleuchtung', label: 'Zustand + Funktion sämtlicher Beleuchtungseinrichtungen' },
            { id: 'handlampen_warnblinkleuchten', label: 'Funktion der Handlampen und Warnblinkleuchten' },
            { id: 'stecker', label: 'Stecker und Steckdosen und deren Verbindungskabel' },
            { id: 'schlauchverbindungen', label: 'Schlauchverbindungen Sichtkontrolle' },
        ]
    },
    // === SEITE 2 ===
    {
        id: 'zustand_seite2',
        title: 'Kontrollobjekte auf Zustand (Fortsetzung)',
        hasOkWann: true,
        items: [
            { id: 'armaturenkasten', label: 'Zustand Armaturenkasten' },
            { id: 'rahmen_traversen', label: 'Rahmen und Traversen – Sichtprüfung auf Risse' },
            { id: 'modulasi_system', label: 'Nur PGP: Kontrolle Modulasi-System', highlight: true },
        ]
    },
    {
        id: 'wartungsarbeiten',
        title: 'Durchgeführte Wartungsarbeiten',
        hasDatumSZM: true,
        hasDatumAHAL: true,
        items: [
            { id: 'fahrzeugwaesche_1', label: 'Fahrzeugwäsche 1' },
            { id: 'fahrzeugwaesche_2', label: 'Fahrzeugwäsche 2' },
            { id: 'motoroel', label: 'Motoröl aufgefüllt' },
            { id: 'kuehlwasser', label: 'Kontrolle Kühlwasser' },
            { id: 'wartung_aufbau', label: 'Wartungen am Aufbau' },
            { id: 'nebenantriebswelle', label: 'Abschmieren Nebenantriebswelle' },
            { id: 'kabinettschloesser', label: 'Schmieren der Kabinettschlösser' },
            { id: 'hydraulikoel', label: 'Kontrolle Hydrauliköl (falls vorhanden)' },
        ]
    },
    {
        id: 'maengel',
        title: 'Festgestellte Mängel, die eine Instandsetzung in der Werkstatt erforderlich machen',
        isTextArea: true,
        items: [
            { id: 'maengel_1', label: 'Mangel 1' },
            { id: 'maengel_2', label: 'Mangel 2' },
            { id: 'maengel_3', label: 'Mangel 3' },
            { id: 'maengel_4', label: 'Mangel 4' },
            { id: 'maengel_5', label: 'Mangel 5' },
            { id: 'maengel_6', label: 'Mangel 6' },
        ]
    },
    {
        id: 'unterschriften',
        title: 'Unterschriften',
        isSignature: true,
        items: [
            { id: 'unterschrift_fahrer', label: 'Unterschrift Fahrer' },
            { id: 'ausgewertet_durch', label: 'Ausgewertet durch' },
            { id: 'ausgewertet_am', label: 'am' },
        ]
    },
];

// Hilfsfunktion um alle Item-IDs zu bekommen
export const getAllItemIds = () => {
    const ids = [];
    checklistData.forEach(section => {
        section.items.forEach(item => {
            ids.push(item.id);
        });
    });
    return ids;
};

// Hilfsfunktion um Sektionen nach Seiten zu filtern
export const getPage1Sections = () => {
    return checklistData.filter(section =>
        ['fahrzeugdaten', 'vollstaendigkeit', 'profiltiefen_rechts', 'profiltiefen_links', 'zustand_seite1'].includes(section.id)
    );
};

export const getPage2Sections = () => {
    return checklistData.filter(section =>
        ['zustand_seite2', 'wartungsarbeiten', 'maengel', 'unterschriften'].includes(section.id)
    );
};
