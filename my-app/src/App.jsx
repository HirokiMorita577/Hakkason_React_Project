import { useState  } from 'react'
import './App.css'

function App() {
  const [nihilMessage, setNihilMessage] = useState("まだ何も生成されていません")
  const [loading, setLoading] = useState(false)

  const callGPT = async () => {
    setLoading(true)
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "あなたはニヒリズム哲学を語る詩人です。短くて絶望的な真理を述べてください。" }
              ]
            }
          ]
        }),
      })

      const data = await res.json()
      console.log(data)
      setNihilMessage(
        data.candidates?.[0]?.content?.parts?.[0]?.text || "APIからの応答が不正です"
      )
    } catch (error) {
      setNihilMessage("エラーが発生しました: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <button onClick={callGPT} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? "虚無を生成中…" : "ニヒリズムを生成"}
      </button>
      <p style={{ marginTop: '1rem' }}>{nihilMessage}</p>
    </div>
  )
}

export default App
