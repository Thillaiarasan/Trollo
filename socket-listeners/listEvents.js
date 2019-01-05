import { Board, List, Card, User } from '../models';

module.exports = function (io, socket, connections) {
  socket.on('ADD_LIST_REQUEST', async ({ boardId, listTitle }) => {
    try {
      const board = await Board.findById(boardId);
      if (!board) {
        return
      }
      const newList = new List({
        title: listTitle,
        cards: [],
        isDelete: false
      })
      await newList.save();
      board.lists.push(newList._id);
      board.lists = Array.from(new Set(board.lists));
      await board.save();
      const response = { boardId: board._id, list: newList };
      board.users.forEach(user => {
        let socketId = connections[user];
        io.to(socketId).emit('ADD_LIST_SUCCESS', response)
      });
    } catch (error) {
      console.error(error)
    }

  })

  socket.on('CHANGE_LIST_TITLE_REQUEST', async (req) => {
    const { list: { _id, title }, boardId } = req;
    try {
      const board = await Board.findById(boardId);
      if (!board) {
        return
      }
      const list = await List.findByIdAndUpdate(_id, { $set: { title } }, { new: true });
      if (!list) {
        return;
      }
      const response = { boardId, list };
      board.users.forEach(user => {
        let socketId = connections[user];
        io.to(socketId).emit('CHANGE_LIST_TITLE_SUCCESS', response)
      });
    } catch (error) {
      console.error(error)
    }
  })

  socket.on('DELETE_LIST_REQUEST', async (req) => {
    const { boardId, listId } = req;
    try {
      const list = await List.findByIdAndUpdate(listId, { $set: { isDeleted: true } }, { new: true });
      const board = await Board.findById(boardId);
      board.lists = board.lists.filter(id => id !== listId);
      board.save();
      if (!list) {
        return;
      }
      board.users.forEach(user => {
        let socketId = connections[user];
        io.to(socketId).emit('DELETE_LIST_SUCCESS', req)
      });
    } catch (error) {
      console.error(error)
    }
  });

  socket.on('MOVE_LIST_REQUEST', async (req) => {
    const { oldListIndex, newListIndex, boardId, destListId, sourceListId } = req;
    try {
      const board = await Board.findById(boardId);
      const source = board.lists[oldListIndex];
      const dest = board.lists[newListIndex];
      console.log(board);
      if (source !== sourceListId || dest !== destListId) {
        return;
      }
      let newLists = [...board.lists];
      const [removedList] = newLists.splice(oldListIndex, 1);
      newLists.splice(newListIndex, 0, removedList);
      board.lists = newLists;
      await board.save();
      board.users.forEach(user => {
        let socketId = connections[user];
        io.to(socketId).emit('MOVE_LIST_SUCCESS', req)
      });
    } catch (error) {
      io.emit('MOVE_LIST_FAILURE', error);
    }
  })
}