import { Board, List, Card, User } from '../models';

module.exports = function (io, socket, connections) {
  socket.on('ADD_CARD_REQUEST', async (req) => {
    const { cardTitle, listId, boardId } = req;
    try {
      const board = await Board.findById(boardId);
      if (!board) {
        return;
      }
      const list = await List.findById(listId);
      if (!list) {
        io.emit('ADD_CARD_FAILURE', 'Not found')
        return;
      }
      const newCard = new Card({
        title: cardTitle
      })
      await newCard.save();
      list.cards.push(newCard._id);
      list.cards = Array.from(new Set(list.cards));
      await list.save();
      const result = { listId: list._id, card: newCard };
      board.users.forEach(user => {
        let socketId = connections[user];
        io.to(socketId).emit('ADD_CARD_SUCCESS', result)
      });
    } catch (error) {
      io.emit('ADD_CARD_FAILURE', error)
    }
  })

  socket.on('MOVE_CARD_REQUEST', async req => {
    const {
      cardId,
      oldCardIndex,
      newCardIndex,
      sourceListId,
      destListId,
      boardId
    } = req;
    try {
      const board = await Board.findById(boardId);
      if (!board) {
        return;
      }
      if (sourceListId === destListId) { //Move card in same list
        const sourceList = await List.findById(sourceListId);
        if (sourceList) {
          const sourceCard = sourceList.cards[oldCardIndex];
          if (sourceCard !== cardId) {
            return;
          }
          const newCards = Array.from(sourceList.cards);
          const [removedCard] = newCards.splice(oldCardIndex, 1);
          newCards.splice(newCardIndex, 0, removedCard);
          sourceList.cards = newCards;
          sourceList.save();
          // io.emit('MOVE_CARD_SUCCESS', req)
        }
      }
      else {
        const sourceList = await List.findById(sourceListId);
        const sourceCard = sourceList.cards[oldCardIndex];
        if (sourceCard !== cardId) {
          return;
        }
        const destList = await List.findById(destListId);
        if (sourceList && destList) {
          const sourceCards = Array.from(sourceList.cards);
          const [removedCard] = sourceCards.splice(oldCardIndex, 1);
          const destCards = Array.from(destList.cards);
          destCards.splice(newCardIndex, 0, removedCard);
          sourceList.cards = sourceCards;
          destList.cards = destCards;
          sourceList.save();
          destList.save();
          // io.emit('MOVE_CARD_SUCCESS', req)
        }
      }
      board.users.forEach(user => {
        let socketId = connections[user];
        io.to(socketId).emit('MOVE_CARD_SUCCESS', req)
      });
    } catch (error) {
      console.error(error)
    }
  })

  socket.on('CHANGE_CARD_TITLE_REQUEST', async req => {
    const { _id, title, boardId } = req;
    try {
      const board = await Board.findById(boardId);
      const card = await Card.findByIdAndUpdate(_id, { $set: { title } }, { new: true });
      console.log(card)
      if (!card) {
        io.emit('CHANGE_CARD_TITLE_FAILURE', 'Not found')
        return;
      }
      board.users.forEach(user => {
        let socketId = connections[user];
        io.to(socketId).emit('CHANGE_CARD_TITLE_SUCCESS', card)
      });
    } catch (error) {
      io.emit('CHANGE_CARD_TITLE_FAILURE', error)
    }
  })

  socket.on('DELETE_CARD_REQUEST', async (req) => {
    const { cardId, listId, boardId } = req;
    try {
      const board = await Board.findById(boardId);
      const card = await Card.findByIdAndUpdate(cardId, { $set: { isDeleted: true } }, { new: true });
      console.log(card);
      if (!card) {
        io.emit('DELETE_CARD_FAILURE', 'Not found');
        return;
      }
      const list = await List.findById(listId);
      list.cards = list.cards.filter(id => id !== cardId);
      list.save();
      board.users.forEach(user => {
        let socketId = connections[user];
        io.to(socketId).emit('DELETE_CARD_SUCCESS', req)
      });
    } catch (error) {
      io.emit('DELETE_CARD_FAILURE', error);
    }
  });
};