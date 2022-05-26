class AppError extends Error{
    constructor(status, message) {
        super(),
        status = this.status,
        message = this.message
    }
};

let errHandler = async (err, req, res, next) => {
    let { message, status } = err;
    res.render('errPage', {message, status});
};

module.exports = { AppError, errHandler };