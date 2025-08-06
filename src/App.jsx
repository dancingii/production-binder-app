import React, { useState } from 'react';
import { xml2js } from 'xml-js';

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [characters, setCharacters] = useState([]);
  const [highlighted, setHighlighted] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.fdx')) {
      alert("Please upload a valid .fdx file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
  try {
    const xml = event.target.result;
    const json = xml2js(xml, { compact: true });

    // ✅ STEP 1: Debug output
    console.log("🔍 FDX PARSED JSON:", JSON.stringify(json, null, 2));

    const content = json?.FinalDraft?.Content;

    if (!content) {
      alert("Could not find 'Content' in FDX");
      return;
    }

    let paragraphs = content.Paragraph;

    // ✅ Log type and text of each paragraph
    if (!Array.isArray(paragraphs)) paragraphs = [paragraphs];

    console.log("✅ Paragraphs:");
    paragraphs.forEach((p, i) => {
      console.log(`[${i}] Type: ${p?._attributes?.Type} | Text: ${p?.Text?._text}`);
    });

    // You can now move forward with your parsing logic here
  } catch (err) {
    console.error("FDX parse error:", err);
    alert("Failed to load script. Make sure it's a valid .fdx file.");
  }
};


        const scenesList = [];
        let currentScene = [];

        const charSet = new Set();

        for (const para of paragraphs) {
          const type = para._attributes?.Type;
          const text = para.Text?._text?.trim() || '';

          if (!text) continue;

          if (type === 'Scene Heading') {
            if (currentScene.length > 0) {
              scenesList.push(currentScene);
              currentScene = [];
            }
          }

          if (type === 'Character') {
            charSet.add(text);
          }

          currentScene.push({ type, text });
        }

        if (currentScene.length > 0) scenesList.push(currentScene);

        setScenes(scenesList);
        setCharacters(Array.from(charSet));
        setCurrentIndex(0);
      } catch (err) {
        console.error("Parse error:", err);
        alert("Failed to parse file.");
      }
    };

    reader.readAsText(file);
  };

  const currentScene = scenes[currentIndex] || [];

  return (
    <div style={{ padding: 20 }}>
      <h1>Production Binder</h1>
      <input type="file" accept=".fdx" onChange={handleFile} />

      {scenes.length > 0 && (
        <>
          <div style={{ marginTop: 20 }}>
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}>⬅️ Previous</button>
            <button onClick={() => setCurrentIndex(Math.min(scenes.length - 1, currentIndex + 1))}>Next ➡️</button>
          </div>

          <div style={{ marginTop: 20 }}>
            <label>
              Highlight Character:{" "}
              <select value={highlighted} onChange={(e) => setHighlighted(e.target.value)}>
                <option value="">-- None --</option>
                {characters.map((char) => (
                  <option key={char} value={char}>{char}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginTop: 20 }}>
            {currentScene.map((line, idx) => (
              <div
                key={idx}
                style={{
                  fontWeight: line.type === 'Character' && line.text === highlighted ? 'bold' : 'normal',
                  fontStyle: line.type === 'Parenthetical' ? 'italic' : 'normal',
                  marginBottom: 5
                }}
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

export default App;
