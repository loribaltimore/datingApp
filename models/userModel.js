let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let model = mongoose.model;
let passportLocalMongoose = require('passport-local-mongoose');
let Reject = require('./rejectModel');
let Chat = require('./chatModel');
let Notify = require('./notificationSchema');

let userSchema = new Schema({
        email: {
            type: String,
            required: true
        },
    bio: {
        first_name: {
            type: String,
            required: true,
            min: 1,
            max: 15
        },
        last_name: {
            type: String,
            required: true,
            min: 1,
            max: 15
        },
        location: {
            name: {
                type: String
            },
            geometry: {
                    type: {
                    type: String,
                        enum: ['Point'],
                },
                coordinates: {
                    type: Array,
                }
            },
            loc_services: {
                type: String,
                default: 'static'
            }
        },
        age: {
            type: Number,
            required: true,
            min: 18
        },
        img: [
            {
                filename: {
                    type: String,
                    required: true
                },
                path: {
                    type: String,
                    required: true
                }
            }
        ],
        member_since: {
            type: Date,
            required: true
        },
    },
    matching: {
        match_id: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        liked: [
            {
                type: mongoose.Types.ObjectId
            }
        ],
        matches: [
            {
                match_id: {
                    type: mongoose.Types.ObjectId
                },
                name: {
                    type: String
                },
                photo: {
                    type: String
                },
                match_date: {
                    type: Date
                },
                sort_value: {
                    type: Number,
                    required: true,
                    default: 1
                },
                nudge: {
                    asked: {
                        type: Boolean,
                        default: false
                    },
                    replied: {
                        type: Boolean,
                        default: false
                    },
                    recieved: {
                        type: Boolean,
                        default: false
                    }
                }
            }
            
        ],
        rejected: [
            {
                type: Schema.Types.ObjectId,
                ref: 'reject'
               }
        ],
        average_rating: {
            rating: {
                type: Number,
                default: 5
            },
            rated_by: {
                type: Number,
                default: 1
            } 
        },
        chat: [
            {
                type: Schema.Types.ObjectId,
                ref: 'chat'
            }
        ],
    },
    preferences: {
        gender: {
            type: String,
            required: true,
            enum: ['Male', 'Female', 'Queer'],
            default: 'Male'
        },
        seeking: [
            {
            type: String,
            required: true,
                enum: ['Male', 'Female', 'Queer']
            }
        ],
        distance: {
            desired: {
                type: Number
            },
            currentLoc: {
                lat: {
                    type: Number
                },
                lon: {
                    type: Number
                }
            }
        },
        age: {
            type: Number
        }
    },
    personality: {
        habits: {
            smoking: {
                type: String,
                enum: ['Yes', 'No', 'Sometimes'],
            },
            drinking: {
                type: String,
                enum: ['Yes', 'No', 'Sometimes'],
            },
            drugs: {
                type: String,
                enum: ['Yes', 'No', 'Sometimes'],
            },
            weed: {
                type: String,
                enum: ['Yes', 'No', 'Sometimes'],
            }
        },
        hobbies: {
            exercise: [
                {
                    type: String,
                    enum: ['Running', 'Climbing', 'Hiking', 'Weightlifting', 'Sports'],
                }
            ],
            music: {
                plays: [
                    {
                        type: String,
                        enum: ['Guitar', 'Piano', 'Violin', 'Clarinet', 'Cello', 'Drums']
                    }
                ],
                listens_to: [
                    {
                        type: String,
                        enum: ['Metal', 'Rock', 'Hard Rock', 'EDM', 'Country', 'Bluegrass', 'Techno', 'Pop', 'Rap']
                    }
                ],
                spotify: [{
                    artist: {
                        type: String
                    },
                    cover: {
                        type: String
                    },
                    track: {
                        type: String
                    }
                }]
            },
            video_games: {
                plays: [
                    {
                        type: String,
                        enum: ['Action', 'Shooters', 'Adventure', 'Arcade', 'MMO', 'RPG', 'Retro']
                    }
                ],
                favorite: {
                    poster: {
                        type: String
                    },
                    title: {
                        type: String
                    },
                    release: {
                        type: String
                    }
                },
                currently_playing: {
                    poster: {
                        type: String
                    },
                    title: {
                        type: String
                    },
                    release: {
                        type: String
                    }
                }
            },
            travel: {
                been_to: {
                    name: {
                        type: String
                    },
                    geometry: {
                        type: {
                            type: String,
                            enum: ['Point'],
                        },
                        coordinates: {
                            type: Array,
                        }
                    }
                },
                going_to: {
                    name: {
                        type: String
                    },
                    geometry: {
                        type: {
                            type: String,
                            enum: ['Point'],
                        },
                        coordinates: {
                            type: Array,
                        }
                    }
                }
            },
            reading: {
                favorite: {
                    poster: {
                        type: String
                    },
                    title: {
                        type: String
                    },
                    author: {
                        type: String
                    }
                },
                currently_reading: {
                    poster: {
                        type: String
                    },
                    title: {
                        type: String
                    },
                    author: {
                        type: String
                    }
                }
            },
            movies_and_tv: {
                favorite:
                {
                    poster: {
                        type: String
                    },
                    title: {
                        type: String
                    },
                    release: {
                        type: String
                    }
                },
                
                currently_watching: {
                    poster: {
                        type: String
                    },
                    title: {
                        type: String
                    },
                    release: {
                        type: String
                    }
                }
            }
        
        },
        prompts: [{
            topic: {
                type: String,
            },
            response: {
                type: String
            }
        }],
    },
    auth: {
        spotify: {
            access_token: {
                type: String
            },
            token_type: {
                type: String
            },
            expires_in: {
                type: Number
            },          
            refresh_token: {
                type: String
            },
            scope: {
                type: String
            },
        }
    },
    notifications: [
        {
            type: Schema.Types.ObjectId,
            ref: 'notification'
        }
    ],
    limit: {
        count: {
            type: Number,
            default: 0
        },
        start: {
            type: Date,
        }
    }
});
userSchema.virtual('converted_rating').get(function () {
    return Math.round(this.matching.average_rating.rating / this.matching.average_rating.rated_by);
});
userSchema.plugin(passportLocalMongoose);
let User = model('user', userSchema);

module.exports = User;

///were making a form to submit all the hobby, habit, personality information. 
//one form, submit, disappears, the next appears, and so on. 
//All submitting one after the other until finished. Should give optionn to skip.
///alternate page setup when more or less info i present. 