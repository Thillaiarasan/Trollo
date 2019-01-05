const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let ListSchema = new Schema({
    title: String,
    cards: [String],
    isDeleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("List", ListSchema);