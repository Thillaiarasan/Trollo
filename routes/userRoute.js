import Router from 'koa-router'
import bcrypt from 'bcrypt'
import { User } from '../models';
import jwt from 'jsonwebtoken';
import joi from 'joi';

const SECRET = 'pm102-trollo';


const strList = joi.array().items(joi.string());
const userSchema = joi.object({
    name: joi.string().required(),
    password: joi.string().required(),
    email: joi.string().email({ minDomainAtoms: 2 })
});

const   router = new Router()
router.prefix('/api/users')

router.get('/search/:query', async (ctx, next) => {
  // await boardControlller.get(ctx)
  const { query } = ctx.params;
  let users = await User.find();
  users = users.filter(u => u.email.toLowerCase().includes(query.toLowerCase()))
  ctx.body = users;
});

router.post('/login', async (ctx, next) => {
  // await boardControlller.get(ctx)
  const { email, password } = ctx.request.body;
  const user = await User.findOne({ email });
  if (!user) {
    ctx.throw(404, 'User not found');
  }
  const valid = bcrypt.compare(password, user.password);
  if (valid) {
    const token = jwt.sign({email}, SECRET)
    ctx.body = {
      email: user.email,
      _id: user._id,
      name: user.name,
      token
    };
  }
  else {
    ctx.throw(403, 'Invalid authentication');
  }
});

router.post('/register', async (ctx, next) => {
  const {name, email, password} = ctx.request.body;
  console.log(password);
  const hashedPassword = await bcrypt.hashSync(password, 10)
  console.log(hashedPassword);
  try {
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    console.log(newUser);
    const validator = joi.validate(newUser, userSchema, { allowUnknown: true })
    if (validator.error) return ctx.throw(400, validator.error.details[0].message);
    await newUser.save();
    ctx.body = {
      status: 200,
      message: 'Register successfully'
    }
  } catch (error) {
    console.log(error)
    ctx.throw(500, error.message);
  }
})



export default router;