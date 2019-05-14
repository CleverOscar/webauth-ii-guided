const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
//session is added to the server file
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

//alternatively: const KnexSessionStore = require('connect-session-knex')
// and then KnexSessionStore(session)

const sessionConfig = {
  name: 'sushi',//default is sid, but that would reveal our stack
  secret: 'keeping is lowkey homie',//to encrypt/dcrypt the cookie
  cookie: {
    maxAge: 1000 * 60 * 60, //how long the session is valid for, in millia secconds
    secure: false, // used to cancel out javascript to get access and only accessed with https
  },
  httpOnly: true, // cannot access the cookie from JS using document.cookie - security reasons
  //keep it true unless there is a good reasson to let JS access the Cookies
  resave: false, //keep it false to avoid recreating sesstions that have not changed
  saveUninitialized: false, // GDPR laws against setting cookies automatically

  // we add this to configure the way sessions are stored
  store: new KnexSessionStore({
    knex: require('../database/dbConfig'), // configured instance of knex
    tableName: 'session', // creating a table on the fly that will store sessions inside the database, can be named anything you want
    sidfieldname: 'sid', //column that will hold the id of the session, can be named anything you want
    createtable: true, // if table does not exist, it will create it automatically
    clearInterval: 1000 * 60 * 60, // time it takes to check for old sessions and remove them from the database

  })
}

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));


server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  res.send("It's alive!");
});

module.exports = server;
