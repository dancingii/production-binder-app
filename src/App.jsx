import React, { useState } from 'react';
import './App.css';

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
    <div className="app-container">
      <div className="sidebar">
        <button className="nav-button active">Script</button>
        <button className="nav-button">Stripboard</button>
        <button className="nav-button">Schedule</button>
        <button className="nav-button">Call Sheet</button>
        <button className="nav-button">To-Do</button>
        <button className="nav-button">Props</button>
        <button className="nav-button">Wardrobe</button>
      </div>

      <div className="main">
        <h1>Scene Viewer</h1>
        <input type="file" accept=".fdx" onChange={handleFileUpload} />

        {scenes.length > 0 && (
          <div className="slide-window">
            <h2>{currentIndex + 1}: {scenes[currentIndex].heading}</h2>
            <div className="slide-content">
              {scenes[currentIndex].content.map((block, index) => {
                switch (block.type) {
                  case 'Character':
                    return <p key={index} className="character">{block.text}</p>;
                  case 'Dialogue':
                    return <p key={index} className="dialogue">{block.text}</p>;
                  case 'Parenthetical':
                    return <p key={index} className="parenthetical">({block.text})</p>;
                  case 'Action':
                    return <p key={index} className="action">{block.text}</p>;
                  default:
                    return <p key={index}>{block.text}</p>;
                }
              })}
            </div>
            <div className="navigation-buttons">
              <button onClick={handlePrev}>Previous</button>
              <button onClick={handleNext}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
