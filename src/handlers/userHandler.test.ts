import request from 'supertest';
import express from 'express';
import userRouter from '../handlers/userHandler';
import * as userService from '../services/userService';
import { errorHandler } from './errorHandler';


const app = express();
app.use('/users', userRouter);
app.use(errorHandler);

jest.mock('../services/userService');

describe('User Routes', () => {
    describe('GET /users', () => {
        it('should return a list of users', async () => {
            const mockUsers = [
                {
                    id: 1,
                    name: "User1",
                    surname: "1",
                    birth_date: "1995-07-03",
                    sex: "male"
                },
                {
                    id: 2,
                    name: "User2",
                    surname: "2",
                    birth_date: "1995-07-03",
                    sex: "female"
                },
            ];

            (userService.getUsers as jest.Mock).mockResolvedValue(mockUsers);

            const res = await request(app).get('/users');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUsers);
        });

        it('should return 500 if getUsers fails', async () => {
            (userService.getUsers as jest.Mock).mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/users');
            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Internal Server Error');
        });
    });

    describe('POST /users', () => {
        it('should create a new user', async () => {
            const newUser =  {
                id: 1,
                name: "User1",
                surname: "1",
                birth_date: "1995-07-03",
                sex: "male"
            };

            (userService.createUser as jest.Mock).mockResolvedValue(newUser);

            const res = await request(app).post('/users').send(newUser);
            expect(res.status).toBe(201);
            expect(res.body).toEqual(newUser);
        });

        it('should return 400 if validation fails', async () => {
            (userService.createUser as jest.Mock).mockRejectedValue(new Error('Invalid user data'));

            const res = await request(app).post('/users').send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid user data');
        });
    });

    describe('GET /users/:id', () => {
        it('should return a user by id', async () => {
            const mockUser =  {
                id: 1,
                name: "User1",
                surname: "1",
                birth_date: "1995-07-03",
                sex: "male"
            };

            (userService.getUser as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app).get('/users/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUser);
        });

        it('should return 404 if user not found', async () => {
            (userService.getUser as jest.Mock).mockResolvedValue(null);

            const res = await request(app).get('/users/999');
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('User with ID 999 not found.');
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete a user', async () => {
            const mockUser =  {
                id: 1,
                name: "User1",
                surname: "1",
                birth_date: "1995-07-03",
                sex: "male"
            };

            (userService.deleteUser as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app).delete('/users/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUser);
        });

        it('should return 404 if user not found', async () => {
            (userService.deleteUser as jest.Mock).mockResolvedValue(null);

            const res = await request(app).delete('/users/999');
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('User with ID 999 not found.');
        });
    });

    describe('PUT /users/:id', () => {
        it('should update a user', async () => {
            const updatedUser =  {
                id: 1,
                name: "User1",
                surname: "1",
                birth_date: "1995-07-03",
                sex: "male"
            };

            (userService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

            const res = await request(app).put('/users/1').send(updatedUser);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedUser);
        });

        it('should return 404 if user not found', async () => {
            const updatedUser =  {
                id: 1,
                name: "User1",
                surname: "1",
                birth_date: "1995-07-03",
                sex: "male"
            };

            (userService.updateUser as jest.Mock).mockResolvedValue(null);

            const res = await request(app).put('/users/999').send(updatedUser);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('User with ID 999 not found.');
        });
    });

    describe('GET /users/group/:id', () => {
        it('should return users by group id', async () => {
            const mockUsers = [
                {
                    id: 1,
                    name: "User1",
                    surname: "1",
                    birth_date: "1995-07-03",
                    sex: "male"
                },
                {
                    id: 2,
                    name: "User2",
                    surname: "2",
                    birth_date: "1995-07-03",
                    sex: "female"
                },
            ];

            (userService.getUsersByGroup as jest.Mock).mockResolvedValue(mockUsers);

            const res = await request(app).get('/users/group/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUsers);
        });
    });

    describe('POST /users/group', () => {
        it('should associate a group with a user', async () => {
            const requestBody = { userId: 1, groupId: 1 };

            (userService.addGroup as jest.Mock).mockResolvedValue(undefined);

            const res = await request(app).post('/users/group').send(requestBody);
            expect(res.status).toBe(201);
        });
    });

    describe('DELETE /users/:id/groups/:groupId', () => {
        it('should disassociate a group from a user', async () => {
            const userId = 1;
            const groupId = 1;

            (userService.removeGroup as jest.Mock).mockResolvedValue(undefined);

            const res = await request(app).delete(`/users/${userId}/groups/${groupId}`);
            expect(res.status).toBe(204);
        });
    });
});
