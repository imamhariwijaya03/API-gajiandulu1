require('module-alias/register');
const {
  schedule_templates: ScheduleTemplate,
  defined_schedules: DefinedSchedule,
  employees: Employee
} = require('@models');
const Sequelize = require('sequelize');

const countUserScheduleOfMonth = async (yearMonth, employeeId) => {
  let scheduleTemplates = await ScheduleTemplate.findAll({
    where: [
      Sequelize.where(
        Sequelize.fn(
          'DATE_FORMAT',
          Sequelize.fn(
            'IF',
            Sequelize.col('deleted_date'),
            Sequelize.col('deleted_date'),
            '2999-12-31'
          ),
          '%Y-%m'
        ),
        'NOT LIKE',
        `%${yearMonth}%`
      ),
      {
        $not: [
          Sequelize.where(
            Sequelize.fn(
              'DATE_FORMAT',
              Sequelize.fn(
                'IF',
                Sequelize.col('deleted_after'),
                Sequelize.col('deleted_after'),
                '2999-12-31'
              ),
              '%Y-%m'
            ),
            '<=',
            yearMonth
          )
        ]
      },
      {
        $not: [
          Sequelize.where(
            Sequelize.fn(
              'DATE_FORMAT',
              Sequelize.fn(
                'IF',
                Sequelize.col('end_repeat'),
                Sequelize.col('end_repeat'),
                '2999-12-31'
              ),
              '%Y-%m'
            ),
            '<=',
            yearMonth
          )
        ]
      },
      { employee_id: employeeId },
      Sequelize.or(
        Sequelize.and(
          Sequelize.where(
            Sequelize.fn('DATE_FORMAT', Sequelize.col('start_date'), '%Y-%m'),
            '<=',
            yearMonth
          ),
          Sequelize.where(
            Sequelize.fn('DATE_FORMAT', Sequelize.col('end_date'), '%Y-%m'),
            '>',
            yearMonth
          )
        ),
        [
          Sequelize.where(
            Sequelize.fn('DATE_FORMAT', Sequelize.col('start_date'), '%Y-%m'),
            '<=',
            yearMonth
          ),
          Sequelize.literal(`CASE
            WHEN repeat_type = 'yearly'
              THEN (FLOOR(DATEDIFF('${yearMonth}', DATE_FORMAT(end_date, '%Y-%m'))/365 + 1) % yearly_frequent) = 0
              AND (yearly_frequent_months LIKE CONCAT('%', MONTH('${yearMonth}'), '%') OR (WEEK('${yearMonth}', 0) - WEEK(DATE_SUB('${yearMonth}', INTERVAL DAYOFMONTH('${yearMonth}') - 1 DAY), 0) + 1) = yearly_frequent_custom_count AND DAYOFWEEK('${yearMonth}') = yearly_frequent_custom_days)
            WHEN repeat_type = 'monthly'
              THEN (FLOOR(DATEDIFF('${yearMonth}', DATE_FORMAT(end_date, '%Y-%m'))/30 + 1) % monthly_frequent) = 0
              AND (monthly_frequent_date LIKE CONCAT('%,',DAYOFMONTH('${yearMonth}'),',%') or monthly_frequent_date LIKE CONCAT(DAYOFMONTH('${yearMonth}'), ',%') or monthly_frequent_date LIKE CONCAT('%,',DAYOFMONTH('${yearMonth}'))
              OR (WEEK('${yearMonth}', 0) - WEEK(DATE_SUB('${yearMonth}', INTERVAL DAYOFMONTH('${yearMonth}') - 1 DAY), 0) + 1) = monthly_frequent_custom_count AND DAYOFWEEK('${yearMonth}') = monthly_frequent_custom_days)              
            WHEN repeat_type = 'weekly'
              THEN (FLOOR(DATEDIFF('${yearMonth}', DATE_FORMAT(DATE_SUB(end_date, INTERVAL (DAYOFWEEK(end_date) - 1) DAY), '%Y-%m'))/7 + 1) % weekly_frequent) = 0
              AND weekly_frequent_days LIKE CONCAT('%', DAYOFWEEK('${yearMonth}'), '%')
            WHEN repeat_type = 'daily'
              THEN (DATEDIFF('${yearMonth}', DATE_FORMAT(end_date, '%Y-%m')) % daily_frequent) = 0
           END`)
        ]
      )
    ],
    attributes: ['id', 'start_date', 'end_date', 'start_time', 'end_time'],
    include: [
      {
        model: Employee,
        where: { id: employeeId },
        attributes: ['id'],
        include: [
          {
            model: DefinedSchedule,
            required: false,
            where: [
              Sequelize.where(
                Sequelize.fn('DATE_FORMAT', Sequelize.col('presence_date'), '%Y-%m'),
                yearMonth
              )
            ],
            attributes: ['id', 'presence_date', 'presence_start', 'presence_end']
          }
        ]
      }
    ]
  });

  // If schedule template still not found, then find only the defined schedule
  if (!scheduleTemplates || scheduleTemplates.length <= 0) {
    scheduleTemplates = await DefinedSchedule.findAll({
      where: [
        { employee_id: employeeId },
        Sequelize.where(
          Sequelize.fn('DATE_FORMAT', Sequelize.col('presence_date'), '%Y-%m'),
          yearMonth
        )
      ],
      include: [
        {
          model: Employee,
          where: { id: employeeId },
          attributes: ['id', 'user_id']
        }
      ]
    });
  }

  return scheduleTemplates.length;
};

module.exports = countUserScheduleOfMonth;
