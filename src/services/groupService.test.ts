import * as groupService from '../services/groupService';
import { pool } from '../data_layer/database';

jest.mock('../data_layer/database', () => ({
    pool: {
        execute: jest.fn()
    }
}));

const mockedExecute = pool.execute as jest.Mock;

describe('GroupService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getGroups', () => {
        it('should return list of groups', async () => {
            const mockGroup = [{ id: 1, name: 'Group1' }];
            mockedExecute.mockResolvedValueOnce([mockGroup]);

            const result = await groupService.getGroup(1);
            expect(result).toEqual(mockGroup[0]);
        });
    });

    describe('getGroup', () => {
        it('should return a group if exists', async () => {
            const mockGroup = [{ id: 1, name: 'Group1' }];

            mockedExecute.mockResolvedValueOnce([mockGroup]);

            const result = await groupService.getGroup(1);
            expect(result).toEqual(mockGroup[0]);
        });

        it('should return null if group does not exist', async () => {
            mockedExecute.mockResolvedValueOnce([[]]);

            const result = await groupService.getGroup(999);
            expect(result).toBeNull();
        });
    });

    describe('createGroup', () => {
        it('should insert and return new group', async () => {
            const newGroup = { name: 'New Group' };
            mockedExecute
                .mockResolvedValueOnce([{ insertId: 2 }])
                .mockResolvedValueOnce([[{ id: 2, name: 'New Group' }]]);

            const result = await groupService.createGroup(newGroup as any);
            expect(result).toEqual({ id: 2, name: 'New Group' });
        });
    });

    describe('updateGroup', () => {
        it('should update and return updated group', async () => {
            const updatedGroup = { name: 'Updated Name' };
            mockedExecute
                .mockResolvedValueOnce([{ affectedRows: 1 }])
                .mockResolvedValueOnce([[{ id: 1, name: 'Updated Name' }]]);

            const result = await groupService.updateGroup(updatedGroup as any, 1);
            expect(result).toEqual({ id: 1, name: 'Updated Name' });
        });

        it('should return null if no rows affected', async () => {
            mockedExecute.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const result = await groupService.updateGroup({ name: 'Fail' } as any, 999);
            expect(result).toBeNull();
        });
    });

    describe('deleteGroup', () => {
        it('should delete and return group if exists', async () => {
            const groupToDelete = [{ id: 1, name: 'ToDelete' }];
            mockedExecute
                .mockResolvedValueOnce([groupToDelete])              // selectGroupById
                .mockResolvedValueOnce([{ affectedRows: 1 }])        // deleteGroupById
                .mockResolvedValueOnce([{ affectedRows: 1 }]);       // deleteGroupByUserGroup

            const result = await groupService.deleteGroup(1);
            expect(result).toEqual(groupToDelete[0]);
        });

        it('should return null if group does not exist', async () => {
            mockedExecute.mockResolvedValueOnce([[]]);

            const result = await groupService.deleteGroup(999);
            expect(result).toBeNull();
        });
    });

    describe('getGroupsByUser', () => {
        it('should return groups for a user', async () => {
            const mockGroups = [{ id: 1, name: 'Group1' }];
            mockedExecute.mockResolvedValueOnce([mockGroups]); // GIUSTO
        
            const result = await groupService.getGroupsByUser(1);
            expect(result).toEqual(mockGroups);
            expect(mockedExecute).toHaveBeenCalledWith(
                'SELECT g.* FROM  `groups` g INNER JOIN user_group ug ON g.id = ug.group_id WHERE ug.user_id = ?',
                [1]
            );
        });
    });
});
