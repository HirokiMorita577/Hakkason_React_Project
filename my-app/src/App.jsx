import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [nihilMessage, setNihilMessage] = useState("まだ何も生成されていません");
  const [loading, setLoading] = useState(false);
  const [bgActive, setBgActive] = useState(false);
  const [bgImage, setBgImage] = useState(null);
  const [lastBgIndex, setLastBgIndex] = useState(-1);
  const [imgPathList, setImgPathList] = useState([]);
  const imgPathListRef = useRef([]); // 追加
  const [audioList, setAudioList] = useState([]);

  const audioRef = useRef(null);

  useEffect(() => {
    const audioModules = import.meta.glob('./assets/audio/*.{mp3,wav,ogg}', {
      eager: true,
      import: 'default',
      query: '?url'
    });
    setAudioList(Object.values(audioModules));

    const imageModules = import.meta.glob('./assets/img/*.{gif,jpg,jpeg,png}', {
      eager: true,
      import: 'default',
      query: '?url'
    });
    const imgList = Object.values(imageModules);
    setImgPathList(imgList);
    imgPathListRef.current = imgList; // 追加
    console.log("画像リスト:", imgList); // ここで中身を確認
  }, []);

  // 音声認識で「押して」などを検知し、処理を分離
  useEffect(() => {
    // Web Speech API の SpeechRecognition を利用
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("このブラウザは音声認識に対応していません。");
      return;
    }

    let recognition;
    let isUnmounted = false; // クリーンアップ判定用

    try {
      recognition = new SpeechRecognition();
    } catch (e) {
      console.warn("音声認識の初期化に失敗しました:", e);
      return;
    }

    recognition.lang = 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      if (!isUnmounted) console.log("音声認識が開始されました（マイク接続OK）");
    };

    recognition.onaudiostart = () => {
      if (!isUnmounted) console.log("マイクから音声入力を検出しました");
    };

    recognition.onaudioend = () => {
      if (!isUnmounted) console.log("マイク入力が終了しました");
    };

    // 音声認識結果を処理する関数
    const handleTranscript = (transcript) => {
      console.log("音声認識結果:", transcript);
      if (
        transcript.includes('押して') ||
        transcript.includes('をして') ||
        transcript.includes('おして')
      ) {
        if (!loading) handleClick();
      }
      if (transcript.includes('うるさい')) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        // 音声合成も止める
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      }
      // 「背景」と「猫」が両方含まれていたらcat画像またはneko画像からランダム
      if (
        (transcript.includes('背景') || transcript.includes('はいけい')) &&
        transcript.includes('猫')
      ) {
        const catImgs = imgPathListRef.current.filter(path =>
          path.toLowerCase().includes('cat') || path.toLowerCase().includes('neko')
        );
        if (catImgs.length > 0) {
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * catImgs.length);
          } while (
            catImgs.length > 1 &&
            catImgs[newIndex] === bgImage
          );
          setBgImage(catImgs[newIndex]);
          setLastBgIndex(-1); // cat画像の場合は通常のインデックス管理をリセット
          console.log("猫背景画像を変更しました:", catImgs[newIndex]);
        }
        return; // 他の背景処理はスキップ
      }
      if (
        transcript.includes('変えて') ||
        transcript.includes('かえて') ||
        transcript.includes('帰って')
      ) {
        // 背景だけ変える
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * imgPathListRef.current.length);
        } while (newIndex === lastBgIndex && imgPathListRef.current.length > 1);
        setLastBgIndex(newIndex);
        setBgImage(imgPathListRef.current[newIndex]);
        console.log("背景画像を変更しました:", imgPathListRef.current);
        console.log("背景画像を変更しました:", newIndex);
        console.log("背景画像を変更しました:", imgPathListRef.current[newIndex]);
      }
    };

    // onresultで認識結果をhandleTranscriptに渡す
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          handleTranscript(transcript);
        }
      }
    };

    recognition.onerror = (e) => {
      console.warn('音声認識エラー:', e);
    };

    recognition.onend = () => {
      if (!isUnmounted) {
        console.log("音声認識が終了しました。再開します。");
        setTimeout(() => {
          if (!isUnmounted) recognition.start();
        }, 500);
      }
    };

    recognition.start();

    return () => {
      isUnmounted = true;
      recognition.abort();
    };
  }, []); // 依存配列を空にしてマウント時のみセット

  const getBgImage = (idx) => {
    if (!imgPathList.length) return null;
    return imgPathList[idx % imgPathList.length];
  };

  const generateAudio = async (text) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTPエラー ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const audio = new Audio("http://127.0.0.1:8000" + data.file);
      audio.play();
    } catch (e) {
      console.error("音声再生エラー:", e);
      alert("音声再生に失敗しました: " + e.message);
    }
  };

  const playRandomSong = () => {
    if (!audioList.length) return;
    const idx = Math.floor(Math.random() * audioList.length);
    const path = audioList[idx];
    if (audioRef.current) {
      audioRef.current.src = path;
      audioRef.current.play();
    }
  };

  // ここでAPIキーを送信してGemini API呼び出し
  const callGEMINI = async (apiKey) => {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey }), // APIキーをここで送る
      });

      const data = await res.json();
      return {
        message: data.message || "APIからの応答が不正です",
        romaji: data.romaji || ""
      };
    } catch (error) {
      return {
        message: "エラーが発生しました: " + error.message,
        romaji: ""
      };
    } finally {
      setLoading(false);
    }
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
    // ここに友達からもらったAPIキーをセットしてください
    const friendApiKey = "ここにAPIキーを入れてください";

    setLoading(true);
    setTimeout(async () => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * imgPathList.length);
      } while (newIndex === lastBgIndex && imgPathList.length > 1);

      setLastBgIndex(newIndex);
      playRandomSong();
      const { message, romaji } = await callGEMINI(friendApiKey);
      setBgImage(imgPathList[newIndex]);
      setNihilMessage(message);
      if (romaji) {
        generateAudio(romaji);
      } else {
        speakAsEinstein(message);
      }
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
