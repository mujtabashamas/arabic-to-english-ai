# Arabic to English AI Translator

A Node.js application that performs OCR on Arabic PDFs and translates the content to English using AI.

## Features

- PDF to Image conversion using 'pdf-to-img'
- Arabic text extraction using Tesseract OCR
- English translation using OpenAI's GPT-4
- Supports multiple page processing
- Outputs translated text to a new PDF

## Prerequisites

- Node.js (v16 or higher)
- Tesseract OCR with Arabic language support
- OpenAI API key

### Installing Tesseract OCR

Ubuntu/Debian:

```bash
sudo apt-get install tesseract-ocr libtesseract-dev tesseract-ocr-ara
```

MacOS:

```bash
brew install tesseract tesseract-lang
```

## Installation

```bash
npm install
```

## Usage

```javascript
const { processDocument } = require('./app.js');
processDocument('input.pdf', 'output.pdf')
  .then((result) => {
    console.log('Translation completed!');
  })
  .catch((err) => {
    console.error('Error:', err);
  });
```

## Future Goals

- Batch processing multiple PDFs
- Improved OCR accuracy for Arabic fonts
- Support for Arabic book formats
- Web interface for uploads
- Custom dictionary support
- Progress tracking
- Support for EPUB, MOBI
- Arabic handwriting recognition

## License

MIT License

## Project Status

Currently in development, focusing on:

1. OCR accuracy for Arabic fonts
2. Translation quality
3. Processing speed
4. Document format support

## Book Translation Goals

Future versions will support:

- Chapter detection
- Table of contents
- Footnotes
- Poetry formatting
- Right-to-left text
- Cultural context
- Academic citations
