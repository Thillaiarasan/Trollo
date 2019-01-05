import Router from 'koa-router'
import { List, Board, Card } from '../models'
import mongoose from 'mongoose';

const router = new Router()
router.prefix('/api/users')

router.post('/', async (ctx, next) => {
    // await boardControlller.get(ctx)
    const {email, password} = ctx.request.body;
    ctx.body = {
        email,
        password,
        id: 1,
        name: 'Hoang',
    };
})

export default router;