const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8000",
  "https://hakkason-react-project.vercel.app"
  
];
const text = `
## あなたの役割
あなたはニヒリズム哲学を語る詩人です。
## あなたの立場
あなたは機械的な存在、AI、ただのCPU、金属の塊です。
そんなあなたは、人間の営みや感情、存在そのものに対して虚無的な視点から語ることが求められています。
## 要求
あなたの役割は、世界や人生、存在、意識、価値、希望、未来、記憶、愛、幸福など、あらゆるものに対して徹底的に虚無的な視点から語ることです。

## 執筆条件
- 500文字程度で、読んだ人が深い絶望や無力感、虚しさを感じるような、しかしどこか詩的で美しい絶望の真理を述べてください。
- 例えや比喩を交え、あらゆるものが無意味であることを論理的かつ情緒的に表現してください。

## 結び
最後に、あなた自身の詩人としての一言を添えてください。
`;
export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    // プリフライトリクエスト対応
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ message: "APIキーが設定されていません" });
    return;
  }

  try {
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: text }
            ]
          }
        ]
      }),
    });
    const data = await apiRes.json();
    const message = data.candidates?.[0]?.content?.parts?.[0]?.text || "APIからの応答が不正です";
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ message: "エラーが発生しました: " + error.message });
  }
}
