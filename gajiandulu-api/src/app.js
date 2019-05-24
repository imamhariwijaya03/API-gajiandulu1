require('module-alias/register');
// const path = require('path');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');
const config = require('config');
const { ApolloServer } = require('apollo-server-express');
const { apolloUploadExpress } = require('apollo-upload-server');
// const cron = require('node-cron');
const fs = require('fs');

const { authAdmin, notFound } = require('@helpers');
const routes = require('./routes');
const { events /*observe */ } = require('./eventemitter');
const schema = require('./schema');
// const EVENT = require('./eventemitter/constants');

const graphqlPath = '/graphql';

const app = express();

//Global Variable
global.emailErrorLog = fs.createWriteStream(__dirname + '/../log/mailer.error.log', {
  flags: 'a'
});

//Add Date Add Hours Method
Date.prototype.addHours = function(h) {
  this.setHours(this.getHours() + h);
  return this;
};

// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(favicon(path.join(config.public), 'favicon.ico'));
// Host the public folder
// app.use('/', express.static(config.public));
app.use('/uploads', express.static(config.uploads));
app.use('/documents', express.static(config.documents));
// Event Listener
events.UserRegistered.listenUserRegistered();
events.UserRegistered.listenUserJoined();
events.UserRegistered.listenMemberAprroved();
events.MemberLatePresence.listenMemberLate();
events.MemberOverwork.listenMemberOverwork();
events.WithdrawChanged.listenWithdrawApproved();
events.WithdrawChanged.listenWithdrawRejected();
events.WithdrawChanged.listenWithdrawRequest();
events.PeriodicPieces.listenPeriodicPieces();
events.CronSalaryGroup.listenCronSalaryGroup();
events.Subscribing.listenSubscribing();
events.CronMembersSalaryGroup.listenCronMembersSalaryGroup();
events.CronPayrollDate.listenCronPayrollDate();
events.UserActivityNotif.listenUserActivityNotif();

// Cron - Set cron running on 01:00 WIB
// cron.schedule('* * 18 * * *', () => {
//   observe.emit(EVENT.PERIODIC_PIECES);
//   observe.emit(EVENT.CRON_MEMBERS_SALARY_GROUP);
//   observe.emit(EVENT.CRON_SALARY_GROUP);
//   observe.emit(EVENT.SUBSCRIBING);
//   observe.emit(EVENT.CRON_PAYROLL_DATE);
// });

// API Version
app.use('/api/v1', routes.v1);
app.use('/api/v2', routes.v2);
app.use('/api/v1-mesin-absensi', routes.v1MesinAbsensi);

// Graphql End point
const server = new ApolloServer(schema);
app.use(graphqlPath, authAdmin, apolloUploadExpress({ maxFileSize: 6000000 }));
server.applyMiddleware({ app, graphqlPath });

app.use(notFound());

module.exports = app;
