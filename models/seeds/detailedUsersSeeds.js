module.exports.spotifySeed = {
    plays: [],
    listens_to: [],
    spotify: [
        {
            artist: 'Death',
            cover: 'https://i.scdn.co/image/ab67616d0000b273014e93e47bf1dc746cab4930',
            track: 'Symbolic',
        },
        {
            artist: 'Death',
            cover: 'https://i.scdn.co/image/ab67616d0000b27391fcdc499f2dbfbcd7e58b59',
            track: 'Spirit Crusher',
        },
        {
            artist: 'lil Cumtism',
            cover: 'https://i.scdn.co/image/ab67616d0000b2731ac87094fe56f6c421c22fa4',
            track: 'Beat My Wife 2',
        },
        {
            artist: 'All Time Low',
            cover: 'https://i.scdn.co/image/ab67616d0000b273c8913cd7b91bb7f6bbbec305',
            track: 'Dear Maria, Count Me In',
        },
        {
            artist: 'Memphis May Fire',
            cover: 'https://i.scdn.co/image/ab67616d0000b27361c5b88a32459a575a273d7c',
            track: 'Miles Away - feat. Kellin Quinn',
        }
    ]
};

module.exports.movieSeed = {
    favorite: {
        poster: 'http://image.tmdb.org/t/p/w185//nb1MLEOXVFBKTM4J9GLoksqgDBk.jpg',
        title: 'Blazing Saddles',
        release: '1974-02-07'
    },
    currently_watching: {
        poster: 'http://image.tmdb.org/t/p/w185//w0yIF8UPMNBDLwztmqgUoc4isLH.jpg',
        title: 'The Texas Chainsaw Massacre',
        release: '2003-05-21'
    }
};

module.exports.readingSeed = {
    favorite: {
        poster: 'http://books.google.com/books/content?id=gpwqbgA0m5EC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
        title: "Of Mice and Men: Teacher's Deluxe Edition",
        author: 'John Steinbeck'
    },
    currently_reading: {
        poster: 'http://books.google.com/books/content?id=XlD9DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
        title: 'Slaughterhouse-Five',
        author: 'Kurt Vonnegut'
    }
};

module.exports.travelSeeds = {
    been_to: {
        geometry: { type: 'Point', coordinates: [Array] },
        name: 'Detroit, Michigan, United States'
    },
    going_to: {
        geometry: { type: 'Point', coordinates: [Array] },
        name: 'United Kingdom'
    }
};

module.exports.video_game_seed = {
    favorite: {
        poster: 'https://images.igdb.com/igdb/image/upload/t_cover_small_2x/co4bku.jpg',
        title: 'Super Mario 64',
        release: '1997'
    },
    currently_playing: {
        poster: 'https://images.igdb.com/igdb/image/upload/t_cover_small_2x/co1wch.jpg',
        title: 'Kirby Air Ride',
        release: '2003'
    },
    plays: []
};

module.exports.promptSeed = [
    {
        topic: "Don't date me if...",
        response: 'You hate kitties mf',
    },
    {
        topic: "What's your favorite quote?",
        response: 'God is dead!',
    },
    {
        topic: 'The most important thing in life...',
        response: 'Is lookin G O O D',
    },
    {
        topic: 'The most important thing in a relationship is...',
        response: 'Honest and trust',
    }
];

module.exports.spotifyAuth = {
    access_token: 'BQCdxAsRRBZa4aLmUCSPdS1iyoWLSPGOe4tGyCFj4j9-UFQhngTdq-45Nhc6OOwlHC8LY42wU7rxeE_7MBBE40sm30z9rDwQqdGWrlR_PlEtG1uDHEffjpM5ZHgJqTobynyaxIhux30uMDKa5vW7CEDZesJXrh4qR9wuWM1OUhlbGA',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'AQBOcpHX2k0vfXWakf7UrIWPNXTEKtsVaAwD7DXcZsVBD47xzm3xjmEVK5SGZAAKx7aTwN4G-u14gLGK1IwmRitewcgxDY-_3pYW5ZyCwGkVRX-Rv5CdWg8s5Gd6izCd_cI',
    scope: 'user-top-read'
  }
  

  