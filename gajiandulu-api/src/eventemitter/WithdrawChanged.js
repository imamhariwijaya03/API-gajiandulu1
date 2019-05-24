require('dotenv').config();
const { oneSignalApi, nodemailerMail, mailTemplates, formatCurrency } = require('@helpers');
const { notifications: Notif, employees: Employee, users: User } = require('@models');
const EVENT = require('./constants');

class WithdrawChanged {
  constructor(observable) {
    this.observable = observable;
  }

  listenWithdrawApproved() {
    this.observable.addListener(EVENT.WITHDRAW_APPROVED, async data => {
      const HEADING_MESSAGE = `Tarikan GajianDulu nomor ${data.withdrawId} telah disetujui`;
      const BODY_MESSAGE = `Tarikan GajianDulu tanggal ${
        data.withdrawCreated
      } dengan nomor Tarikan ${data.withdrawId} telah disetujui dan ditransfer`;

      // prettier-ignore
      /* eslint-disable quotes */
      let payload = {
        "app_id": process.env.ONESIGNAL_APPID,
        "filters": [
          {"field": "tag", "key": "userId", "relation": "=", "value": data.userId}
        ],
        "data": {"foo": "bar"},
        "headings": {"en": HEADING_MESSAGE},
        "contents": {"en": BODY_MESSAGE}
      };
      if (process.env.NODE_ENV !== 'production') {
        // prettier-ignore
        /* eslint-disable quotes */
        payload.filters.push(
          {"operator": "AND"},
          {"field": "tag", "key": "env", "relation": "=", "value": "development"}
        );
      }
      /* eslint-enable quotes */

      await Notif.create({
        employee_id: data.employeeId,
        body: BODY_MESSAGE
      });

      oneSignalApi.post('/notifications', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${process.env.ONESIGNAL_APIKEY}`
        }
      });

      /* eslint-disable */
      nodemailerMail.sendMail(
        {
          from: 'cs@atenda.id',
          to: data.userEmail, // An array if you have multiple recipients.
          subject: `Pencairan Tarikan GajianDulu - Atenda`,
          //You can use "html:" to send HTML email content. It's magic!
          html: mailTemplates.tarikanGajianDuluTemplate({
            wdid: data.withdrawId,
            wdNetto: data.withdrawNet,
            wdCreated: data.withdrawCreated
          })
        },
        function(err, info) {
          if (err) {
            let errorLog = new Date().toISOString() + ' [Withdraw Approved]: ' + err + '\n';
            global.emailErrorLog.write(errorLog);
          }
        }
      );
      /* eslint-enable */
    });
  }

  listenWithdrawRejected() {
    this.observable.addListener(EVENT.WITHDRAW_REJECTED, async data => {
      const HEADING_MESSAGE = `Tarikan GajianDulu nomor ${data.withdrawId} ditolak`;
      const BODY_MESSAGE = `Tarikan GajianDulu tanggal ${
        data.withdrawCreated
      } dengan nomor Tarikan ${data.withdrawId} telah ditolak`;

      // prettier-ignore
      /* eslint-disable quotes */
      let payload = {
        "app_id": process.env.ONESIGNAL_APPID,
        "filters": [
          {"field": "tag", "key": "userId", "relation": "=", "value": data.userId}
        ],
        "data": {"foo": "bar"},
        "headings": {"en": HEADING_MESSAGE},
        "contents": {"en": BODY_MESSAGE}
      };
      if (process.env.NODE_ENV !== 'production') {
        // prettier-ignore
        /* eslint-disable quotes */
        payload.filters.push(
          {"operator": "AND"},
          {"field": "tag", "key": "env", "relation": "=", "value": "development"}
        );
      }
      /* eslint-enable quotes */

      await Notif.create({
        employee_id: data.employeeId,
        body: BODY_MESSAGE
      });

      oneSignalApi.post('/notifications', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${process.env.ONESIGNAL_APIKEY}`
        }
      });

      /* eslint-disable */
      nodemailerMail.sendMail(
        {
          from: 'cs@atenda.id',
          to: data.userEmail, // An array if you have multiple recipients.
          subject: `Tarikan GajianDulu Ditolak - GajianDulu`,
          //You can use "html:" to send HTML email content. It's magic!
          html: mailTemplates.penolakanGajianDuluTemplate({
            wdid: data.withdrawId,
            wdNetto: data.withdrawNet,
            wdCreated: data.withdrawCreated
          })
        },
        function(err, info) {
          if (err) {
            let errorLog = new Date().toISOString() + ' [Withdraw Reject]: ' + err + '\n';
            global.emailErrorLog.write(errorLog);
          }
        }
      );
      /* eslint-enable */
    });
  }

  listenWithdrawRequest() {
    this.observable.addListener(EVENT.WITHDRAW_REQUEST, async data => {
      //console.log("test", data)
      const employeeData = await Employee.findOne({
        where: { user_id: data.userId },
        attributes: ['role', 'id'],
        include: [
          {
            model: User,
            attributes: ['id', 'full_name']
          }
        ]
      });
      const managerData = await Employee.findAll({
        where: { company_id: data.companyId, role: '1' }
      });
      const HEADING_MESSAGE = `Pengajuan tarikan GajianDulu`;
      // MESSAGE FOR MANAGER
      const BODY_MESSAGE = `Anggota ${
        employeeData.user.full_name
      } telah mengajukan tarikan GajianDulu sebesar Rp. ${formatCurrency(
        data.totalWithdraw
      )} pada tanggal ${data.thisDate}`;
      // MESSAGE FOR EMPLOYEE
      const BODY_MESSAGE2 = `Pengajuan tarikan GajianDulu atas nama ${
        employeeData.user.full_name
      } sebesar Rp. ${formatCurrency(data.totalWithdraw)} pada tanggal ${
        data.thisDate
      } telah berhasil diajukan`;

      /**
       * SEND NOTIFICATION FOR MANAGER
       */

      let filters = [];
      let payloadNotif = [];
      for (let i = 0; i < managerData.length; i++) {
        payloadNotif.push({
          employee_id: managerData[i].id,
          body: BODY_MESSAGE
        });
        // prettier-ignore
        /* eslint-disable quotes */
        filters.push({"field": "tag", "key": "employeeId", "relation": "=", "value": managerData[i].id}, {"operator": "OR"});
      }
      filters.splice(-1, 1);
      if (process.env.NODE_ENV !== 'production') {
        // prettier-ignore
        /* eslint-disable quotes */
        filters.push(
          {"operator": "AND"},
          {"field": "tag", "key": "env", "relation": "=", "value": "development"}
        );
      }

      await Notif.bulkCreate(payloadNotif);

      // prettier-ignore
      /* eslint-disable quotes */
      let payload = {
        app_id: process.env.ONESIGNAL_APPID,
        filters,
        headings: { en: HEADING_MESSAGE },
        contents: { en: BODY_MESSAGE }
      };

      oneSignalApi.post('/notifications', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${process.env.ONESIGNAL_APIKEY}`
        }
      });

      /**
       * SEND NOTIFICATION FOR EMPLOYEE
       */

      filters = [];
      filters.push({ field: 'tag', key: 'userId', relation: '=', value: data.userId });
      if (process.env.NODE_ENV !== 'production') {
        // prettier-ignore
        /* eslint-disable quotes */
        filters.push(
          {"operator": "AND"},
          {"field": "tag", "key": "env", "relation": "=", "value": "development"}
        );
      }

      await Notif.create({
        employee_id: employeeData.id,
        body: BODY_MESSAGE2
      });

      payload = {
        app_id: process.env.ONESIGNAL_APPID,
        filters,
        data: { foo: 'bar' },
        headings: { en: HEADING_MESSAGE },
        contents: { en: BODY_MESSAGE2 }
      };
      // SEND NOTIFICATION FOR EMPLOYEE
      oneSignalApi.post('/notifications', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${process.env.ONESIGNAL_APIKEY}`
        }
      });
    });
  }
}

module.exports = WithdrawChanged;
