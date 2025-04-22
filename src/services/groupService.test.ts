import { pool } from '../data_layer/database';
import * as groupService from './groupService';
import { Group } from '../data_layer/models';

jest.mock('../data_layer/database', () => ({
  pool: {
    query: jest.fn(),
    execute: jest.fn(),
  },
}));

describe('GroupService', () => {
  let mockedQuery: jest.Mock;
  let mockedExecute: jest.Mock;

  beforeEach(() => {
    mockedQuery = pool.query as jest.Mock;
    mockedExecute = pool.execute as jest.Mock;
    jest.clearAllMocks();
  });

  it('should return all groups', async () => {
    const mockGroups: Group[] = [{ id: 1, name: 'Admin' }, { id: 2, name: 'User' }];

    mockedExecute.mockResolvedValueOnce([mockGroups]);

    const result = await groupService.getGroups();
    expect(result).toEqual(mockGroups);
  });

  it('should return a group by ID', async () => {
    const mockGroup: Group = { id: 1, name: 'Admin' };

    mockedExecute.mockResolvedValueOnce([[mockGroup]]);

    const result = await groupService.getGroup(1);
    expect(result).toEqual(mockGroup);
  });

  it('should return null if group does not exist', async () => {
    mockedExecute.mockResolvedValueOnce([[]]);

    const result = await groupService.getGroup(999);
    expect(result).toBeNull();
  });

  it('should create and return new group', async () => {
    const newGroup: Group = { id: 0, name: 'Developers' };
    const insertedGroup: Group = { id: 3, name: 'Developers' };

    mockedQuery.mockResolvedValueOnce([{ insertId: 3 }]);
    mockedExecute.mockResolvedValueOnce([[insertedGroup]]);

    const result = await groupService.createGroup(newGroup);
    expect(result).toEqual(insertedGroup);
  });

  it('should update and return group if update is successful', async () => {
    const groupToUpdate: Group = { id: 1, name: 'Updated Group' };

    mockedExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); // update
    mockedExecute.mockResolvedValueOnce([[groupToUpdate]]);     // select after update

    const result = await groupService.updateGroup(groupToUpdate, 1);
    expect(result).toEqual(groupToUpdate);
  });

  it('should return null if update affects no rows', async () => {
    const groupToUpdate: Group = { id: 999, name: 'Ghost Group' };

    mockedExecute.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const result = await groupService.updateGroup(groupToUpdate, 999);
    expect(result).toBeNull();
  });

  it('should delete and return group if exists', async () => {
    const mockGroup: Group = { id: 1, name: 'ToDelete' };

    mockedExecute
      .mockResolvedValueOnce([[mockGroup]])          // selectGroupById
      .mockResolvedValueOnce([{ affectedRows: 1 }])  // deleteGroupById
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // deleteGroupByUserGroup

    const result = await groupService.deleteGroup(1);
    expect(result).toEqual(mockGroup);
  });

  it('should return null if group does not exist when deleting', async () => {
    mockedExecute.mockResolvedValueOnce([[]]);

    const result = await groupService.deleteGroup(999);
    expect(result).toBeNull();
  });

  it('should return groups by user ID', async () => {
    const mockGroups: Group[] = [{ id: 1, name: 'Admin' }];

    mockedExecute.mockResolvedValueOnce([mockGroups]);

    const result = await groupService.getGroupsByUser(1);
    expect(result).toEqual(mockGroups);
  });
});
