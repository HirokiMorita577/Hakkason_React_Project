import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [nihilMessage, setNihilMessage] = useState("まだ何も生成されていません");
  const [loading, setLoading] = useState(false);
  const [bgActive, setBgActive] = useState(false);
  const [bgImage, setBgImage] = useState(null);
  const [lastBgIndex, setLastBgIndex] = useState(-1);
  const [gifPathList, setGifPathList] = useState([]);

  const audioRef = useRef(null);

  const subjects = ["記憶", "存在", "未来", "思考", "痛み", "光", "空虚"];
  const verbs = ["は崩れる", "は意味を失う", "は再構成される", "に価値はない", "が繰り返される", "が錯覚に過ぎない"];
  const endings = [
    "ために生まれた。",
    "が唯一の真実だ。",
    "それが無である証明だ。",
    "そしてすべてが終わる。",
    "そして誰も覚えていない。",
    "それでいて、それでしかない。",
    "ここでは駐車係の仕事すらないんだ！"
  ];

  // public/audio に入っているファイルのパス（ファイル名がわかっている前提）
  const songList = [
    "/audio/test_1.wav",
    "/audio/test_2.wav"
  ];

  useEffect(() => {
    const modules = import.meta.glob('./assets/img/*.gif', { query: '?url', import: 'default', eager: true });
    setGifPathList(Object.values(modules));
  }, []);

  const getgifimg = (idx) => {
    if (!gifPathList.length) return null;
    return gifPathList[idx % gifPathList.length];
  };

  const playRandomSong = () => {
    if (!songList.length) return;
    const idx = Math.floor(Math.random() * songList.length);
    if (audioRef.current) {
      audioRef.current.src = songList[idx];
      audioRef.current.play();
    }
  };

  const callGEMINI = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/gemini/nihil';
      if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      ) {
        endpoint = 'https://hakkason-react-project.vercel.app/api/gemini/nihil';
      }
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await res.json();
      if (data.message) {
        playRandomSong();
      }
      return data.message || "APIからの応答が不正です";
    } catch (error) {
      setNihilMessage("エラーが発生しました: " + error.message);
    } finally {
      setLoading(false);
    }
    return "null";
  };

  const speakAsEinstein = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = speechSynthesis.getVoices().find(v => v.name.includes("Google UK English Male")) || null;
    if (voice) utterance.voice = voice;
    utterance.rate = 0.85;
    utterance.pitch = 0.8;
    speechSynthesis.speak(utterance);
  };

  const handleClick = async () => {
    setLoading(true);
    setTimeout(async () => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * gifPathList.length);
      } while (newIndex === lastBgIndex && gifPathList.length > 1);

      setLastBgIndex(newIndex);

      playRandomSong();
      const message = await callGEMINI();
      setBgImage(gifPathList[newIndex]);
      setNihilMessage(message);
      speakAsEinstein(message);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (bgImage) {
      setBgActive(true);
      console.log("背景画像がセットされました:", bgImage);
    }
  }, [bgImage]);

  return (
    <>
      {/* 背景GIF */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: bgActive && bgImage ? `url(${bgImage})` : 'none',
        }}
      />

      {/* メインコンテンツ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1>Vite + React</h1>
        <div className="card">
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
      </div>

      <audio ref={audioRef} />
    </>
  );
}

export default App;
