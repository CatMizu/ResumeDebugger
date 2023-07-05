const User = require('../models');
const { Resume } = require('../models');
const ResumeParser = require('simple-resume-parser');

/**
 * Retrieves all resumes associated with a given user ID
 * @param {String} userId - The user ID
 * @returns {Promise<Array>} Returns a Promise that resolves to an array containing all resume objects associated with the user ID. Each resume object does not include `data` and `upload_time` fields.
 * Note: If no resumes are found associated with the user ID, the returned array will be empty.
 */
const getResumesByUserId = async (userId) => {
    const resumes = await Resume.find({ user: userId }, '-data -upload_time');
    return resumes;
  };

/**
 * Delete a resume by its ID if it is associated with the given user ID
 * @param {String} userId - The user ID
 * @param {String} resumeId - The resume ID
 * @returns {Promise} Returns a Promise that resolves if the resume is successfully deleted or rejects if not found or not associated with the user
 */
const deleteResumeById = async (userId, resumeId) => {
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
  
    if (!resume) {
      throw new Error('Resume not found or not associated with the user');
    }
  
    await Resume.deleteOne({ _id: resumeId });
  };
  
/**
 * Create a new resume and save it to the database
 * @param {Buffer} file - The file buffer of the resume pdf
 * @param {String} fileName - The name of the pdf file
 * @param {String} userId - The id of the user who uploaded the resume
 * @param {Object} educationAnalysis - The education analysis result from Vertex AI
 * @param {Object} workAnalysis - The work experience analysis result from Vertex AI
 * @param {String} overallAnalysis - The overall analysis result from Vertex AI
 * @param {Stirng} scoreAnalysis - The overall score from Vertex AI
 * @returns {Promise} Returns a Promise that resolves to the saved Resume object if successful or rejects if an error occurs
 */
const saveResume = async (file, fileName, userId, educationAnalysis, workAnalysis, overallAnalysis, scoreAnalysis) => {
  // Use regex to extract all 2-digit numbers from the overallAnalysis text
  const scoreRegex = /\b\d{2}\b/g;
  const matchResults = scoreAnalysis.match(scoreRegex);
  const scores = matchResults ? matchResults.map(Number) : [];

  // Filter out the number 100
  const scoresNot100 = scores.filter(score => score !== 100);

  const overallScore = scoresNot100[0];

  const newResume = new Resume({
    pdfName: fileName,
    data: file,
    analysisResult: {
      overAllScore: overallScore,
      overAllFeedBack: overallAnalysis,
      educationFeedBack: educationAnalysis,
      experienceFeedBack: workAnalysis,
    },
    user: userId,
  });

  // Save the new resume to the database
  const savedResume = await newResume.save();
  return savedResume;
};

/**
 * Convert a TEXT resume to JSON document
 * @param {String} resume - The text resume.
 * @returns {Promise<String>}  A string representation of the processed JSON document.
 * @throws {Error} If there's an error during the Document convertion.
 */

async function parseResume(resume) {
  //Read text file
  const parsedResume = new ResumeParser(resume);
  
  //Convert to JSON Object
  const resumeJSON = parsedResume.parseToJSON()
  .then( data => {
    return data;
  })
  .catch(error => {
    throw new Error();
  })
  return resumeJSON;
}

module.exports = {
    getResumesByUserId,
    deleteResumeById,
    saveResume,
    parseResume,
  };
  