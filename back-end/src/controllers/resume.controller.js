const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { resumeService, vertexService } = require('../services');
const logger = require('../config/logger');

const educationQuestion = "Assuming you are a professional headhunter, please evaluate\
 the education experience section of the above resume, and provide some suggestions for\
  improvement, Please be as detailed as possible.";
const workQuestion = "Assuming you are a professional headhunter, please evaluate the \
work experience section of the above resume, and provide some suggestions for \
improvement, Please be as detailed as possible.";
const overallQuestion = "Suppose you are a professional headhunter, please give an \
overall evaluation of the above resume information, give a score out of 100, and \
provide some suggestions for improvement, Please be as detailed as possible.";
const scoreQuestion = "This is my resume, give it a score out of 100. ";

const submitResume = catchAsync(async (req, res) => {
  // 1. Convert the PDF resume to text.
  const resumeText = await vertexService.convertPdfToText(req.body.file);
  // 2. Parse the resume text into a structured JSON object.
  // TODO: const resumeJson = await resumeParser.parseResume(resumeText, 'json');

  // 3. Generate a response to the resume using the Vertex AI language model.
  const educationAnalysis = await vertexService.generateResponseToQuestion(resumeText, educationQuestion);
  const workAnalysis = await vertexService.generateResponseToQuestion(resumeText, workQuestion);
  const overallAnalysis = await vertexService.generateResponseToQuestion(resumeText, overallQuestion);
  const scoreAnalysis = await vertexService.generateResponseToQuestion(resumeText, scoreQuestion);
  
  // 4. save the pdf to MongoDB
  const savedResume = await resumeService.saveResume(
    req.body.file,
    req.body.fileName,
    req.user.id,
    educationAnalysis,
    workAnalysis,
    overallAnalysis,
    scoreAnalysis,
  );

  res.status(httpStatus.CREATED).send(savedResume);
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