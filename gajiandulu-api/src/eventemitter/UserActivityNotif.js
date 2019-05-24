require('dotenv').config();
const { oneSignalApi } = require('@helpers');
const {
  notifications: Notif,
  employees: Employee,
  companies: Company,
  logs: Log
} = require('@models');
const EVENT = require('./constants');

class UserActivityNotif {
  constructor(observable) {
    this.observable = observable;
  }

  listenUserActivityNotif() {
    this.observable.addListener(EVENT.USER_ACTIVITY_NOTIF, async data => {
      // Find All Manager of Current Company
      let payloadNotif = [];
      let filters = [];
      const currentUser = await Employee.findOne({
        where: { id: data.employeeId },
        attributes: ['role'],
        include: { model: Company, attributes: ['id', 'company_name', 'name'] }
      });
      const findManagers = await Company.findOne({
        where: { id: currentUser.company.id },
        include: { model: Employee, where: { role: 1 } }
      });
      // CREATE RECORD TO LOGS
      await Log.create({
        platform: 'app',
        company: currentUser.company.company_name || currentUser.company.name,
        description: data.description
      });
      // Only Send Activity Notitification From Supervisor or Operator
      if (currentUser.role !== 1) {
        findManagers.employees.forEach(val => {
          payloadNotif.push({ employee_id: val.id, body: data.description, is_read: 0 });
          filters.push(
            { field: 'tag', key: 'employeeId', relation: '=', value: val.id },
            { operator: 'OR' }
          );
        });
        filters.splice(-1, 1);
        if (process.env.NODE_ENV !== 'production') {
          // prettier-ignore
          /* eslint-disable quotes */
          filters.push(
            {"operator": "AND"},
            {"field": "tag", "key": "env", "relation": "=", "value": "development"}
          );
        }
        // CREATE RECORD TO NOTIFICATION
        await Notif.bulkCreate(payloadNotif);
        /* eslint-disable quotes */
        const payload = {
          app_id: process.env.ONESIGNAL_APPID,
          filters: filters,
          headings: { en: 'Informasi' },
          contents: { en: data.description }
        };
        oneSignalApi.post('/notifications', payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${process.env.ONESIGNAL_APIKEY}`
          }
        });
      }
    });
  }
}

module.exports = UserActivityNotif;
