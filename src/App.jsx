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
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(e.target.result, 'text/xml');
      const sceneElements = xmlDoc.getElementsByTagName('Scene');

      const parsedScenes = Array.from(sceneElements).map((scene) => {
        const heading = scene.getElementsByTagName('Scene Heading')[0]?.textContent || '';
        const elements = Array.from(scene.children).map((el) => {
          const type = el.tagName;
          const text = el.textContent;
          return { type, text };
        });

        return {
          heading,
          content: elements,
        };
      });

      setScenes(parsedScenes);
      setCurrentIndex(0);
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
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'monospace' }}>
      {/* Left Navigation (Placeholder) */}
      <div
        style={{
          width: '80px',
          backgroundColor: '#ffedd5',
          color: '#333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '20px',
        }}
      >
        <div style={{ marginBottom: '20px', cursor: 'pointer' }}>Script</div>
        <div style={{ marginBottom: '20px', cursor: 'pointer' }}>Stripboard</div>
        <div style={{ marginBottom: '20px', cursor: 'pointer' }}>Schedule</div>
        <div style={{ marginBottom: '20px', cursor: 'pointer' }}>Call Sheet</div>
        <div style={{ marginBottom: '20px', cursor: 'pointer' }}>To-Do</div>
        <div style={{ marginBottom: '20px', cursor: 'pointer' }}>Props</div>
        <div style={{ marginBottom: '20px', cursor: 'pointer' }}>Wardrobe</div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Production Binder</h1>
        <input type="file" accept=".fdx" onChange={handleFileUpload} />

        {scenes.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Slideshow Window */}
            <div
              style={{
                width: '1000px',
                height: '1000px',
                overflowY: 'auto',
                padding: '20px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                fontFamily: 'Courier, monospace',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                position: 'relative',
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
                          style={{ textAlign: 'center', fontWeight: 'bold', margin: '10px 0' }}
                        >
                          {block.text}
                        </p>
                      );
                    case 'Dialogue':
                      return (
                        <p
                          key={index}
                          style={{
                            textAlign: 'left',
                            marginLeft: '300px',
                            marginRight: '300px',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {block.text}
                        </p>
                      );
                    case 'Parenthetical':
                      return (
                        <p
                          key={index}
                          style={{ textAlign: 'center', fontStyle: 'italic', margin: '10px 0' }}
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

              {/* Pinned Buttons */}
              <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
                <button onClick={handlePrev} style={{ marginRight: '10px' }}>
                  Previous
                </button>
                <button onClick={handleNext}>Next</button>
              </div>
            </div>

            {/* Scene Dropdown on Right */}
            <div
              style={{
                height: '1000px',
                width: '500px',
                marginLeft: '20px',
                backgroundColor: '#fdfdfd',
                overflowY: 'auto',
              }}
            >
              <select
                size={30}
                onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                style={{ width: '100%', height: '100%', fontFamily: 'monospace' }}
              >
                {scenes.map((scene, idx) => (
                  <option key={idx} value={idx}>
                    <strong>{idx + 1}</strong>   {scene.heading}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
