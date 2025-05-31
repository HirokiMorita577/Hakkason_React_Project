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
      console.log(`Playing song: ${songs[idx]}`)
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
      if(data.message){
        playRandomSong();
      }
      return data.message || "APIからの応答が不正です"
    } catch (error) {
      setNihilMessage("エラーが発生しました: " + error.message)
    } finally {
      setLoading(false)
    }
    return "null";
  }

  // 構成パーツ
  const subjects = ["記憶", "存在", "未来", "思考", "痛み", "光", "空虚"];
  const verbs = ["は崩れる", "は意味を失う", "は再構成される", "に価値はない", "が繰り返される", "が錯覚に過ぎない"];
  const endings = [
    "ために生まれた。",
    "が唯一の真実だ。",
    "それが無である証明だ。",
    "そしてすべてが終わる。",
    "そして誰も覚えていない。",
    "それでいて、それでしかない。"
  ];

  // アインシュタイン風に読み上げ
  const speakAsEinstein = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = speechSynthesis.getVoices().find(v => v.name.includes("Google UK English Male")) || null;
    if (voice) utterance.voice = voice;
    utterance.rate = 0.85;
    utterance.pitch = 0.8;
    speechSynthesis.speak(utterance);
  };

  // メッセージ生成
  const generateNihilism = () => {
    const s = subjects[Math.floor(Math.random() * subjects.length)];
    const v = verbs[Math.floor(Math.random() * verbs.length)];
    const e = endings[Math.floor(Math.random() * endings.length)];
    return `${s}${v}${e}`;
  }

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      const message = callGEMINI();
      setNihilMessage(message);
      speakAsEinstein(message);
      setLoading(false);
    }, 1000); // 1秒ディレイ（演出）
  }

  return (
    <>
      <div className="card">

        {/* ニヒリズムボタン */}
        <button onClick={handleClick} disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? "虚無を生成中…" : "ニヒリズムを生成"}
        </button>
        <p style={{ marginTop: '1rem' }}>{nihilMessage}</p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <audio ref={audioRef} />
    </>
  )
}

export default App
