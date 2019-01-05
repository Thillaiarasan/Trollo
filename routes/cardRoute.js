import Router from 'koa-router'
import { List, Board, Card } from '../models'
import mongoose from 'mongoose';

const router = new Router()
router.prefix('/api/cards')

router.get('/:boardId', async (ctx, next) => {
    // await boardControlller.get(ctx)
    const { boardId } = ctx.params;
    if (!boardId) ctx.throw(404, 'Not found')
    try {
        const board = await Board.findById(boardId);
        if (!board) {
            ctx.throw(404, 'Not found')
        }
        const listIds = board.lists.map(id => new mongoose.Types.ObjectId(id));;
        const lists = await List.find({
            _id: { $in: listIds },
            isDeleted: false
        });
        let cardIds = [];
        lists.forEach(list => {
            const ids = list.cards.map(id => new mongoose.Types.ObjectId(id));
            cardIds = cardIds.concat(ids);
        });
        console.log(cardIds);
        const cards = await Card.find({
            _id: { $in: cardIds },
            isDeleted: false
        });
        ctx.body = cards;
        await next();
    } catch (error) {
        console.log(error)
    }
})

export default router
