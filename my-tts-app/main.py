from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import uuid
import os
import httpx

# Tortoise TTSを読み込み
from tortoise.api import TextToSpeech, TextToSpeechInput

# 音声保存先ディレクトリ
OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# TTSモデル初期化
tts = TextToSpeech(
    voice_dir="C:/Hakason/tortoise/voices",  # voicesフォルダのパス
    models_dir="C:/Hakason/tortoise/models"   # modelsフォルダのパス
)

app = FastAPI()

# CORS設定（全許可にしています。必要に応じて変更してください）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# リクエストモデル
class TTSRequest(BaseModel):
    text: str

class GeminiRequest(BaseModel):
    pass  # 今回は入力なしでOK

# 音声生成API
@app.post("/generate")
async def generate_tts(req: TTSRequest):
    try:
        text = req.text
        filename = f"{uuid.uuid4().hex}.wav"
        filepath = os.path.join(OUTPUT_DIR, filename)

        print(f"[INFO] Generating speech from text: {text}")
        audio = tts.tts(TextToSpeechInput(text=text))
        audio.save(filepath)

        print(f"[INFO] Audio saved to {filepath}")
        return {"file": f"/outputs/{filename}"}

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})

# 音声ファイル返却API
@app.get("/outputs/{filename}")
async def get_audio(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        return JSONResponse(status_code=404, content={"error": "File not found"})
    return FileResponse(file_path, media_type="audio/wav")

# Gemini API呼び出し用API
@app.post("/api/gemini/nihil")
async def call_gemini(req: GeminiRequest):
    prompt = """
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
        return JSONResponse(status_code=500, content={"message": "Gemini APIキーが設定されていません"})

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key={api_key}",
                json={
                    "contents": [
                        {"parts": [{"text": prompt}]}
                    ]
                },
                headers={"Content-Type": "application/json"},
            )
            data = res.json()
            full = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            japanese, _, romaji = full.partition("\n\n")
            return {"message": japanese.strip(), "romaji": romaji.strip()}

    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Gemini API呼び出し失敗: {e}"})
