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
        <div style={{
          width: '800px',
          height: '800px',
          margin: '20px auto',
          border: '1px solid #ccc',
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: '#fff',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>
            {currentIndex + 1}: {scenes[currentIndex].heading}
          </h2>
          <div>
            {scenes[currentIndex].content.map((block, index) => {
              switch (block.type) {
                case 'Character':
                  return <p key={index} style={{ textAlign: 'center', fontWeight: 'bold', margin: '10px 0' }}>{block.text}</p>;
                case 'Dialogue':
                  return <p key={index} style={{ marginLeft: '100px', marginRight: '100px', textAlign: 'left' }}>{block.text}</p>;
                case 'Parenthetical':
                  return <p key={index} style={{ marginLeft: '90px', fontStyle: 'italic' }}>({block.text})</p>;
                case 'Action':
                  return <p key={index} style={{ textAlign: 'left' }}>{block.text}</p>;
                default:
                  return <p key={index}>{block.text}</p>;
              }
            })}
          </div>
        </div>
      )}

      {scenes.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={handlePrev}>Previous</button>
          <button onClick={handleNext} style={{ marginLeft: '10px' }}>Next</button>
        </div>
      )}
    </div>
  );
}

export default App;
