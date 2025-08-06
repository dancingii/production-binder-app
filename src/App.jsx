import React, { useState } from 'react';

function App() {
  const [characters, setCharacters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const charSet = new Set(lines);
        setCharacters(Array.from(charSet));
        setCurrentIndex(0);
      } catch (err) {
        console.error("Parse error:", err);
        alert("Failed to parse file.");
      }
    };
    reader.readAsText(file);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % characters.length);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Character Review</h1>
      <input type="file" accept=".txt" onChange={handleFileUpload} />
      {characters.length > 0 && (
        <>
          <h2>{characters[currentIndex]}</h2>
          <button onClick={handleNext}>Next</button>
        </>
      )}
    </div>
  );
}

export default App;
