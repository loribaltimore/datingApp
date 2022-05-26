let express = require('express');
let userRouter = express.Router();
let { renderLogin, renderHome, UserEdit,
    startMatch, renderMatching, addImg, engageMatch,
    unmatch, userDelete, userLogin, approveSpotify,
    spotifyCallback, renderSignUp, createUser,
    renderUserEdit, videoGameTest, renderChat,
    renderChatroom, saveChat, userLogout,
    notificationHandler } = require('../userController');
let passport = require('passport');
let multer = require('multer');
let storage = require('../../middleware/cloudinaryConfig');
let upload = multer(storage);
let { locals } = require('../../middleware/locals');
let { isAuth, isOwner } = require('../../middleware/auth');
let { asyncCatch } = require('../../middleware/functions');
let { userValidate, personalityValidate } = require('../../middleware/validators');

userRouter.use(locals);


userRouter.get('/edit', (req, res, next) => {
res.render('editProfile')
})

userRouter.route('/home')
    .get(isAuth, asyncCatch(renderHome))
   
 ///Login Page
userRouter.route('/auth/login')
    .get(asyncCatch(renderLogin))
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/user/auth/login' }), userLogin)
    
userRouter.route('/auth/logout')
.get(userLogout)

userRouter.get('/auth/spotify', UserEdit);

userRouter.route('/auth/signup')
    .get(asyncCatch(renderSignUp))
    .post(upload.array('img'), userValidate, asyncCatch(createUser));

userRouter.route('/:id/edit')
    .get(isAuth, asyncCatch(renderUserEdit));

userRouter.post('/:id/videogame', isAuth, asyncCatch(videoGameTest))

userRouter.route('/:id')
    .get()///profile home
    .put(isOwner, personalityValidate, asyncCatch(UserEdit))///user edit
    .post(isOwner, asyncCatch(addImg))///user add
    .delete(isOwner, asyncCatch(userDelete)) ////user delete

userRouter.route('/:id/chat')
    .get(isOwner, renderChat);

userRouter.route('/:id/match')
    .get(startMatch)



userRouter.route('/:id/match/:match_id')
    .get(isOwner, asyncCatch(renderMatching))///render match page
    .post(isOwner, asyncCatch(engageMatch))///add like or comment
    .delete(isOwner, asyncCatch(unmatch)) ///delete match

    userRouter.route('/:id/match/:match_id/notifications')
    .post(notificationHandler)

userRouter.route('/:id/match/:match_id/chat')
    .get(isOwner, renderChatroom)
    .post(isOwner, saveChat)


userRouter.get('*', renderLogin);
module.exports = userRouter;

///why is matching logging me out? it is ending my session with passport for some reason.


