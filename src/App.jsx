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

        // Parse .fdx XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const elements = xmlDoc.getElementsByTagName('Paragraph');

        const charSet = new Set();

        for (let i = 0; i < elements.length; i++) {
          const elem = elements[i];
          if (elem.getAttribute('Type') === 'Character') {
            const name = elem.textContent.trim();
            if (name) {
              charSet.add(name);
            }
          }
        }

        setCharacters(Array.from(charSet));
        setCurrentIndex(0);
      } catch (err) {
        console.error("Parse error:", err);
        alert("Failed to parse .fdx file.");
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
      <input type="file" accept=".fdx" onChange={handleFileUpload} />
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
