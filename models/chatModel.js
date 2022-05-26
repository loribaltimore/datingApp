let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let model = mongoose.model;
let User = require('./userModel');
let Msg = require('./msgSchema');

let chatSchema = new Schema({
    match_id: {
        type: String
    },
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: 'msg'
        }
    ],
    status: {
        type: String,
        enum: ['read', 'unread']
    },
    most_recent: {
        type: Boolean,
        default: false
    }
});

let Chat = model('chat', chatSchema);

module.exports = Chat;

