import Router from 'koa-router';
import { Board, List, Card } from '../models';
import joi from 'joi';
import mongoose from 'mongoose';

const strList = joi.array().items(joi.string());
const boardSchema = joi.object({
    title: joi.string().required(),
    users: strList,
    lists: strList,
    isDeleted: joi.boolean(),
    owner: joi.string().required()
});

const router = new Router()
router.prefix('/api/boards')

router.get('/:userEmail', async (ctx, next) => {
    // await boardControlller.get(ctx)
    const { userEmail } = ctx.params;
    if (!userEmail) ctx.throw(404, 'Not found')
    try {
        const boards = await Board.find({
            users: { $in: [userEmail] },
            isDeleted: false
        });
        if (!boards) {
            ctx.throw(404, 'Not found')
        }
        ctx.body = boards;
        await next();
    } catch (error) {
        console.log(error)
    }
})

router.get('/:userEmail/byId/:id', async (ctx, next) => {
    // await boardControlller.getById(ctx)
    const { userEmail, id } = ctx.params;
    if (!userEmail || !id) ctx.throw(404, 'Not found')
    try {
        // get board
        const board = await Board.findOne({
            users: { $in: [userEmail] },
            _id: id,
            isDeleted: false
        });
        if (!board) {
            ctx.throw(404, 'Not found')
        }
        // get lists in board
        const listIds = board.lists.map(id => new mongoose.Types.ObjectId(id));
        const lists = await List.find({
            _id: { $in: listIds },
            isDeleted: false
        });
        // get cards in lists
        let cardIds = [];
        lists.forEach(list => {
            const ids = list.cards.map(id => new mongoose.Types.ObjectId(id));
            cardIds = cardIds.concat(ids);
        });
        const cards = await Card.find({
            _id: { $in: cardIds },
            isDeleted: false
        });
        ctx.body = { board, lists, cards };
        await next();
    } catch (error) {
        console.log(error)
    }
})

router.post('/', async (ctx, next) => {
    // const result = await boardControlller.create(ctx)
    const req = ctx.request.body;
    let board = new Board({
        title: req.title,
        users: req.users,
        lists: req.lists,
        owner: req.users[0]
    })
    const validator = joi.validate(board, boardSchema, { allowUnknown: true })
    if (validator.error) return ctx.throw(400, validator.error.details[0].message);

    try {
        await board.save();
        ctx.body = board;
    } catch (error) {
        console.log(error)
    }
});

router.put('/changeBoardTitle', async (ctx, next) => {
    const { boardToUpdate, email } = ctx.request.body;
    const { _id, title } = boardToUpdate;
    console.log(email);
    try {
        const board = await Board.findOneAndUpdate({_id: new mongoose.Types.ObjectId(_id), owner: email}, { $set: { title } }, { new: true });
        if (!board) ctx.throw(400, 'Invalid board id');
        ctx.body = board;
    } catch (error) {
        ctx.throw(error);
    }
})

router.put('/delete', async (ctx, next) => {
    // const {id} = ctx.params;
    const { email, _id } = ctx.request.body;
    try {
        const board = await Board.findOneAndUpdate({_id, owner: email, isDeleted: false}, { $set: { isDeleted: true } }, { new: true });
        if (!board) ctx.throw(400, 'Invalid board id');
        ctx.body = "Remove successfully";
    } catch (error) {
        console.log(error)
    }
})

router.put('/addMember', async (ctx, next) => {
    const { email, _id, owner } = ctx.request.body;
    try {
        const board = await Board.findOne({
            _id,
            owner
        });
        if (board.users.includes(email)) {
            ctx.throw(400, 'Invalid');
        }
        board.users.push(email);
        await board.save();
        if (!board) ctx.throw(400, 'Invalid board id');
        ctx.body = board;
    } catch (error) {
        ctx.throw(error);
    }
})

router.put('/removeMember', async (ctx, next) => {
    const { email, _id, owner } = ctx.request.body;
    try {
        const board = await Board.findOne({
            _id,
            owner
        });
        board.users = board.users.filter(u => u !== email);
        await board.save();
        if (!board) ctx.throw(400, 'Invalid board id');
        ctx.body = board;
    } catch (error) {
        ctx.throw(error);
    }
})

export default router
