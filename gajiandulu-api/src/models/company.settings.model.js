'use strict';
module.exports = (sequelize, DataTypes) => {
  var CompanySettings = sequelize.define(
    'company_settings',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      company_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: 'companies',
          key: 'id'
        }
      },
      notif_presence_overdue: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      presence_overdue_limit: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      overwork_limit: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      notif_overwork: {
        allowNull: false,
        type: DataTypes.BOOLEAN
      },
      rest_limit: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      notif_work_schedule: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      automated_payroll: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      payroll_date: {
        allowNull: true,
        type: DataTypes.INTEGER
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

  CompanySettings.associate = function(models) {
    // associations can be defined here
    CompanySettings.belongsTo(models.companies, {
      foreignKey: 'company_id'
    });
  };
  return CompanySettings;
};
