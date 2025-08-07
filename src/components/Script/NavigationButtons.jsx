import React from 'react';

function NavigationButtons({ scenes, setCurrentIndex }) {
  if (scenes.length === 0) return null;

  return (
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
  );
}

export default NavigationButtons;
