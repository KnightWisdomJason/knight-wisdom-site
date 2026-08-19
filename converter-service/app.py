import hashlib, hmac, io, os, shutil, subprocess, tempfile, time
from pathlib import Path
import fitz
from docx import Document
from docx.enum.section import WD_SECTION
from docx.shared import Inches, Pt
from fastapi import FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

SECRET = os.environ.get("CONVERTER_SIGNING_SECRET", "")
MAX_BYTES = int(os.environ.get("MAX_UPLOAD_MB", "50")) * 1024 * 1024
origins = [item.strip() for item in os.environ.get("ALLOWED_ORIGINS", "https://knightwisdom.com").split(",") if item.strip()]
app = FastAPI(title="KnightWisdom Converter")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["POST"], allow_headers=["Content-Type", "X-Converter-Token"], max_age=600)

def authorize(token: str | None, action: str):
    if not SECRET or not token: raise HTTPException(401, "Converter authorization is unavailable")
    try: expiry, allowed, signature = token.split(".", 2); payload = f"{expiry}.{allowed}"; expected = hmac.new(SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
        
    except ValueError: raise HTTPException(401, "Invalid converter authorization")
    if not hmac.compare_digest(expected, signature) or int(expiry) < int(time.time()) or allowed != action: raise HTTPException(401, "Expired converter authorization")

async def save_upload(upload: UploadFile, folder: Path, suffix: str) -> Path:
    if not upload.filename or not upload.filename.lower().endswith(suffix): raise HTTPException(400, f"Please upload a {suffix} file")
    target = folder / f"source{suffix}"; total = 0
    with target.open("wb") as output:
        while chunk := await upload.read(1024 * 1024):
            total += len(chunk)
            if total > MAX_BYTES: raise HTTPException(413, "File is too large")
            output.write(chunk)
    return target

def cleanup(folder: Path): shutil.rmtree(folder, ignore_errors=True)

@app.get("/health")
def health(): return {"ok": True}

@app.post("/convert/word-to-pdf")
async def word_to_pdf(file: UploadFile = File(...), x_converter_token: str | None = Header(default=None)):
    authorize(x_converter_token, "word-to-pdf"); folder = Path(tempfile.mkdtemp(dir="/work")); source = await save_upload(file, folder, ".docx")
    try: subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(folder), str(source)], check=True, timeout=90, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception: cleanup(folder); raise HTTPException(422, "LibreOffice could not convert this document")
    result = folder / "source.pdf"
    if not result.exists(): cleanup(folder); raise HTTPException(422, "No PDF was created")
    return FileResponse(result, media_type="application/pdf", filename=f"{Path(file.filename).stem}.pdf", background=BackgroundTask(cleanup, folder))

@app.post("/convert/pdf-to-word")
async def pdf_to_word(file: UploadFile = File(...), x_converter_token: str | None = Header(default=None)):
    authorize(x_converter_token, "pdf-to-word"); folder = Path(tempfile.mkdtemp(dir="/work")); source = await save_upload(file, folder, ".pdf")
    try:
        pdf = fitz.open(source); document = Document(); document.sections[0].top_margin = document.sections[0].bottom_margin = document.sections[0].left_margin = document.sections[0].right_margin = Pt(0)
        for index, page in enumerate(pdf):
            rect = page.rect; section = document.sections[-1]; section.page_width = Pt(rect.width); section.page_height = Pt(rect.height)
            image = folder / f"page-{index}.png"; pixmap = page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5), alpha=False); pixmap.save(image)
            document.add_picture(str(image), width=Pt(rect.width), height=Pt(rect.height))
            if index < len(pdf) - 1: document.add_section(WD_SECTION.NEW_PAGE)
        result = folder / "result.docx"; document.save(result)
    except Exception: cleanup(folder); raise HTTPException(422, "This PDF could not be rendered")
    return FileResponse(result, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=f"{Path(file.filename).stem}.docx", background=BackgroundTask(cleanup, folder))
