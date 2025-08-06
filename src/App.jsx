import React, { useState } from 'react';
import { parseStringPromise } from 'xml2js';
import './App.css';

function App() {
  const [scriptData, setScriptData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file.name.endsWith('.fdx')) {
      alert('Please upload a valid .fdx (Final Draft) file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const xmlText = e.target.result;
      try {
        const parsed = await parseStringPromise(xmlText);
        const scriptElements = parsed.FinalDraft.Script[0.Content[0].Paragraph];

        const scenes = [];
        const charSet = new Set();
        let currentScene = [];

        for (const element of scriptElements) {
          const type = element.$.Type;
          const text = element.Text?.[0] || '';

          if (type === 'Scene Heading') {
            if (currentScene.length) scenes.push(currentScene);
            currentScene = [{ type, text }];
          } else {
            currentScene.push({ type, text });
            if (type === 'Character') {
              charSet.add(text.toUpperCase());
            }
          }
        }

        if (currentScene.length) {
          scenes.push(currentScene);
        }

        setScriptData(scenes);
        setCharacters(Array.from(charSet));
        setCurrentIndex(0);
      } catch (err) {
        console.error('Parse error:', err);
        alert('Failed to parse file.');
      }
    };

    reader.readAsText(file);
  };

  const renderScene = (scene) => {
    return scene.map((item, index) => {
      if (item.type === 'Character') {
        const isHighlighted = item.text.toUpperCase() === selectedCharacter;
        return (
          <div key={index} style={{ fontWeight: isHighlighted ? 'bold' : 'normal', marginTop: '1em' }}>
            {item.text}
          </div>
        );
      }

      if (item.type === 'Dialogue') {
        return (
          <div key={index} style={{ marginLeft: '2em', marginBottom: '1em' }}>
            {item.text}
          </div>
        );
      }

      if (item.type === 'Scene Heading') {
        return (
          <div key={index} style={{ fontWeight: 'bold', textDecoration: 'underline', marginTop: '2em' }}>
            {item.text}
          </div>
        );
      }

      return (
        <div key={index} style={{ marginLeft: '1em' }}>
          {item.text}
        </div>
      );
    });
  };

  return (
    <div className="App" style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Production Binder</h1>

      <input type="file" accept=".fdx" onChange={handleFileUpload} />
      {scriptData.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}>⬅ Previous</button>
            <button onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, scriptData.length - 1))}>Next ➡</button>
          </div>

          <div>
            <label>
              Highlight Character:&nbsp;
              <select
                value={selectedCharacter}
                onChange={(e) => setSelectedCharacter(e.target.value)}
              >
                <option value="">-- None --</option>
                {characters.map((char) => (
                  <option key={char} value={char}>
                    {char}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>
            {renderScene(scriptData[currentIndex])}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
