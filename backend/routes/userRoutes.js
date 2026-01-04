import express from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    getUserStats
} from '../controllers/userController.js';
import { protect, adminOnly, superAdminOnly } from '../middleware/auth.js';

const router = express.Router();

// All user management routes are admin-only
router.use(protect);
router.use(adminOnly);

router.get('/', getUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/toggle', toggleUserStatus);
router.patch('/:id/password', superAdminOnly, resetUserPassword);

export default router;
