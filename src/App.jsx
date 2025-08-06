import React, { useState } from "react";
import { parseStringPromise } from "xml2js";

export default function App() {
  const [scenes, setScenes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file?.name?.endsWith(".fdx")) {
      alert("Upload a valid .fdx file.");
      return;
    }

    const xml = await file.text();

    try {
      const parsed = await parseStringPromise(xml);
      const paras = parsed.FinalDraft.Script[0].Content[0].Paragraph;
      const scenesArray = [];
      const charSet = new Set();
      let current = [];

      for (const p of paras) {
        const type = p.$.Type;
        const txt = p.Text?.[0] || "";
        if (type === "Scene Heading") {
          if (current.length) scenesArray.push(current);
          current = [{ type, text: txt }];
        } else {
          current.push({ type, text: txt });
          if (type === "Character") charSet.add(txt.toUpperCase());
        }
      }

      if (current.length) scenesArray.push(current);

      setScenes(scenesArray);
      setCharacters([...charSet]);
      setCurrentIndex(0);
      setSelectedCharacter("");
    } catch (error) {
      console.error("Parse error:", error);
      alert("Parsing failed.");
    }
  };

  const scene = scenes[currentIndex] || [];

  return (
    <div className="app">
      <h1>Production Binder</h1>
      <input type="file" accept=".fdx" onChange={handleUpload} />

      {scenes.length > 0 && (
        <>
          <div className="nav">
            <button onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}>
              ← Prev
            </button>
            <span>
              Scene {currentIndex + 1} / {scenes.length}
            </span>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(scenes.length - 1, i + 1))}
            >
              Next →
            </button>
          </div>

          <div className="character-select">
            <label>Highlight Character: </label>
            <select
              value={selectedCharacter}
              onChange={(e) => setSelectedCharacter(e.target.value)}
            >
              <option value="">-- All --</option>
              {characters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="scene">
            {scene.map((line, idx) => (
              <div
                key={idx}
                className={`line ${line.type.toLowerCase()} ${
                  line.type === "Character" &&
                  selectedCharacter &&
                  line.text.toUpperCase() === selectedCharacter
                    ? "highlight"
                    : ""
                }`}
              >
                {line.text}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
