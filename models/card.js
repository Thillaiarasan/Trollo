const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let Card = new Schema({
    title       : String,
    text     : String,
    users: [String],
    color: String,
    isDeleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Card', Card);