let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let model = mongoose.model;

let notificationSchema = new Schema({
    category: {
        type: String,
        enum: ['Match', 'Account', 'Profile', 'Message', 'Nudge', 'Admin', 'Like']
    },
    from: {
        match_id: {
            type: mongoose.Types.ObjectId
        },
        name: {
            type: String
        },
        photo: {
            type: String
        },
    },
    message: {
        type: String,
        required: true
    },
    sort_value: {
        type: Number,
        default: 1
    }
},
);

let Notify = model('notification', notificationSchema);

module.exports = Notify;