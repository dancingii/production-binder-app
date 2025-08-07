import React from 'react';
import Slideshow from './Slideshow';
import SceneDropdown from './SceneDropdown';
import NavigationButtons from './NavigationButtons';

function Script({ scenes, currentIndex, setCurrentIndex, handleFileUpload }) {
  return (
    <>
      <div style={{ margin: '20px' }}>
        <input type="file" accept=".fdx" onChange={handleFileUpload} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
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
    fontFamily: 'Courier, monospace', // ✅ Added line
  }}
        >
          <Slideshow scenes={scenes} currentIndex={currentIndex} />
        </div>
        <SceneDropdown
          scenes={scenes}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      </div>

      <NavigationButtons scenes={scenes} setCurrentIndex={setCurrentIndex} />
    </>
  );
}

export default Script;
