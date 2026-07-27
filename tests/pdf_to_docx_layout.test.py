"""Acceptance checks for page dimensions and orientation in PDF-to-DOCX conversion.

Run with the project virtual environment:
    .venv/bin/python tests/pdf_to_docx_layout.test.py
"""

import subprocess
import sys
import tempfile
from io import BytesIO
from pathlib import Path

from docx import Document
from PIL import Image
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas

ROOT = Path(__file__).resolve().parents[1]
CONVERTER = ROOT / "scripts" / "pdf_to_docx.py"


def close_enough(left, right, tolerance=3):
    return abs(left - right) <= tolerance


def create_pdf(path, page_size, complex_layout=False):
    canvas = Canvas(str(path), pagesize=page_size)
    width, height = page_size
    canvas.setFont("Helvetica", 14)
    canvas.drawString(48, height - 52, "Knight Wisdom conversion layout test")
    canvas.setFont("Helvetica", 10)
    canvas.drawString(48, height - 78, "The content should retain the page size and orientation.")
    if complex_layout:
        image_buffer = BytesIO()
        Image.new("RGB", (40, 40), "#6b5ce7").save(image_buffer, format="PNG")
        image_buffer.seek(0)
        canvas.drawImage(ImageReader(image_buffer), 50, height - 180, width=80, height=80)
        for row in range(4):
            for column in range(3):
                x, y = 170 + column * 100, height - 100 - row * 35
                canvas.rect(x, y, 100, 35)
                canvas.drawString(x + 8, y + 12, f"R{row + 1} C{column + 1}")
    canvas.showPage()
    canvas.save()


def convert_and_check(pdf_path, expected_size):
    docx_path = pdf_path.with_suffix(".docx")
    result = subprocess.run([sys.executable, str(CONVERTER), str(pdf_path), str(docx_path)], check=True, capture_output=True, text=True)
    assert result.stdout, "converter did not produce debug output"
    section = Document(docx_path).sections[0]
    expected_width, expected_height = expected_size
    assert close_enough(section.page_width.pt, expected_width), (section.page_width.pt, expected_width)
    assert close_enough(section.page_height.pt, expected_height), (section.page_height.pt, expected_height)


def main():
    with tempfile.TemporaryDirectory(prefix="knightwisdom-layout-") as directory:
        directory = Path(directory)
        cases = [
            ("a4-text.pdf", A4, False),
            ("a4-table-image.pdf", A4, True),
            ("landscape.pdf", landscape(A4), True),
        ]
        for filename, page_size, complex_layout in cases:
            path = directory / filename
            create_pdf(path, page_size, complex_layout)
            convert_and_check(path, page_size)
            print(f"PASS: {filename}")


if __name__ == "__main__":
    main()
