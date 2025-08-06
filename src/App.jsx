import React, { useState } from 'react';
import { XMLParser } from 'fast-xml-parser';

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCharacter, setFilterCharacter] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '',
        });
        const xml = parser.parse(event.target.result);

        const paragraphs =
          xml?.FinalDraft?.Content?.Script?.Paragraph || [];

        // Normalize single vs array
        const paragraphList = Array.isArray(paragraphs)
          ? paragraphs
          : [paragraphs];

        const extractedScenes = [];
        let currentScene = null;

        for (const p of paragraphList) {
          const type = p.Type;
          const textContent = p.Text || '';

          if (type === 'Scene Heading') {
            if (currentScene) {
              extractedScenes.push(currentScene);
            }
            currentScene = {
              heading: textContent,
              content: [],
              characters: new Set(),
            };
          } else if (currentScene) {
            currentScene.content.push({ type, text: textContent });

            if (type === 'Character') {
              currentScene.characters.add(textContent.trim().toUpperCase());
            }
          }
        }

        if (currentScene) {
          extractedScenes.push(currentScene);
        }

        // Flatten character sets and assign to scene
        const cleanedScenes = extractedScenes.map((scene) => ({
          ...scene,
          characters: Array.from(scene.characters),
        }));

        setScenes(cleanedScenes);
        setCurrentIndex(0);
      } catch (err) {
        alert('Failed to load script. Make sure it\'s a valid .fdx file.');
        console.error('FDX parse error:', err);
      }
    };

    if (file) {
      reader.readAsText(file);
    }
  };

  const filteredScenes = scenes.filter((scene) => {
    const matchesSearch = scene.content.some((p) =>
      p.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesCharacter =
      !filterCharacter ||
      scene.characters.includes(filterCharacter.trim().toUpperCase());

    return matchesSearch && matchesCharacter;
  });

  const currentScene = filteredScenes[currentIndex] || {
    heading: 'No scenes found.',
    content: [],
  };

  const handleNext = () => {
    if (currentIndex < filteredScenes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Production Binder</h1>

      <input
  type="file"
  accept=".fdx"
  onChange={(e) => {
    console.log('File selected:', e.target.files[0]);
    handleFileUpload(e);
  }}
/>

      <div>
        <input
          type="text"
          placeholder="Search scene text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', margin: '0.5rem 0', padding: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Filter by character..."
          value={filterCharacter}
          onChange={(e) => setFilterCharacter(e.target.value)}
          style={{ width: '100%', margin: '0.5rem 0', padding: '0.5rem' }}
        />
      </div>

      <div style={{ border: '1px solid #ccc', padding: '1rem', minHeight: '300px' }}>
        <h2>{currentScene.heading}</h2>
        {currentScene.content.map((p, idx) => (
          <p key={idx}>
            <strong>{p.type}:</strong> {p.text}
          </p>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handlePrevious} disabled={currentIndex === 0}>
          Previous
        </button>
        <span style={{ margin: '0 1rem' }}>
          Scene {filteredScenes.length === 0 ? 0 : currentIndex + 1} of {filteredScenes.length}
        </span>
        <button onClick={handleNext} disabled={currentIndex >= filteredScenes.length - 1}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
