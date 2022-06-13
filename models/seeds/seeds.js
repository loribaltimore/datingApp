let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let model = mongoose.model;
let User = require('../userModel');
let Reject = require('../rejectModel');
let Chat = require('../chatModel');
let Msg = require('../msgSchema');
let Notify = require('../notificationSchema');
let passport = require('passport');
let LocalStrategy = require('passport-local');
mongoose.connect('mongodb://localhost:27017/datingApp');
let { names }  = require('./seedNames');
let cities = require('./cities')
let MapboxClient = require('mapbox');
let client = new MapboxClient('pk.eyJ1IjoibG9yaWJhMXRpbW9yZSIsImEiOiJja3ppbjA3Z3kwc2VrMnBxaGsxY3o0dnQ4In0.QzBP8BoDRGZetSuQiMVY7A');
let { spotifyAuth, promptSeed, video_game_seed,
    travelSeed, readingSeed, movieSeed,
    spotifySeed } = require('./detailedUsersSeeds');

let seedUser = async function () {
    // let allUsers = await User.deleteMany({username: !'dev' });
    let thisDev = await User.deleteOne({ username: 'dev' });
    let randomCity = `${cities[Math.floor(Math.random() * cities.length - 1)].city}, ${cities[Math.floor(Math.random() * cities.length - 1)].state}`;
    let randomName = [names[Math.floor(Math.random() * names.length - 1)], names[Math.floor(Math.random() * names.length - 1)]];
    let answer = ['Yes', 'No'];
    let password = 'dev';
    let newUser = await new User({
            email: `lorib@gmail.com`,
            username: 'dev',
        bio: {
            first_name: 'Dakota',
            last_name: 'Boing',
            location: {
                geometry: { type: 'Point', coordinates: [ -122.3301, 47.6038 ] },
                name: 'Seattle Washington'
              },
            age: Math.floor(Math.random() * 32 + 18),
            img: [
                {
                    path: 'https://res.cloudinary.com/demgmfow6/image/upload/v1647578718/user-photos/waxjanmzemsc7op4yfzp.jpg',
                    filename: 'user-photos/waxjanmzemsc7op4yfzp',
                  },
                  {
                    path: 'https://res.cloudinary.com/demgmfow6/image/upload/v1647578718/user-photos/kqgc10nhk5ameyu7tjjd.jpg',
                    filename: 'user-photos/kqgc10nhk5ameyu7tjjd',
                  }
            ],
            member_since: Date()
        },
        matching:{
            average_rating: { rated_by: 1, rating: 5 },
            liked: [],
            matches: [],
            rejected: [],
            match_id: mongoose.Types.ObjectId()
          },
        personality: {
            habits: {
                smoking: 'Yes',
                drinking: 'Yes',
                drugs: 'No',
                weed: 'No',
            },
            hobbies: {
                exercise: ['Running', 'Hiking'],
                music: spotifySeed,
                video_games: video_game_seed,
                travel: travelSeed,
                reading: readingSeed,
                movies_and_tv: movieSeed
            },
            prompts: promptSeed
        },
        auth: {
            spotify: spotifyAuth
        }
    });
    await User.register(newUser, password);
    await newUser.save();
    console.log(newUser)
}
// for (let i = 0; i < 50; i++){
    // seedUser();
// }

let resetRatings = async function () {
    // let allMsg = await Msg.deleteMany({});
    // let allChat = await Chat.deleteMany({});
    let allUsers = await User.find({});
    // let allNotif = await Notify.deleteMany({});
    let currentUser = await User.findOne({ username: 'dev' });
    let breandan = await User.findOne({ 'bio.first_name': 'Breandan' });
    let bai = await User.findOne({ username: 'Bailley' });

    // let data = await client.geocodeForward('427 Bellevue Way SE Bellevue Washington').then(data => console.log(data.entity.features[0])).catch(err => console.log(err))
    // currentUser.matching.liked = [];
    // currentUser.matching.rejected = [];
    // currentUser.limit.start = undefined;
    // currentUser.limit.count = 0;
    // currentUser.matching.matches = [];
    // currentUser.notifications = [];
    // breandan.matching.liked = [];
    // breandan.matching.rejected = [];
    // breandan.limit.start = undefined;
    // breandan.limit.count = 0;
    // breandan.matching.matches = [];
    // breandan.notifications = [];
    // await currentUser.save();
    // await breandan.save();
//     for (let user of allUsers) {
//         user.notifications = [];
//         user.matching.liked = [];
//         user.matching.matches = [];
//         user.matching.rejected = [];
//         user.matching.chat = [];
//         await user.save();
//    }
// let coords = [
//     [18.638871889816645, 73.72858586016072],
//     [18.619739909723343, 73.7299732884603],
//     [18.65253449529855, 73.77153350954103],
//     [18.613812286792573, 73.72085377787351],
//     [18.71180659226937, 73.71181185434831],
//     [18.621696130437005, 73.71888818658562],
//     [18.642767953416186, 73.72112875862214],
//     [18.62187883912188, 73.73424797889263]
// ];
//     for (let user of allUsers) {
//         let randomCoord = Math.floor(Math.random() * coords.length - 1);
//         if (randomCoord === -1) {
//             randomCoord +=1
//         };
//         let coord = coords[randomCoord];
//         user.preferences.distance.desired = 5;
//         user.preferences.distance.currentLoc = {
//             lat: coord[0],
//             lon: coord[1]
//         };
//         await user.save();
//     }

    // for (let user of allUsers) {
    //     if (allUsers.indexOf(user) <= 31) {
    //         user.preferences.gender = 'Male';
    //             if (allUsers.indexOf(user) <= 15) {
    //                 user.preferences.seeking.push('Female')
    //             } else {
    //                 user.preferences.seeking.push('Queer')
    //             }
    //     } else if (allUsers.indexOf(user) > 31 && allUsers.indexOf(user) <= 62) {
    //         user.preferences.gender = 'Female';
    //             if (allUsers.indexOf(user) <= 45) {
    //                 user.preferences.seeking.push('Male')
    //             } else {
    //                 user.preferences.seeking.push('Queer')
    //             }
    //     } else {
    //         user.preferences.gender = 'Queer';
    //             if (allUsers.indexOf(user) <= 45) {
    //                 user.preferences.seeking.push('Female')
    //             } else {
    //                 user.preferences.seeking.push('Queer')
    //             }
    //     };
    //     await user.save();
    // }
    
    console.log(currentUser.matching.match_id);
    console.log(breandan.matching.match_id);
    console.log(bai.matching.match_id);



console.log("DONE")

};


    resetRatings();





  