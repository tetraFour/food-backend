require('dotenv').config();

const express = require('express');
const app = require('express')();
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const passport = require('passport');
const setUpPassport = require('./setuppassport');
const routes = require('./routes');
const cors = require('cors');

const connect = async () =>
  mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/login-test',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
  );

app.set('port', process.env.PORT || 7000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://food-admin-client.herokuapp.com/',
    credentials: true,
  }),
);
app.use(
  session({
    secret: 'TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX',
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

setUpPassport();

app.use(routes);

app.listen(app.get('port'), async function () {
  await connect();
  console.log('MONGO: successfully connected');
  console.log('Server started on port ' + app.get('port'));
});
