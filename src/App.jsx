import React, { useState } from 'react';
import { parse } from 'fast-xml-parser';

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xml = e.target.result;
        const json = parse(xml, {
          ignoreAttributes: false,
          attributeNamePrefix: '',
          textNodeName: 'text',
        });

        const content = json.FinalDraft.Document.Content.Paragraph;
        const extractedScenes = [];
        let currentScene = null;
        let sceneCounter = 1;

        content.forEach((item) => {
          const type = item.Type;
          const text = typeof item.Text === 'string' ? item.Text : item.Text?.text || '';

          if (type === 'Scene Heading') {
            if (currentScene) extractedScenes.push(currentScene);
            currentScene = {
              number: sceneCounter++,
              heading: text,
              content: [],
            };
          } else if (currentScene) {
            currentScene.content.push({ type, text });
          }
        });

        if (currentScene) extractedScenes.push(currentScene);

        console.log('Scene Numbers:', extractedScenes.map(s => s.number)); // log scene numbers

        setScenes(extractedScenes);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Parse error:', err);
        alert('Failed to parse FDX file.');
      }
    };

    reader.readAsText(file);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % scenes.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + scenes.length) % scenes.length);
  };

  const handleSceneJump = (e) => {
    setCurrentIndex(parseInt(e.target.value));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Production Binder</h1>
      <input type="file" accept=".fdx" onChange={handleFileUpload} />
      {scenes.length > 0 && (
        <>
          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <label htmlFor="sceneSelect">Jump to Scene: </label>
            <select id="sceneSelect" onChange={handleSceneJump} value={currentIndex}>
              {scenes.map((scene, index) => (
                <option key={index} value={index}>
                  {scene.number}: {scene.heading}
                </option>
              ))}
            </select>
          </div>
          <div style={{
            width: '1000px',
            height: '1000px',
            overflowY: 'auto',
            overflowX: 'auto',
            border: '1px solid #ccc',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            padding: '20px',
            textAlign: 'left'
          }}>
            <h2 style={{ whiteSpace: 'nowrap' }}>{scenes[currentIndex].number}: {scenes[currentIndex].heading}</h2>
            {scenes[currentIndex].content.map((line, idx) => {
              if (line.type === 'Character') {
                return <div key={idx} style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '20px' }}>{line.text}</div>;
              } else if (line.type === 'Dialogue') {
                return <div key={idx} style={{ margin: '0 100px', marginTop: '10px' }}>{line.text}</div>;
              } else if (line.type === 'Parenthetical') {
                return <div key={idx} style={{ fontStyle: 'italic', textAlign: 'center', marginTop: '10px' }}>{line.text}</div>;
              } else {
                return <div key={idx} style={{ marginTop: '10px' }}>{line.text}</div>;
              }
            })}
          </div>
          <div style={{ marginTop: '20px' }}>
            <button onClick={handlePrevious}>Previous</button>
            <button onClick={handleNext} style={{ marginLeft: '10px' }}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
