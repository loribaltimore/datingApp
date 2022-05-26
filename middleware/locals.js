let User = require('../models/userModel');
let { randomUserGenerate } = require('../middleware/functions');

module.exports.locals = async (req, res, next) => {
    
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.path = req.path;
    if (req.session.possibleMatches) {
        res.locals.totalPossibleMatches = req.session.possibleMatches.length 
    }
    next()
};

