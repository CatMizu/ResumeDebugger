const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const resumeSchema = mongoose.Schema(
  {
    pdfName: String,
    data: String,
    jsonData: mongoose.Schema.Types.Mixed,
    analysisResult: {
      overAllScore: Number,
      overAllFeedBack: String,
      educationFeedBack: String,
      experienceFeedBack: String,
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.plugin(toJSON);
resumeSchema.plugin(paginate);

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
