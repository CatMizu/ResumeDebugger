const {DocumentProcessorServiceClient} = require('@google-cloud/documentai').v1;
const tokenManager = require('../utils/getTokenWithServiceAccount');
const axios = require('axios');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

API_ENDPOINT="us-central1-aiplatform.googleapis.com";
PROJECT_ID="hackathon-389018";
MODEL_ID="text-bison"
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
async function generateResponseToQuestion(resumeInformation, question) {
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
          { content: `Resume: ${resumeInformation} \n ${question}` } 
      ],
      parameters: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          topP: 0.8, 
          topK: 40   
      }
  };

  // Send the request and return the response.
  try {
      const response = await axios.post(
        `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:predict`,
        data,
        { headers }
      );
      return response.data.predictions[0].content;
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
async function convertPdfToText(pdfBase64String) {
  
  const client = new DocumentProcessorServiceClient();
  const name = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;

  const request = {
    name,
    rawDocument: {
      content: pdfBase64String,
      mimeType: 'application/pdf',
    },
  };

  try {
    const [result] = await client.processDocument(request);
    return result.document.text;
  } catch (error) {
    throw new ApiError(`Error during Document AI API call: ${error}`);
  }
}

module.exports = {
  generateResponseToQuestion,
  convertPdfToText,
};
