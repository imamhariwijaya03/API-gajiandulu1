require('module-alias/register');
const {
  response,
  scheduleTemplates: scheduleTemplatesHelper,
  definedSchedules: definedSchedulesHelper
} = require('@helpers');
const {
  journals: Journals,
  employees: Employee,
  companies: Company,
  journal_details: JournalDetail,
  // divisions: Division,
  digital_assets: DigitalAsset,
  users: User,
  presences: Presence
} = require('@models');
const Sequelize = require('sequelize');
const { Op } = Sequelize;

const dashboardService = {
  get: async (req, res) => {
    const { start: start, end: end, dateInfo: today } = req.query;
    const { company_id: companyId } = req.params;
    const { employeeId } = res.local.users;

    try {
      const date = new Date();
      date.setHours(date.getHours() + 7);
      // const today = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(
      //   -2
      // )}-${date.getDate()}`;
      let employeeIdArray = [];
      let depositTotal = 0;
      let allDepositTotal = 0;
      let journalData = null;
      let subscribeTotal = null;
      let withdrawData = null;
      let allWithdrawData = null;
      let withdrawBill = null;
      let employees = null;
      let eligibleEmployees = 0;
      let salaryDebit = 0;
      let salaryCredit = 0;
      let rangedGrossWithdraws = 0;
      // let withdrawable = null;
      let netSalary = null;
      let todaySchedule;
      let notYetCheckIn = [];
      let notYetCheckOut = [];
      let outOfSchedule;
      let restOverdue;
      let presenceOverdue;
      let overwork;
      let approvedMemberWithdraw;
      let memberWithdraw = [];
      let scheduleTemplates = [];
      let todayPresence = null;
      let todayScheduleDescription = null;

      const company = await Company.findOne({ where: { id: companyId } });
      if (!company) {
        return res.status(400).json(response(false, 'Wrong company ID'));
      }

      const employeeData = await Employee.findOne({
        where: { id: employeeId }
        // include: {
        //   model: Division,
        //   attributes: ['name'],
        //   through: { attributes: ['leadership'] }
        // }
      });

      const balanceDate = await Journals.findOne({
        attributes: [[Sequelize.fn('max', Sequelize.col('journals.created_at')), 'created_at']],
        where: { balance: 1, type: 'payment' },
        include: { model: Employee, attributes: [], where: { company_id: companyId } },
        group: ['journals.employee_id', 'employee.id']
      });

      // Total salary and withdraw bill only manager can see
      if (employeeData.role.toString() !== '2') {
        employees = await Employee.findAll({
          where: { company_id: companyId, flag: 3 }
        });
        for (let i = 0; i < employees.length; i++) {
          employeeIdArray.push(employees[i].id);
          if (employees[i].role !== 1) {
            eligibleEmployees++;
          }
        }

        journalData = await Journals.findOne({
          where: [
            { employee_id: employeeIdArray },
            { type: { [Op.notIn]: ['withdraw', 'subscribe', 'payment'] } },
            Sequelize.where(
              Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d'),
              '>=',
              `${start}`
            ),
            Sequelize.where(
              Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d'),
              '<=',
              `${end}`
            )
          ],
          attributes: [[Sequelize.fn('SUM', Sequelize.literal('`debet`-`kredit`')), 'total_salary']]
        });

        subscribeTotal = await Journals.findOne({
          where: [
            { employee_id: employeeIdArray },
            { type: { [Op.or]: ['subscribe', 'payment'] } },
            balanceDate !== null && {
              created_at: {
                [Op.gt]: Sequelize.fn('DATE_FORMAT', balanceDate.created_at, '%Y-%m-%d %H:%i:%S')
              }
            }
          ],
          attributes: [
            [Sequelize.fn('SUM', Sequelize.literal('`kredit`-`debet`')), 'total_subscribe']
          ]
        });

        allWithdrawData = await JournalDetail.findAll({
          where: { status: 1 },
          include: {
            model: Journals,
            attributes: [],
            where: [
              { employee_id: employeeIdArray, type: 'withdraw' },
              balanceDate !== null && {
                created_at: {
                  [Op.gt]: Sequelize.fn('DATE_FORMAT', balanceDate.created_at, '%Y-%m-%d %H:%i:%S')
                }
              }
            ]
          }
        });

        withdrawData = await JournalDetail.findAll({
          where: { status: 1 },
          include: {
            model: Journals,
            attributes: ['type', 'employee_id', 'description'],
            where: [
              { employee_id: employeeIdArray, type: 'withdraw' },
              Sequelize.where(
                Sequelize.fn(
                  'DATE_FORMAT',
                  Sequelize.col('journal_details.created_at'),
                  '%Y-%m-%d'
                ),
                '>=',
                `${start}`
              ),
              Sequelize.where(
                Sequelize.fn(
                  'DATE_FORMAT',
                  Sequelize.col('journal_details.created_at'),
                  '%Y-%m-%d'
                ),
                '<=',
                `${end}`
              )
            ]
          }
        });
        if (withdrawData.length) {
          for (let i = 0; i < withdrawData.length; i++) {
            depositTotal += withdrawData[i].total;
          }
        }
        if (allWithdrawData.length) {
          for (let i = 0; i < allWithdrawData.length; i++) {
            allDepositTotal += allWithdrawData[i].total;
          }
        }
        withdrawBill =
          parseInt(allDepositTotal || 0) + parseInt(subscribeTotal.dataValues.total_subscribe || 0);

        // Get members information
        const getScheduleTemplates = await scheduleTemplatesHelper(today, employeeId, companyId);

        const getDefinedSchedule = await definedSchedulesHelper(today, companyId);

        // Join schedule data from schedule template and defined schedule
        scheduleTemplates = getScheduleTemplates.concat(getDefinedSchedule);
        // remove null result
        // scheduleTemplates = scheduleTemplates.filter(val => val !== null);
        let onScheduleMemberId = [];
        let employeeIdInCompany = [];
        let outOfScheduleMembers = [];
        for (let i = 0; i < scheduleTemplates.length; i++) {
          onScheduleMemberId.push(scheduleTemplates[i].employee.id);
        }
        for (let i = 0; i < employees.length; i++) {
          employeeIdInCompany.push(employees[i].id);
        }

        // Let know member in the array that don't have schedule today
        const onScheduleEmployeeData = await Employee.findAll({
          where: { id: onScheduleMemberId },
          include: [
            {
              model: Presence,
              attributes: ['id'],
              where: { presence_date: today },
              required: false
            },
            {
              model: User,
              attributes: ['full_name', 'phone']
            },
            {
              model: DigitalAsset,
              required: false,
              attributes: ['url', 'type'],
              where: {
                type: 'avatar'
              },
              as: 'assets'
            }
          ]
        });
        let mixArray = onScheduleMemberId.concat(employeeIdInCompany);
        for (let i = 0; i < employeeIdInCompany.length; i++) {
          const getId = mixArray.filter(id => id === employeeIdInCompany[i]);
          if (getId.length === 1) {
            outOfScheduleMembers.push(employeeIdInCompany[i]);
          }
        }
        for (let i = 0; i < onScheduleMemberId.length; i++) {
          let rawPresenceStart;
          let rawPresenceEnd;
          const isPresenceExist = await Presence.findOne({
            where: { employee_id: onScheduleMemberId[i], presence_date: today }
          });
          const scheduleData = scheduleTemplates.filter(
            value => value.employee.id === onScheduleMemberId[i]
          );
          rawPresenceStart = scheduleData[0].shift
            ? scheduleData[0].shift.schedule_shift.start_time
            : scheduleData[0].start_time || scheduleData[0].presence_start;
          rawPresenceEnd = scheduleData[0].shift
            ? scheduleData[0].shift.schedule_shift.end_time
            : scheduleData[0].end_time || scheduleData[0].presence_end;
          const presenceStart = new Date(today + ' ' + rawPresenceStart);
          const presenceEnd = new Date(today + ' ' + rawPresenceEnd);
          if (!isPresenceExist && date > presenceStart) {
            const lateness = Math.abs(date - presenceStart) / 36e5;
            const employeeData = onScheduleEmployeeData.filter(
              value => value.id === onScheduleMemberId[i]
            );
            let employeeDataCopy = employeeData[0].dataValues;
            // CREATE OBJECT CLONE OF EMPLOYEE DATA
            employeeDataCopy = { ...employeeDataCopy };
            employeeDataCopy.lateness = parseFloat(lateness.toFixed(2));
            employeeDataCopy.presenceStart = rawPresenceStart;
            employeeDataCopy.employee = {
              user: employeeDataCopy.user,
              assets: employeeDataCopy.assets
            };
            delete employeeDataCopy.user;
            delete employeeDataCopy.assets;
            notYetCheckIn.push(employeeDataCopy);
          }
          if (isPresenceExist && !isPresenceExist.presence_end && date > presenceEnd) {
            const lateness = Math.abs(date - presenceEnd) / 36e5;
            const employeeData = onScheduleEmployeeData.filter(
              value => value.id === onScheduleMemberId[i]
            );
            let employeeDataCopy = employeeData[0].dataValues;
            // CREATE OBJECT CLONE OF EMPLOYEE DATA
            employeeDataCopy = { ...employeeDataCopy };
            employeeDataCopy.lateness = parseFloat(lateness.toFixed(2));
            employeeDataCopy.presenceEnd = rawPresenceEnd;
            employeeDataCopy.employee = {
              user: employeeDataCopy.user,
              assets: employeeDataCopy.assets
            };
            delete employeeDataCopy.user;
            delete employeeDataCopy.assets;
            notYetCheckOut.push(employeeDataCopy);
          }
        }

        let onSchedulePresences = await Presence.findAll({
          where: { employee_id: onScheduleMemberId, presence_date: today },
          include: [
            {
              model: Employee,
              attributes: ['id', 'user_id'],
              include: [
                {
                  model: User,
                  attributes: ['full_name']
                },
                {
                  model: DigitalAsset,
                  required: false,
                  attributes: ['url', 'type'],
                  where: {
                    type: 'avatar'
                  },
                  as: 'assets'
                }
              ]
            }
          ]
        });

        outOfSchedule = await Presence.findAll({
          where: {
            employee_id: outOfScheduleMembers,
            presence_date: today,
            presence_start: { [Op.ne]: null },
            presence_end: { [Op.ne]: null }
          },
          include: [
            {
              model: Employee,
              attributes: ['id', 'user_id'],
              include: [
                {
                  model: User,
                  attributes: ['full_name']
                },
                {
                  model: DigitalAsset,
                  required: false,
                  attributes: ['url', 'type'],
                  where: {
                    type: 'avatar'
                  },
                  as: 'assets'
                }
              ]
            }
          ]
        });

        restOverdue = onSchedulePresences.filter(function(item, index) {
          return item.rest_overdue > 0;
        });
        presenceOverdue = onSchedulePresences.filter(function(item, index) {
          return item.presence_overdue > 0;
        });
        overwork = onSchedulePresences.filter(function(item, index) {
          return item.overwork > 0;
        });

        approvedMemberWithdraw = await JournalDetail.findAll({
          where: [
            { status: 1 },
            Sequelize.where(
              Sequelize.fn('DATE_FORMAT', Sequelize.col('journal_details.created_at'), '%Y-%m-%d'),
              today
            )
          ],
          include: {
            model: Journals,
            where: { employee_id: employeeIdInCompany, type: 'withdraw' },
            include: [
              {
                model: Employee,
                attributes: ['id', 'user_id'],
                include: [
                  {
                    model: User,
                    attributes: ['full_name']
                  },
                  {
                    model: DigitalAsset,
                    required: false,
                    attributes: ['url', 'type'],
                    where: {
                      type: 'avatar'
                    },
                    as: 'assets'
                  }
                ]
              }
            ]
          }
        });

        for (let i = 0; i < approvedMemberWithdraw.length; i++) {
          const temp = approvedMemberWithdraw[i];
          temp.dataValues.employee = approvedMemberWithdraw[i].journal.employee;
          delete temp.dataValues.journal;
          memberWithdraw.push(temp);
        }
      }

      /* ================================================
       * Get user salary and schedule except role manager
       * ================================================
       */
      if (employeeData.role.toString() !== '1') {
        const rangedJournalData = await Journals.findAll({
          where: [
            {
              $not: {
                type: 'withdraw'
              }
            },
            { employee_id: employeeId },
            Sequelize.where(
              Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d'),
              '>=',
              start
            ),
            Sequelize.where(
              Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m-%d'),
              '<=',
              end
            )
          ],
          attributes: ['type', 'debet', 'kredit', 'description', 'created_at']
        });

        // Get user withdraw info except role manager
        const rangedWithdrawData = await JournalDetail.findAll({
          include: {
            model: Journals,
            attributes: ['type', 'employee_id', 'description'],
            where: [
              { employee_id: employeeId, type: 'withdraw' },
              Sequelize.where(
                Sequelize.fn(
                  'DATE_FORMAT',
                  Sequelize.col('journal_details.created_at'),
                  '%Y-%m-%d'
                ),
                '>=',
                start
              ),
              Sequelize.where(
                Sequelize.fn(
                  'DATE_FORMAT',
                  Sequelize.col('journal_details.created_at'),
                  '%Y-%m-%d'
                ),
                '<=',
                end
              )
            ]
          }
        });

        if (rangedWithdrawData.length > 0) {
          for (let i = 0; i < rangedWithdrawData.length; i++) {
            // if (rangedWithdrawData[i].status.toString() === '0') {
            //   withdrawable += rangedWithdrawData[i].total;
            // }
            if (rangedWithdrawData[i].status.toString() !== '-1') {
              rangedGrossWithdraws += rangedWithdrawData[i].total;
            }
          }
        }

        rangedJournalData.map(journal => {
          salaryDebit += journal.debet;
          salaryCredit += journal.kredit;
        });

        netSalary = salaryDebit - salaryCredit - rangedGrossWithdraws;

        // Users' today schedule
        todaySchedule = await definedSchedulesHelper(today, companyId, employeeId);
        if (!todaySchedule.length) {
          todaySchedule = await scheduleTemplatesHelper(today, employeeId, companyId, true);
        }
        if (todaySchedule.length && todaySchedule[0].shift) {
          todayScheduleDescription = `${todaySchedule[0].shift.schedule_shift.start_time};${
            todaySchedule[0].shift.schedule_shift.end_time
          };${todaySchedule[0].division && todaySchedule[0].division.division.name}`;
        }
        if (todaySchedule.length && !todaySchedule[0].shift) {
          todayScheduleDescription = `${todaySchedule[0].start_time ||
            todaySchedule[0].presence_start};${todaySchedule[0].end_time ||
            todaySchedule[0].presence_end};`;
        }

        let thisDate = new Date();
        thisDate.setHours(thisDate.getHours() + 7);
        thisDate = `${thisDate.getFullYear()}-${('0' + (thisDate.getMonth() + 1)).slice(-2)}-${(
          '0' + thisDate.getDate()
        ).slice(-2)}`;
        todayPresence = await Presence.findOne({
          attributes: ['presence_date', 'presence_start', 'presence_end', 'rest_start', 'rest_end'],
          where: [
            {
              employee_id: employeeId
            },
            Sequelize.where(
              Sequelize.fn('DATE_FORMAT', Sequelize.col('presence_date'), '%Y-%m-%d'),
              thisDate
            )
          ]
        });
      }
      // For now, set Pass Three Month to TRUE
      let passThreeMonth = true;
      let nextThreeMonth = new Date(employeeData.date_start_work);
      nextThreeMonth = new Date(nextThreeMonth.setMonth(nextThreeMonth.getMonth() + 3));
      if (nextThreeMonth <= date && employeeData.date_start_work) passThreeMonth = true;
      if (nextThreeMonth >= date && employeeData.date_start_work) passThreeMonth = false;

      const payload = Object.assign(
        {},
        {
          id: companyId,
          codename: company.codename,
          company_active: company.active,
          user_active: employeeData.active,
          role: employeeData.role,
          gajiandulu_status: employeeData.gajiandulu_status,
          flag: employeeData.flag,
          past_three_month: passThreeMonth,
          net_salary: netSalary || 0,
          // withdrawable_salary: withdrawable || 0,
          today_schedule: employeeData.role !== 1 && todayScheduleDescription,
          today_presence: todayPresence || null,
          member_count: eligibleEmployees,
          total_salary: (journalData && journalData.dataValues.total_salary - depositTotal) || 0,
          withdraw_bill: withdrawBill || 0,
          not_yet_checkin: notYetCheckIn || null,
          not_yet_checkout: notYetCheckOut || null,
          no_schedule: outOfSchedule || null,
          rest_overdue: restOverdue || null,
          presence_overdue: presenceOverdue || null,
          overwork: overwork || null,
          approved_withdraw: memberWithdraw || null
        }
      );
      return res
        .status(200)
        .json(response(true, 'Dashboard summary has been successfully retrieved', payload));
    } catch (error) {
      if (error.errors) {
        return res.status(400).json(response(false, error.errors));
      }
      return res.status(400).json(response(false, error.message));
    }
  }
};

module.exports = dashboardService;
