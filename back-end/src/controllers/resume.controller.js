const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { resumeService, vertexService } = require('../services');
const logger = require('../config/logger');

const submitResume = catchAsync(async (req, res) => {
  // 1. Convert the PDF resume to text.
  const resumeJSON = await vertexService.convertPdfToJson(req.body.file);
  logger.info(resumeJSON);

  // 2. Parse the resume text into a structured JSON object.
  // TODO: const resumeJson = await resumeParser.parseResume(resumeText, 'json');

  // 3. Generate a response to the resume using the Vertex AI language model.
  //logger.info(req.body.file);
  //const resumeAnalysis = await vertexService.generateResponseToQuestion(req.body.file);

  // 4. Save the binary PDF resume to MongoDB.
  // TODO: const resume = await resumeService.saveResume(req.params.userId, req.file.buffer, resumeAnalysis, resumeJson);

  // 5. Respond with the resume analysis.
  res.status(httpStatus.CREATED).send(resumeJSON);
});

const getAllResumes = catchAsync(async (req, res) => {
  const Resumes = await resumeService.getResumesByUserId(req.user.id);
  res.send({ Resumes });
});

const deleteResume = catchAsync(async (req, res) => {
  await resumeService.deleteResumeById(req.user.id, req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  submitResume,
  getAllResumes,
  deleteResume,
};