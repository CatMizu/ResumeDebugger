const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const resumeValidation = require('../../validations/resume.validation');
const resumeController = require('../../controllers/resume.controller');

const router = express.Router();

router.route('/submit').post(auth(), validate(resumeValidation.submitResume), resumeController.submitResume);

router.route('/getAllResumes').get(auth(), validate(resumeValidation.getAllResumes), resumeController.getAllResumes);

router.route('/:id').delete(auth(), validate(resumeValidation.deleteResume), resumeController.deleteResume);

module.exports = router;