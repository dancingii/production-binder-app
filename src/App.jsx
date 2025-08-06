import React, { useState } from 'react';
import { XMLParser } from 'fast-xml-parser';

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.fdx')) {
      alert('Please upload a valid .fdx file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlContent = event.target.result;
      console.log('File loaded:', xmlContent.slice(0, 300)); // Log part of the file for debugging

      try {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '',
        });

        const json = parser.parse(xmlContent);
        const script = json.FinalDraft;
        const content = script.Content;
        const paragraphs = Array.isArray(content.Paragraph) ? content.Paragraph : [content.Paragraph];

        const sceneList = [];

        let currentScene = null;

        paragraphs.forEach((para) => {
          const type = para.Type;
          const text = para.Text || '';

          if (type === 'Scene Heading') {
            if (currentScene) sceneList.push(currentScene);
            currentScene = { heading: text, content: [] };
          } else if (currentScene) {
            currentScene.content.push({ type, text });
          }
        });

        if (currentScene) sceneList.push(currentScene);
        setScenes(sceneList);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Error parsing XML:', err);
        alert('Failed to load script. Make sure it\'s a valid .fdx file.');
      }
    };

    reader.readAsText(file);
  };

  const currentScene = scenes[currentIndex];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Production Binder</h1>
      <input type="file" accept=".fdx" onChange={handleFileUpload} />
      {scenes.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>{currentScene.heading}</h2>
          <div>
            {currentScene.content.map((line, index) => (
              <p key={index} style={{ margin: '4px 0' }}>
                <strong>{line.type}:</strong> {line.text}
              </p>
            ))}
          </div>
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))} disabled={currentIndex === 0}>
              Previous
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(i + 1, scenes.length - 1))}
              disabled={currentIndex === scenes.length - 1}
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
