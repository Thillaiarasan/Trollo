// const mongoose = require('mongoose');
import mongoose from 'mongoose'
let Schema = mongoose.Schema;

let boardSchema = new Schema({
    title: String,
    users: [String],
    lists: [String],
    isDeleted: {
        type: Boolean,
        default: false
    },
    owner: {
        type: String,
        required: true
    }
});

const Board = mongoose.model("Board", boardSchema)
module.exports = Board;