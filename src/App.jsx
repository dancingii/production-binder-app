import React, { useState } from 'react';
import { XMLParser } from 'fast-xml-parser';

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCharacter, setFilterCharacter] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',       // Keeps attribute names clean
      textNodeName: 'text',          // Ensures text nodes aren't renamed
      preserveOrder: true,           // <— VERY IMPORTANT to preserve all elements in order
    });

    const result = parser.parse(text);
    const paragraphs = result.FinalDraft.Content.Paragraph;

    const parsedScenes = [];
    let currentScene = { sceneNumber: 1, elements: [] };
    let currentCharacter = null;
    const allCharacters = new Set();

    for (const element of paragraphs) {
      const type = element['@_Type'];
      const text = typeof element.Text === 'string'
        ? element.Text
        : element.Text?.['#text'] || '';

      if (type === 'Scene Heading') {
        if (currentScene.elements.length > 0) {
          parsedScenes.push(currentScene);
          currentScene = {
            sceneNumber: currentScene.sceneNumber + 1,
            elements: [],
          };
        }
        currentScene.elements.push({ type: 'slugline', text });
        currentCharacter = null;
      } else if (type === 'Action') {
        currentScene.elements.push({ type: 'action', text });
        currentCharacter = null;
      } else if (type === 'Character') {
        currentCharacter = text;
        allCharacters.add(currentCharacter);
        currentScene.elements.push({ type: 'character', text });
      } else if (type === 'Dialogue') {
        currentScene.elements.push({
          type: 'dialogue',
          text,
          character: currentCharacter,
        });
      } else if (type === 'Parenthetical') {
        currentScene.elements.push({ type: 'parenthetical', text });
      } else if (type === 'Transition') {
        currentScene.elements.push({ type: 'transition', text });
      } else if (type === 'Shot') {
        currentScene.elements.push({ type: 'shot', text });
      }
    }

    if (currentScene.elements.length > 0) parsedScenes.push(currentScene);
    setScenes(parsedScenes);
    setCurrentIndex(0);
  };

  const currentScene = scenes[currentIndex];

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const foundIndex = scenes.findIndex((scene) =>
      scene.elements.some((el) => el.text?.toLowerCase().includes(query))
    );
    if (foundIndex !== -1) setCurrentIndex(foundIndex);
  };

  const nextScene = () => {
    if (currentIndex < scenes.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevScene = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const characterOptions = Array.from(
    new Set(
      scenes.flatMap((scene) =>
        scene.elements
          .filter((el) => el.type === 'character')
          .map((el) => el.text)
      )
    )
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'Courier New, monospace' }}>
      <h1>Upload Final Draft Script (.fdx)</h1>
      <input type="file" accept=".fdx" onChange={handleFileUpload} />
      <br />
      <br />

      {scenes.length > 0 && (
        <>
          <input
            type="text"
            placeholder="Search scenes..."
            value={searchQuery}
            onChange={handleSearch}
            style={{ padding: '8px', marginRight: '1rem', width: '300px' }}
          />

          <select
            value={filterCharacter}
            onChange={(e) => setFilterCharacter(e.target.value)}
            style={{ padding: '8px' }}
          >
            <option value="">Show all characters</option>
            {characterOptions.map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
          </select>

          <div
            style={{
              border: '1px solid #ccc',
              padding: '1rem',
              marginTop: '1rem',
              background: '#f9f9f9',
              minHeight: '300px',
            }}
          >
            {currentScene?.elements.map((el, idx) => {
              if (
                filterCharacter &&
                el.type === 'dialogue' &&
                el.character !== filterCharacter
              )
                return null;

              if (
                filterCharacter &&
                el.type === 'character' &&
                el.text !== filterCharacter
              )
                return null;

              const styleMap = {
                slugline: { fontWeight: 'bold', textTransform: 'uppercase' },
                action: { marginLeft: '2rem', marginBottom: '0.5rem' },
                character: {
                  textAlign: 'center',
                  fontWeight: 'bold',
                  marginTop: '1.5rem',
                },
                dialogue: {
                  textAlign: 'center',
                  marginLeft: '3rem',
                  marginRight: '3rem',
                },
                parenthetical: {
                  textAlign: 'center',
                  fontStyle: 'italic',
                  color: '#555',
                },
                transition: {
                  textAlign: 'right',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                },
                shot: {
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  color: '#333',
                },
              };

              return (
                <div key={idx} style={styleMap[el.type]}>
                  {el.text}
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1rem',
              width: '320px',
            }}
          >
            <button onClick={prevScene} disabled={currentIndex === 0}>
              ⟵ Previous
            </button>
            <span>
              Scene {currentIndex + 1} of {scenes.length}
            </span>
            <button
              onClick={nextScene}
              disabled={currentIndex === scenes.length - 1}
            >
              Next ⟶
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
