import React from 'react';

function Slideshow({ scenes, currentIndex }) {
  if (scenes.length === 0) {
    return (
      <div style={{ fontStyle: 'italic' }}>
        No project loaded. Please upload a .fdx file to begin.
      </div>
    );
  }

  return (
    <>
      <h2 style={{ marginBottom: '20px' }}>
        {currentIndex + 1}: {scenes[currentIndex].heading}
      </h2>
      <div>
        {scenes[currentIndex].content.map((block, index) => {
          switch (block.type) {
            case 'Character':
              return (
                <p key={index} style={{ textAlign: 'center', fontWeight: 'bold', margin: '10px 0' }}>
                  {block.text}
                </p>
              );
            case 'Dialogue':
              return (
                <p key={index} style={{ marginLeft: '300px', marginRight: '300px', textAlign: 'left' }}>
                  {block.text}
                </p>
              );
            case 'Parenthetical':
              return (
                <p key={index} style={{ textAlign: 'center', fontStyle: 'italic', margin: '10px 0' }}>
                  ({block.text})
                </p>
              );
            case 'Action':
              return <p key={index} style={{ textAlign: 'left' }}>{block.text}</p>;
            default:
              return <p key={index}>{block.text}</p>;
          }
        })}
      </div>
    </>
  );
}

export default Slideshow;
