const Joi = require('joi');
let { AppError } = require('../middleware/errHandling');
module.exports.userValidate = function (req, res, next) {
    let emailSchema = Joi.object({
        email: Joi.string().required()
    });
    let bioSchema = Joi.object({
        first_name: Joi.string().required().min(1).max(15),
        last_name: Joi.string().required().min(1).max(15),
        location: {
            data: Joi.string(),
            loc_services: Joi.string()
        },
        age: Joi.number().required().min(18),
        member_since: Joi.number().required()
    });
    let prefSchema = Joi.object({
        gender: Joi.string().required().valid('Male', 'Female', 'Queer'),
        seeking: Joi.array().items(Joi.string().valid('Male', 'Female', 'Queer')),
        distance: {
            desired: Joi.number().required(),
            currentLoc: {
                lat: Joi.number(),
                lon: Joi.number()
            }
        },
        age: Joi.number()
    });
    let { email } = req.body.acct;
    let { error } = emailSchema.validate({email});
    if (error) {
        let { message } = error.details[0];
        error = { message: message, status: 404 }
        next(error)
    } else {
        let { error } = bioSchema.validate(req.body.bio);
        if (error) {
            console.log('fucked up on the bio');
            next(error);
        } else {
            let { error } = prefSchema.validate(req.body.pref);
            if (error) {
                console.log('fucked up on the pref');
            next(error);
            } else {
                next()
            }
        }
    };

};

   
module.exports.personalityValidate = async (req, res, next) => {
    let habitSchema = Joi.object({
        habits: {
            smoking: Joi.string().valid('Yes', 'No', 'Sometimes'),
            drinking: Joi.string().valid('Yes', 'No', 'Sometimes'),
            weed: Joi.string().valid('Yes', 'No', 'Sometimes'),
            drugs: Joi.string().valid('Yes', 'No', 'Sometimes'),
        }
    });
    
    let exerciseSchema = Joi.object({
        exercise: Joi.array()
            .items(
                Joi.string()
                    .valid('Running', 'Climbing', 'Hiking', 'Weightlifting', 'Sports')
            )
    });
    let musicSchema = Joi.object({
        music: {
            plays: Joi.array()
                .items(
                    Joi.string()
                        .valid('Guitar', 'Piano', 'Violin', 'Clarinet', 'Cello', 'Drums')
                ),
            listens: Joi.array()
                .items(
                    Joi.string()
                        .valid('Metal', 'Rock', 'Hard Rock', 'EDM', 'Country', 'Bluegrass', 'Techno', 'Pop', 'Rap')
                ),
            spotify: Joi.string()
          
        }
    });
    
    let travelSchema = Joi.object({
        travel: {
            been_to: {
                name: Joi.string(),
                geometry: {
                    type: Joi.string().valid('Point'),
                    coordinates: Joi.array().items(Joi.number())
                }
            },
            going_to: {
                name: Joi.string(),
                geometry: {
                    type: Joi.string().valid('Point'),
                    coordinates: Joi.array().items(Joi.number())
                }
            }
        }
    });
    let vgSchema = Joi.object({
        vg: {
            plays: Joi.array().items(Joi.string().valid('Action', 'Shooters', 'Adventure', 'Arcade', 'MMO', 'RPG', 'Retro')),
            favorite: Joi.string().pattern(/\w+::\w+::\d/),
            currently_playing: Joi.string().pattern(/\w+::\w+::\d/),
        }
    });
    let readingSchema = Joi.object({
        reading: {
            favorite: Joi.string().pattern(/.+::.+::./),
            currently_reading: Joi.string().pattern(/.+::.+::./),
        }
    });
    
    let moviesSchema = Joi.object({
        movies_and_tv: {
            favorite:  Joi.string().pattern(/.+::.+::./),
            currently_watching:  Joi.string().pattern(/.+::.+::./)
        },
    });
    let promptSchema = Joi.object({
        promptResponse: Joi.string().pattern(/.+::.+/)
    })

    if (req.body.exercise) {
        let { error } = exerciseSchema.validate(req.body);
        if (error) {
            console.log('exercise not validating in JOI');
            next(error)
        } else {
            console.log('exercise validated');
            next();
        }
    } else if (req.body.music) {

        let { error } = musicSchema.validate(req.body);
        if (error) {
            console.log('music not validating in JOI');
            next(error)
        } else {
            console.log('music validated');
            next();
        }
    }else if (req.body.vg) {
        let { error } = vgSchema.validate(req.body);
        if (error) {
            console.log('vg not validating in JOI');
            next(error)
        } else {
            console.log('vg validated');
            next();
        }
    }else if (req.body.travel) {
        let { error } = travelSchema.validate(req.body);
        if (error) {
            console.log('travel not validating in JOI');
            next(error)
        } else {
            console.log('travel validated');
            next();
        }
    } else if (req.body.movies_and_tv) {
        let { error } = moviesSchema.validate(req.body);
        if (error) {
            console.log('movies not validating in JOI');
            next(error)
            
        } else {
            console.log('movies validated');
            next();
        }
    } else if (req.body.reading) {
        let { error } = readingSchema.validate(req.body);
        if (error) {
            console.log('reading not validating in JOI');
            next(error)
        } else {
            console.log('reading validated');
            next();
        }
    } else if (req.body.prompts) {
        let { error } = promptSchema.validate(req.body);
        if (error) {
            console.log('prompts not validating in JOI');
            next(error)
        } else {
            console.log('prompts validated');
            next();
        }
    } else if (req.body.deleteSpotify !== undefined) {
        console.log('yes')
        next();
    } else if (req.body.approveSpotify !== undefined) {
        next()
    }

        
}

