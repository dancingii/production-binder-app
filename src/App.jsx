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
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const sceneElements = xmlDoc.getElementsByTagName("Content");

        const parsedScenes = [];

        for (let i = 0; i < sceneElements.length; i++) {
          const scene = sceneElements[i];
          const paragraphs = scene.getElementsByTagName("Paragraph");

          const content = [];
          let heading = "";

          for (let j = 0; j < paragraphs.length; j++) {
            const p = paragraphs[j];
            const type = p.getAttribute("Type");
            const text = p.textContent.trim();
            if (!text) continue;

            if (type === "Scene Heading" && heading === "") {
              heading = text;
            }

            content.push({ type, text });
          }

          if (content.length > 0) {
            parsedScenes.push({ heading, content });
          }
        }

        setScenes(parsedScenes);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Parse error:", err);
        alert("Failed to parse file.");
      }
    };

    reader.readAsText(file);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % scenes.length);
  };

  return (
    <div style={{ display: 'flex', padding: '20px', fontFamily: 'Courier, monospace' }}>
      <div>
        <h1>Production Binder</h1>
        <input type="file" accept=".fdx" onChange={handleFileUpload} />
      </div>

      {scenes.length > 0 && (
        <div
          style={{
            width: '1000px',
            height: '1000px',
            overflowY: 'auto',
            marginLeft: '40px',
            padding: '20px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            backgroundColor: '#fdfdfd',
            textAlign: 'left'
          }}
        >
          <h2>{scenes[currentIndex].heading}</h2>
          {scenes[currentIndex].content.map((line, idx) => {
            const { type, text } = line;
            let style = { margin: '10px 0' };

            if (type === 'Character') {
              style.textAlign = 'center';
              style.fontWeight = 'bold';
            } else if (type === 'Parenthetical') {
              style.marginLeft = '50px';
              style.fontStyle = 'italic';
            } else if (type === 'Dialogue') {
              style.marginLeft = '100px';
              style.marginRight = '100px';
            }

            return (
              <div key={idx} style={style}>
                {text}
              </div>
            );
          })}
          <button onClick={handleNext} style={{ marginTop: '20px' }}>
            Next Scene
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
