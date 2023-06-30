const User = require('../models');
const Resume = require('../models');

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
  
module.exports = {
    getResumesByUserId,
    deleteResumeById,
  };
  