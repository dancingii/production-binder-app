import React, { useState } from 'react';

// Modules
function Script({ scenes, currentIndex, setCurrentIndex, handleFileUpload }) {
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % scenes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + scenes.length) % scenes.length);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {/* Slideshow Window */}
      <div
        style={{
          width: '1000px',
          height: '1000px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '20px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          boxSizing: 'border-box',
          textAlign: 'left',
        }}
      >
        {scenes.length === 0 ? (
          <div style={{ fontStyle: 'italic' }}>No project loaded. Please upload a .fdx file to begin.</div>
        ) : (
          <>
            <h2 style={{ marginBottom: '20px' }}>
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
          </>
        )}
      </div>

      {/* Scene Dropdown */}
      {scenes.length > 0 && (
        <div style={{ marginLeft: '20px', height: '1000px' }}>
          <select
            style={{ height: '1000px', width: '500px' }}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(Number(e.target.value))}
            size={20}
          >
            {scenes.map((scene, index) => (
              <option key={index} value={index}>
                {index + 1}: {scene.heading}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function Stripboard() {
  return <div style={{ padding: '20px' }}>Stripboard Module Coming Soon</div>;
}
function StripboardSchedule() {
  return <div style={{ padding: '20px' }}>Stripboard Schedule Module Coming Soon</div>;
}
function CallSheet() {
  return <div style={{ padding: '20px' }}>Call Sheet Module Coming Soon</div>;
}
function ToDoList() {
  return <div style={{ padding: '20px' }}>To-Do List Module Coming Soon</div>;
}
function Props() {
  return <div style={{ padding: '20px' }}>Props Module Coming Soon</div>;
}
function Wardrobe() {
  return <div style={{ padding: '20px' }}>Wardrobe Module Coming Soon</div>;
}

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeModule, setActiveModule] = useState('Script');

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

  const renderModule = () => {
    switch (activeModule) {
      case 'Script':
        return (
          <>
            <div style={{ margin: '20px' }}>
              <input type="file" accept=".fdx" onChange={handleFileUpload} />
            </div>
            <Script
              scenes={scenes}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              handleFileUpload={handleFileUpload}
            />
            {scenes.length > 0 && (
              <div style={{ textAlign: 'right', marginTop: '10px', width: '1000px' }}>
                <button onClick={() => setCurrentIndex((prev) => (prev - 1 + scenes.length) % scenes.length)}>
                  Previous
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % scenes.length)}
                  style={{ marginLeft: '10px' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        );
      case 'Stripboard':
        return <Stripboard />;
      case 'StripboardSchedule':
        return <StripboardSchedule />;
      case 'CallSheet':
        return <CallSheet />;
      case 'ToDoList':
        return <ToDoList />;
      case 'Props':
        return <Props />;
      case 'Wardrobe':
        return <Wardrobe />;
      default:
        return <div>Invalid Module</div>;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left Nav */}
      <div
        style={{
          width: '80px',
          backgroundColor: '#FFE5B4',
          paddingTop: '10px',
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {['Script', 'Stripboard', 'StripboardSchedule', 'CallSheet', 'ToDoList', 'Props', 'Wardrobe'].map((mod) => (
          <button
            key={mod}
            onClick={() => setActiveModule(mod)}
            style={{
              margin: '5px 0',
              backgroundColor: activeModule === mod ? '#ddd' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeModule === mod ? 'bold' : 'normal',
            }}
          >
            {mod}
          </button>
        ))}
      </div>

      {/* Main Display */}
      <div style={{ flexGrow: 1, padding: '10px' }}>{renderModule()}</div>
    </div>
  );
}

export default App;
