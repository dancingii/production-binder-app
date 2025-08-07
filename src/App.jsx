import React, { useState } from 'react';
import Script from './components/Script/Script';
import Stripboard from './modules/Stripboard';
import StripboardSchedule from './modules/StripboardSchedule';
import CallSheet from './modules/CallSheet';
import ToDoList from './modules/ToDoList';
import Props from './modules/Props';
import Wardrobe from './modules/Wardrobe';

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
          <Script
            scenes={scenes}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            handleFileUpload={handleFileUpload}
          />
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
      {/* Left Navigation */}
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
