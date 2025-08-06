import React, { useState } from "react";
import { XMLParser } from "fast-xml-parser";

function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCharacter, setFilterCharacter] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const xml = parser.parse(text);

    try {
      const script = xml.FinalDraft?.Content?.Script;
      const paragraphs = Array.isArray(script.Paragraph)
        ? script.Paragraph
        : [script.Paragraph];

      let sceneList = [];
      let currentScene = { text: "", characters: new Set() };

      paragraphs.forEach((p) => {
        const type = p["@_Type"];
        const content = typeof p.Text === "string" ? p.Text : p.Text?.["#text"] || "";

        if (type === "Scene Heading") {
          if (currentScene.text) {
            sceneList.push({
              ...currentScene,
              characters: Array.from(currentScene.characters),
            });
          }
          currentScene = { text: content + "\n", characters: new Set() };
        } else {
          if (type === "Character" && content) {
            currentScene.characters.add(content.trim());
          }
          currentScene.text += content + "\n";
        }
      });

      if (currentScene.text) {
        sceneList.push({
          ...currentScene,
          characters: Array.from(currentScene.characters),
        });
      }

      setScenes(sceneList);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to parse script:", err);
      alert("Failed to load script. Make sure it's a valid .fdx file.");
    }
  };

  const filteredScenes = scenes.filter((scene) => {
    const matchesText = scene.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCharacter =
      !filterCharacter || scene.characters.includes(filterCharacter);
    return matchesText && matchesCharacter;
  });

  const currentScene = filteredScenes[currentIndex] || { text: "", characters: [] };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Production Binder</h1>
      <input type="file" accept=".fdx" onChange={handleFileUpload} />
      <br /><br />
      <input
        type="text"
        placeholder="Search scene text..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Filter by character..."
        value={filterCharacter}
        onChange={(e) => setFilterCharacter(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <div style={{ border: "1px solid #ccc", padding: "10px", minHeight: "300px" }}>
        <pre>{currentScene.text}</pre>
      </div>
      <div style={{ marginTop: "10px" }}>
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Scene {currentIndex + 1} of {filteredScenes.length}
        </span>
        <button
          onClick={() =>
            setCurrentIndex((prev) => Math.min(prev + 1, filteredScenes.length - 1))
          }
          disabled={currentIndex >= filteredScenes.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
