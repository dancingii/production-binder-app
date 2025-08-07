import React, { useState } from 'react';
import './App.css'; // If you have global styles

function App() {
  const [activeModule, setActiveModule] = useState('Script');
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
              content: [],
            };
          } else if (currentScene) {
            currentScene.content.push({ type, text: content });
          }
        });

        if (currentScene) parsedScenes.push(currentScene);
        setScenes(parsedScenes);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Parse error:', err);
        alert('Failed to parse .fdx file.');
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

  const handleSceneSelect = (event) => {
    setCurrentIndex(Number(event.target.value));
  };

  const navItems = [
    'Script',
    'Stripboard',
    'Schedule',
    'Call Sheet',
    'To-Do',
    'Props',
    'Wardrobe',
  ];

  return (
    <div style={{ display: 'flex', fontFamily: 'Courier, monospace' }}>
      {/* Left navigation bar */}
      <div
        style={{
          width: '80px',
          backgroundColor: '#ffe0b3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '10px',
        }}
      >
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveModule(item)}
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              margin: '10px 0',
              backgroundColor: activeModule === item ? '#ccc' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#333',
              fontFamily: 'monospace',
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, padding: '20px' }}>
        {activeModule === 'Script' && (
          <div>
            <h1>Scene Viewer</h1>
            <input type="file" accept=".fdx" onChange={handleFileUpload} />

            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              {/* Dropdown menu on the right */}
              {scenes.length > 0 && (
                <select
                  size="1000"
                  value={currentIndex}
                  onChange={handleSceneSelect}
                  style={{
                    width: '500px',
                    height: '1000px',
                    marginLeft: '20px',
                    fontFamily: 'Courier, monospace',
                    overflowY: 'scroll',
                    whiteSpace: 'pre',
                  }}
                >
                  {scenes.map((scene, index) => (
                    <option key={index} value={index}>
                      <strong>{index + 1}</strong>:   {scene.heading}
                    </option>
                  ))}
                </select>
              )}

              {/* Slideshow window */}
              {scenes.length > 0 && (
                <div
                  style={{
                    width: '1000px',
                    height: '1000px',
                    margin: '20px 0',
                    border: '1px solid #ccc',
                    padding: '20px',
                    overflowY: 'auto',
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                    fontFamily: 'Courier, monospace',
                  }}
                >
                  <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>
                    {currentIndex + 1}: {scenes[currentIndex].heading}
                  </h2>
                  <div>
                    {scenes[currentIndex].content.map((block, index) => {
                      switch (block.type) {
                        case 'Character':
                          return (
                            <p
                              key={index}
                              style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                margin: '10px 0',
                              }}
                            >
                              {block.text}
                            </p>
                          );
                        case 'Dialogue':
                          return (
                            <p
                              key={index}
                              style={{
                                marginLeft: '300px',
                                marginRight: '300px',
                                textAlign: 'left',
                              }}
                            >
                              {block.text}
                            </p>
                          );
                        case 'Parenthetical':
                          return (
                            <p
                              key={index}
                              style={{
                                textAlign: 'center',
                                fontStyle: 'italic',
                                margin: '10px 0',
                              }}
                            >
                              ({block.text})
                            </p>
                          );
                        case 'Action':
                          return (
                            <p key={index} style={{ textAlign: 'left' }}>
                              {block.text}
                            </p>
                          );
                        default:
                          return <p key={index}>{block.text}</p>;
                      }
                    })}
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <button onClick={handlePrev}>Previous</button>
                    <button onClick={handleNext} style={{ marginLeft: '10px' }}>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placeholder for other modules */}
        {activeModule !== 'Script' && (
          <h2 style={{ color: '#888' }}>
            {activeModule} module coming soon...
          </h2>
        )}
      </div>
    </div>
  );
}

export default App;
