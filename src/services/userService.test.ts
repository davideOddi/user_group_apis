import { pool } from '../data_layer/database';
import * as userService from './userService';
import { User } from '../data_layer/models';
import { Sex } from '../data_layer/models';

jest.mock('../data_layer/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('UserService', () => {
  let mockedExecute: jest.Mock;

  beforeEach(() => {
    mockedExecute = pool.query as jest.Mock;
    jest.clearAllMocks(); 
  });

  it('should add a user to a group', async () => {
    mockedExecute.mockResolvedValueOnce([{}]); // Simula inserimento avvenuto
  
    await expect(userService.addGroup(1, 2)).resolves.toBeUndefined();
  
    expect(mockedExecute).toHaveBeenCalledWith(
      'INSERT INTO user_group (user_id, group_id) VALUES (?, ?)',
      [1, 2]
    );
  });
  
  it('should remove a user from a group', async () => {
    mockedExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
  
    const result = await userService.removeGroup(1, 2);
  
    expect(result).toBeUndefined(); // La funzione è `void`
    expect(mockedExecute).toHaveBeenCalledWith(
      'DELETE FROM user_group WHERE user_id = ? AND group_id = ?',
      [1, 2]
    );
  });
  
  it('should return users by group id', async () => {
    const mockUsers: User[] = [
      { id: 1, name: 'Mario', surname: 'Rossi', birth_date: new Date('1990-01-01'), sex: Sex.Male },
    ];
  
    mockedExecute.mockResolvedValueOnce([mockUsers]);
  
    const result = await userService.getUsersByGroup(3);
  
    expect(result).toEqual(mockUsers);
    expect(mockedExecute).toHaveBeenCalledWith(
      'SELECT u.* FROM users u INNER JOIN user_group ug ON u.id = ug.user_id WHERE ug.group_id = ?',
      [3]
    );
  });
  

  it('should return list of users', async () => {
    const mockUsers: User[] = [
      { id: 1, name: 'Mario', surname: 'Rossi', birth_date: new Date('1990-01-01'), sex: Sex.Male },
      { id: 2, name: 'Luca', surname: 'Verdi', birth_date: new Date('1985-05-15'), sex: Sex.Male },
    ];

    mockedExecute.mockResolvedValueOnce([mockUsers]); 

    const result = await userService.getUsers(10, 1);
    expect(result).toEqual(mockUsers); 
  });

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

  it('should insert and return new user', async () => {
    const newUser: User = { id: 2, name: 'Luigi', surname: 'Bianchi', birth_date: new Date('1995-02-01'), sex: Sex.Male };

    mockedExecute.mockResolvedValueOnce([{ insertId: 2 }]); 
    mockedExecute.mockResolvedValueOnce([[{ id: 2, ...newUser }]]);

    const result = await userService.createUser(newUser);
    expect(result).toEqual({ id: 2, ...newUser });
  });

  it('should return null if insert fails', async () => {
    const newUser: User = { id: 0, name: 'Failed', surname: 'Test', birth_date: new Date('2000-01-01'), sex: Sex.Male };

    mockedExecute.mockResolvedValueOnce([{ insertId: 0 }]); 

    const result = await userService.createUser(newUser);
    expect(result).toBeNull(); 
  });

  it('should return null if update affects no rows', async () => {
    const userToUpdate: User = { id: 999, name: 'Updated', surname: 'User', birth_date: new Date('1990-01-01'), sex: Sex.Male };

    mockedExecute.mockResolvedValueOnce([{ affectedRows: 0 }]); 
    const result = await userService.updateUser(userToUpdate, 999);
    expect(result).toBeNull(); 
  });

  it('should update and return user if update is successful', async () => {
    const updatedUser: User = { id: 1, name: 'Updated', surname: 'User', birth_date: new Date('1990-01-01'), sex: Sex.Male };

    mockedExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); 
    mockedExecute.mockResolvedValueOnce([[updatedUser]]); 

    const result = await userService.updateUser(updatedUser, 1);
    expect(result).toEqual(updatedUser); 
  });

  it('should delete and return user if exists', async () => {
    const mockUser: User = { id: 1, name: 'Mario', surname: 'Rossi', birth_date: new Date('1990-01-01'), sex: Sex.Male };

    mockedExecute.mockResolvedValueOnce([[mockUser]]); 
    mockedExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); 
    mockedExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); 

    const result = await userService.deleteUser(1);
    expect(result).toEqual(mockUser); 
  });

  it('should return null if user does not exist', async () => {
    mockedExecute.mockResolvedValueOnce([[]]);

    const result = await userService.deleteUser(999); 
    expect(result).toBeNull(); 
  });
});
