import Router from 'koa-router'
import { List, Board } from '../models'
import mongoose from 'mongoose';

const router = new Router()
router.prefix('/api/lists')

router.get('/:boardId', async (ctx, next) => {
    // await boardControlller.get(ctx)
    const { boardId } = ctx.params;
    if (!boardId) ctx.throw(404, 'Not found')
    try {
        const board = await Board.findById(boardId);
        if (!board) {
            ctx.throw(404, 'Not found')
        }
        const listIds = board.lists.map(id => new mongoose.Types.ObjectId(id));
        const lists = await List.find({
            _id: { $in: listIds },
            isDeleted: false
        });
        ctx.body = lists;
        await next();
    } catch (error) {
        console.log(error)
    }
})

export default router
