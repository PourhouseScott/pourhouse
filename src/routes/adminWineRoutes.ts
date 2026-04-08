import { Router } from 'express';
import * as adminWineController from '../controllers/adminWineController';
import { adminAuthMiddleware } from '@/middleware/adminAuthMiddleware';

const router = Router();

router.use(adminAuthMiddleware);

// List wines
router.get('/', adminWineController.listWines);
// Create wine
router.post('/', adminWineController.createWine);
// Update wine
router.put('/:id', adminWineController.updateWine);
// Delete wine
router.delete('/:id', adminWineController.deleteWine);

export default router;
