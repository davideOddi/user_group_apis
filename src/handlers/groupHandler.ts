import express, { Request, Response, Router, NextFunction } from 'express';
import { verifyId } from '../common';

const router: Router = express.Router();
router.param('id', verifyId)
router.use(express.json());

router.get('/', (req: Request, res: Response) => {
    console.log('group list');
    res.send('requested group list');
});

router
    .route('/:id')
    .get((req: Request, res: Response) => {
        const id: string = req.params.id;
        console.log(`getting group by id:${id}`);
        res.send(`requested group by id:${id}`);
    })
    .delete((req: Request, res: Response) => {
        const id: string = req.params.id;
        console.log(`deleting group by id:${id}`);
        res.send(`deleting group by id:${id}`);
    })
    .put((req: Request, res: Response) => {
        const id: string = req.params.id;
        console.log(`updating group by id:${id}`);
        res.send(`updating group by id:${id}`);
    });

router.post('/', (req: Request, res: Response) => {
        console.log('requested create group');
        res.send('requested create group');
});

export default router;