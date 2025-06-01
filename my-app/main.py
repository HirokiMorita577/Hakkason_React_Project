from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import uuid
import httpx

from tortoise.api import TextToSpeech, TextToSpeechInput

app = FastAPI()

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str

class GeminiRequest(BaseModel):
    pass  # 空でもよい（必要があれば入力を追加）

@app.post("/generate")
async def generate_audio(req: TTSRequest):
    try:
        text = req.text
        filename = f"{uuid.uuid4().hex}.wav"
        filepath = os.path.join(OUTPUT_DIR, filename)

        tts = TextToSpeech(voice_dir="tortoise/voices")
        tts.load_voice("einstein")
        audio = tts.tts(TextToSpeechInput(text=text))
        audio.save(filepath)

        return {"file": f"/outputs/{filename}"}

    except Exception as e:
        print("❌ 音声生成エラー:", str(e))
        return {"error": str(e)}

@app.post("/api/gemini/nihil")
async def call_gemini(_: GeminiRequest):
    prompt = r"""
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
- **最後に、全く同じ内容をローマ字表記でも出力してください**
- **ローマ字表記の際、読みやすさを重視して、ヘボン式に近い形で書いてください**
"""

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"message": "Gemini APIキーが設定されていません"}

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key={api_key}",
                json={
                    "contents": [
                        {
                            "parts": [{"text": prompt}]
                        }
                    ]
                },
                headers={"Content-Type": "application/json"}
            )
            data = res.json()
            full = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            japanese, _, romaji = full.partition("\n\n")
            return {"message": japanese.strip(), "romaji": romaji.strip()}

    except Exception as e:
        return {"message": f"Gemini API呼び出し失敗: {e}"}
