const {DocumentProcessorServiceClient} = require('@google-cloud/documentai').v1;
const tokenManager = require('../utils/getTokenWithServiceAccount');
const axios = require('axios');
const ApiError = require('../utils/ApiError');

const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');
const {GoogleAuth} = require('google-auth-library');

API_ENDPOINT="us-central1-aiplatform.googleapis.com"
PROJECT_ID="hackathon-389018"
MODEL_ID="text-bison@001"
PROCESSOR_ID = 'aab87c1a73025336'; // Replace with your processor ID
LOCATION = 'us'; // Replace with your processor location

/**
 * This function sends a request to a Vertex AI language model
 * to generate a response to a given prompt (the input question).
 *
 * @param {String} question The question to generate a response for.
 * @returns {Promise<Object>} The response from the Vertex AI API.
 * @throws {Error} If there's an error during the API call.
 */
async function generateResponseToQuestion(question) {
  // Get the access token.
  const accessToken = await tokenManager.getAccessToken();

  // Define the request headers.
  const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
  };

  // Define the request data. The prompt is the input question.
  const data = {
      instances: [
          { content: question } 
      ],
      parameters: {
          temperature: 0.5,
          maxOutputTokens: 256,
          topP: 0.8, 
          topK: 40   
      }
  };

  // Send the request and return the response.
  try {
      const response = await axios.post(`https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:predict`, data, { headers });
      return response.data;
  } catch (error) {
      throw new ApiError(`Error during Vertex AI API call: ${error}`);
  }
}

/**
 * This function converts a Base64 encoded PDF string into a JSON document.
 *
 * @param {String} pdfBase64String A Base64 encoded string containing the content of the PDF file.
 * @returns {Promise<String>} A string representation of the processed JSON document.
 * @throws {ApiError} If there's an error during the Document AI API call.
 */
async function convertPdfToJson(pdfBase64Stringg) {

  const filePath = path.join(__dirname, '../../functionalsample.pdf');

  // Read the file from the filesystem and convert it to a Base64 string
  const pdfFile = fs.readFileSync(filePath);
  const pdfBase64String = Buffer.from(pdfFile).toString('base64');
  
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  
  const client = new DocumentProcessorServiceClient();
  // Define the name of the processor to call
  const name = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;

  // Define the API request parameters
  const request = {
    name,
    rawDocument: {
      content: pdfBase64String,
      mimeType: 'application/pdf',
    },
  };

  try {
    // Call the Document AI API to process the document
    const [result] = await client.processDocument(request);
    const {document} = result;
    const {text} = document;

  // Extract shards from the text field
  const getText = textAnchor => {
    if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
      return '';
    }

    // First shard in document doesn't have startIndex property
    const startIndex = textAnchor.textSegments[0].startIndex || 0;
    const endIndex = textAnchor.textSegments[0].endIndex;

    return text.substring(startIndex, endIndex);
  };

  // Read the text recognition output from the processor
  console.log('The document contains the following paragraphs:');
  const [page1] = document.pages;
  const {paragraphs} = page1;

  for (const paragraph of paragraphs) {
    const paragraphText = getText(paragraph.layout.textAnchor);
    console.log(`Paragraph text:\n${paragraphText}`);
  }

    return text;
  } catch (error) {
    logger.info(error);
    // If there's an error during the API call, throw an error
    throw new ApiError(`Error during Document AI API call: ${error}`);
  }
}

module.exports = {
  generateResponseToQuestion,
  convertPdfToJson,
};
