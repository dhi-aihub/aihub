import { Router } from 'express';
import {
  createOrUpdateTrainingResult,
  getTrainingResult,
  getAllTrainingResults,
} from '../controllers/trainingResult.controller';

const router = Router();

router.post('/', createOrUpdateTrainingResult);
router.get('/:trainingJobId', getTrainingResult);
router.get('/', getAllTrainingResults);

export default router;
