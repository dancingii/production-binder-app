import React, { useState } from 'react';

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const paragraphs = Array.from(xmlDoc.getElementsByTagName('Paragraph'));

        const parsedScenes = [];
        let currentScene = null;

        paragraphs.forEach((para) => {
          const type = para.getAttribute('Type');
          const content = para.textContent.trim();

          if (!content) return;

          if (type === 'Scene Heading') {
            if (currentScene) parsedScenes.push(currentScene);
            currentScene = {
              heading: content,
              content: []
            };
          } else if (currentScene) {
            currentScene.content.push({ type, text: content });
          }
        });

        // Push final scene
        if (currentScene) parsedScenes.push(currentScene);

        setScenes(parsedScenes);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Parse error:", err);
        alert("Failed to parse .fdx file.");
      }
    };

    reader.readAsText(file);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % scenes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + scenes.length) % scenes.length);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Scene Viewer</h1>
      <input type="file" accept=".fdx" onChange={handleFileUpload} />

      {scenes.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>{scenes[currentIndex].heading}</h2>
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {scenes[currentIndex].content.map((block, index) => {
              switch (block.type) {
                case 'Character':
                  return <p key={index} style={{ textAlign: 'center', fontWeight: 'bold' }}>{block.text}</p>;
                case 'Dialogue':
                  return <p key={index} style={{ marginLeft: '40px' }}>{block.text}</p>;
                case 'Parenthetical':
                  return <p key={index} style={{ marginLeft: '30px', fontStyle: 'italic' }}>({block.text})</p>;
                case 'Action':
                  return <p key={index}>{block.text}</p>;
                default:
                  return <p key={index}>{block.text}</p>;
              }
            })}
          </div>
          <div style={{ marginTop: '20px' }}>
            <button onClick={handlePrev}>Previous</button>
            <button onClick={handleNext} style={{ marginLeft: '10px' }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
