import React, { useState } from 'react';
import { XMLParser } from 'fast-xml-parser';

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCharacter, setFilterCharacter] = useState('');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    textNodeName: 'text',
    preserveOrder: true,
  });

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parser.parse(text);

    // Flatten elements under final_draft
    const elements = parsed.find(el => el.final_draft)?.final_draft || [];

    let scenes = [];
    let currentScene = [];

    for (let node of elements) {
      const key = Object.keys(node)[0];
      const element = node[key];

      if (element?.style === 'Scene Heading') {
        if (currentScene.length > 0) {
          scenes.push(currentScene);
        }
        currentScene = [element];
      } else {
        currentScene.push(element);
      }
    }

    if (currentScene.length > 0) {
      scenes.push(currentScene);
    }

    setScenes(scenes);
    setCurrentIndex(0);
  };

  const nextScene = () => {
    setCurrentIndex((prev) => (prev < filteredScenes.length - 1 ? prev + 1 : prev));
  };

  const prevScene = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const getFilteredScene = (scene) => {
    return scene.filter(el => {
      const matchesCharacter =
        !filterCharacter || el.style !== 'Character' || el.text?.toLowerCase() === filterCharacter.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (el.text && el.text.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCharacter && matchesSearch;
    });
  };

  const filteredScenes = scenes.map(getFilteredScene).filter(scene => scene.length > 0);
  const currentScene = filteredScenes[currentIndex] || [];

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Script Viewer</h1>
      <input type="file" accept=".xml" onChange={handleFileChange} />

      {scenes.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div>
            <label>Search: </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginRight: '1rem' }}
            />
            <label>Filter by Character: </label>
            <input
              type="text"
              value={filterCharacter}
              onChange={(e) => setFilterCharacter(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1.5rem', whiteSpace: 'pre-wrap' }}>
            {currentScene.map((el, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                {el.style === 'Scene Heading' && <h3>{el.text}</h3>}
                {el.style === 'Action' && <p><strong>{el.text}</strong></p>}
                {el.style === 'Character' && <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{el.text}</p>}
                {el.style === 'Parenthetical' && <p style={{ textAlign: 'center' }}>({el.text})</p>}
                {el.style === 'Dialogue' && <p style={{ textAlign: 'center' }}>{el.text}</p>}
                {el.style === 'Transition' && <p style={{ textAlign: 'right', fontStyle: 'italic' }}>{el.text}</p>}
                {![
                  'Scene Heading',
                  'Action',
                  'Character',
                  'Parenthetical',
                  'Dialogue',
                  'Transition',
                ].includes(el.style) && <p>{el.text}</p>}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button onClick={prevScene} disabled={currentIndex === 0}>Previous</button>
            <span style={{ margin: '0 1rem' }}>
              Scene {currentIndex + 1} of {filteredScenes.length}
            </span>
            <button onClick={nextScene} disabled={currentIndex >= filteredScenes.length - 1}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
