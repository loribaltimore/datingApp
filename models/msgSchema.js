let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let model = mongoose.model;
let User = require('./userModel');

let msgSchema = new Schema({
    body: {
        type: String,
        max: 500,
        min: 1,
        required:true
    },
    expireAt: {
        type: Date,
        default: Date.now,
        expires: 604800
    }
},
    { timestamps: true }
);

let Msg = model('msg', msgSchema);

module.exports = Msg;
