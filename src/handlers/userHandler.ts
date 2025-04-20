import express, { Router } from 'express';
import { verifyId, validateUser } from '../common';
import {
    getUser,
    deleteUser,
    updateUser,
    createUser,
    getUsers
} from '../services/userService';

const router: Router = express.Router();

router.use(express.json());
router.param('id', verifyId);

router.get('/', (async (req, res) => {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;
    console.log(`Retrieving users - page ${page}, limit ${limit}`);

    const users = await getUsers(limit, page);
    res.json(users);
}));

router.post('/', validateUser, (async (req, res) => {
    console.log(`Creating new user`);

    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
}));

router.route('/:id')
    .get(async (req, res) => {
        const id = parseInt(req.params.id);
        console.log(`Getting user with id: ${id}`);

        const user = await getUser(id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: `User with ID ${id} not found.` });
        }
    }
    )
    .delete(async (req, res) => {
        const id = parseInt(req.params.id);
        console.log(`Deleting user with id: ${id}`);

        const user = await deleteUser(id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: `User with ID ${id} not found.` });
        }
    }
    )
    .put(validateUser, async (req, res) => {
        const id = parseInt(req.params.id);
        console.log(`Updating user with id: ${id}`);

        const updatedUser = await updateUser(req.body, id);
        res.json(updatedUser);
    }
    );

export default router;
