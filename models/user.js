import mongoose from 'mongoose';
import 'mongoose-type-email';
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    name       : String,
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true,
        unique: true,
    },
    password       : String,
});

module.exports = mongoose.model("User", UserSchema);