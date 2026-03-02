import { useState, useMemo, useCallback } from "react";
import { checklistData } from "./data/checklistData";
import { useFormData } from "./hooks/useFormData";
import { MONTHS } from "./constants";
import {
  isRequiredField,
  isFormComplete,
  getMissingFields,
} from "./utils/validationUtils";
import {
  exportToHTML,
  exportToJSON,
  exportForWord,
  saveAsDefault,
} from "./utils/exportUtils";
import {
  importFromJSON,
  copyToClipboard,
  pasteFromClipboard,
} from "./utils/importUtils";

/**
 * Hauptkomponente der LKW-Wartungs-App.
 *
 * Refactoring-Hintergrund:
 * - Logik in Custom Hooks und Utility-Funktionen extrahiert
 * - XSS-Schutz durch HTML-Escaping
 * - useMemo für Performance-Optimierung
 * - useCallback für stabile Funktionsreferenzen
 */
function App() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const {
    formData,
    setFormData,
    updateField,
    setAllOkWithDate,
    clearAll,
    saveFixedValues,
  } = useFormData();

  // Memoize abgeleitete Werte für Performance
  const totalSections = useMemo(() => checklistData.length, []);
  const currentSection = useMemo(
    () => checklistData[currentSectionIndex],
    [currentSectionIndex]
  );
  const formComplete = useMemo(
    () => isFormComplete(formData, checklistData),
    [formData]
  );

  const missingFields = useMemo(
    () => getMissingFields(formData, checklistData),
    [formData]
  );

  // Navigation-Handler mit useCallback
  const goToPrevious = useCallback(() => {
    setCurrentSectionIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSectionIndex((prev) => Math.min(totalSections - 1, prev + 1));
  }, [totalSections]);

  // Monats-Navigation
  const changeMonth = useCallback(
    (delta) => {
      const currentMonth = formData["monat"] ?? MONTHS[new Date().getMonth()];
      const currentIndex = MONTHS.indexOf(currentMonth);
      const newIndex = (currentIndex + delta + 12) % 12;
      updateField("monat", MONTHS[newIndex]);
    },
    [formData, updateField]
  );

  // Wrapper für Export-Funktionen
  const handleExportHTML = useCallback(() => {
    exportToHTML(formData, checklistData);
  }, [formData]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(formData);
  }, [formData]);

  const handleExportWord = useCallback(() => {
    exportForWord(formData, checklistData, formComplete);
  }, [formData, formComplete]);

  const handleSaveAsDefault = useCallback(() => {
    saveAsDefault(formData);
  }, [formData]);

  const handleImportJSON = useCallback(
    (event) => {
      importFromJSON(event, setFormData);
    },
    [setFormData]
  );

  const handleCopyToClipboard = useCallback(() => {
    copyToClipboard(formData);
  }, [formData]);

  const handlePasteFromClipboard = useCallback(() => {
    pasteFromClipboard(setFormData);
  }, [setFormData]);

  // Render-Funktionen für verschiedene Sektionstypen
  const renderHeaderSection = (section) => (
    <div key={section.id} className="section">
      <div className="header-grid">
        {section.items.map((item) => (
          <div
            key={item.id}
            className={`header-field ${item.fixed ? "fixed-field" : ""}`}>
            <label>
              {item.label}
              {isRequiredField(item.id) && (
                <span
                  className="required-star"
                  style={{ color: "red", marginLeft: "4px" }}>
                  *
                </span>
              )}
              {item.fixed && <span className="fixed-badge">💾</span>}
            </label>
            {item.isMonthSelector ? (
              <div className="month-selector">
                <button
                  className="arrow-btn month-arrow"
                  onClick={() => changeMonth(-1)}
                  aria-label="Vorheriger Monat">
                  ◀
                </button>
                <input
                  type="text"
                  value={formData[item.id] ?? MONTHS[new Date().getMonth()]}
                  onChange={(e) => updateField(item.id, e.target.value)}
                  className="month-input"
                  readOnly
                  aria-label="Aktueller Monat"
                />
                <button
                  className="arrow-btn month-arrow"
                  onClick={() => changeMonth(1)}
                  aria-label="Nächster Monat">
                  ▶
                </button>
              </div>
            ) : (
              <input
                type={item.inputType || "text"}
                value={formData[item.id] ?? ""}
                onChange={(e) => updateField(item.id, e.target.value)}
                placeholder={item.inputType === "date" ? "TT.MM.JJJJ" : "..."}
                className={item.fixed ? "fixed-input" : ""}
                aria-required={isRequiredField(item.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderVollstaendigkeitTable = (section) => (
    <div key={section.id} className="section">
      <h2>{section.title}</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="col-item">Kontrollobjekt</th>
              <th className="col-ist">Ist</th>
              <th className="col-soll">Soll</th>
              <th className="col-ablauf">Ablaufdatum</th>
            </tr>
          </thead>
          <tbody>
            {section.items.map((item) => (
              <tr key={item.id} className={item.highlight ? "highlight" : ""}>
                <td className="col-item">{item.label}</td>
                <td className="col-ist">
                  <input
                    type="number"
                    value={formData[`${item.id}_ist`] ?? ""}
                    onChange={(e) =>
                      updateField(`${item.id}_ist`, e.target.value)
                    }
                    required
                    aria-required="true"
                  />
                  {!formData[`${item.id}_ist`] &&
                    item.id !== "atemschutzmaske" &&
                    item.id !== "fluchthaube" && (
                      <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                    )}
                </td>
                <td className="col-soll">
                  <span className="soll-value">{item.soll ?? ""}</span>
                </td>
                <td className="col-ablauf">
                  {item.hasAblauf ? (
                    <input
                      type="text"
                      value={formData[`${item.id}_ablauf`] ?? ""}
                      onChange={(e) =>
                        updateField(`${item.id}_ablauf`, e.target.value)
                      }
                      placeholder="TT.MM.JJJJ"
                    />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProfiltiefenRechtsTable = (section) => {
    const adjustValue = (itemId, pos, delta) => {
      const key = `${itemId}_${pos}`;
      const current = parseFloat(formData[key]) || 0;
      const newValue = Math.max(0, current + delta);
      updateField(key, newValue.toString());
    };

    const hasInnerColumn = (itemId) => itemId === "lkw_b_achse";

    return (
      <div key={section.id} className="section">
        <h2>{section.title}</h2>
        <div className="table-container">
          <table className="profiltiefen-table">
            <thead>
              <tr>
                <th className="col-achse">Achse</th>
                <th className="col-re">Rechts</th>
                <th className="col-re">Rechts innen</th>
              </tr>
            </thead>
            <tbody>
              {section.items.map((item) => {
                const positions = hasInnerColumn(item.id)
                  ? ["re1", "re2"]
                  : ["re1"];
                return (
                  <tr key={item.id}>
                    <td className="col-achse">{item.label}</td>
                    {positions.map((pos) => (
                      <td key={pos} className="col-profiltiefe">
                        <div className="profiltiefe-input-wrapper">
                          <button
                            className="arrow-btn down"
                            onClick={() => adjustValue(item.id, pos, -1)}
                            aria-label={`${item.label} ${pos} verringern`}>
                            ▼
                          </button>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={formData[`${item.id}_${pos}`] ?? ""}
                            onChange={(e) =>
                              updateField(`${item.id}_${pos}`, e.target.value)
                            }
                            placeholder="mm"
                            className="profiltiefe-input"
                            aria-label={`${item.label} ${pos}`}
                          />
                          <button
                            className="arrow-btn up"
                            onClick={() => adjustValue(item.id, pos, 1)}
                            aria-label={`${item.label} ${pos} erhöhen`}>
                            ▲
                          </button>
                        </div>
                      </td>
                    ))}
                    {!hasInnerColumn(item.id) && (
                      <td className="col-profiltiefe"></td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProfiltiefenLinksTable = (section) => {
    const adjustValue = (itemId, pos, delta) => {
      const key = `${itemId}_${pos}`;
      const current = parseFloat(formData[key]) || 0;
      const newValue = Math.max(0, current + delta);
      updateField(key, newValue.toString());
    };

    const hasInnerColumn = (itemId) => itemId === "lkw_b_achse";

    return (
      <div key={section.id} className="section">
        <h2>{section.title}</h2>
        <div className="table-container">
          <table className="profiltiefen-table">
            <thead>
              <tr>
                <th className="col-achse">Achse</th>
                <th className="col-li">Links</th>
                <th className="col-li">Links innen</th>
              </tr>
            </thead>
            <tbody>
              {section.items.map((item) => {
                const positions = hasInnerColumn(item.id)
                  ? ["li1", "li2"]
                  : ["li1"];
                return (
                  <tr key={item.id}>
                    <td className="col-achse">{item.label}</td>
                    {positions.map((pos) => (
                      <td key={pos} className="col-profiltiefe">
                        <div className="profiltiefe-input-wrapper">
                          <button
                            className="arrow-btn down"
                            onClick={() => adjustValue(item.id, pos, -1)}
                            aria-label={`${item.label} ${pos} verringern`}>
                            ▼
                          </button>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={formData[`${item.id}_${pos}`] ?? ""}
                            onChange={(e) =>
                              updateField(`${item.id}_${pos}`, e.target.value)
                            }
                            placeholder="mm"
                            className="profiltiefe-input"
                            aria-label={`${item.label} ${pos}`}
                          />
                          <button
                            className="arrow-btn up"
                            onClick={() => adjustValue(item.id, pos, 1)}
                            aria-label={`${item.label} ${pos} erhöhen`}>
                            ▲
                          </button>
                        </div>
                      </td>
                    ))}
                    {!hasInnerColumn(item.id) && (
                      <td className="col-profiltiefe"></td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderZustandTable = (section) => (
    <div key={section.id} className="section">
      <h2>{section.title}</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="col-item">Kontrollobjekt</th>
              <th className="col-ok">OK</th>
              <th className="col-wann">Wann</th>
            </tr>
          </thead>
          <tbody>
            {section.items.map((item) => (
              <tr key={item.id} className={item.highlight ? "highlight" : ""}>
                <td className="col-item">{item.label}</td>
                <td className="col-ok">
                  <button
                    className={`ok-btn ${
                      formData[`${item.id}_ok`] ? "active" : ""
                    }`}
                    onClick={() =>
                      updateField(`${item.id}_ok`, !formData[`${item.id}_ok`])
                    }
                    aria-label={
                      formData[`${item.id}_ok`]
                        ? "OK bestätigt"
                        : "Als OK markieren"
                    }
                    aria-pressed={formData[`${item.id}_ok`] ?? false}>
                    {formData[`${item.id}_ok`] ? "✓" : ""}
                  </button>
                  {!formData[`${item.id}_ok`] &&
                    item.id !== "modulasi_system" && (
                      <span
                        style={{
                          color: "red",
                          marginLeft: "4px",
                          fontSize: "12px",
                        }}>
                        *
                      </span>
                    )}
                </td>
                <td className="col-wann">
                  <input
                    type="text"
                    value={formData[`${item.id}_wann`] ?? ""}
                    onChange={(e) =>
                      updateField(`${item.id}_wann`, e.target.value)
                    }
                    placeholder="TT.MM.JJJJ"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="btn btn-secondary"
        onClick={() => setAllOkWithDate(section)}
        style={{ marginTop: "15px", width: "100%" }}>
        ✓ Alle OK mit Datum
      </button>
    </div>
  );

  const renderReifenTable = (section) => (
    <div key={section.id} className="section">
      <h2>{section.title}</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="col-item">Profiltiefen</th>
              <th className="col-rechts">Rechts</th>
              <th className="col-links">Links</th>
              <th className="col-ok">OK</th>
              <th className="col-wann">Wann</th>
            </tr>
          </thead>
          <tbody>
            {section.items.map((item) => (
              <tr key={item.id}>
                <td className="col-item">{item.label}</td>
                <td className="col-rechts">
                  <input
                    type="number"
                    value={formData[`${item.id}_rechts`] ?? ""}
                    onChange={(e) =>
                      updateField(`${item.id}_rechts`, e.target.value)
                    }
                    placeholder="mm"
                  />
                </td>
                <td className="col-links">
                  <input
                    type="number"
                    value={formData[`${item.id}_links`] ?? ""}
                    onChange={(e) =>
                      updateField(`${item.id}_links`, e.target.value)
                    }
                    placeholder="mm"
                  />
                </td>
                <td className="col-ok">
                  <button
                    className={`ok-btn ${
                      formData[`${item.id}_ok`] ? "active" : ""
                    }`}
                    onClick={() =>
                      updateField(`${item.id}_ok`, !formData[`${item.id}_ok`])
                    }
                    aria-label={
                      formData[`${item.id}_ok`]
                        ? "OK bestätigt"
                        : "Als OK markieren"
                    }
                    aria-pressed={formData[`${item.id}_ok`] ?? false}>
                    {formData[`${item.id}_ok`] ? "✓" : ""}
                  </button>
                </td>
                <td className="col-wann">
                  <input
                    type="text"
                    value={formData[`${item.id}_wann`] ?? ""}
                    onChange={(e) =>
                      updateField(`${item.id}_wann`, e.target.value)
                    }
                    placeholder="TT.MM.JJJJ"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWartungTable = (section) => (
    <div key={section.id} className="section">
      <h2>{section.title}</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="col-item">Arbeit</th>
              <th className="col-datum">Datum SZM/MW</th>
              <th className="col-datum">Datum AH/AL</th>
            </tr>
          </thead>
          <tbody>
            {section.items.map((item) => (
              <tr key={item.id}>
                <td className="col-item">{item.label}</td>
                <td className="col-datum">
                  <input
                    type="text"
                    value={formData[`${item.id}_szm`] ?? ""}
                    onChange={(e) =>
                      updateField(`${item.id}_szm`, e.target.value)
                    }
                    placeholder="TT.MM.JJJJ"
                  />
                </td>
                <td className="col-datum">
                  <input
                    type="text"
                    value={formData[`${item.id}_ahal`] ?? ""}
                    onChange={(e) =>
                      updateField(`${item.id}_ahal`, e.target.value)
                    }
                    placeholder="TT.MM.JJJJ"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMaengelSection = (section) => (
    <div key={section.id} className="section">
      <h2>{section.title}</h2>
      <div className="maengel-grid">
        {section.items.map((item) => (
          <input
            key={item.id}
            type="text"
            className="maengel-input"
            value={formData[item.id] ?? ""}
            onChange={(e) => updateField(item.id, e.target.value)}
            placeholder={item.label}
          />
        ))}
      </div>
    </div>
  );

  const renderSignatureSection = (section) => (
    <div key={section.id} className="section">
      <h2>Unterschriften</h2>
      <div className="signature-grid">
        {section.items.map((item) => (
          <div key={item.id} className="signature-field">
            <label>{item.label}</label>
            <input
              type="text"
              value={formData[item.id] ?? ""}
              onChange={(e) => updateField(item.id, e.target.value)}
              aria-required="true"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSection = (section) => {
    if (section.isHeader) return renderHeaderSection(section);
    if (section.hasProfiltiefenRechts)
      return renderProfiltiefenRechtsTable(section);
    if (section.hasProfiltiefenLinks)
      return renderProfiltiefenLinksTable(section);
    if (section.hasIstSoll) return renderVollstaendigkeitTable(section);
    if (section.hasRechtsLinks) return renderReifenTable(section);
    if (section.hasDatumSZM) return renderWartungTable(section);
    if (section.isTextArea) return renderMaengelSection(section);
    if (section.isSignature) return renderSignatureSection(section);
    if (section.hasOkWann) return renderZustandTable(section);
    return null;
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Formblatt</h1>
        <p>Nachweis monatliche Wartung Kfz-Technik und Zubehör</p>
        {!showSettings && (
          <div className="page-nav">
            <span
              style={{
                color: "white",
                padding: "8px 15px",
                fontSize: "0.9rem",
              }}>
              {currentSectionIndex + 1} / {totalSections}
            </span>
          </div>
        )}
        {showSettings && (
          <div className="page-nav">
            <button className="page-btn" onClick={() => setShowSettings(false)}>
              ◀ Zurück zum Formular
            </button>
          </div>
        )}
      </header>

      <main className="content">
        {!showSettings ? (
          renderSection(currentSection)
        ) : (
          <div className="sync-section">
            <h3>📱 Daten synchronisieren</h3>
            <div className="sync-buttons">
              <button className="btn btn-secondary" onClick={handleExportJSON}>
                📤 Als JSON exportieren
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCopyToClipboard}>
                📋 In Zwischenablage kopieren
              </button>
              <button
                className="btn btn-secondary"
                onClick={handlePasteFromClipboard}>
                📥 Aus Zwischenablage einfügen
              </button>
              <label className="btn btn-secondary file-input-label">
                📁 JSON Datei importieren
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden-file-input"
                />
              </label>
            </div>
            <p className="sync-hint">
              Tipp: Auf Laptop "Exportieren" oder "Kopieren", dann auf Handy
              "Einfügen" oder "Datei importieren"
            </p>
            <div className="default-section">
              <h4>💾 Als Default speichern (für neue Geräte)</h4>
              <div className="sync-buttons">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveAsDefault}>
                  📥 default-data.json erstellen
                </button>
              </div>
              <p className="sync-hint">
                Diese Datei automatisch für alle neuen Geräte laden. Speichere
                sie im public-Ordner.
              </p>
            </div>

            <div className="default-section" style={{ marginTop: "30px" }}>
              <h4>⚙️ Weitere Aktionen</h4>
              <div className="sync-buttons">
                <button className="btn btn-secondary" onClick={saveFixedValues}>
                  💾 Feste Werte speichern
                </button>
                <button className="btn btn-secondary" onClick={clearAll}>
                  🗑️ Alle löschen
                </button>
                <button className="btn btn-primary" onClick={handleExportHTML}>
                  📄 Als HTML exportieren
                </button>
              </div>
            </div>

            <div
              className="default-section"
              style={{
                marginTop: "30px",
                border: "2px solid #4CAF50",
                padding: "15px",
                borderRadius: "8px",
              }}>
              <h4>📝 Für Word-Dokument exportieren</h4>
              <p className="sync-hint" style={{ marginBottom: "15px" }}>
                Erstellt eine JSON-Datei mit Platzhaltern für die automatische
                Befüllung der Word-Vorlage. Alle Pflichtfelder müssen ausgefüllt
                sein.
              </p>
              {!formComplete && missingFields.length > 0 && (
                <div
                  className="missing-fields"
                  style={{
                    background: "#3d2817",
                    border: "1px solid #fbbf24",
                    borderRadius: "6px",
                    padding: "10px",
                    marginBottom: "15px",
                    fontSize: "0.8rem",
                  }}>
                  <strong style={{ color: "#fbbf24" }}>Fehlende Felder:</strong>
                  <ul
                    style={{
                      margin: "8px 0 0 0",
                      paddingLeft: "20px",
                      color: "#e0e0e0",
                    }}>
                    {missingFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="sync-buttons">
                <button
                  className="btn btn-primary"
                  onClick={handleExportWord}
                  style={{
                    backgroundColor: formComplete ? "#4CAF50" : "#ccc",
                  }}>
                  {formComplete
                    ? "✅ Für Word exportieren"
                    : "⚠️ Formular unvollständig"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {!showSettings && (
        <div className="button-container">
          <button
            className="btn btn-secondary"
            onClick={goToPrevious}
            disabled={currentSectionIndex === 0}>
            ◀ Zurück
          </button>
          <button
            className="btn btn-primary"
            onClick={goToNext}
            disabled={currentSectionIndex === totalSections - 1}>
            Weiter ▶
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowSettings(true)}
            title="Einstellungen"
            aria-label="Einstellungen öffnen">
            ⚙️
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
