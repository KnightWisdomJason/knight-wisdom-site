#!/usr/bin/env python3
"""Layout-aware PDF to DOCX conversion and diagnostics for Knight Wisdom."""

import json
import subprocess
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

import fitz
from docx import Document
from pdf2docx import Converter

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
WP_NS = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"


def fc_match(font_name):
    if not font_name:
        return None
    try:
        return subprocess.check_output(["fc-match", "-f", "%{family}", font_name], text=True, stderr=subprocess.DEVNULL).strip() or None
    except (OSError, subprocess.CalledProcessError):
        return None


def collect_pdf_debug(pdf_path):
    document = fitz.open(pdf_path)
    pages = []
    first_text = None
    fonts = []
    for index, page in enumerate(document):
        rect = page.rect
        rotation = page.rotation
        pages.append({"page": index + 1, "width_pt": rect.width, "height_pt": rect.height, "rotation": rotation, "orientation": "landscape" if rect.width > rect.height else "portrait"})
        if first_text is None:
            blocks = page.get_text("dict").get("blocks", [])
            for block in blocks:
                if block.get("type") != 0:
                    continue
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        first_text = {"x_pt": span["bbox"][0], "y_top_pt": span["bbox"][1], "width_pt": span["bbox"][2] - span["bbox"][0], "height_pt": span["bbox"][3] - span["bbox"][1], "font": span.get("font"), "font_size_pt": span.get("size"), "coordinate_origin": "top-left (PyMuPDF; PDF native coordinates are bottom-left)"}
                        break
                    if first_text:
                        break
                if first_text:
                    break
        for font in page.get_fonts(full=False):
            name = font[3]
            if name not in fonts:
                fonts.append(name)
    document.close()
    return {"pdf_pages": pages, "first_text_element": first_text, "font_matches": [{"pdf_font": name, "fontconfig_match": fc_match(name)} for name in fonts[:20]], "units": {"pdf_point_to_twip": 20, "pdf_point_to_emu": 12700, "pdf_coordinate_origin": "bottom-left", "docx_absolute_coordinate_origin": "top-left"}}


def collect_docx_debug(docx_path):
    document = Document(docx_path)
    sections = [{"page_width_twips": section.page_width.twips, "page_height_twips": section.page_height.twips, "left_margin_twips": section.left_margin.twips, "right_margin_twips": section.right_margin.twips, "top_margin_twips": section.top_margin.twips, "bottom_margin_twips": section.bottom_margin.twips, "gutter_twips": section.gutter.twips, "orientation": "landscape" if section.page_width > section.page_height else "portrait"} for section in document.sections]
    anchors = []
    with zipfile.ZipFile(docx_path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
        for anchor in root.findall(f".//{{{WP_NS}}}anchor")[:5]:
            position_h = anchor.find(f"{{{WP_NS}}}positionH")
            position_v = anchor.find(f"{{{WP_NS}}}positionV")
            anchors.append({"positionH_relativeFrom": position_h.get("relativeFrom") if position_h is not None else None, "positionH_posOffset_emu": position_h.findtext(f"{{{WP_NS}}}posOffset") if position_h is not None else None, "positionV_relativeFrom": position_v.get("relativeFrom") if position_v is not None else None, "positionV_posOffset_emu": position_v.findtext(f"{{{WP_NS}}}posOffset") if position_v is not None else None})
    return {"docx_sections": sections, "floating_objects": anchors, "first_written_x": anchors[0]["positionH_posOffset_emu"] if anchors else "No floating DrawingML object; text is laid out in normal DOCX flow."}


def main(input_path, output_path):
    debug = collect_pdf_debug(input_path)
    converter = Converter(input_path)
    try:
        converter.convert(output_path)
    finally:
        converter.close()
    if not Path(output_path).is_file():
        raise RuntimeError("pdf2docx completed without writing a DOCX file")
    debug.update(collect_docx_debug(output_path))
    print(json.dumps(debug, ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: pdf_to_docx.py INPUT.pdf OUTPUT.docx")
    main(sys.argv[1], sys.argv[2])
