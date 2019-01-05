import { Board, List, Card, User } from '../models';

module.exports = function (io, socket, connections) {
  socket.on('DELETE_BOARD_REQUEST', async req => {
    const { email, _id } = req;
    try {
      const board = await Board.findOneAndUpdate({ _id, owner: email, isDeleted: false }, { $set: { isDeleted: true } }, { new: true });
      if (!board) return;
      board.users.forEach(user => {
        let socketId = connections[user];
        io.to(socketId).emit('DELETE_BOARD_SUCCESS', board);
      });
    } catch (error) {
      console.error(error)
    }
  })

  socket.on('ADD_MEMBER_REQUEST', async req => {
    const { email, _id, owner } = req;
    try {
      const board = await Board.findOne({
        _id,
        owner
      });
      if (!board || board.users.includes(email)) {
        io.emit('UPDATE_MEMBER_FAILURE', 'Invalid');
        return;
      }
      board.users.push(email);
      board.users = Array.from(new Set(board.users));
      await board.save();
      board.users.forEach(user => {
        let socketId = connections[user];
        io.to(socketId).emit('UPDATE_MEMBER_SUCCESS', {
          board,
          email
        })
      });
    } catch (error) {
      io.emit('UPDATE_MEMBER_FAILURE', error);
    }
  })

  socket.on('REMOVE_MEMBER_REQUEST', async req => {
    const { email, _id, owner } = req;
    try {
      const board = await Board.findOne({
        _id,
        owner
      });
      const prevUsers = [...board.users];
      board.users = board.users.filter(u => u !== email);
      if (!board) {
        io.emit('UPDATE_MEMBER_FAILURE', 'Invalid');
        return;
      }
      await board.save();
      prevUsers.forEach(user => {
        let socketId = connections[user];
        io.to(socketId).emit('UPDATE_MEMBER_SUCCESS', {
          board,
          email
        })
      });
    } catch (error) {
      console.error(error);
    }
  })
}