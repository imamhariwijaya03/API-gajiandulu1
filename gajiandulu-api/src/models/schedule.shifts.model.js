'use strict';
module.exports = (sequelize, DataTypes) => {
  const ScheduleShift = sequelize.define(
    'schedule_shifts',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
          model: 'companies',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      shift_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      shift_multiply: {
        type: DataTypes.DECIMAL
      },
      start_time: {
        type: DataTypes.STRING,
        allowNull: false
      },
      end_time: {
        type: DataTypes.STRING,
        allowNull: false
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
  ScheduleShift.associate = function(models) {
    // associations can be defined here
    ScheduleShift.belongsTo(models.companies, {
      foreignKey: 'company_id'
    });
    ScheduleShift.hasMany(models.schedule_shift_details, {
      foreignKey: 'shift_id',
      onDelete: 'CASCADE'
    });
  };
  return ScheduleShift;
};
