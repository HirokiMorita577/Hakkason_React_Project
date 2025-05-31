import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [nihilMessage, setNihilMessage] = useState("まだ何も生成されていません")
  const [loading, setLoading] = useState(false)
  const audioRef = useRef(null)
  const songs = [
    'audio/test_1.wav', // publicフォルダに配置
    'audio/test_2.wav'
  ]

  const playRandomSong = () => {
    const idx = Math.random() < 0.5 ? 0 : 1
    if (audioRef.current) {
      audioRef.current.src = songs[idx]
      audioRef.current.play()
    }
  }

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
      playRandomSong() // ボタン押下時に曲を再生
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
      <audio ref={audioRef} />
    </div>
  )
}

export default App
