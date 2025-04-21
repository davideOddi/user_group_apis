import * as userService from '../services/userService';
import { pool } from '../data_layer/database';
import { Sex, User } from '../data_layer/models';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

jest.mock('../data_layer/database', () => ({
    pool: {
        execute: jest.fn()
    }
}));

const mockedExecute = pool.execute as jest.Mock;

describe('UserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should return list of users', async () => {
            const mockUsers: User[] = [
                { id: 1, name: 'Mario', surname: 'Rossi', birth_date: new Date('1990-01-01'), sex: Sex.Male },
            ];
            mockedExecute.mockResolvedValueOnce([mockUsers]);

            const result = await userService.getUsers(10, 1);
            expect(result).toEqual(mockUsers);
            expect(mockedExecute).toHaveBeenCalledWith('SELECT * FROM users LIMIT ? OFFSET ?', [10, 0]);
        });
    });

    describe('getUser', () => {
        it('should return a user if exists', async () => {
            const mockUser: User = { id: 1, name: 'Mario', surname: 'Rossi', birth_date: new Date('1990-01-01'), sex: Sex.Male };
            mockedExecute.mockResolvedValueOnce([[mockUser]]);

            const result = await userService.getUser(1);
            expect(result).toEqual(mockUser);
        });

        it('should return null if user does not exist', async () => {
            mockedExecute.mockResolvedValueOnce([[]]);

            const result = await userService.getUser(999);
            expect(result).toBeNull();
        });
    });

    describe('createUser', () => {
        it('should insert and return new user', async () => {
            const newUser: User = {
                name: 'Luigi',
                surname: 'Verdi',
                birth_date: new Date('1985-05-10'),
                sex: Sex.Male,
            };
            mockedExecute.mockResolvedValueOnce([{ insertId: 2 }]);
            mockedExecute.mockResolvedValueOnce([[{ id: 2, ...newUser }]]);

            const result = await userService.createUser(newUser);
            expect(result).toEqual({ id: 2, ...newUser });
        });
        
        it('should return null if insert fails', async () => {
            mockedExecute.mockResolvedValueOnce([{ insertId: 0 }]);

            const result = await userService.createUser({
                name: 'Failed',
                surname: 'User',
                birth_date: new Date('1990-01-01'),
                sex: Sex.Male,
            });
            expect(result).toBeNull();
        });
    });

    describe('updateUser', () => {
        it('should return null if update affects no rows', async () => {
            const userToUpdate: User = {
                name: 'Mario',
                surname: 'Rossi',
                birth_date: new Date('1990-01-01'),
                sex: Sex.Male
            };
            mockedExecute.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const result = await userService.updateUser(userToUpdate, 999); 
            expect(result).toBeNull();
        });

        it('should update and return user if update is successful', async () => {
            const updatedUser: User = {
                id: 1,
                name: 'Updated',
                surname: 'Rossi',
                birth_date: new Date('1990-01-01'),
                sex: Sex.Male
            };
            mockedExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockedExecute.mockResolvedValueOnce([[updatedUser]]);

            const result = await userService.updateUser(updatedUser, 1); 
            expect(result).toEqual(updatedUser);
        });
    });

    describe('deleteUser', () => {
        it('should delete and return user if exists', async () => {
            const mockUser: User = { 
                id: 1, 
                name: 'DeleteMe', 
                surname: 'Test', 
                birth_date: new Date('1990-01-01'), 
                sex: Sex.Male 
            };
            mockedExecute
                .mockResolvedValueOnce([[mockUser]]) 
                .mockResolvedValueOnce([{ affectedRows: 1 }]) 
                .mockResolvedValueOnce([{ affectedRows: 1 }]); 

            const result = await userService.deleteUser(1);
            expect(result).toEqual(mockUser);
        });

        it('should return null if user does not exist', async () => {
            mockedExecute.mockResolvedValueOnce([[]]); 

            const result = await userService.deleteUser(999);
            expect(result).toBeNull();
        });

        it('should return null if delete fails', async () => {
            mockedExecute.mockResolvedValueOnce([[{ id: 1 }]]);
            mockedExecute.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const result = await userService.deleteUser(1);
            expect(result).toBeNull();
        });
    });

    describe('addGroup and removeGroup', () => {
        it('should add user to group', async () => {
            mockedExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            await userService.addGroup(1, 2);

            expect(mockedExecute).toHaveBeenCalledWith(
                'INSERT INTO user_group (user_id, group_id) VALUES (?, ?)',
                [1, 2]
            );
        });

        it('should remove user from group', async () => {
            mockedExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            await userService.removeGroup(1, 2);

            expect(mockedExecute).toHaveBeenCalledWith(
                'DELETE FROM user_group WHERE user_id = ? AND group_id = ?',
                [1, 2]
            );
        });
    });

    describe('getUsersByGroup', () => {
        it('should return users of a group', async () => {
            const mockUsers: User[] = [
                { id: 1, name: 'Mario', surname: 'Rossi', birth_date: new Date('1990-01-01'), sex: Sex.Male },
            ];
            mockedExecute.mockResolvedValueOnce([mockUsers]);

            const result = await userService.getUsersByGroup(2);
            expect(result).toEqual(mockUsers);
            expect(mockedExecute).toHaveBeenCalledWith(
                `SELECT u.* FROM users u INNER JOIN user_group ug ON u.id = ug.user_id WHERE ug.group_id = ?`, 
                [2]
            );
        });

        it('should return empty array if no users in group', async () => {
            mockedExecute.mockResolvedValueOnce([[]]);

            const result = await userService.getUsersByGroup(999);
            expect(result).toEqual([]);
        });
    });
});
