// Root.jsx
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

// This function will extract text from a file based on its type
export async function fetchChatWithFiles(rubricFile, lessonFile, courseFile) {
  const parsedTexts = await Promise.all([
    parseFile(rubricFile),
    parseFile(lessonFile),
    parseFile(courseFile),
  ]);

  // For now, just return raw text to render in <p>
  return parsedTexts.join("\n\n");
}

// Main parser logic
async function parseFile(file) {
  const fileType = file.type;

  if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // DOCX
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else if (fileType === "application/pdf") {
    // PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      pages.push(pageText);
    }

    return pages.join("\n\n");
  } else if (fileType === "text/plain") {
    // TXT
    return await file.text();
  } else {
    return `Unsupported file type: ${file.name}`;
  }
}

// This can later be improved for tokenization, chat streaming, etc.
export function ChatOutput({ response }) {
  return (
    <div>
      {response.split("\n\n").map((para, idx) => (
        <p key={idx}>{para}</p>
      ))}
    </div>
  );
}