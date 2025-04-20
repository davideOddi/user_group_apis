import express, { Express } from 'express';
import userHandler from './handlers/userHandler';
import groupHandler from './handlers/groupHandler';
import { errorHandler } from './handlers/errorHandler';

const SERVER_PORT: number = 3000;
const app: Express = express();

app.use('/users', userHandler);
app.use('/groups', groupHandler);

app.use(errorHandler);

app.listen(SERVER_PORT, () => {
    console.log(`Server listening on port ${SERVER_PORT}`);
});

