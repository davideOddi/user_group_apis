import request from 'supertest';
import { app } from './index';
import { errorHandler } from './handlers/errorHandler';

jest.mock('./handlers/userHandler', () => jest.fn((req, res, next) => {
    if (req.query.error === 'true') {
        const error = new Error('Internal Server Error');
        next(error);
    } else {
        res.status(200).send('User handler mocked');
    }
}));jest.mock('./handlers/groupHandler', () => jest.fn((req, res, next) => res.status(200).send('Group handler mocked')));

app.use(errorHandler);


describe('API Routes', () => {
    it('should route GET /users to the user handler', async () => {
        const response = await request(app).get('/users');

        // Verifica che la risposta sia quella mockata, cioè che venga ritornato 200
        expect(response.status).toBe(200);  
        expect(response.text).toBe('User handler mocked');
    });

    it('should route GET /groups to the group handler', async () => {
        const response = await request(app).get('/groups');

        expect(response.status).toBe(200);
        expect(response.text).toBe('Group handler mocked');
    });

    it('should handle errors with errorHandler', async () => {
        const response = await request(app).get('/users').query({ error: 'true' });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');
    });
});
