'use strict';
module.exports = (sequelize, DataTypes) => {
  var DefinedSchedule = sequelize.define(
    'defined_schedules',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      employee_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      presence_date: {
        type: DataTypes.DATEONLY
      },
      presence_start: {
        type: DataTypes.TIME
      },
      presence_end: {
        type: DataTypes.TIME
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },
    {
      underscored: true,
      timestamps: true
    }
  );
  DefinedSchedule.associate = function(models) {
    // associations can be defined here
    DefinedSchedule.belongsTo(models.employees, {
      foreignKey: 'employee_id'
    });
    DefinedSchedule.hasOne(models.division_schedules, {
      foreignKey: 'schedule_id',
      scope: { schedule_type: 'defined_schedules' },
      as: 'division'
    });
    DefinedSchedule.hasOne(models.schedule_shift_details, {
      foreignKey: 'schedule_id',
      scope: { schedule_type: 'defined_schedules' },
      as: 'shift'
    });
  };
  return DefinedSchedule;
};
