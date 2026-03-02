/**
 * Konstanten für die LKW-Wartungs-App.
 *
 * Warum: Konstanten außerhalb der Komponente definieren verhindert,
 * dass sie bei jedem Render neu erstellt werden.
 * Object.freeze() macht sie zusätzlich immutable.
 */

export const MONTHS = Object.freeze([
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
]);

export const REQUIRED_FIELDS = Object.freeze([
    "kennzeichen_zug",
    "anhaenger_auflieger",
    "fahrer",
    "monat",
    "datum_am",
    "km_stand",
]);

export const DEFAULT_FIELDS = Object.freeze([
    "kennzeichen_zug",
    "anhaenger_auflieger",
    "g_nummer",
    "fahrer",
]);

export const PROFILTIEFEN_ACHSE = Object.freeze([
    "lkw_a_achse",
    "lkw_b_achse",
    "lkw_c_achse",
    "ah_al_a_achse",
    "ah_al_b_achse",
    "ah_al_c_achse",
]);

export const ACHSE_LABELS = Object.freeze({
    lkw_a_achse: "LKW A-Achse",
    lkw_b_achse: "LKW B-Achse",
    lkw_c_achse: "LKW C-Achse",
    ah_al_a_achse: "AH/AL A-Achse",
    ah_al_b_achse: "AH/AL B-Achse",
    ah_al_c_achse: "AH/AL C-Achse",
});
