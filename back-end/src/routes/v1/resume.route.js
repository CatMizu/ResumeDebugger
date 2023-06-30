const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
//const equationValidation = require('../../validations/equation.validation');
const resumeController = require('../../controllers/resume.controller');

const router = express.Router();

router.route('/submit').post(resumeController.submitResume);

router.route('/getAllResumes').get(resumeController.getAllResumes);

router.route('/:id').delete(resumeController.deleteResume);

module.exports = router;