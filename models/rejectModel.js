let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let model = mongoose.model;
let User = require('./userModel');


let rejectSchema = new Schema({
    match_id: {
        type: mongoose.Types.ObjectId
    },
    expireAt: {
        type: Date,
        default: Date.now,
        expires: 2629800
    }
},
    {timestamps: true}
);

let Reject = model('reject', rejectSchema);

module.exports = Reject;


///issue is with expireAt. 
///the populate came up empty because there were none in ypur database to populate from, but the ids were
///still saved in your array. 
///msgs worked because you hadnt configured the expiresAt in the same way
///figure out expiring or create a new system to store msgs and rejects.
///without expiring there isn't a point in them being models