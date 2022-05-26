let axios = require('axios').default
let mongoose = require('mongoose');
let User = require('../models/userModel');
let MapboxClient = require('mapbox');
let client = new MapboxClient(process.env.MAPBOX_TOKEN);
let querystring = require('querystring');
let express = require('express');
let app = express();
let http = require('http');
let server = http.createServer(app);
let { Server } = require('socket.io');
let io = new Server(server);
let Notify = require('../models/notificationSchema');
let AppError = require('../middleware/errHandling');

function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

module.exports.getUserDistance =  (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d * 0.6213712;
  }

module.exports.randomUserGenerate = async (currentUser) => {
    let lat = currentUser.preferences.distance.currentLoc.lat;
    let lon = currentUser.preferences.distance.currentLoc.lon;
    let distance = currentUser.preferences.distance.desired;
    let allRejects = await currentUser.populate('matching.rejected')
        .then(data => {
            return data.matching.rejected.map(function (element, index) {
                return element.match_id
            });
        }).catch(err => console.log(err));
    let allLiked = currentUser.matching.liked;
    let allUsers = await User.find({})
        .then(data => {
            return data.filter(function (element, index) {
                if (element.id !== currentUser.id
                    && currentUser.preferences.seeking.indexOf(element.preferences.gender) > -1
                    && allRejects.indexOf(element.matching.match_id) === -1
                    && allLiked.indexOf(element.matching.match_id) === -1
                    && module.exports.getUserDistance(lat, lon, element.preferences.distance.currentLoc.lat, element.preferences.distance.currentLoc.lon)
                    <= (distance && element.preferences.distance.desired)) {
                    return element
                }
            }).map(x => x.matching.match_id.toString());
        }).catch(err => console.log(err));
   
    return allUsers;
    
}



// module.exports.randomUserGenerate = async (currentUser) => {
//     ///find all users and filter out current
//     let allUsers = await User.find({})
//         .then(data => {
//             return data.filter(function (element, index) {
//                 if (element.id !== currentUser.id && currentUser.bio.seeking.indexOf(element.bio.gender) > -1) {
//                     return element
//                 }
//             })
//         }).catch(err => console.log(err));
//     let random = Math.floor(Math.random() * allUsers.length - 1);
//     if (random === -1) {
//         random = 0
//     };
//     console.log(currentUser.matching.liked.length + currentUser.matching.rejected.length);
//     console.log(allUsers.length)
//     ///populate all currentUsers rejected and filter out each match_id
//     let allRejects = await currentUser.populate('matching.rejected')
//         .then(data => {
//                 return data.matching.rejected.map(function (element, index) {
//                     return element.match_id
//                 });
//         }).catch(err => console.log(err));
//     let allLiked = currentUser.matching.liked;
//     ///if the random users match_id is not in allRejects then user is next Match
//     if (allRejects.indexOf(allUsers[random].matching.match_id) === -1
//         && allLiked.indexOf(allUsers[random].matching.match_id) === -1) {
//         let nextMatch = allUsers[random];
//         console.log('THIS IS THE NEXT ID')
//         console.log(nextMatch.id)
//         if (nextMatch === undefined) {
//             console.log(random);
//             console.log(allUsers[random])
//         } else {
//             console.log('NEXT MATCH IS NOT UNDEFINED')
//         }
//         return nextMatch;
//     } else {
//         console.log('ANOTHER GO OF IT')
//         await this.randomUserGenerate(currentUser).then(data => {return data}).catch(err => console.log(err));
//     }
//     };

let spotifyTop = async (req, res, next) => {
    let { id } = req.params;
    let currentUser = await User.findById(req.user.id);
    let spotifyInfo = await axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/me/top/tracks?limit=5',
        headers: {
            'Authorization': `Bearer ${currentUser.auth.spotify.access_token}`,
            'Content-Type': 'application/json'
        }
    }).then(res =>{return res.data} )
        .catch(err => console.log(err));
    let { items } = spotifyInfo;
    let allSpotifyInfo = items.map(function (element, index) {
        return { artist: element.artists[0].name, cover: element.album.images[0].url, track: element.name }
    });
    currentUser.personality.hobbies.music.spotify = allSpotifyInfo;
    await currentUser.save();
}

let refreshSpotify = async (req, res, next, refreshToken) => {
    let currentUser = req.user;
    let client_id = process.env.CLIENT_ID;
    let client_secret = process.env.CLIENT_SECRET;
    let newToken = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
            grant_type: 'refresh_token',
            refresh_token: currentUser.auth.spotify.refresh_token,
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(res => { return res })
        .catch(err => console.log(err));
    if (newToken) {
        await currentUser.updateOne({ 'auth.spotify': newToken.data });
        await currentUser.updateOne({ 'auth.spotify.refresh_token': currentUser.auth.spotify.refresh_token });
    }
    spotifyTop(req, res, next);
    req.flash('success', 'Successfully refreshed Spotify!')
    res.redirect('home')
}

let deleteSpotify = async (req, res, next) => {
    let { id } = req.params;
    let currentUser = await User.findByIdAndUpdate(id, { 'auth.spotify': {} });
    currentUser.personality.hobbies.music.spotify = [];
    await currentUser.save();
    req.flash('success', 'Successfully delete Spotify!')
    res.redirect('home')
};

let approveSpotify = async (req, res, next) => {
    console.log('getting here')
    let currentUser = req.user.id;
    let client_id = process.env.CLIENT_ID;
    let client_secret = process.env.CLIENT_SECRET;
    var scope = 'user-top-read';
    let originalState = '123erfgdv2e3t4hrgbewf23tghegbfvwf2rg3v';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            redirect_uri: `http://portfolio:3000/user/auth/spotify`,
            scope: scope,
            state: originalState
        })
    );
};

let spotifyCallback = async (req, res, next) => {
        let currentUser = await User.findById(req.user.id);
        let client_id = process.env.CLIENT_ID;
        let client_secret = process.env.CLIENT_SECRET;
        var scope = 'user-top-read';
        let originalState = '123erfgdv2e3t4hrgbewf23tghegbfvwf2rg3v';
        let code = req.query.code;
    let state = req.query.state;
            if (state !== originalState) {
              res.redirect('/user/auth/login' +
                querystring.stringify({
                  error: 'state_mismatch'
                }));
                req.flash('error', 'Authentication Error; Try Again Later')
            } else {
                let information = await axios({
                    method: 'post',
                    url: 'https://accounts.spotify.com/api/token',
                    params: {
                        code: code,
                        redirect_uri: 'http://portfolio:3000/user/auth/spotify',
                        grant_type: 'authorization_code',
                    },
                    headers: {
                        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    json: true
                }).then(res => {  return res})
                    .catch(err => console.log(err));
                // let { access_token, token_type, expires_in, refresh_token, scope } = information.data;
                let { data } = information;
                console.log('THIS IS THE DATA')
                console.log(data)
                await currentUser.updateOne({ 'auth.spotify': data });
                await spotifyTop(req, res, next)
                    .then(data => { console.log(data); return data })
                    .catch(err => console.log(err));
                res.redirect('/user/home');
            }  
    }

let randNum = function (prompts) {
    let randNum = Math.floor(Math.random() * prompts.length);
    let randPrompt = prompts[randNum];
    return randPrompt
}

module.exports.getRandPrompt = (prompts, randPrompts) => {
    let randPrompt = randNum(prompts);
    if (randPrompts.length !== prompts.length && randPrompts.length < 3) {
        if (randPrompts.indexOf(randPrompt) === -1) {
            randPrompts.push(randPrompt)
        };
            this.getRandPrompt(prompts, randPrompts)
    };
    return randPrompts
};


module.exports.fetchMovies = async (movieTitle) => {
    await axios({
        method: 'get',
        url: 'https://api.themoviedb.org/3/search/movie',
        params: {
            api_key: process.env.MOVIE_API_KEY,
            query: movieTitle,
            include_adult: false
        },
        headers: {
            'Content-Type': 'application-json'
        }
    }).then(res => { console.log(res.data.results); return res })
        .catch(err => console.log(err));
};

let getGameCredentials = async (req, res, next) => {
    let gameCredentials = await axios({
        method: 'post',
        url: 'https://id.twitch.tv/oauth2/token',
        params: {
            client_id: process.env.TWITCH_CLIENT,
            client_secret: process.env.TWITCH_SECRET,
            grant_type: 'client_credentials'
        },
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => { return response.data })
        .catch(err => console.log(err));
    return gameCredentials
}

module.exports.gameSearch = async (req, res, next) => {
    let { current_search, favorite_search } = req.body.vg;
    let movieAPI = process.env.MOVIE_API_KEY;
    let booksAPI = process.env.BOOKS_API_KEY;
    let favorite_searchResults = undefined;
    let current_searchResults = undefined;
    let {access_token} = await getGameCredentials()
        .then(data => { return data})
        .catch(err => console.log(err));
    let gameResults =  await axios({
        method: 'get',
        url: 'https://api.igdb.com/v4/games',
        params: {
            search: (current_search ? current_search : favorite_search),
            fields: 'cover.image_id, release_dates.human, name '
        },
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT,
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }
    }).then(response => { return response.data }).catch(err => console.log(err));
    if (current_search) {
       current_searchResults = gameResults;
    } else {
       favorite_searchResults = gameResults;
    };
res.render('editProfile', {current_searchResults, favorite_searchResults, movieAPI, booksAPI})
}
////get the release dates to easily show on the page by changing them on the backend before they go up front
module.exports.habitSwitch = async (req, res, next) => {
    let { id } = req.params;
    let { habits } = req.body;
    switch (habits) {
        case habits[smoking]:
            let editUser = await User.findByIdAndUpdate(id, { 'personality.habits.smoking': req.body[smoking] });
            break;
        case habits[drinking]:
             editedUser = await User.findByIdAndUpdate(id, { 'personality.habits.drinking': req.body[drinking] });
            break;
        case habits[drugs]:
             editedUser = await User.findByIdAndUpdate(id, { 'personality.habits.drugs': req.body[drugs] });
            break;
        case habits[weed]:
             editedUser = await User.findByIdAndUpdate(id, { 'personality.habits.weed': req.body[weed] });
            break;
    };
    res.redirect(`${id}/edit`);
};

let exerciseSwitch = async (req, res, next) => {
    let { id } = req.params;
    let { exercise } = req.body;
    let editedUser = await User.findById(id);
    exercise = exercise.filter(function (element, index) {
        if (editedUser.personality.hobbies.exercise.indexOf(element) === -1) {
                return element
            }
    });
    editedUser.personality.hobbies.exercise.push(...exercise);
    await editedUser.save();
    req.flash('success', 'Successfully Updated Exercise')
    res.redirect(`${id}/edit`)
};

let musicSwitch = async (req, res, next) => {
    let { id } = req.params;
    console.log('music working')
    let { music_plays, music_listens } = req.body;
    let editedUser = await User.findById(id);
    if (music_plays) {
        music_plays =  music_plays.filter(function (element, index) {
            if (editedUser.personality.hobbies.music.plays.indexOf(element) === -1) {
                return element
            };
        });
        editedUser.personality.hobbies.music.plays.push(...music_plays);
    };
    if (music_listens) {
        music_listens =  music_listens.filter(function (element, index) {
            if (editedUser.personality.hobbies.music.listens_to.indexOf(element) === -1) {
                return element
            };
        });
        editedUser.personality.hobbies.music.listens_to.push(...music_listens);
    };
    await editedUser.save();
    req.flash('success', 'Successfully Updated Music Taste')
    res.redirect(`${id}/edit`)
};


////why wont the form activate the videogames switch???//////////??????????????????????
let videoGamesSwitch = async (req, res, next) => {
    console.log(req.body)
    let { id } = req.params;
    let { plays, favorite, currently_playing } = req.body.vg;
    let editedUser = await User.findById(id);
    if (plays) {
        vg_plays =  plays.filter(function (element, index) {
            if (editedUser.personality.hobbies.video_games.plays.indexOf(element) === -1) {
                return element
            };
        });
     editedUser.personality.hobbies.video_games.plays.push(...plays);
    };
    if (favorite) {
        favorite = favorite.split('::');
        let posterSrc = `https://images.igdb.com/igdb/image/upload/t_cover_small_2x/${favorite[0]}.jpg`;
        let favoriteObject = { poster: posterSrc , title: favorite[1], release: favorite[2] };
        await editedUser.updateOne({ 'personality.hobbies.video_games.favorite': favoriteObject });
    };
    if (currently_playing) {
        current = currently_playing.split('::');
        let posterSrc = `https://images.igdb.com/igdb/image/upload/t_cover_small_2x/${current[0]}.jpg`;
        let currentObject = { poster: posterSrc , title: current[1], release: current[2] };
        await editedUser.updateOne({ 'personality.hobbies.video_games.currently_playing': currentObject });
    }
    await editedUser.save();
    req.flash('success', 'Video Game Updated Successfully!')
    res.redirect(`/user/${id}/edit`)
};
let readingSwitch = async (req, res, next) => {
    console.log('reading switch working')
    let { id } = req.params;
    let { favorite, currently_reading } = req.body.reading;
    let editedUser = await User.findById(id);
    if (currently_reading) {
        current = currently_reading.split('::');
        currentBook = { poster: current[1], title: current[0], author: current[2] };
        console.log(currentBook)
     await editedUser.updateOne({'personality.hobbies.reading.currently_reading': currentBook }) 
    };
    if (favorite) {
        favorite = favorite.split('::');
        favoriteBook = { poster: favorite[1], title: favorite[0], author: favorite[2] };

        await editedUser.updateOne({ 'personality.hobbies.reading.favorite': favoriteBook });
    };
    req.flash('success', 'Successfully updated Reading!')
   res.redirect('/user/home')
};

let travelSwitch = async (req, res, next) => {
    let { id } = req.params;
    let editedUser = await User.findById(id);
    for (let el in req.body.travel) {
        if (req.body.travel[el] !== '') {
            let query = req.body.travel[el];
            let forward = await client.geocodeForward(query)
            .then(res => { return { name: res.entity.features[0].place_name, geometry: res.entity.features[0].geometry } })
                .catch(err => console.log(err));
                if (el === 'been_to') {
                    await editedUser.updateOne({ 'personality.hobbies.travel.been_to': forward })
                } else {
                    await editedUser.updateOne({ 'personality.hobbies.travel.going_to':forward })
                };
        };
    }
    console.log(editedUser.personality.hobbies.travel);
    req.flash('success', 'Successfully updated Travel')
    res.redirect(`${id}/edit`);
};

let promptSwitch = async (req, res, next) => {
    let { id } = req.params;
    let currentUser =  await User.findById(id);
    let { promptResponse } = req.body;
    let response = promptResponse.split('::');
    let promptSet = currentUser.personality.prompts.map(x => x.topic);
    if (promptSet.indexOf(response[0]) == -1) {
        let promptRes = { topic: response[0], response: response[1] };
    currentUser.personality.prompts.push(promptRes);
    await currentUser.save()
        .then(data => console.log(data.personality.prompts))
        .catch(err => console.log(err));
        req.flash('success', 'Successfully updated Prompt!')
    res.redirect(`${id}/edit`)
    } else {
        currentUser.personality.prompts[promptSet.indexOf(response[0])].response = response[1];
        await currentUser.save().then(data => console.log(data.personality.prompts)).catch(err => console.log(err));
        req.flash('success', 'Successfully updated Prompt!')
        res.redirect(`${id}/edit`)
    }
    
}

let movieSwitch = async (req, res, next) => {
    let { id } = req.params;
    let { favorite, currently_watching } = req.body.movies_and_tv;
    let editedUser = await User.findById(id);
    if (favorite) {
        favorite = favorite.split('::');
        favorite.forEach(async (element, index) => {
            if (index === 0) {
                await editedUser.updateOne({ 'personality.hobbies.movies_and_tv.favorite.poster': `http://image.tmdb.org/t/p/w185/${element}` });
            } else if (index === 1) {
                await editedUser.updateOne({ 'personality.hobbies.movies_and_tv.favorite.title': element });
            }
            if (index === 2) {
                await editedUser.updateOne({ 'personality.hobbies.movies_and_tv.favorite.release': element });
            }
        });
    };
    if (currently_watching) {
        current = currently_watching.split('::');
        currentMovie = { poster: `http://image.tmdb.org/t/p/w185/${current[0]}`, title: current[1], release: current[2] };
        console.log(currentMovie);
        await editedUser.updateOne({ 'personality.hobbies.movies_and_tv.currently_watching': currentMovie });
    };
    req.flash('success', 'Successfully Updated Movie Taste')
    res.redirect(`${id}/edit`)
    await editedUser.save();

};


module.exports.hobbiesSwitch = async (req, res, next) => {
    if (Object.keys(req.body)[0]) {
        switch (Object.keys(req.body)[0]) {
            case 'exercise':
                exerciseSwitch(req, res, next);
                break;
            case ('music'):
                musicSwitch(req, res, next);
                break;
            case ('vg'):
                videoGamesSwitch(req, res, next);
                break;
            case 'travel':
                travelSwitch(req, res, next);
                break;
            case 'reading':
                readingSwitch(req, res, next);
                break;
            case 'movies_and_tv':
                movieSwitch(req, res, next);
                break;
            case 'promptResponse':
                promptSwitch(req, res, next);
                break;
            case 'approveSpotify':
                approveSpotify(req, res, next);
                break;
            case 'deleteSpotify':
                deleteSpotify(req, res, next);
                break;
            case 'refreshSpotify':
                refreshSpotify(req, res, next)
        };
    } else {
        spotifyCallback(req, res, next);
    }
};

module.exports.asyncCatch = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => next(err))
    }
};

module.exports.logout = async (req, res, next) => {
    req.logout()
    res.redirect('/user/auth/login');
}

module.exports.deleteNotif = async (req, res, next) => {
    console.log('deleteNotif')
    let { id, match_id } = req.params;
    let { notif_id, btn, category } = req.body.notification;
    let currentNotif = await Notify.findByIdAndUpdate(notif_id, { sort_value: 0 });
    console.log(currentNotif);
    let currentUser = await User.findById(id);
    let notifPop = await currentUser.populate({ path: 'notifications' })
        .then(data => { return data })
        .catch(err => console.log(err))
    console.log(notifPop.notifications.sort(function (a, b) {
        return a.sort_value - b.sort_value
    }));
    console.log('BEFORE ' + currentUser.notifications.length);
   
    notifPop.notifications.sort(function (a, b) {
        return a.sort_value - b.sort_value
    }).shift()
    currentUser.notifications = notifPop.notifications;
    console.log('AFTER ' + currentUser.notifications.length);
    await currentUser.save();
    let deleteNotif = await Notify.findByIdAndDelete(notif_id);
}

module.exports.notifBuilder = async (req, res, next, category, matches = undefined) => {
    let { id, match_id } = req.params;
    let { nudge } = req.body;
    let currentUser = await User.findById(id);
    let prospectiveMatch = await User.findOne({ 'matching.match_id': match_id });
    let nudgeRegex = new RegExp(`${prospectiveMatch.bio.first_name}`);
    let newNotif = await new Notify({
        category: category,
        from: {
            match_id: currentUser.matching.match_id,
            name: currentUser.bio.first_name,
            photo: currentUser.bio.img[0].path,
        },
        message: `You got a ${category} from ${currentUser.bio.first_name}!`,
    }).save()
        .then(data => { return data })
        .catch(err => console.log(err));
    prospectiveMatch.notifications.push(newNotif.id);
    console.log(`NOTIFICATION BUILT for ${category}`);
    if (category === 'Matched') {
        matches.forEach(function (element, index) {
            if (element.match_id.toString() === currentUser.matching.match_id.toString()) {
                element.nudge.asked = true;
            }
        });
        prospectiveMatch.matching.matches = matches;
    };
    console.log("THIS IS NUDGE " + req.body.nudge)
    if (nudge === true) {
        for (let match of prospectiveMatch.matching.matches) {
            console.log(match.match_id);
            console.log(currentUser.matching.match_id);
            if (match.match_id.toString() === currentUser.matching.match_id.toString()) {
                match.nudge.asked = true;
          }
        };
        for (let match of currentUser.matching.matches) {
            if (match.match_id.toString() === prospectiveMatch.matching.match_id.toString()) {
                match.nudge.recieved = true;
          }
    };
    } else if (nudgeRegex.test(nudge) === true) {
        console.log('SAVECHAT -- NUDGE IS TRUE')
        for (let match of currentUser.matching.matches) {
            if (match.match_id.toString() === match_id) {
                console.log('currentUser in Prospective matches changing nudge status');
                match.nudge.asked = false;
                match.nudge.replied = true;
            };
        };
        for (let match of prospectiveMatch.matching.matches) {
             if (match.match_id.toString() === currentUser.matching.match_id.toString()) {
                console.log('Prospective in currentUser matches changing nudge status');
                match.nudge.asked = false;
                match.nudge.replied = true;
            };
        };
    }
    await currentUser.save();
    await prospectiveMatch.save()
    return newNotif;
}

let hobbyCheck = async (req, finalHobby) => {
    for (let hobby in finalHobby) {
        if (hobby !== undefined && hobby.length) {
            break;
        } else {
            await nudgeBuilder(req).catch(err => console.log(err));
        }
    };
    return ''
};

let nudgeSwitch = async(req, hobby, user) => {
    let finalHobby = user.personality.hobbies[hobby];
    await hobbyCheck(req, finalHobby).catch(err => console.log(err));
console.log(finalHobby)
    let finalNudge = undefined;
    switch (hobby) {
        ///have to check to see if exercise works
        case 'exercise':
            if (finalHobby.length) {
                finalNudge = `${user.bio.first_name} loves ${finalHobby[0]}! What do you do to stay fit?`;
                break;
            } else {
                nudgeSwitch(hobby, user);
                break;
            };
            
        case 'music':
            if (finalHobby.plays.length) {
                finalNudge = `${user.bio.first_name} plays ${finalHobby.plays[0]}! Ask them their favorite song to play!`;
                break;
            } else if (finalHobby.listens_to.length) {
                finalNudge = `${user.bio.first_name} listens to a lot of ${finalHobby.listens_to[0]}! See if you like the same artists!`;
                break;
            } else {
                finalNudge = `${user.bio.first_name} loves ${finalHobby.spotify[0].artist}! Ask if they've seen them live!`;
                break;
            };

        case 'video_games':
            if (finalHobby.favorite) {
                finalNudge = `${user.bio.first_name}'s favorite game is ${finalHobby.favorite.title}! Do you like that game too?`;
                break;
            } else if (finalHobby.currently_playing) {
                finalNudge = `${user.bio.first_name} has been playing ${finalHobby.currently_playing.title}! See how they're liking it!`;
                break;
            };
        case 'reading':
            if (finalHobby.favorite) {
                finalNudge = `${user.bio.first_name}'s favorite book is ${finalHobby.favorite.title}! Have you read it?`;
                break;
            } else if (finalHobby.currently_playing) {
                finalNudge = `${user.bio.first_name} has been reading ${finalHobby.currently_playing.title} lately! See how they're liking it!`;
                break;
            };
        case 'movies_and_tv':
            if (finalHobby.favorite) {
                finalNudge = `${user.bio.first_name}'s favorite movie is ${finalHobby.favorite.title}! Have you watched it?`;
                break;
            } else if (finalHobby.currently_playing) {
                finalNudge = `${user.bio.first_name} has been watching ${finalHobby.currently_playing.title} lately! See how they're liking it!`;
                break;
            };
        case 'travel':
            if (finalHobby.going_to) {
                finalNudge = `${user.bio.first_name}'s next destination is ${finalHobby.going_to.name.split(',')[0]}! Have you been there?`;
                break;
            } else if (finalHobby.been_to) {
                finalNudge = `${user.bio.first_name}'s been to ${finalHobby.been_to.name.split(',')[0]}! Have you been there?`;
                break;
            }
    }
    return finalNudge;
}

module.exports.nudgeBuilder = async (req) => {
    let { id, match_id } = req.params;
    let currentUser = await User.findById(id);
    let prospectiveMatch = await User.findOne({ 'matching.match_id': match_id });
    let randHobby = undefined;
    let random = Math.floor(Math.random() * Object.keys(currentUser.personality.hobbies).length);
    let allHobbies = Object.keys(currentUser.personality.hobbies);
    if (allHobbies[random] !== undefined) {
       randHobby = allHobbies[random]; 
    } else {
        randHobby = allHobbies[random - 1];
    };
    let finalHobby = currentUser.personality.hobbies[randHobby];
    let theNudge = await nudgeSwitch(randHobby,randHobby, prospectiveMatch)
        .then(data => { return data })
        .catch(err => console.log(err));
    return theNudge;
}

module.exports.createClock = async (currentUser) => {
    let timeUntilMatching = Math.ceil((28800000 - (Date.now() - currentUser.limit.start)) / 3600000);
    let timeInSeconds = Math.ceil((28800000 - (Date.now() - currentUser.limit.start)) / 1000);
    let hoursTotal = Math.floor((timeInSeconds / 3600));
    let minutesLeft = Math.floor((timeInSeconds - (hoursTotal * 3600)) / 60);
    let secondsLeft = Math.floor((((timeInSeconds - (hoursTotal * 3600)) / 60) - minutesLeft) * 60);
    let timeFormat = {
        hours: hoursTotal,
        mins: minutesLeft,
        secs: secondsLeft
    };
    console.log(timeFormat)
    return timeFormat
}

module.exports.getClientLocation = async (ipAddress) => {
    let ip = '183.87.70.24';
    let request = await axios({
        method: 'get',
        url: `http://ip-api.com/json/${ip}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => { return response.data })
        .catch(err => console.log(err));
    let coords = {
        lat: request.lat,
        lon: request.lon
    };
    return coords;
}



  
  






///Lets make video games less confusing on the backend. Seems like we did it that way due to having to fetch 
//access token. let's make it more uniform.
