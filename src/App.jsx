import React, { useState } from "react";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text",
  preserveOrder: true
});

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCharacter, setFilterCharacter] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parser.parse(text);

    let elements = [];

    // Handle Final Draft .fdx format
    const fdxRoot = parsed.find((el) => el.FinalDraft)?.FinalDraft;
    if (fdxRoot?.Content) {
      elements = fdxRoot.Content;
    } else {
      // Fallback for raw final_draft export
      const altRoot = parsed.find((el) => el.final_draft)?.final_draft;
      if (altRoot) {
        elements = altRoot;
      }
    }

    const paragraphs = elements
      .map((el) => el.Paragraph)
      .filter((el) => el && el.style);

    const groupedScenes = [];
    let currentScene = [];

    for (let el of paragraphs) {
      if (el.style === "Scene Heading") {
        if (currentScene.length > 0) {
          groupedScenes.push(currentScene);
        }
        currentScene = [el];
      } else {
        currentScene.push(el);
      }
    }

    if (currentScene.length > 0) {
      groupedScenes.push(currentScene);
    }

    setScenes(groupedScenes);
    setCurrentIndex(0);
  };

  const currentScene = scenes[currentIndex] || [];

  const filteredScene = currentScene.filter((el) => {
    if (filterCharacter && el.style === "Character") {
      return el.text.toLowerCase().includes(filterCharacter.toLowerCase());
    }
    return true;
  });

  const handleNext = () => {
    if (currentIndex < scenes.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const filteredScenes = searchQuery
    ? scenes.filter((scene) =>
        scene.some((el) =>
          el.text?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : scenes;

  return (
    <div style={{ fontFamily: "monospace", padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1>Production Binder</h1>
      <input type="file" accept=".fdx,.xml" onChange={handleFileChange} />
      <br /><br />
      <input
        type="text"
        placeholder="Search scene text..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Filter by character..."
        value={filterCharacter}
        onChange={(e) => setFilterCharacter(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
      />
      <div style={{ border: "1px solid #ccc", padding: "20px", minHeight: "300px", backgroundColor: "#fefefe" }}>
        {filteredScene.map((el, idx) => (
          <div key={idx} style={{ marginBottom: "10px" }}>
            {el.style === "Character" && (
              <div style={{ fontWeight: "bold", textAlign: "center" }}>{el.text}</div>
            )}
            {el.style === "Dialogue" && (
              <div style={{ textAlign: "center" }}>{el.text}</div>
            )}
            {el.style === "Scene Heading" && (
              <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>{el.text}</div>
            )}
            {el.style === "Action" && (
              <div style={{ fontStyle: "italic" }}>{el.text}</div>
            )}
            {el.style !== "Character" &&
              el.style !== "Dialogue" &&
              el.style !== "Scene Heading" &&
              el.style !== "Action" && <div>{el.text}</div>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "20px" }}>
        <button onClick={handlePrev} disabled={currentIndex === 0}>
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Scene {currentIndex + 1} of {scenes.length}
        </span>
        <button onClick={handleNext} disabled={currentIndex === scenes.length - 1}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
