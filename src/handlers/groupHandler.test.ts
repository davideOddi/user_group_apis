import request from 'supertest'; 
import express from 'express';
import router from './groupHandler'; 
import * as groupService from '../services/groupService'; 

const app = express();
app.use(express.json());
app.use('/groups', router);

jest.mock('../services/groupService');
const mockGetGroups = groupService.getGroups as jest.Mock;
const mockGetGroup = groupService.getGroup as jest.Mock;
const mockDeleteGroup = groupService.deleteGroup as jest.Mock;
const mockUpdateGroup = groupService.updateGroup as jest.Mock;
const mockCreateGroup = groupService.createGroup as jest.Mock;
const mockGetGroupsByUser = groupService.getGroupsByUser as jest.Mock;

jest.mock('../services/groupService', () => {
    console.log('Mocking groupService');
    return {
      getGroups: jest.fn(),
      getGroup: jest.fn(),
      deleteGroup: jest.fn(),
      updateGroup: jest.fn(),
      createGroup: jest.fn(),
      getGroupsByUser: jest.fn(),
    };
  });

describe('Group Routes', () => {
    describe('GET /groups', () => {
        it('should return list of groups', async () => {
            const mockGroups = [
                { id: 1, name: 'Group1' },
                { id: 2, name: 'Group2' },
            ];

            mockGetGroups.mockResolvedValue(mockGroups);
            const res = await request(app).get('/groups');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockGroups);
        });
    });
    describe('GET /groups/user/:id', () => {
        it('should return groups by user id', async () => {
            const mockGroups = [
                { id: 1, name: 'Admin' },
                { id: 2, name: 'User' },
            ];
            mockGetGroupsByUser.mockResolvedValue(mockGroups);

            const res = await request(app).get('/groups/user/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockGroups);
        });
    });

    describe('GET /groups/:id', () => {
        it('should return group by ID', async () => {
            const mockGroup = { id: 1, name: 'Admin' };
            mockGetGroup.mockResolvedValue(mockGroup);

            const res = await request(app).get('/groups/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockGroup);
        });

        it('should return 404 if group not found', async () => {
            mockGetGroup.mockResolvedValue(null);

            const res = await request(app).get('/groups/999');
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Group with ID 999 not found.');
        });
    });

    describe('DELETE /groups/:id', () => {
        it('should delete a group and return the deleted group', async () => {
            const mockGroup = { id: 1, name: 'Admin' };
            mockDeleteGroup.mockResolvedValue(mockGroup);

            const res = await request(app).delete('/groups/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockGroup);
        });

        it('should return 404 if group not found for deletion', async () => {
            mockDeleteGroup.mockResolvedValue(null);

            const res = await request(app).delete('/groups/999');
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Group with ID 999 not found.');
        });
    });

    describe('PUT /groups/:id', () => {
        it('should update a group and return the updated group', async () => {
            const mockGroup = { id: 1, name: 'Updated Group' };
            mockUpdateGroup.mockResolvedValue(mockGroup);

            const res = await request(app).put('/groups/1').send({ name: 'Updated Group' });
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockGroup);
        });

        it('should return 404 if group not found for update', async () => {
            mockUpdateGroup.mockResolvedValue(null);

            const res = await request(app).put('/groups/999').send({ name: 'Updated Group' });
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Group with ID 999 not found.');
        });
    });

    describe('POST /groups', () => {
        it('should create a new group', async () => {
            const mockGroup = { id: 1, name: 'New Group' };
            mockCreateGroup.mockResolvedValue(mockGroup);

            const res = await request(app).post('/groups').send({ name: 'New Group' });
            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockGroup);
        });
    });
});
