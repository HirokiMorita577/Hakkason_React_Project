import { useState  } from 'react'
import './App.css'

function App() {
  const [nihilMessage, setNihilMessage] = useState("まだ何も生成されていません")
  const [loading, setLoading] = useState(false)

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
      const message = generateNihilism();
      setNihilMessage(message);
      speakAsEinstein(message);
      setLoading(false);
    }, 1000); // 1秒ディレイ（演出）
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

        {/* ニヒリズムボタン */}
        <button onClick={handleClick} disabled={loading} style={{ marginTop: '1rem' }}>
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
