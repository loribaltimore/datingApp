module.exports.isAuth = async (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    } else {
        console.log('You are logged out')
        res.redirect('/user/auth/login')
    }
};

module.exports.isOwner = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.id === req.params.id) {
            next()
        }
    } else {
        req.flash('error', 'You have been logged out')
        res.redirect('/user/auth/login')
    }
};