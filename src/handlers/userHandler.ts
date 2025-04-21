import express, { Router, Request, Response, } from 'express';
import { verifyId, validateUser } from '../common/validator';
import {
    getUser,
    deleteUser,
    updateUser,
    createUser,
    getUsers,
    addGroup,
    removeGroup,
    getUsersByGroup
} from '../services/userService';

const router: Router = express.Router();

router.use(express.json());
router.param('id', verifyId);

router.get('/', (async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;
    console.log(`Retrieving users - page ${page}, limit ${limit}`);
    const users = await getUsers(limit, page);
    res.status(200).json(users);
}));

router.post('/', validateUser, (async (req: Request, res: Response) => {
    console.log(`Creating user`);
    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
}));

router.route('/:id')
    .get(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        console.log(`Getting user with id: ${id}`);

        const user = await getUser(id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: `User with ID ${id} not found.` });
        }
    })
    .delete(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        console.log(`Deleting user with id: ${id}`);

        const user = await deleteUser(id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: `User with ID ${id} not found.` });
        }
    })
    .put(validateUser, async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        console.log(`Updating user with id: ${id}`);

        const updatedUser = await updateUser(req.body, id);
        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: `User with ID ${id} not found.` });
        }
    });

router.get('/group/:id', async (req: Request, res: Response) => {
    const groupId = parseInt(req.params.id);
    console.log(`Getting groups for user id: ${groupId}`);
    const userList = await getUsersByGroup(groupId);
    res.status(200).json(userList);
});

router.post('/group', async (req: Request, res: Response) => {
    const { groupId, userId } = req.body;
    console.log(`associating group with id: ${groupId} to user with id ${userId}`);
    await addGroup(userId, groupId);
    res.sendStatus(201);
});

router.delete('/:id/groups/:groupId', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const groupId = parseInt(req.params.groupId);
    console.log(`disassociating  group with id: ${groupId} to user with id ${userId}`);
    await removeGroup(userId, groupId);
    res.sendStatus(204);
})

export default router;
