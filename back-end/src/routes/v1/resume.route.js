const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const resumeController = require('../../controllers/resume.controller');

const router = express.Router();

router.route('/submit').post(auth(), resumeController.submitResume);

router.route('/getAllResumes').get(auth(), resumeController.getAllResumes);

router.route('/:id').delete(resumeController.deleteResume);

module.exports = router;