import { useState  } from 'react'
import './App.css'

function App() {
  const [nihilMessage, setNihilMessage] = useState("まだ何も生成されていません")
  const [loading, setLoading] = useState(false)

  const callGEMINI = async () => {
    setLoading(true)
    try {
      // サーバーレス関数経由でリクエスト
      const res = await fetch('/api/gemini/nihil', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      })
      const data = await res.json()
      setNihilMessage(
        data.message || "APIからの応答が不正です"
      )
    } catch (error) {
      setNihilMessage("エラーが発生しました: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <button onClick={callGEMINI} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? "虚無を生成中…" : "ニヒリズムを生成"}
      </button>
      <p style={{ marginTop: '1rem' }}>{nihilMessage}</p>
    </div>
  )
}

export default App
