import express, { Request, Response, Router } from 'express';
import { verifyId, validateGroup } from '../common/validator';
import {
    getGroups,
    getGroup,
    deleteGroup,
    updateGroup,
    createGroup,
    getGroupsByUser
} from '../services/groupService';

const router: Router = express.Router();
router.param('id', verifyId)
router.use(express.json());

router.get('/', async (req: Request, res: Response) => {
    console.log(`Retrieving groups list`);
    const groupList = await getGroups();
    res.status(200).json(groupList);
});

router.get('/user/:id', async (req: Request, res: Response) => {
    const groupId = parseInt(req.params.id);
    console.log(`Getting users by group id: ${groupId}`);
    const groupList = await getGroupsByUser(groupId);
    res.status(200).json(groupList);
});


router
    .route('/:id')
    .get(async(req: Request, res: Response) => {
        const id = Number(req.params.id);
        console.log(`getting group by id:${id}`);
        const group = await getGroup(id);
        if (group) {
            res.status(200).json(group);
        } else {
            res.status(404).json({ message: `Group with ID ${id} not found.` });
        }
    })
    .delete(async(req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        console.log(`deleting group by id:${id}`);
        
        const group = await deleteGroup(id);
        if (group) {
            res.status(200).json(group);
        } else {
            res.status(404).json({ message: `Group with ID ${id} not found.` });
        }
    })
    .put(validateGroup, async(req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        console.log(`updating group by id:${id}`);
  
        const updatedgroup = await updateGroup(req.body, id);
        if (updatedgroup) {
            res.status(200).json(updatedgroup);
        } else {
            res.status(404).json({ message: `Group with ID ${id} not found.` });
        }
    });

router.post('/', validateGroup, async(req: Request, res: Response) => {
    console.log('creating group');
    const createdGroup = await createGroup(req.body);
    res.status(201).json(createdGroup);
});

export default router;