import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PSW,
    database: process.env.MYSQL_DB,
    //debug: true,
}).promise();


export default pool;