const express = require('express');
const router  = express.Router();
const {
  generateNewPlan, getPlans, getPlanById, completeStep, deletePlan
} = require('../controllers/planController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/generate',                        generateNewPlan);
router.get('/',                                 getPlans);
router.get('/:id',                              getPlanById);
router.patch('/:planId/steps/:stepIndex/complete', completeStep);
router.delete('/:id',                           deletePlan);

module.exports = router;