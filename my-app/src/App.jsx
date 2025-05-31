import { useRef ,useState } from 'react'
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [nihilMessage, setNihilMessage] = useState("まだ何も生成されていません");
  const [loading, setLoading] = useState(false);

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
  };

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      playRandomSong(); // ランダムな曲を再生
      const message = callGEMINI();
      setNihilMessage(message);
      speakAsEinstein(message);
      setLoading(false);
    }, 1000); // 1秒ディレイ（演出）
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        {/* でっかいニヒリズムボタン */}
        <button
          onClick={handleClick}
          disabled={loading}
          style={{
            marginTop: '2rem',
            marginBottom: '2rem',
            padding: '2.5rem 5rem',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            borderRadius: '2rem',
            background: 'linear-gradient(90deg, #232526 0%, #414345 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
            letterSpacing: '0.2em',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'transform 0.1s',
            transform: loading ? 'scale(0.98)' : 'scale(1)'
          }}
        >
          {loading ? "虚無を生成中…" : "ニヒリズム"}
        </button>
        <div
          style={{
            marginTop: '2.5rem',
            marginBottom: '1.5rem',
            fontSize: '2rem',
            fontWeight: 600,
            color: '#e0e0e0',
            textAlign: 'center',
            lineHeight: 1.6,
            letterSpacing: '0.05em',
            textShadow: '0 2px 12px rgba(0,0,0,0.35), 0 1px 0 #444',
            padding: '1.5rem 1rem',
            borderRadius: '1.2rem',
            background: 'rgba(30,30,35,0.55)',
            minHeight: '3.5em',
            boxSizing: 'border-box',
            wordBreak: 'break-word',
            border: '1px solid rgba(255,255,255,0.08)',
            maxWidth: '90%',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          {nihilMessage}
        </div>
      </div>

      <audio ref={audioRef} />
    </>
  )
}

export default App
