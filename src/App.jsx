import { useState } from 'react'
import { supabase } from './supabaseClient'
import { XMLParser } from 'fast-xml-parser'

function App() {
  const [projectName, setProjectName] = useState('')
  const [scenes, setScenes] = useState([])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    const text = await file.text()

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    })

    const xml = parser.parse(text)
    const content = xml.FinalDraft.Content

    const parsedScenes = []
    let currentScene = null

    for (const element of content.Paragraph) {
      const type = element['@_Type']
      const text = element.Text || ''

      if (type === 'Scene Heading') {
        if (currentScene) parsedScenes.push(currentScene)
        currentScene = { slugline: text, action: '', characters: [], dialogue: '' }
      } else if (type === 'Action') {
        currentScene.action += text + ' '
      } else if (type === 'Character') {
        if (!currentScene.characters.includes(text)) {
          currentScene.characters.push(text)
        }
      } else if (type === 'Dialogue') {
        currentScene.dialogue += text + '\n'
      }
    }
    if (currentScene) parsedScenes.push(currentScene)

    setScenes(parsedScenes)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Upload Script</h1>

      <input
        type="text"
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />

      <br /><br />

      <input type="file" accept=".fdx" onChange={handleFileUpload} />

      <h2>Parsed Scenes</h2>
      {scenes.length === 0 ? (
        <p>No scenes parsed yet.</p>
      ) : (
        <ul>
          {scenes.map((scene, idx) => (
            <li key={idx}>
              <strong>{scene.slugline}</strong><br />
              <em>Characters:</em> {scene.characters.join(', ')}<br />
              <em>Action:</em> {scene.action}<br />
              <em>Dialogue:</em> <pre>{scene.dialogue}</pre>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
