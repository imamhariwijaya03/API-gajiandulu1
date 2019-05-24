const {
  employees: EmployeeModel,
  cron_members_salary_groups: CronMembersSalaryGroupModel,
  salary_details: SalaryDetail,
  company_settings: CompanySetting,
  companies: Company
} = require('@models');

const EVENT = require('../constants');

class CronMembersSalaryGroup {
  constructor(observable) {
    this.observable = observable;
  }
  listenCronMembersSalaryGroup() {
    this.observable.addListener(EVENT.CRON_MEMBERS_SALARY_GROUP, async () => {
      let date = new Date();
      date = new Date(`${date} -0700`);
      date = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getDate()}`;
      const employeeModel = await CronMembersSalaryGroupModel.findAll({
        include: {
          model: EmployeeModel,
          include: {
            model: Company,
            include: {
              model: CompanySetting,
              attributes: ['payroll_date'],
              as: 'setting',
              where: { payroll_date: date }
            }
          }
        }
      });

      employeeModel.forEach(async data => {
        const cronMembersSalaryGroup = await CronMembersSalaryGroupModel.findOne({
          where: { employee_id: data.employee_id }
        });

        const salaryDetail = await SalaryDetail.findOne({
          where: { employee_id: cronMembersSalaryGroup.employee_id }
        });

        salaryDetail.update({
          salary_id: cronMembersSalaryGroup.salary_id
        });
        cronMembersSalaryGroup.destroy();
      });
    });
  }
}

module.exports = CronMembersSalaryGroup;
