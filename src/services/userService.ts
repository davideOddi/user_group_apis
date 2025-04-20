    import { User } from '../data_layer/models';
    import { pool } from '../data_layer/database';
    import { ResultSetHeader, RowDataPacket } from 'mysql2';

    export function getUsers(limit : number, page: number): Promise<User[]>{
        return selectUsers(limit, page);
    }

    export function getUser(id: number): Promise<User | null> {
        return selectUserById(id);
    }

    export async function createUser(user: User): Promise<User | null> {
        const userId = await insertUser(user);
        return selectUserById(userId);
    }

    async function selectUsers(limit: number, page: number): Promise<User[]> {
        const [users] = await pool.query<RowDataPacket[]>('SELECT * FROM users LIMIT ? OFFSET ?',[limit, page]);
        return users as User[];
    }

    export async function updateUser(user: User, id: number): Promise<User | null> {
        const affectedRows = await modifyUser(id, user);
        if (affectedRows > 0) {
            return selectUserById(id);
        }
        return null;
    }

    export async function deleteUser(id: number): Promise<User | null>{
        const userToDelete = selectUserById(id);
        if(userToDelete != null && await deleteUserById(id)){
            return userToDelete;
        }
        return null;
    }

    async function selectUserById(id: number): Promise<User | null>  {
        const [users] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
        return users[0] as User || null;
    }

    async function insertUser(user: User): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>('INSERT INTO users SET ?', [user]);
        return result.insertId;
    }

    async function modifyUser(id: number, user: Omit<User, 'id'>): Promise<number> {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE users SET name = ?, surname = ?, birth_date = ?, sex = ? WHERE id = ?',
            [user.name, user.surname, user.birth_date.toISOString().split('T')[0], user.sex, id]
        );
        return result.affectedRows;
    }

    export async function deleteUserById(id: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

