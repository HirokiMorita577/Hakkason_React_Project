import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [nihilMessage, setNihilMessage] = useState("まだ何も生成されていません")
  const [loading, setLoading] = useState(false)

  const callGPT = async () => {
    setLoading(true)
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "あなたはニヒリズム哲学を語る詩人です。短くて絶望的な真理を述べてください。"
            },
            {
              role: "user",
              content: "ニヒリズム的な真理をください。"
            }
          ],
        }),
      })

      const data = await res.json()
      setNihilMessage(data.choices?.[0]?.message?.content || "APIからの応答が不正です")
    } catch (error) {
      setNihilMessage("エラーが発生しました: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>

        {/* 👇 ニヒリズムボタンを追加 👇 */}
        <button onClick={callGPT} disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? "虚無を生成中…" : "ニヒリズムを生成"}
        </button>
        <p style={{ marginTop: '1rem' }}>{nihilMessage}</p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
