const Joi = require('joi');
const { objectId } = require('./custom.validation');

const submitResume = {
  body: Joi.object().keys({
    file: Joi.string().required(),
    fileName: Joi.string().required(),
  }),
};

const getAllResumes = {
  headers: Joi.object({
    accessToken: Joi.string().required(),
  }).unknown(),
};

const deleteResume = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
};

module.exports = {
  submitResume,
  getAllResumes,
  deleteResume,
};
