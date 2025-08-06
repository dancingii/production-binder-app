import { Buffer } from 'buffer';
import process from 'process';

window.Buffer = Buffer;
window.process = process;
import React, { useState } from "react";
import { xml2js } from "xml-js";

export default function App() {
  const [scenes, setScenes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCharacter, setFilterCharacter] = useState("");

  const getText = (node) => {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getText).join(" ");
    if (node._text) return node._text;
    if (node["#text"]) return node["#text"];
    return "";
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const result = xml2js(text, { compact: true });
    const paragraphs =
      result.FinalDraft?.Document?.Content?.Paragraph || [];

    const parsedScenes = [];
    let currentScene = { sceneNumber: 1, elements: [] };
    let currentCharacter = null;

    for (const el of paragraphs) {
      const type = el._attributes?.Type;
      const content = getText(el.Text);
      if (!type || !content) continue;

      if (type === "Scene Heading") {
        if (currentScene.elements.length) {
          parsedScenes.push(currentScene);
          currentScene = {
            sceneNumber: currentScene.sceneNumber + 1,
            elements: [],
          };
        }
        currentScene.elements.push({ type: "slugline", text: content });
        currentCharacter = null;
      } else if (type === "Action" || type === "General") {
        currentScene.elements.push({ type: "action", text: content });
        currentCharacter = null;
      } else if (type === "Character") {
        currentCharacter = content;
        currentScene.elements.push({ type: "character", text: content });
      } else if (type === "Dialogue") {
        currentScene.elements.push({
          type: "dialogue",
          character: currentCharacter,
          text: content,
        });
      } else if (type === "Parenthetical") {
        currentScene.elements.push({ type: "parenthetical", text: content });
      } else if (type === "Transition") {
        currentScene.elements.push({ type: "transition", text: content });
      } else if (type === "Shot") {
        currentScene.elements.push({ type: "shot", text: content });
      }
    }

    if (currentScene.elements.length) parsedScenes.push(currentScene);
    setScenes(parsedScenes);
    setCurrentIndex(0);
  };

  const currentScene = scenes[currentIndex];

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setSearchQuery(q);
    const idx = scenes.findIndex((sc) =>
      sc.elements.some((el) =>
        el.text.toLowerCase().includes(q)
      )
    );
    if (idx >= 0) setCurrentIndex(idx);
  };

  const nextScene = () => {
    if (currentIndex < scenes.length - 1)
      setCurrentIndex(currentIndex + 1);
  };
  const prevScene = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const characterOptions = Array.from(
    new Set(
      scenes.flatMap((sc) =>
        sc.elements
          .filter((el) => el.type === "character")
          .map((el) => el.text)
      )
    )
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "Courier New, monospace" }}>
      <h1>Upload .fdx Script</h1>
      <input type="file" accept=".fdx" onChange={handleFileUpload} />
      {scenes.length > 0 && (
        <>
          <div style={{ margin: "1rem 0" }}>
            <input
              type="text"
              placeholder="Search scenes..."
              value={searchQuery}
              onChange={handleSearch}
              style={{
                padding: "6px",
                marginRight: "8px",
                width: "260px",
              }}
            />
            <select
              value={filterCharacter}
              onChange={(e) =>
                setFilterCharacter(e.target.value)
              }
            >
              <option value="">All Characters</option>
              {characterOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              background: "#f9f9f9",
              minHeight: "300px",
            }}
          >
            {currentScene.elements
              .filter((el) =>
                filterCharacter
                  ? el.type === "dialogue"
                    ? el.character === filterCharacter
                    : el.type === "character"
                    ? el.text === filterCharacter
                    : true
                  : true
              )
              .map((el, idx) => (
                <div key={idx} style={{ marginBottom: "0.6rem" }}>
                  <span
                    style={{
                      ...(el.type === "slugline" && {
                        fontWeight: "bold",
                      }),
                      ...(el.type === "character" && {
                        textAlign: "center",
                        fontWeight: "bold",
                      }),
                      ...(el.type === "dialogue" && {
                        textAlign: "center",
                        margin: "0 3rem",
                      }),
                      ...(el.type === "action" && {
                        marginLeft: "2rem",
                      }),
                    }}
                  >
                    {el.text}
                  </span>
                </div>
              ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <button onClick={prevScene} disabled={currentIndex === 0}>
              ← Prev
            </button>
            <span>
              Scene {currentIndex + 1} of {scenes.length}
            </span>
            <button
              onClick={nextScene}
              disabled={currentIndex === scenes.length - 1}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
