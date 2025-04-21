import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Sex, User, Group } from '../data_layer/models';

const userSchema = Joi.object<User>({
    name: Joi.string().required(),
    surname: Joi.string().required(),
    birth_date: Joi.date().required(),
    sex: Joi.string().valid(Sex.Male, Sex.Female, Sex.Other).required(),
});

const groupSchema = Joi.object<Group>({
    name: Joi.string().required(),
});

export const verifyId = (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    console.log(`validating id ${id}`)
    if (isNaN(id) || id <= 0) {
        return res.status(400).send({ error: 'Invalid ID format. ID must be a positive number.' });
    }
    next();
};

export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = userSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        res.status(400).json({
            error: 'Invalid user data',
            details: error.details
        });
        return; 
    }
    req.body = value;
    next();
};

export const validateGroup = (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = groupSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error){
        res.status(400).json({
            rror: 'Invalid group data',
            details: error.details
        });
        return;
    }
    req.body = value;
    next();
};
