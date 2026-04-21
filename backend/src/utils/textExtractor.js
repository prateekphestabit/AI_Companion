const path = require("path");
const logger = require("./logger");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
async function extractFileText(file) {
  try {
    const buffer = file.buffer;
    const ext = path.extname(file.originalname).toLowerCase();
    let text = "";
    if (ext === '.txt') text = buffer.toString("utf8");
    else if(ext === '.pdf') text = (await pdfParse(buffer)).text;
    else if(ext === '.docx') text = (await mammoth.extractRawText({ buffer })).value;
    else throw new Error("Unsupported file type");

    return text.replace(/\r\n/g, "\n")      // windows line breaks
    .replace(/\n{2,}/g, "\n")   // many new lines -> one
    .replace(/[ \t]{2,}/g, " ") // extra spaces
    .trim();
  } catch (error) {
    logger.error(`Error in textExtractor: ${error.message}`);
    throw error;
  }
}

module.exports = { extractFileText };