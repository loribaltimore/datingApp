if (process.env.NODE_env !== 'production') {
    require('dotenv').config()
};
let express = require('express');
let app = express();
let fs = require('fs');
let mongoose = require('mongoose');
let http = require('http');
let server = http.createServer({
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.cer')
}, app).listen(3000, () => {
    console.log('Server is Live')
});
mongoose.connect('mongodb://localhost:27017/datingApp')
    .then(data => console.log('Database is Live'))
    .catch(err => console.log(err));
let cors = require('cors');
let path = require('path');
let ejs = require('ejs');
let passport = require('passport');
let LocalStrategy = require('passport-local')
let ejsMate = require('ejs-mate')
let bodyParser = require('body-parser');
let methodOverride = require('method-override');
let session = require('express-session');
let flash = require('connect-flash');
let joi = require('joi');
let cookieParser = require('cookie-parser')
let userRouter = require('./controllers/routers/userRouter');
let User = require('./models/userModel');
let { errHandler } = require('./middleware/errHandling');
let ipInfo = require('ipinfo-express');
app.use(ipInfo({
    token: process.env.IP_TOKEN,
    cache: null,
    timeout: 5000
}));
let { Server } = require('socket.io');
let io = new Server(server);
io.on('connection', (socket) => {
    console.log('chat connected');
    socket.on('channel', (channel) => {
        socket.join(channel);
        io.emit('channel', `Youve joined ${channel}`)
    });
    socket.on('private message', (msg) => {
      io.emit('private message', msg);
    });
    socket.on('disconnect', (reason) => {
        console.log('Youve left the chat')
    })
});
io.on('disconnect', (socket) => {
    console.log('chat disconnected')
})

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser('secret'))
let sessionConfig = {
    secret: 'this is my secret',
    resave: false,
    saveUninitialized: true
    ///I need to see how to config session
};
app.use(session(sessionConfig));
app.use(flash(sessionConfig));
app.use(passport.initialize());
app.use(passport.session(sessionConfig))
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use('/user', userRouter);
app.use(errHandler);
