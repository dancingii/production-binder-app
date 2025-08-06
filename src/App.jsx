import React, { useState } from 'react';

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sceneNumbers, setSceneNumbers] = useState([]);

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
        const numbers = [];

        for (let i = 0; i < sceneElements.length; i++) {
          const scene = sceneElements[i];
          const elements = scene.getElementsByTagName("Paragraph");
          const sceneContent = [];
          let heading = "";
          for (let j = 0; j < elements.length; j++) {
            const el = elements[j];
            const type = el.getAttribute("Type");
            const text = el.textContent.trim();
            if (!text) continue;

            if (type === "Scene Heading") {
              heading = text;
            }

            sceneContent.push({ type, text });
          }

          if (sceneContent.length > 0) {
            numbers.push(parsedScenes.length + 1); // scene numbers start at 1
            parsedScenes.push({ heading, content: sceneContent });
          }
        }

        setScenes(parsedScenes);
        setSceneNumbers(numbers);
        setCurrentIndex(0);
        console.log("Scene numbers:", numbers);
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

  const handleSceneJump = (e) => {
    const index = parseInt(e.target.value);
    if (!isNaN(index)) setCurrentIndex(index);
  };

  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <div>
        <h1>Production Binder</h1>
        <input type="file" accept=".fdx" onChange={handleFileUpload} />
        {sceneNumbers.length > 0 && (
          <div style={{ margin: '10px 0' }}>
            <label>Jump to Scene: </label>
            <select onChange={handleSceneJump} value={currentIndex}>
              {sceneNumbers.map((num, idx) => (
                <option key={idx} value={idx}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {scenes.length > 0 && (
        <div
          style={{
            width: '1000px',
            height: '1000px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '20px',
            marginLeft: '40px',
            boxSizing: 'border-box',
            fontFamily: 'Courier, monospace',
            whiteSpace: 'pre-wrap'
          }}
        >
          <div>
            <h2 style={{ whiteSpace: 'nowrap' }}>
              {currentIndex + 1}. {scenes[currentIndex].heading}
            </h2>
            {scenes[currentIndex].content.map((line, idx) => {
              let style = { margin: '10px 0' };

              if (line.type === "Character") {
                style.textAlign = "center";
                style.fontWeight = "bold";
              } else if (line.type === "Parenthetical") {
                style.textAlign = "center";
                style.fontStyle = "italic";
              } else if (line.type === "Dialogue") {
                style.marginLeft = "100px";
                style.marginRight = "100px";
              }

              return (
                <div key={idx} style={style}>
                  {line.text}
                </div>
              );
            })}
            <div style={{ marginTop: '20px' }}>
              <button onClick={handleNext}>Next Scene</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
