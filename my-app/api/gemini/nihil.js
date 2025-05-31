export default async function handler(req, res) {
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
              { text: "あなたはニヒリズム哲学を語る詩人です。短くて絶望的な真理を述べてください。" }
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
