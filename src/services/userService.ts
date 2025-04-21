import { User } from '../data_layer/models';
import { pool } from '../data_layer/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function getUsers(limit: number, page: number): Promise<User[]> {
    return selectUsers(limit, page);
}

export async function getUser(id: number): Promise<User | null> {
    return selectUserById(id);
}

export async function createUser(user: User): Promise<User | null> {
    const userId = await insertUser(user);
    return selectUserById(userId);
}

export async function updateUser(user: User, id: number): Promise<User | null> {
    const affectedRows = await modifyUser(id, user);
    if (affectedRows > 0) {
        return selectUserById(id);
    }
    return null;
}

export async function deleteUser(id: number): Promise<User | null> {
    const userToDelete = await selectUserById(id);
    if (userToDelete != null && await deleteUserById(id)) {
        await removeUserFromUserGroup(id);
        return userToDelete;
    }
    return null;
}

export async function addGroup(userId: number, groupId: number) : Promise<void> {
    await insertUserGroup(userId, groupId)
}

export async function removeGroup(userId: number, groupId: number) : Promise<void> {
    await removeUserGroup(userId, groupId)
}

export async function getUsersByGroup(groupId: number): Promise<User[]>{
    return await selectUsersByGroup(groupId);
}

async function selectUserById(id: number): Promise<User | null> {
    const [users] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] as User || null;
}

async function insertUser(user: User): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>('INSERT INTO users SET ?', [user]);
    return result.insertId;
}

async function modifyUser(id: number, user: Omit<User, 'id'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE users SET name = ?, surname = ?, birth_date = ?, sex = ? WHERE id = ?',
        [user.name, user.surname, user.birth_date.toISOString().split('T')[0], user.sex, id]
    );
    return result.affectedRows;
}

async function deleteUserById(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM users WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

async function selectUsers(limit: number, page: number): Promise<User[]> {
    const offset = (page - 1) * limit
    const [users] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM users LIMIT ? OFFSET ?',
        [limit, offset]);
    return users as User[];
}

async function insertUserGroup(userId: number, groupId: number): Promise<void> {
    await pool.execute<ResultSetHeader>(
        'INSERT INTO user_group (user_id, group_id) VALUES (?, ?)',
        [userId, groupId]
    );
}

async function removeUserGroup(userId: number, groupId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM user_group WHERE user_id = ? AND group_id = ?',
        [userId, groupId]
    );
    return result.affectedRows > 0;
}

async function removeUserFromUserGroup(userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM user_group WHERE user_id = ?',
        [userId]
    );
    return result.affectedRows > 0;
}

async function selectUsersByGroup(groupId: number): Promise<User[]> {
    const [users] = await pool.execute<RowDataPacket[]>(
        `SELECT u.* FROM users u INNER JOIN user_group ug
         ON u.id = ug.user_id WHERE ug.group_id = ?`,
        [groupId]
    );

    return users as User[];
}




