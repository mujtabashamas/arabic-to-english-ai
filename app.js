const fs = require('fs-extra');
const tesseract = require('node-tesseract-ocr');
const OpenAI = require('openai');
const { PDFDocument, rgb } = require('pdf-lib');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ocrConfig = {
  lang: 'ara',
  oem: 1,
  psm: 6,
  dpi: 300,
  preserve_interword_spaces: 1,
  tessdata_dir: '/usr/share/tesseract-ocr/4.00/tessdata/',
};

// Read PDF file from local path
async function readPdfFile(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    return buffer;
  } catch (error) {
    console.error('Error reading PDF file:', error);
    throw error;
  }
}

// Convert PDF to Images using pdf-to-img
async function convertPdfToImages(pdfBuffer) {
  const images = [];
  const { pdf } = await import('pdf-to-img');

  const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

  try {
    const document = await pdf(pdfDataUrl, { scale: 4 });
    let pageCount = 0;

    for await (const image of document) {
      images.push(image);
      pageCount++;

      if (pageCount >= 3) break;
    }
  } catch (error) {
    console.error('Error converting PDF to images:', error);
  }
  return images;
}

async function performOCR(images) {
  const ocrResults = [];

  for (const image of images) {
    try {
      const tempImagePath = `./temp_${Date.now()}.png`;
      const imageBuffer = Buffer.from(image, 'base64');
      await fs.writeFile(tempImagePath, imageBuffer);

      const text = await tesseract.recognize(tempImagePath, ocrConfig);
      console.log('OCR Result:', text);
      ocrResults.push(text);

      await fs.unlink(tempImagePath);
    } catch (error) {
      console.error('Error during OCR processing:', error.message);
    }
  }

  return ocrResults;
}

async function translateToEnglish(arabicText) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a translator specializing in Arabic to English translation. If you receive text that appears to be incorrectly recognized, please indicate that and explain what might be wrong with the input."
        },
        {
          role: "user",
          content: `Please translate the following text to English. If the text appears to be incorrectly recognized Arabic, please indicate that:

${arabicText}`
        }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Translation Error:', error);
    throw error;
  }
}

async function createNewPDF(translatedText, outputPath) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  page.drawText(translatedText, {
    x: 50,
    y: height - 50,
    size: 12,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
}

async function processDocument(inputPdfPath, outputPdfPath) {
  try {
    console.log('Reading PDF file...');
    const pdfBuffer = await readPdfFile(inputPdfPath);

    console.log('Converting PDF to images...');
    const images = await convertPdfToImages(pdfBuffer);

    console.log('Performing OCR...');
    const ocrResults = await performOCR(images);

    const arabicText = ocrResults.join('\n');
    console.log(arabicText);
    console.log('Translating text...');
    const englishText = await translateToEnglish(arabicText);

    // console.log('Creating output PDF...');
    await createNewPDF(englishText, outputPdfPath);

    return {
      originalText: arabicText,
      translatedText: englishText
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

// Usage example:
processDocument('input.pdf', 'output.pdf')
  .then(result => {
    console.log('Process completed successfully!');
    console.log('Original text:', result.originalText);
    console.log('Translated text:', result.translatedText);
  })
  .catch(err => {
    console.error('Error:', err);
  });
