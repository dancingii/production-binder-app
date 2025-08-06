import React, { useState } from 'react';

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState('');

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.fdx')) {
      setError('Please upload a valid .fdx file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const xmlString = event.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        const content = Array.from(xmlDoc.getElementsByTagName('Content'));
        const parsedScenes = content.map((node) => {
          const elements = node.getElementsByTagName('Paragraph');
          return Array.from(elements).map((el) => ({
            type: el.getAttribute('Type'),
            text: el.textContent,
          }));
        });

        setScenes(parsedScenes);
        setCurrentIndex(0);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load script. Make sure it\'s a valid .fdx file.');
      }
    };

    reader.readAsText(file);
  }

  const currentScene = scenes[currentIndex] || [];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Production Binder (.fdx Viewer)</h1>
      <input type="file" accept=".fdx" onChange={handleFileChange} />
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {currentScene.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          {currentScene.map((line, i) => (
            <div key={i}>
              <strong>{line.type}:</strong> {line.text}
            </div>
          ))}
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))} disabled={currentIndex === 0}>
              Previous
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(i + 1, scenes.length - 1))}
              disabled={currentIndex >= scenes.length - 1}
              style={{ marginLeft: '10px' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
