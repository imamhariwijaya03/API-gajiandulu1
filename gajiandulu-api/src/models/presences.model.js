'use strict';
module.exports = (sequelize, DataTypes) => {
  const Presences = sequelize.define(
    'presences',
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
        allowNull: false,
        type: DataTypes.DATEONLY
      },
      presence_start: {
        allowNull: true,
        type: DataTypes.DATE
      },
      presence_end: {
        allowNull: true,
        type: DataTypes.DATE
      },
      rest_start: {
        allowNull: true,
        type: DataTypes.DATE
      },
      rest_end: {
        allowNull: true,
        type: DataTypes.DATE
      },
      presence_overdue: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      rest_overdue: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      is_absence: {
        allowNull: false,
        type: DataTypes.TINYINT,
        defaultValue: 0
      },
      is_leave: {
        allowNull: false,
        type: DataTypes.TINYINT,
        defaultValue: 0
      },
      is_holiday: {
        allowNull: true,
        type: DataTypes.TINYINT,
        defaultValue: 0
      },
      overwork: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      work_hours: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      checkin_location: {
        allowNull: true,
        type: DataTypes.STRING
      },
      checkout_location: {
        allowNull: true,
        type: DataTypes.STRING
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
      timestamps: true,
      underscored: true
    }
  );

  // eslint-disable-next-line no-unused-vars
  Presences.associate = function(models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    Presences.belongsTo(models.employees, {
      foreignKey: 'employee_id'
    });
    Presences.hasMany(models.digital_assets, {
      foreignKey: 'uploadable_id',
      scope: {
        uploadable_type: 'presences'
      },
      as: 'assets'
    });
  };

  return Presences;
};
