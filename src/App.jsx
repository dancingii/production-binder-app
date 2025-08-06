import React, { useState } from 'react';
import { XMLParser } from 'fast-xml-parser';

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file.name.endsWith('.fdx')) {
      alert('Please upload a valid Final Draft (.fdx) file.');
      return;
    }

    const text = await file.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const json = parser.parse(text);

    const script = json.FinalDraft?.Content?.Paragraph;
    if (!script) {
      alert('Unable to parse script.');
      return;
    }

    let currentScene = { lines: [], characters: new Set() };
    const allScenes = [];

    for (const item of script) {
      const type = item['@_Type'];
      const text = item['#text'] || '';

      if (type === 'Scene Heading') {
        if (currentScene.lines.length) {
          allScenes.push(currentScene);
          currentScene = { lines: [], characters: new Set() };
        }
        currentScene.lines.push({ type: 'Scene Heading', text });
      } else if (type === 'Character') {
        currentScene.lines.push({ type: 'Character', text });
        currentScene.characters.add(text);
      } else if (type === 'Dialogue') {
        currentScene.lines.push({ type: 'Dialogue', text });
      } else if (['Action', 'Parenthetical', 'Transition'].includes(type)) {
        currentScene.lines.push({ type, text });
      }
    }

    if (currentScene.lines.length) {
      allScenes.push(currentScene);
    }

    setScenes(allScenes);
    setCurrentSceneIndex(0);
    setSelectedCharacter('');
  };

  const currentScene = scenes[currentSceneIndex] || { lines: [], characters: [] };

  return (
    <div>
      <h1>Production Binder</h1>
      <input type="file" accept=".fdx" onChange={handleFileUpload} />

      {scenes.length > 0 && (
        <>
          <div>
            <button onClick={() => setCurrentSceneIndex((i) => Math.max(0, i - 1))}>
              ⬅️ Previous
            </button>
            <button onClick={() => setCurrentSceneIndex((i) => Math.min(scenes.length - 1, i + 1))}>
              Next ➡️
            </button>
          </div>

          <div>
            <label htmlFor="character-select">Highlight Character:</label>
            <select
              id="character-select"
              value={selectedCharacter}
              onChange={(e) => setSelectedCharacter(e.target.value)}
            >
              <option value="">-- None --</option>
              {[...currentScene.characters].map((char, i) => (
                <option key={i} value={char}>
                  {char}
                </option>
              ))}
            </select>
          </div>

          <div className="script-page">
            {currentScene.lines.map((line, index) => {
              if (line.type === 'Character') {
                const isHighlighted = line.text === selectedCharacter;
                return (
                  <div key={index} className="character-line">
                    <div
                      className={`character-name ${isHighlighted ? 'highlight' : ''}`}
                    >
                      {line.text}
                    </div>
                  </div>
                );
              } else if (line.type === 'Dialogue') {
                return (
                  <div key={index} style={{ marginLeft: '2rem' }}>
                    {line.text}
                  </div>
                );
              } else {
                return (
                  <div key={index} style={{ fontStyle: 'italic', margin: '0.5rem 0' }}>
                    {line.text}
                  </div>
                );
              }
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
