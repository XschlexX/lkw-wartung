import { useState, useEffect } from "react";
import { checklistData } from "./data/checklistData";

function App() {
  // Jede Sektion hat ihre eigene Seite (0-basiert für Array-Index)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const totalSections = checklistData.length;
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("lkwWartungData");
    return saved ? JSON.parse(saved) : {};
  });
  const [defaultDataLoaded, setDefaultDataLoaded] = useState(false);

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
          console.log("Keine Default-Daten gefunden");
        }
      }
    };
    loadDefaultData();
  }, [defaultDataLoaded]);

  useEffect(() => {
    localStorage.setItem("lkwWartungData", JSON.stringify(formData));
  }, [formData]);

  // Aktuelles Datum automatisch setzen beim Laden (nur wenn nicht vorhanden)
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    // Nur setzen wenn noch kein Datum vorhanden
    if (!formData["datum_am"]) {
      updateField("datum_am", formattedDate);
    }
  }, []);

  const updateField = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const setAllOkWithDate = (section) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const updates = {};
    section.items.forEach((item) => {
      // Überspringe optionale Felder
      if (item.id === "modulasi_system") return;

      updates[`${item.id}_ok`] = true;
      updates[`${item.id}_wann`] = formattedDate;
    });

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const saveFixedValues = () => {
    localStorage.setItem("lkwWartungFixedValues", JSON.stringify(formData));
    alert("Feste Werte wurden gespeichert!");
  };

  const clearAll = () => {
    if (confirm("Alle Werte löschen?")) {
      setFormData({});
      localStorage.removeItem("lkwWartungData");
    }
  };

  const exportToHTML = () => {
    const html = generateHTML(formData);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Formblatt-Wartung-${
      new Date().toISOString().split("T")[0]
    }.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lkw-wartung-daten-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prüft ob alle Pflichtfelder ausgefüllt sind
  const isFormComplete = () => {
    const requiredFields = [
      "kennzeichen_zug",
      "anhaenger_auflieger",
      "fahrer",
      "monat",
      "datum_am",
      "km_stand",
    ];

    // Prüfe Header-Felder
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
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
        if (!formData[item.id] || formData[item.id].trim() === "") {
          return false;
        }
      }
    }

    return true;
  };

  // Erstellt eine Word-optimierte Export-Datei mit Platzhaltern
  const exportForWord = () => {
    if (!isFormComplete()) {
      alert(
        "Bitte fülle alle Pflichtfelder aus:\n- Fahrzeugdaten (Kennzeichen, Anhänger, Fahrer, Monat, Datum, KM)\n- Alle Ist-Werte in der Vollständigkeits-Kontrolle\n- Alle OK-Checkboxen im Zustand\n- Alle Unterschriften"
      );
      return;
    }

    // Erstelle strukturierte Daten für Word-Platzhalter
    const wordData = {
      // Metadaten
      _meta: {
        exportDatum: new Date().toLocaleDateString("de-DE"),
        exportZeit: new Date().toLocaleTimeString("de-DE"),
        version: "1.0",
      },

      // Fahrzeugdaten - direkt als Platzhalter
      KENNZEICHEN_ZUG: formData["kennzeichen_zug"] || "",
      KENNZEICHEN_ANHAENGER: formData["anhaenger_auflieger"] || "",
      G_NUMMER: formData["g_nummer"] || "",
      FAHRER: formData["fahrer"] || "",
      MONAT: formData["monat"] || "",
      DATUM_AM: formData["datum_am"] || "",
      KM_STAND: formData["km_stand"] || "",

      // Vollständigkeit - dynamisch generiert
      ...generateVollstaendigkeitData(),

      // Profiltiefen
      ...generateProfiltiefenData(),

      // Zustand
      ...generateZustandData(),

      // Wartungsarbeiten
      ...generateWartungsarbeitenData(),

      // Mängel
      ...generateMaengelData(),

      // Unterschriften
      UNTERSCHRIFT_FAHRER: formData["unterschrift_fahrer"] || "",
      AUSGEWERTET_DURCH: formData["ausgewertet_durch"] || "",
      AUSGEWERTET_AM: formData["ausgewertet_am"] || "",
    };

    const dataStr = JSON.stringify(wordData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `word-export-${formData["kennzeichen_zug"] || "lkw"}-${
      formData["monat"] || ""
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Hilfsfunktion: Vollständigkeits-Daten generieren
  const generateVollstaendigkeitData = () => {
    const data = {};
    const section = checklistData.find((s) => s.id === "vollstaendigkeit");
    if (!section) return data;

    section.items.forEach((item, index) => {
      const prefix = `VOLL_${String(index + 1).padStart(2, "0")}`;
      data[`${prefix}_LABEL`] = item.label;
      data[`${prefix}_IST`] = formData[`${item.id}_ist`] || "";
      data[`${prefix}_SOLL`] = item.soll || "";
      data[`${prefix}_ABLAUF`] = formData[`${item.id}_ablauf`] || "";
    });

    return data;
  };

  // Hilfsfunktion: Profiltiefen-Daten generieren
  const generateProfiltiefenData = () => {
    const data = {};
    const achsen = [
      "lkw_a_achse",
      "lkw_b_achse",
      "lkw_c_achse",
      "ah_al_a_achse",
      "ah_al_b_achse",
      "ah_al_c_achse",
    ];

    achsen.forEach((achse, index) => {
      const prefix = `PROFIL_${String(index + 1).padStart(2, "0")}`;
      const labels = {
        lkw_a_achse: "LKW A-Achse",
        lkw_b_achse: "LKW B-Achse",
        lkw_c_achse: "LKW C-Achse",
        ah_al_a_achse: "AH/AL A-Achse",
        ah_al_b_achse: "AH/AL B-Achse",
        ah_al_c_achse: "AH/AL C-Achse",
      };

      data[`${prefix}_LABEL`] = labels[achse];
      data[`${prefix}_RE1`] = formData[`${achse}_re1`] || "";
      data[`${prefix}_RE2`] = formData[`${achse}_re2`] || "";
      data[`${prefix}_LI1`] = formData[`${achse}_li1`] || "";
      data[`${prefix}_LI2`] = formData[`${achse}_li2`] || "";
    });

    return data;
  };

  // Hilfsfunktion: Zustand-Daten generieren
  const generateZustandData = () => {
    const data = {};
    const sections = checklistData.filter((s) => s.hasOkWann);
    let counter = 1;

    sections.forEach((section) => {
      section.items.forEach((item) => {
        const prefix = `ZUSTAND_${String(counter).padStart(2, "0")}`;
        data[`${prefix}_LABEL`] = item.label;
        data[`${prefix}_OK`] = formData[`${item.id}_ok`] ? "Ja" : "Nein";
        data[`${prefix}_WANN`] = formData[`${item.id}_wann`] || "";
        counter++;
      });
    });

    return data;
  };

  // Hilfsfunktion: Wartungsarbeiten-Daten generieren
  const generateWartungsarbeitenData = () => {
    const data = {};
    const section = checklistData.find((s) => s.id === "wartungsarbeiten");
    if (!section) return data;

    section.items.forEach((item, index) => {
      const prefix = `WARTUNG_${String(index + 1).padStart(2, "0")}`;
      data[`${prefix}_LABEL`] = item.label;
      data[`${prefix}_SZM`] = formData[`${item.id}_szm`] || "";
      data[`${prefix}_AHAL`] = formData[`${item.id}_ahal`] || "";
    });

    return data;
  };

  // Hilfsfunktion: Mängel-Daten generieren
  const generateMaengelData = () => {
    const data = {};

    for (let i = 1; i <= 6; i++) {
      data[`MAENGEL_${i}`] = formData[`maengel_${i}`] || "";
    }

    return data;
  };

  const saveAsDefault = () => {
    // Extrahiere nur die festen Felder für die Default-Datei
    const defaultFields = [
      "kennzeichen_zug",
      "anhaenger_auflieger",
      "g_nummer",
      "fahrer",
    ];
    const defaultData = Object.fromEntries(
      defaultFields.map((field) => [field, formData[field] || ""])
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

  const importFromJSON = (event) => {
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
        alert("Fehler beim Import: Ungültige JSON-Datei");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const copyToClipboard = () => {
    const dataStr = JSON.stringify(formData);
    navigator.clipboard.writeText(dataStr).then(() => {
      alert("Daten in Zwischenablage kopiert! Auf dem Handy einfügen.");
    });
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      setFormData(data);
      localStorage.setItem("lkwWartungData", JSON.stringify(data));
      alert("Daten aus Zwischenablage importiert!");
    } catch (error) {
      alert("Fehler: Keine gültigen Daten in Zwischenablage");
    }
  };

  const months = [
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
  ];

  const changeMonth = (delta) => {
    const currentMonth = formData["monat"] || months[new Date().getMonth()];
    const currentIndex = months.indexOf(currentMonth);
    const newIndex = (currentIndex + delta + 12) % 12;
    updateField("monat", months[newIndex]);
  };

  // Hilfsfunktion: Prüft ob ein Feld ein Pflichtfeld ist
  const isRequiredField = (itemId) => {
    const requiredFields = [
      "kennzeichen_zug",
      "anhaenger_auflieger",
      "fahrer",
      "monat",
      "datum_am",
      "km_stand",
    ];
    return requiredFields.includes(itemId);
  };

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
                  onClick={() => changeMonth(-1)}>
                  ◀
                </button>
                <input
                  type="text"
                  value={formData[item.id] || months[new Date().getMonth()]}
                  onChange={(e) => updateField(item.id, e.target.value)}
                  className="month-input"
                  readOnly
                />
                <button
                  className="arrow-btn month-arrow"
                  onClick={() => changeMonth(1)}>
                  ▶
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={formData[item.id] || ""}
                onChange={(e) => updateField(item.id, e.target.value)}
                placeholder="..."
                className={item.fixed ? "fixed-input" : ""}
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
                    type="text"
                    value={formData[`${item.id}_ist`] || ""}
                    onChange={(e) =>
                      updateField(`${item.id}_ist`, e.target.value)
                    }
                    required
                  />
                  {!formData[`${item.id}_ist`] && 
                   item.id !== 'atemschutzmaske' && 
                   item.id !== 'fluchthaube' && (
                    <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                  )}
                </td>
                <td className="col-soll">
                  <span className="soll-value">{item.soll || ""}</span>
                </td>
                <td className="col-ablauf">
                  {item.hasAblauf ? (
                    <input
                      type="text"
                      value={formData[`${item.id}_ablauf`] || ""}
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

    // Nur LKW B-Achse hat "Rechts innen"
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
                            onClick={() => adjustValue(item.id, pos, -1)}>
                            ▼
                          </button>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={formData[`${item.id}_${pos}`] || ""}
                            onChange={(e) =>
                              updateField(`${item.id}_${pos}`, e.target.value)
                            }
                            placeholder="mm"
                            className="profiltiefe-input"
                          />
                          <button
                            className="arrow-btn up"
                            onClick={() => adjustValue(item.id, pos, 1)}>
                            ▲
                          </button>
                        </div>
                      </td>
                    ))}
                    {/* Leere Zelle für Achsen ohne "Rechts innen" */}
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

    // Nur LKW B-Achse hat "Links innen"
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
                            onClick={() => adjustValue(item.id, pos, -1)}>
                            ▼
                          </button>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={formData[`${item.id}_${pos}`] || ""}
                            onChange={(e) =>
                              updateField(`${item.id}_${pos}`, e.target.value)
                            }
                            placeholder="mm"
                            className="profiltiefe-input"
                          />
                          <button
                            className="arrow-btn up"
                            onClick={() => adjustValue(item.id, pos, 1)}>
                            ▲
                          </button>
                        </div>
                      </td>
                    ))}
                    {/* Leere Zelle für Achsen ohne "Links innen" */}
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
                    }>
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
                    value={formData[`${item.id}_wann`] || ""}
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
                    value={formData[`${item.id}_rechts`] || ""}
                    onChange={(e) =>
                      updateField(`${item.id}_rechts`, e.target.value)
                    }
                    placeholder="mm"
                  />
                </td>
                <td className="col-links">
                  <input
                    type="number"
                    value={formData[`${item.id}_links`] || ""}
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
                    }>
                    {formData[`${item.id}_ok`] ? "✓" : ""}
                  </button>
                </td>
                <td className="col-wann">
                  <input
                    type="text"
                    value={formData[`${item.id}_wann`] || ""}
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
                    value={formData[`${item.id}_szm`] || ""}
                    onChange={(e) =>
                      updateField(`${item.id}_szm`, e.target.value)
                    }
                    placeholder="TT.MM.JJJJ"
                  />
                </td>
                <td className="col-datum">
                  <input
                    type="text"
                    value={formData[`${item.id}_ahal`] || ""}
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
            value={formData[item.id] || ""}
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
              value={formData[item.id] || ""}
              onChange={(e) => updateField(item.id, e.target.value)}
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

  // Aktuelle Sektion basierend auf Index
  const currentSection = checklistData[currentSectionIndex];

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
              <button className="btn btn-secondary" onClick={exportToJSON}>
                📤 Als JSON exportieren
              </button>
              <button className="btn btn-secondary" onClick={copyToClipboard}>
                📋 In Zwischenablage kopieren
              </button>
              <button
                className="btn btn-secondary"
                onClick={pasteFromClipboard}>
                📥 Aus Zwischenablage einfügen
              </button>
              <label className="btn btn-secondary file-input-label">
                📁 JSON Datei importieren
                <input
                  type="file"
                  accept=".json"
                  onChange={importFromJSON}
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
                <button className="btn btn-primary" onClick={saveAsDefault}>
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
                <button className="btn btn-primary" onClick={exportToHTML}>
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
              <div className="sync-buttons">
                <button
                  className="btn btn-primary"
                  onClick={exportForWord}
                  style={{
                    backgroundColor: isFormComplete() ? "#4CAF50" : "#ccc",
                  }}>
                  {isFormComplete()
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
            onClick={() =>
              setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))
            }
            disabled={currentSectionIndex === 0}>
            ◀ Zurück
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              setCurrentSectionIndex(
                Math.min(totalSections - 1, currentSectionIndex + 1)
              )
            }
            disabled={currentSectionIndex === totalSections - 1}>
            Weiter ▶
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowSettings(true)}
            title="Einstellungen">
            ⚙️
          </button>
        </div>
      )}
    </div>
  );
}

function generateHTML(formData) {
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
            <div class="data-row"><span class="data-label">Kennzeichen Zugmaschine / Motorwagen:</span><span class="data-value">${
              formData["kennzeichen_zug"] || ""
            }</span></div>
            <div class="data-row"><span class="data-label">G-Nummer:</span><span class="data-value">${
              formData["g_nummer"] || ""
            }</span></div>
            <div class="data-row"><span class="data-label">Fahrer:</span><span class="data-value">${
              formData["fahrer"] || ""
            }</span></div>
        </div>
        <div>
            <div class="data-row"><span class="data-label">Anhänger/Auflieger:</span><span class="data-value">${
              formData["anhaenger_auflieger"] || ""
            }</span></div>
            <div class="data-row"><span class="data-label">Monat:</span><span class="data-value">${
              formData["monat"] || ""
            }</span></div>
            <div class="data-row"><span class="data-label">am:</span><span class="data-value">${
              formData["datum_am"] || ""
            }</span></div>
            <div class="data-row"><span class="data-label">Km-Stand:</span><span class="data-value">${
              formData["km_stand"] || ""
            }</span></div>
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
          .map((i) => `<p>${formData["maengel_" + i] || "&nbsp;"}</p>`)
          .join("")}
    </div>

    <div class="signature-section">
        <div class="signature-row">
            <div class="signature-field">
                <div class="signature-line">${
                  formData["unterschrift_fahrer"] || ""
                }</div>
                <p>Unterschrift Fahrer</p>
            </div>
        </div>
        <div class="signature-row">
            <div class="signature-field">
                <div class="signature-line">${
                  formData["ausgewertet_durch"] || ""
                }</div>
                <p>Ausgewertet durch</p>
            </div>
            <div class="signature-field" style="width: 30%;">
                <div class="signature-line">${
                  formData["ausgewertet_am"] || ""
                }</div>
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
}

function renderVollstaendigkeitHTML(section, formData) {
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
            <td>${item.label}</td>
            <td class="col-ist">${formData[`${item.id}_ist`] || ""}</td>
            <td class="col-soll">${item.soll || ""}</td>
            <td class="col-ablauf">${formData[`${item.id}_ablauf`] || ""}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderZustandHTML(section, formData) {
  if (!section) return "";
  return `
    <h3>${section.title}</h3>
    <table>
      <thead>
        <tr><th class="col-item">Kontrollobjekt</th><th class="col-ok">OK</th><th class="col-wann">Wann</th></tr>
      </thead>
      <tbody>
        ${section.items
          .map(
            (item) => `
          <tr class="${item.highlight ? "highlight" : ""}">
            <td>${item.label}</td>
            <td class="col-ok">${formData[`${item.id}_ok`] ? "✓" : ""}</td>
            <td class="col-wann">${formData[`${item.id}_wann`] || ""}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderReifenHTML(section, formData) {
  if (!section) return "";
  return `
    <h3>${section.title}</h3>
    <table>
      <thead>
        <tr><th class="col-item">Profiltiefen</th><th class="col-rechts">Rechts</th><th class="col-links">Links</th><th class="col-ok">OK</th><th class="col-wann">Wann</th></tr>
      </thead>
      <tbody>
        ${section.items
          .map(
            (item) => `
          <tr>
            <td>${item.label}</td>
            <td class="col-rechts">${formData[`${item.id}_rechts`] || ""}</td>
            <td class="col-links">${formData[`${item.id}_links`] || ""}</td>
            <td class="col-ok">${formData[`${item.id}_ok`] ? "✓" : ""}</td>
            <td class="col-wann">${formData[`${item.id}_wann`] || ""}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderWartungHTML(section, formData) {
  if (!section) return "";
  return `
    <h3>${section.title}</h3>
    <table>
      <thead>
        <tr><th class="col-item">Arbeit</th><th class="col-datum">Datum SZM/MW</th><th class="col-datum">Datum AH/AL</th></tr>
      </thead>
      <tbody>
        ${section.items
          .map(
            (item) => `
          <tr>
            <td>${item.label}</td>
            <td class="col-datum">${formData[`${item.id}_szm`] || ""}</td>
            <td class="col-datum">${formData[`${item.id}_ahal`] || ""}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

export default App;
