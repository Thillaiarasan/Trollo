import Koa from 'koa'
import BodyParser from 'koa-bodyparser'
import logger from 'koa-logger'
import koaJwt from 'koa-jwt'
import cors from '@koa/cors'
import db from './database/db'
import socketioJwt from 'socketio-jwt'
//Routes
import boardRoute from './routes/boardRoute'
import userRoute from './routes/userRoute'
//Models
import Board from './models/board'
import List from './models/list'
import Card from './models/card';
//Socket Listeners
import cardEvents from './socket-listeners/cardEvents';
import boardEvents from './socket-listeners/boardEvents';
import listEvents from './socket-listeners/listEvents';

const SECRET = 'pm102-trollo';

const app = new Koa();

//Establish database connection
db(app)

// Use the bodyparser middlware
app.use(cors())
app.use(BodyParser({ enableTypes: ['json'] }))
app.use(logger())
app.use(koaJwt({ secret: SECRET }).unless({ path: ['/api/users/register', '/api/users/login'] }))

// Routes
app.use(boardRoute.routes())
app.use(boardRoute.allowedMethods())

app.use(userRoute.routes())
app.use(userRoute.allowedMethods())

// Socket IO connection
const serve = app.listen(4000, function () {
  console.log("> Serve listening on port 4000")
});

let io = require('socket.io').listen(serve);
io.origins(['*:*'])
io.use(socketioJwt.authorize({
  secret: SECRET,
  handshake: true
}));
// Socket IO logic
let connections = {};
io.on('connection', socket => {
  console.log('hello! ', socket.decoded_token);
  console.log("> A new user connected ", socket.id);
  let {email} = socket.decoded_token;
  connections[email] = socket.id;

  socket.on('disconnect', function () {
    console.log('Disconnected - ' + socket.id);
  });

  //Boards
  boardEvents(io, socket, connections);
  //Lists
  listEvents(io, socket, connections);
  //Cards
  cardEvents(io, socket, connections);
})
module.exports = serve;