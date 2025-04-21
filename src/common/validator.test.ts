import request from 'supertest';
import express, { Request, Response, RequestHandler } from 'express';
import { validateUser, validateGroup, verifyId } from '../../src/common/validator';
import { Sex } from '../../src/data_layer/models';
const app = express();
app.use(express.json());

app.post('/user', validateUser, (req: Request, res: Response) => {
    res.status(200).json({ message: 'User is valid' });
});

app.post('/group', validateGroup, (req: Request, res: Response) => {
    res.status(200).json({ message: 'Group is valid' });
});

app.get('/user/:id', verifyId as RequestHandler, (req: Request, res: Response) => {
    res.status(200).json({ message: 'Valid ID' });
});
describe('Validators', () => {
    describe('verifyId', () => {
        it('should pass with a valid ID', async () => {
            const res = await request(app).get('/user/5');
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Valid ID');
        });

        it('should fail with a non-numeric ID', async () => {
            const res = await request(app).get('/user/abc');
            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should fail with a negative ID', async () => {
            const res = await request(app).get('/user/-1');
            expect(res.status).toBe(400);
        });
    });

    describe('validateUser', () => {
        const validUser = {
            name: 'Davide',
            surname: 'Oddi',
            birth_date: '1990-01-01',
            sex: Sex.Male
        };

        it('should validate user', async () => {
            const res = await request(app).post('/user').send(validUser);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('User is valid');
        });

        it('should reject a user with missing fields', async () => {
            const { name, ...invalidUser } = validUser;
            const res = await request(app).post('/user').send(invalidUser);
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid user data');
        });

        it('should reject a user with invalid sex', async () => {
            const res = await request(app).post('/user').send({ ...validUser, sex: 'INVALID' });
            expect(res.status).toBe(400);
        });
    });

    describe('validateGroup', () => {
        it('should validate a correct group', async () => {
            const res = await request(app).post('/group').send({ name: 'Admin' });
            expect(res.status).toBe(200);
        });

        it('should reject a group with missing name', async () => {
            const res = await request(app).post('/group').send({});
            expect(res.status).toBe(400);
        });
    });
});