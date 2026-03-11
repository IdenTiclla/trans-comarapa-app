---
name: educational-docs
description: Generate professional PDF educational documents from a given topic or content. Use this skill whenever the user asks to create a PDF, presentation, educational learning material, report, or technical documentation.
author: Iden Ticlla
---

# PDF Educational Docs Generator

This skill enables you to create professional, university-grade educational material in PDF format. It uses advanced formatting to produce high-quality documents quickly and efficiently, incorporating hand-drawn style illustrations with annotations and doodles.

## Overview
The PDF Generation skill allows users to create professional PDF documents based on a specified topic or content. Once the user provides a topic, the skill will analyze the input and generate a formatted PDF document that is visually appealing, professionally structured, and highly didactic, making it perfect for educational purposes, reports, technical documentation, or business proposals.

## Features
- **Sole Output**: Only generates professional PDF documents (no PowerPoint).
- **Professional Hand-Drawn Images**: Generates and embeds highly didactic, hand-drawn style illustrations with explanations, annotations, and doodles (e.g., using the `generate_image` tool with prompts specifying "sketched by hand, whiteboard style doodle, annotations, educational, clean white background").
- **Structured Layout**: Includes a title page, table of contents, logical sections, and page breaks.
- **Custom Formatting**: Employs customized page size, orientation, margins, and professional fonts.
- **Header & Footer**: Adds headers, footers, and page numbers automatically.
- **Embedded Media**: Embeds images while maintaining proper aspect ratios and quality.
- **Optimized Output**: Optimizes file size and supports compression options.
- **Metadata**: Includes creation date, author, and title information.

## Workflow & Implementation Process

1. **Information Gathering & Content Analysis**: 
   - Ask the user for the topic or content if not fully specified.
   - Analyze the topic to create logical sections.
2. **Image Generation**: 
   - Proactively use your `generate_image` tool to create at least 1-2 images for the document.
   - **Crucial Image Style**: Prompt the image generator specifically for "professional hand-drawn sketch, doodle style, educational annotations, whiteboard or clean paper background, clear diagrams". Do NOT use realistic or 3D styles.
3. **Script Writing**:
   - Write a Python script to generate the PDF (e.g., in `/tmp/generate_pdf.py`).
   - Use a robust PDF library such as `fpdf2` or `reportlab`.
   - Ensure you add metadata (title, author, creation date).
   - Create a title page, table of contents, and insert the generated doodle images in the appropriate sections.
4. **Execution**: 
   - Run the Python script using the terminal tool to generate the file.
5. **Confirmation**: 
   - Verify the PDF was created and return the file path to the user.

## Dependencies Configuration
If the required libraries are not installed in the user's environment, write a script to install them in a virtual environment. Common libraries needed:
- PDF generation: `fpdf2` or `reportlab`
- Image embedding: `Pillow` (PIL)

## Output Specifications

### Output Location
- **Directory**: Must be saved inside the `/home/iden/Desktop/trans-comarapa-app/educational_docs/` folder (create it if it doesn't exist).
- **File Naming Convention**: `presentation_[topic]_[timestamp].pdf` (e.g., `presentation_Agent_Skills_2026-03-09.pdf`).

### Technical Details
- **Format**: Standard PDF (compatible with all PDF readers).
- **Compression**: Optimized for file size without quality loss.
- **Compatibility**: Generated PDFs work across all platforms and devices.

## Example
If the user asks for a report about "The Benefits of Remote Work", the skill will generate hand-drawn doodle images illustrating remote work concepts, write a Python script using `fpdf2`, and output `/home/iden/Desktop/trans-comarapa-app/educational_docs/presentation_Remote_Work_Benefits_2026-03-09.pdf` containing a title page, table of contents, pages with text and doodles, page numbers, and professional styling.
