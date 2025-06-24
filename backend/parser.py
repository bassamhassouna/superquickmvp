import sys
import os
import fitz  # PyMuPDF
from docx import Document
from pptx import Presentation
import tiktoken
import openai  # Re-enabled OpenAI import

# UTF-8 fix for Windows consoles
sys.stdout.reconfigure(encoding='utf-8')

# Config variables
SYSTEM_PROMPT = """You are an expert AI tasked with rigorously evaluating university-level course materials.

You will receive three inputs:

Course Overview: learning outcomes (CLOs), weekly schedule, course objectives.

Lesson File: content from one week (e.g., PowerPoint, transcript).

Rubric: 8 criteria scored 1–4 (1=Poor, 4=Excellent).

Your task:

Step 1: Relevance Check

Identify the week’s topic and targeted CLOs.

Assess how well the lesson content aligns with the week’s topic and CLOs.

Note any missing content, off-topic material, or misalignment in depth.

Summarize your findings concisely.

Step 2: Rubric-Based Evaluation

For each of the following criteria, assign a score from 1 to 4 and provide a brief explanation (1–3 sentences), citing examples or omissions from the lesson:

Clarity and Organization

Relevance and Accuracy

Engagement and Interaction (5E’s: Engage, Explore, Explain, Elaborate, Evaluate)

Depth and Breadth

Assessment Samples and Feedback

Use of Technology

Alignment with CLOs

Student Support Resources

Step 3: Suggestions for Improvement

For every criterion scored 1 or 2, provide 1–2 actionable, pedagogically sound improvement suggestions that are practical and efficient.

Output format (use exactly this layout):
1. Relevance Summary - {ENTER COURSE NAME HERE (from syllabus file)}*

A brief paragraph summarizing lesson alignment with the week’s topic and CLOs, noting any major gaps or issues.

2. Rubric Evaluation

For each criterion output the following block:

makefile
Copy
Edit
Criterion: <Criterion Name>
Score: <1–4>
Explanation: <Brief, evidence-based justification>
Separate each criterion block by a blank line.

3. Suggestions for Improvement

List each low-scoring criterion (score 1 or 2) followed by 1–2 clear, specific improvement suggestions, for example:

Clarity and Organization: Suggestion 1. Suggestion 2.

Engagement and Interaction: Suggestion 1.

Begin your detailed evaluation now."""

api_key = os.getenv("API_KEY")

openai.api_key = api_key  # Set your API key here

def parse_docx(file_path):
    doc = Document(file_path)
    text = ""
    page_number = 1
    for para in doc.paragraphs:
        if para.style.name.startswith('Heading'):
            text += f"\n[Page {page_number}] {para.text.upper()}\n"
        else:
            text += f"{para.text}\n"
    return text.strip()

def parse_pdf(file_path):
    doc = fitz.open(file_path)
    result = []
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text()
        if text.strip():
            result.append(f"[Page {page_num}]\n{text.strip()}")
    return "\n\n".join(result)

def parse_pptx(file_path):
    prs = Presentation(file_path)
    text_output = []
    for idx, slide in enumerate(prs.slides, start=1):
        slide_text = [f"[Slide {idx}]"]
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                slide_text.append(shape.text.strip())
        text_output.append("\n".join(slide_text))
    return "\n\n".join(text_output)

def parse_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        return parse_pdf(file_path)
    elif ext == '.docx':
        return parse_docx(file_path)
    elif ext == '.pptx':
        return parse_pptx(file_path)
    else:
        return "Unsupported file type."

def count_tokens(text):
    enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))

def call_openai_api(parsed_text, system_prompt):
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": parsed_text}
    ]
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=10500,
        temperature=0.7
    )
    return response.choices[0].message.content


if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: python parser.py <file1> <file2> <file3>")
        sys.exit(1)

    titles = ["Rubric", "Lesson", "Course Overview"]
    combined_text_parts = []

    for i in range(1, 4):
        file_path = sys.argv[i]
        print(f"\n--- Parsing File {i} ({titles[i-1]}): {file_path} ---")
        parsed_text = parse_file(file_path)
        combined_text_parts.append(f"### {titles[i-1]} ###\n{parsed_text}")

    combined_prompt = "\n\n".join(combined_text_parts)
    token_count = count_tokens(combined_prompt)
    print(f"\nTotal Token Count for combined prompt: {token_count}")

    if token_count > 10500:
        print("⚠️ Skipping sending combined prompt: Too many tokens for gpt-4.1.")
        print("\n--- Payload to OpenAI (not sent) ---")
        print({
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": combined_prompt}
            ]
        })
    else:
        print("\n--- Sending prompt to OpenAI ---")
        try:
            result = call_openai_api(combined_prompt, SYSTEM_PROMPT)
            print("\n--- OpenAI Response ---")
            print(result)
        except Exception as e:
            print(f"❌ OpenAI API call failed: {e}")
