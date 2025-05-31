import { useState  } from 'react'
import './App.css'

function App() {
  const [nihilMessage, setNihilMessage] = useState("まだ何も生成されていません")
  const [loading, setLoading] = useState(false)

  const callGEMINI = async () => {
    setLoading(true)
    try {
      // ローカル・リモートでエンドポイント切り替え
      let endpoint = '/api/gemini/nihil'
      if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      ) {
        // 例: Vercel等の本番環境
        endpoint = 'https://hakkason-react-project.vercel.app/api/gemini/nihil'
      }
      const res = await fetch(endpoint, {
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
