import React from 'react';

function SceneDropdown({ scenes, currentIndex, setCurrentIndex }) {
  if (scenes.length === 0) return null;

  return (
    <div style={{ marginLeft: '20px', height: '1000px' }}>
      <select
        style={{ height: '1000px', width: '500px', fontWeight: 'bold', fontFamily: 'monospace' }}
        value={currentIndex}
        onChange={(e) => setCurrentIndex(Number(e.target.value))}
        size={20}
      >
        {scenes.map((scene, index) => (
          <option key={index} value={index}>
            {index + 1}   {scene.heading}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SceneDropdown;
