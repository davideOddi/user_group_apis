import { Group } from '../data_layer/models';
import { pool } from '../data_layer/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export function getGroups(): Promise<Group[]> {
    return selectGroups();
}

export function getGroup(id: number): Promise<Group | null> {
    return selectGroupById(id);
}

export async function createGroup(group: Group): Promise<Group | null> {
    console.log('qui')
    console.log(group)
    const groupId = await insertGroup(group);
    return selectGroupById(groupId);
}

export async function updateGroup(group: Group, id: number): Promise<Group | null> {
    const affectedRows = await modifyGroup(id, group);
    if (affectedRows > 0) {
        return selectGroupById(id);
    }
    return null;
}

export async function deleteGroup(id: number): Promise<Group | null> {
    const groupToDelete = selectGroupById(id);
    if (groupToDelete != null && await deleteGroupById(id)) {
        return groupToDelete;
    }
    return null;
}

async function selectGroups(): Promise<Group[]> {
    const [groups] = await pool.query<RowDataPacket[]>('SELECT * FROM `groups`');
    return groups as Group[];
}

async function selectGroupById(id: number): Promise<Group | null> {
    const [groups] = await pool.execute<RowDataPacket[]>('SELECT * FROM `groups` WHERE id = ?', [id]);
    return groups[0] as Group || null;
}

async function insertGroup(group: Group): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO `groups` SET ?', [group]);
    return result.insertId;
}

async function modifyGroup(id: number, group: Omit<Group, 'id'>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
        'UPDATE `groups` SET name = ? WHERE id = ?',
        [group.name, id]
    );
    return result.affectedRows;
}

async function deleteGroupById(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM `groups` WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}
