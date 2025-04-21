import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { errorHandler } from './errorHandler';

const app = express();

app.get('/error', (req: Request, res: Response, next: NextFunction) => {
    const error = new Error('OH Noo');
    next(error);  
});

app.get('/error-no-message', (req: Request, res: Response, next: NextFunction) => {
    const error = new Error();
    next(error);  
});

app.use(errorHandler);

describe('ErrorHandler Catch', () => {
    it('should return 500 status and error details for an error with a message', async () => {
        const res = await request(app).get('/error');  

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            error: 'Internal Server Error',
            message: 'OH Noo' 
        });
    });

    it('should return 500 status and a generic error message when the error has no message', async () => {
        const res = await request(app).get('/error-no-message');  

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            error: 'Internal Server Error',
            message: 'Internal Server Error.'
        });
    });
});
