let User = require('../models/userModel');
let Reject = require('../models/rejectModel');
let Chat = require('../models/chatModel');
let Msg = require('../models/msgSchema');
let Notify = require('../models/notificationSchema');
let AppError = require('../middleware/errHandling');
let querystring = require('querystring');
let axios = require('axios').default;
let { fetchMovies, habitSwitch, hobbiesSwitch,
    getGameCredentials, gameSearch, addMap,
    getRandPrompt, randomUserGenerate, chatServer,
    logout, deleteNotif, notifBuilder,
    nudgeBuilder, createClock, getClientLocation,
getUserDistance} = require('../middleware/functions');
let mongoose = require('mongoose');
let MapboxClient = require('mapbox');
const userRouter = require('./routers/userRouter');
let client = new MapboxClient(process.env.MAPBOX_TOKEN);


////User Route
module.exports.renderLogin = async (req, res, next) => {
    res.render('renderLogin')
};
module.exports.userLogin = async (req, res, next) => {
    let currentUser = req.user;
    let ipAddress = undefined
    if (currentUser.bio.location.loc_services === 'active') {
        ipAddress = req.ipinfo.ip.match(/:.+:(.+)/)[1];
        currentUser.preferences.distance.currentLoc = await getClientLocation(ipAddress).catch(err => console.log(err));
        await currentUser.save();
    };
    let possibleMatchList = await randomUserGenerate(currentUser)
        .then(data => { return data })
        .catch(err => next(err));
    if (possibleMatchList.length > 0) {
        req.session.possibleMatches = possibleMatchList.slice(0, 10);
        res.redirect('/user/home')
    } else {
        req.session.possibleMatches = [];
        req.flash('error', 'No Possible Matches. Try configuring your filters..')
        res.redirect('/user/home');
    }
};

module.exports.renderHome = async (req, res, next) => {
    let currentUser = req.user
    let timeFormat = undefined;
    let notifications = await currentUser.populate({ path: 'notifications' })
        .then(data => { return data.notifications })
        .catch(err => console.log(err));
    let allRandomPrompts = getRandPrompt(currentUser.personality.prompts, []);
    let currentTime = Date.now();
    if (currentTime - currentUser.limit.start >= 300000) {
        currentUser.limit.count = 0;
        currentUser.limit.start = undefined;
        await currentUser.save();
    };
    if (currentUser.limit.start !== undefined) {
        timeFormat = await createClock(currentUser)
        .then(data => { return data })
            .catch(err => next(err))
    };
    res.render('homePage', { allRandomPrompts, notifications, timeFormat });
};

module.exports.renderMatching = async (req, res, next) => {
    let matchID = req.params.match_id;
    let rated = undefined;
    let { id } = req.params;
    let currentUser = await User.findById(id);
    let currentLat = currentUser.preferences.distance.currentLoc.lat;
    let currentLon = currentUser.preferences.distance.currentLoc.lon;
    let prospectiveMatch = await User.findOne({ 'matching.match_id': matchID });
    let prospectiveLat = prospectiveMatch.preferences.distance.currentLoc.lat;
    let prospectiveLon = prospectiveMatch.preferences.distance.currentLoc.lon;
    let allRandomPrompts = getRandPrompt(prospectiveMatch.personality.prompts, []);
    let distance = getUserDistance(currentLat, currentLon, prospectiveLat, prospectiveLon);
    if (currentUser.matching.liked.indexOf(prospectiveMatch.matching.match_id) !== -1) {
        console.log(currentUser.matching.liked.indexOf(prospectiveMatch.matching.match_id) )
       rated = true;
    }

    res.render('matchProfilePage', {prospectiveMatch, allRandomPrompts, rated, distance})
};

module.exports.addImg = async (req, res, next) => {

};
module.exports.userDelete = async (req, res, next) => {
    console.log('User Delete Working')
};
/////Match Route
module.exports.startMatch = async (req, res, next) => {
    let { id } = req.params;
    let currentUser = await User.findById(id);
    if (req.session.possibleMatches.length > 1) {
        let nextMatch = req.session.possibleMatches.shift();
        res.redirect(`/user/${currentUser.id}/match/${nextMatch}`)
    } else {
        let possibleMatchList = await randomUserGenerate(currentUser)
            .then(data => { return data })
            .catch(err => next(err));
        if (possibleMatchList.length === 0) {
            req.flash('error', 'No Possible Matches. Try changing your filters..');
            res.redirect(`/user/${currentUser.id}/edit`)
        } else {
            req.session.possibleMatches = possibleMatchList.slice(0, 10);
            let nextMatch = req.session.possibleMatches.shift();
            res.redirect(`/user/${currentUser.id}/match/${nextMatch}`)
        }
    };
}
module.exports.engageMatch = async (req, res, next) => {
    let { id } = req.params;
    let { rating, interest, nudge } = req.body;
    let allUsers = await User.find({ id: !id });
    let matchID = req.params.match_id;
    let currentUser = await User.findById(id);
    let prospectiveMatch = await User.findOne({ 'matching.match_id': matchID });
    ///Rating
    if (rating) {
        prospectiveMatch.matching.average_rating.rating += parseInt(rating);
        prospectiveMatch.matching.average_rating.rated_by += 1;     
    };
    if (nudge === true) {
        console.log('NUDGE IS TRUE')
        req.flash('success', `We nudged ${prospectiveMatch.bio.first_name} for you!`);
        await notifBuilder(req, res, next, 'Nudge', nudge).then(data => { return data }).catch(err => next(err));
    };
        
    ///interested
    if (interest === 'interested') {
        if (currentUser.limit.count < 100) {
            currentUser.limit.count++;
        } else {
            currentUser.limit.start = Date.now();
            await currentUser.save();
            req.flash('error', 'Youre out of matches for today!')
            return res.redirect('/user/home');
        };
        if (prospectiveMatch.matching.liked.indexOf(currentUser.matching.match_id) !== -1) {
            currentUser.matching.matches.push(
                {
                    match_id: prospectiveMatch.matching.match_id,
                    name: prospectiveMatch.bio.first_name,
                    photo: prospectiveMatch.bio.img[0].path,
                    match_date: Date(),
                }
            );
            prospectiveMatch.matching.matches.push(
                {
                    match_id: currentUser.matching.match_id,
                    name: currentUser.bio.first_name,
                    photo: currentUser.bio.img[0].path,
                    match_date: Date(),
                }
            );
            await notifBuilder(req, res, next, 'Match', prospectiveMatch.matching.matches).then(data => { return data }).catch(err => next(err));
            req.flash('success', `You Matched with ${prospectiveMatch.bio.first_name}!`)
        } else if (prospectiveMatch.matching.liked.indexOf(currentUser.matching.match_id) === -1
            && prospectiveMatch.matching.rejected.indexOf(currentUser.matching.match_id) === -1) {
            currentUser.matching.liked.push(prospectiveMatch.matching.match_id);
            await notifBuilder(req, res, next, 'Like').then(data => { return data }).catch(err => next(err));
        }
    } else {
        let newReject = await new Reject({
            match_id: prospectiveMatch.matching.match_id
        }).save();
        currentUser.matching.rejected.push(newReject);
    };
        await prospectiveMatch.save()
        await currentUser.save();
    console.log('USERS ARE SAVED')
    if (req.session.possibleMatches.length > 1) {
        let nextMatch = req.session.possibleMatches.shift();
        res.redirect(`/user/${currentUser.id}/match/${nextMatch}`)
    } else {
        let possibleMatchList = await randomUserGenerate(currentUser)
            .then(data => { return data })
            .catch(err => next(err));
        if (possibleMatchList.length === 0) {
            req.flash('error', 'No Possible Matches. Try changing your filters..');
            res.redirect(`/user/${currentUser.id}/edit`)
        } else {
            req.session.possibleMatches = possibleMatchList.slice(0, 10);
            let nextMatch = req.session.possibleMatches.shift();
            res.redirect(`/user/${currentUser.id}/match/${nextMatch}`)
        }
    };
};
    
module.exports.unmatch = async (req, res, next) => {
    let { id, match_id } = req.params;
    let currentUser = await User.findById(id);
    let prospectiveMatch = await User.findOne({ 'matching.match_id': match_id });
    for (let match of currentUser.matching.matches) {
        if (match.match_id.toString() === match_id) {
            match.sort_value = 0;
            console.log(match)
        }
    };
    for (let match of prospectiveMatch.matching.matches) {
        console.log(match)
        if (match.match_id.toString() === currentUser.matching.match_id) {
            match.sort_value = 0;
            console.log(match)
        }
    };
    currentUser.matching.matches.sort(function (a, b) {
        return a.sort_value - b.sort_value
    }).shift();
    console.log(currentUser.matching.matches.length)
    console.log(prospectiveMatch.matching.matches.length);
    prospectiveMatch.matching.matches.sort(function (a, b) {
        return a.sort_value - b.sort_value
    }).shift();
    console.log(prospectiveMatch.matching.matches.length);
    // await currentUser.save();
    // await prospectiveMatch.save();
    console.log('Unmatch working')
}

module.exports.renderSignUp = async (req, res, next) => {
    let movieAPI = process.env.MOVIE_API_KEY;
res.render('signupPage', {movieAPI})
};


module.exports.UserEdit = async (req, res, next) => {
    console.log(req.body)

    if (req.body.habits) {
        habitSwitch(req, res, next);
    } else {
        console.log('userEdit working')
        hobbiesSwitch(req, res, next);
    };
};

module.exports.createUser = async (req, res, next) => {
    let ipAddress = req.ipinfo.ip.match(/:.+:(.+)/)[1];
    if (req.body.bio) {
        let { acct, bio, pref } = req.body;
        let { email } = acct;
        let { age } = pref;
        age = parseInt(age);
        let newCoord = await client.geocodeForward(bio.location.data).then(data => { console.log(data.entity.features[0]); return data.entity.features[0]})
            .catch(err => next(err));
        bio.location = { name: newCoord.place_name, geometry: newCoord.geometry, loc_services: bio.location.loc_services };
        pref.distance.desired *= 5;
        pref.age = age + 18;
        let newUser = await new User({
        username: acct.username,
        email: email,
            bio: bio,
        preferences: pref
        });
        newUser.preferences.distance.currentLoc = await getClientLocation(ipAddress).catch(err => console.log(err));
    if (req.files) {
        for (file of req.files) {
            newUser.bio.img.push({ filename: file.filename, path: file.path });
        }
    };
    newUser.matching.match_id = mongoose.Types.ObjectId();
    newUser.matching.average_rating.rating = 5;
    newUser.matching.average_rating.rated_by = 1;
    // let registeredUser = await User.register(newUser, acct.password);
    // await newUser.save();
    // req.login(registeredUser, function(err) {
    //     if (err) { return next(err); }
    //     return res.redirect('/user/home')
    //   });
    }
    
};

module.exports.renderUserEdit = async (req, res, next) => {
    let current_searchResults = undefined;
    let favorite_searchResults = undefined;
    let movieAPI = process.env.MOVIE_API_KEY;
    let booksAPI = process.env.BOOKS_API_KEY;
    res.render('editProfile', { movieAPI, favorite_searchResults, current_searchResults, booksAPI})

};

module.exports.videoGameTest = async (req, res, next) => {
    gameSearch(req, res, next)
};

module.exports.renderChat = async (req, res, next) => {
    console.log('1 RENDER CHAT')
    console.log('All matches are collected and sent as a local when this page renders')
    let { id } = req.params;
    let currentUser = await User.findById(id);
    let allMatches = currentUser.matching.matches;
    res.render('renderChat', {allMatches});
}
module.exports.renderChatroom = async (req, res, next) => {
    console.log('2 RENDER CHATROOM')
    let isRenderNudge = true;
    let { id, match_id } = req.params;
    let currentUser = await User.findById(id);
    let prospectiveMatch = await User.findOne({ 'matching.match_id': match_id });
    let nudge = currentUser.matching.matches.filter(function (element, index) {
        if (element.match_id.toString() === match_id) {
            return element
        }
    }).map(x => x.nudge.asked)[0];
    if (nudge === true) {
        isRenderNudge = false;
    };
    let allChatPopCurrent = await currentUser.populate({ path: 'matching.chat'})
        .then(data => {return data})
        .catch(err => console.log(err));
    console.log(allChatPopCurrent.matching.chats);
    console.log('GET ALL CURRENTUSERS CHATS. IF THERE ARE ANY CHATS...');
    if (allChatPopCurrent.matching.chat.length) {
        console.log('THERE IS AT LEAST ONE, BUT IS IT THE CURRENT WITH THE USER YOURE CHATTING WITH?')
        let currentChatCurrent = allChatPopCurrent.matching.chat.filter(function (element, index) {
            if (element.match_id === match_id) {
                return element.id
            }
        });
        if (currentChatCurrent[0] !== (undefined)) {
            console.log('YES IT IS')
            let allChatPopProspective = await prospectiveMatch.populate({ path: 'matching.chat'})
        .then(data => {return data})
                .catch(err => console.log(err));
            console.log(allChatPopProspective.matching.chats);
            console.log("FINDING CURRENTUSER IN PROSPECTIVEMATCHES CHATS")
            let currentChatProspective = allChatPopProspective.matching.chat.filter(function (element, index) {
                if (element.match_id === currentUser.matching.match_id.toString()) {
                    return element.id
                }
            });
            ///them in mine
            let chatFindCurrent = await Chat.findById(currentChatCurrent[0]);
            ///me in theirs
            let chatFindProspective = await Chat.findById(currentChatProspective[0]);
            console.log('The renderChat page is populated from the currentUsers chat list');
            console.log('What I need to do is change their chat with my info to read, because I have clicked the chat')
            console.log('BEFORE '+ chatFindProspective )
            if (chatFindProspective.status === 'unread') {
                chatFindProspective.status = 'read'; 
            };
            console.log('AFTER '+ chatFindProspective )
            await chatFindProspective.save();
            let allMsgPopCurrent = await chatFindCurrent.populate({ path: 'messages' })
                .then(data => {return data })
                .catch(err => console.log(err));
            let allMsgPopProspective = await chatFindProspective.populate({ path: 'messages' })
                .then(data => { return data })
                .catch(err => console.log(err));
            let allMsgs = allMsgPopCurrent.messages.concat(allMsgPopProspective.messages).sort(function (a, b) {
                return a.createdAt.getTime() - b.createdAt.getTime()
            }).map(function (element, index) {
                return element.body
            });
            let read = chatFindCurrent.status;
            console.log('READ will indicate whether or not the other user has changed MY chat record to true, which means they have rendered our chatroom and seen MY MESSAGES')
            console.log('CREATE AN ARRAY OF ALL MESSAGES SENT BY EACH USER');
            console.log('send locals of prospectiveMatch, allMsgs array and nudge (which should always be FALSE if there are msgs')
            res.render('renderChatroom', { prospectiveMatch, allMsgs, nudge, isRenderNudge, read })
        } else {
            console.log('this probably never happens. if it does figure it out');
            let allMsgs = undefined;
            res.render('renderChatroom', { prospectiveMatch, allMsgs, nudge, isRenderNudge})
        }
    } else {
        console.log('YOU HAVE NO CHATS STARTED');
        console.log('Send locals of prospectiveMatch, allmsgs which is undefined and nudge which could be true or false')
        let allMsgs = undefined;
        let read = undefined;
        if (nudge === true) {
          nudge =  await nudgeBuilder(req).catch(err => next(err));
        }
        res.render('renderChatroom', { prospectiveMatch, allMsgs, nudge, isRenderNudge, read})
    }
 
}
module.exports.saveChat = async (req, res, next) => {
    console.log('Msg has been sent')
    let { id, match_id } = req.params;
    let { body, nudge } = req.body;
    let currentUser = await User.findById(id);
    let prospectiveMatch = await User.findOne({ 'matching.match_id': match_id });
    let newMsg = await new Msg({
        body: body
    }).save()
        .then(data => {return data })
        .catch(err => console.log(err));
    console.log('new msg create');
    let allChatsPop = await currentUser.populate({ path: 'matching.chat' })
        .then(data => {return data })
        .catch(err => console.log(err));
        let allChatIds = allChatsPop.matching.chat.map(function (element, index) {
            return element.match_id
        });
    let allChatsPopProspective = await prospectiveMatch.populate({ path: 'matching.chat' })
        .then(data => {return data })
        .catch(err => console.log(err));
        let allChatIdsProspective = allChatsPopProspective.matching.chat.map(function (element, index) {
            return element.match_id
        });
    console.log('All currentUser and prospectiveMatch chats populated, mapped to an array of ONLY chat.match_id')
    if (allChatIds.indexOf(match_id) === -1) {
        console.log('Msg sent to a user that you have not started a chat with yet')
        let newChatCurrent = await new Chat({
            match_id: match_id,
            messages: [newMsg],
            status: 'unread',
            most_recent: true
        }).save();
        let newChatProspective = await new Chat({
            match_id: currentUser.matching.match_id,
            messages: [],
        }).save();
        console.log('this is THEIR new Chat and status shouldnt exist at all on their end');
        console.log(newChatProspective);
        currentUser.matching.chat.push(newChatCurrent)
        prospectiveMatch.matching.chat.push(newChatProspective)
        console.log('New chat registered for each user');
    } else {
        console.log('You already have a chat established');
        let currentChat_id = allChatsPop.matching.chat[allChatIds.indexOf(match_id)].id;
        let prospectiveChat_id = allChatsPopProspective.matching.chat[allChatIdsProspective.indexOf(currentUser.matching.match_id.toString())].id;
        console.log('This should make the nudge false again')
        let legacyChat = await Chat.findById(currentChat_id);
        let legacyChatProspective = await Chat.findById(prospectiveChat_id);
        console.log(legacyChat)
        legacyChat.messages.push(newMsg.id);
        legacyChat.status = 'unread';
        if (legacyChatProspective.most_recent === true) {
            legacyChat.most_recent = true;
            legacyChatProspective.most_recent = false;
        };
        await legacyChat.save();
        await legacyChatProspective.save();
    };
 
    console.log('Notification for new message sent to receiver of ner message')
    await notifBuilder(req, res, next, 'Message').then(data => { return data }).catch(err => next(err));
    await prospectiveMatch.save();
    await currentUser.save();
}

module.exports.userLogout = async (req, res, next) => {
    logout(req, res, next);
}

module.exports.notificationHandler = async (req, res, next) => {
    let { id, match_id } = req.params;
    let { category } = req.body.notification;
    console.log("NOTIF HANDLER GOING OFFFF")
    await deleteNotif(req, res, next).catch(err => next(err));
    switch (category) {
        case 'Message':
            res.redirect(`/user/${id}/match/${match_id}/chat`);
            break;
        case 'Match':
            res.redirect(`/user/${id}/match/${match_id}`);
            break;
        case 'Nudge':
            res.redirect(`/user/${id}/match/${match_id}/chat`);
            break;
        case 'Like':
            res.redirect(`/user/${id}/match`);
            break;
    }
   
}

    ////errors and error page
///go through and establish reliable error handling

///need to make it so you can have an empty profile, no error without hobbies and habits etc

///have to dial in the API populations. Formats and errors;
////need uniform response in userEdit with updating reading. It's redirecting to homepage after updating

    ///instead of wikipedia
    ///all matches page
