from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import subprocess
import tempfile
import os

app = FastAPI(title="JSON ⇄ TOON Converter API")

# Enable CORS for frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)


def run_converter(stdin_text: str, args: list[str]) -> str:
    """Run the json_to_toon CLI as a subprocess."""
    process = subprocess.run(
        ["python", "json_to_toon.py", "-", *args],
        input=stdin_text.encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if process.returncode != 0:
        raise RuntimeError(process.stderr.decode("utf-8")[:4000])
    return process.stdout.decode("utf-8")


@app.post("/api/convert")
async def convert(
    mode: str = Form(...),
    root: str | None = Form(None),
    delimiter: str = Form("comma"),
    indent: int = Form(2),
    length_marker: str | None = Form(None),
    coerce: str | None = Form(None),
    pretty: str | None = Form(None),
    ensure_ascii: str | None = Form(None),
    file: UploadFile | None = None,
    text: str | None = Form(None),
):
    """Main conversion endpoint."""
    raw = (await file.read()).decode("utf-8", "replace") if file else (text or "")
    if not raw.strip():
        return JSONResponse({"ok": False, "error": "Empty input."}, status_code=400)

    try:
        if mode == "json2toon":
            args = ["--indent", str(indent), "--delimiter", delimiter]
            if root:
                args += ["--root", root]
            if length_marker:
                args += ["--length-marker"]
            if coerce:
                args += ["--coerce"]
            output = run_converter(raw, args)
            filename = (file.filename if file else "input.json").rsplit(".", 1)[0] + ".toon"

        elif mode == "toon2json":
            args = ["--mode", "toon2json"]
            if pretty:
                args += ["--pretty"]
            if ensure_ascii:
                args += ["--ensure-ascii"]
            output = run_converter(raw, args)
            filename = (file.filename if file else "input.toon").rsplit(".", 1)[0] + ".json"

        else:
            return JSONResponse({"ok": False, "error": "Invalid mode"}, status_code=400)

        return {"ok": True, "filename": filename, "content": output}

    except Exception as e:
        return {"ok": False, "error": str(e)}


@app.get("/")
def root():
    return {"message": "Welcome to the JSON ⇄ TOON Converter API"}
