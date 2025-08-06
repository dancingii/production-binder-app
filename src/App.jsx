import { useState } from "react";
import { parseStringPromise } from "xml2js";
import "./App.css";

function App() {
  const [scriptData, setScriptData] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith(".fdx")) {
      alert("Please upload a valid .fdx (Final Draft) file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const xmlText = e.target.result;

      try {
        const parsed = await parseStringPromise(xmlText);
        const scriptElements = parsed.FinalDraft.Script[0].Content[0].Paragraph;

        const scenes = [];
        const charSet = new Set();
        let currentScene = [];

        for (const element of scriptElements) {
          const type = element.$.Type;
          const text = element.Text?.[0] || "";

          if (type === "Scene Heading") {
            if (currentScene.length > 0) {
              scenes.push(currentScene);
            }
            currentScene = [{ type, text }];
          } else {
            currentScene.push({ type, text });
            if (type === "Character") {
              charSet.add(text.toUpperCase());
            }
          }
        }

        if (currentScene.length > 0) {
          scenes.push(currentScene);
        }

        setScriptData(scenes);
        setCharacters(Array.from(charSet));
        setCurrentIndex(0);
      } catch (err) {
        console.error("Parse error:", err);
        alert("Failed to parse file.");
      }
    };

    reader.readAsText(file);
  };

  const currentScene = scriptData[currentIndex] || [];

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, scriptData.length - 1));
  };

  const isHighlighted = (text) => {
    if (!selectedCharacter) return false;
    return text.toUpperCase() === selectedCharacter.toUpperCase();
  };

  return (
    <div className="App">
      <h1>Production Binder</h1>
      <input type="file" accept=".fdx" onChange={handleFileUpload} />
      {characters.length > 0 && (
        <div className="character-select">
          <label>Select Character: </label>
          <select
            onChange={(e) => setSelectedCharacter(e.target.value)}
            value={selectedCharacter || ""}
          >
            <option value="">-- All --</option>
            {characters.map((char) => (
              <option key={char} value={char}>
                {char}
              </option>
            ))}
          </select>
        </div>
      )}
      {currentScene.length > 0 && (
        <div className="script">
          {currentScene.map((line, idx) => (
            <div
              key={idx}
              className={`line ${line.type.toLowerCase()} ${
                line.type === "Character" && isHighlighted(line.text)
                  ? "highlight"
                  : ""
              }`}
            >
              <strong>{line.type}</strong>: {line.text}
            </div>
          ))}
        </div>
      )}
      <div className="nav">
        <button onClick={handlePrev} disabled={currentIndex === 0}>
          ← Prev
        </button>
        <span>
          Scene {currentIndex + 1} / {scriptData.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentIndex >= scriptData.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default App;
