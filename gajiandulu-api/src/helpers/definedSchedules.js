require('module-alias/register');
const {
  defined_schedules: DefinedSchedule,
  employees: Employee,
  schedule_shifts: ScheduleShift,
  schedule_shift_details: ScheduleShiftDetails,
  users: User,
  digital_assets: DigitalAsset,
  division_schedules: DivisionSchedules
} = require('@models');

const definedSchedules = async (today, companyId, memberId = null) => {
  const schedule = await DefinedSchedule.findAll({
    where: [{ presence_date: today }, memberId && { employee_id: memberId }],
    include: [
      {
        model: Employee,
        where: { company_id: companyId },
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
      },
      {
        model: ScheduleShiftDetails,
        where: { schedule_type: 'defined_Schedules' },
        as: 'shift',
        include: {
          model: ScheduleShift
        }
      },
      {
        model: DivisionSchedules,
        where: { schedule_type: 'defined_schedules' },
        as: 'division',
        required: false
      }
    ]
  });
  return schedule;
};

module.exports = definedSchedules;
