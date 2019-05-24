const EventEmitter = require('events').EventEmitter;
const UserRegistered = require('./UserRegistered');
const MemberLatePresence = require('./MemberLatePresence');
const MemberOverwork = require('./MemberOverwork');
const WithdrawChanged = require('./WithdrawChanged');
const UserActivityNotif = require('./UserActivityNotif');
const {
  PeriodicPieces,
  CronSalaryGroup,
  Subscribing,
  CronMembersSalaryGroup,
  CronPayrollDate
} = require('./cron');

let observe = new EventEmitter();

const events = {
  UserRegistered: new UserRegistered(observe),
  MemberLatePresence: new MemberLatePresence(observe),
  MemberOverwork: new MemberOverwork(observe),
  WithdrawChanged: new WithdrawChanged(observe),
  PeriodicPieces: new PeriodicPieces(observe),
  CronSalaryGroup: new CronSalaryGroup(observe),
  Subscribing: new Subscribing(observe),
  CronMembersSalaryGroup: new CronMembersSalaryGroup(observe),
  CronPayrollDate: new CronPayrollDate(observe),
  UserActivityNotif: new UserActivityNotif(observe)
};

module.exports = { observe, events };
