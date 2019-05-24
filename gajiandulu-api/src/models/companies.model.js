'use strict';
module.exports = (sequelize, DataTypes) => {
  var Company = sequelize.define(
    'companies',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      codename: {
        allowNull: false,
        type: DataTypes.STRING
      },
      company_name: {
        allowNull: true,
        type: DataTypes.STRING
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      unique_id: {
        allowNull: false,
        type: DataTypes.STRING
      },
      address: {
        allowNull: false,
        type: DataTypes.TEXT
      },
      phone: {
        allowNull: false,
        type: DataTypes.STRING
      },
      timezone: {
        allowNull: false,
        defaultValue: 'Asia/Jakarta',
        type: DataTypes.STRING
      },
      location: {
        allowNull: false,
        type: DataTypes.STRING
      },
      active: {
        allowNull: false,
        type: DataTypes.TINYINT,
        defaultValue: 0
      },
      registration_complete: {
        allowNull: true,
        type: DataTypes.TINYINT,
        defaultValue: 0
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

  Company.associate = function(models) {
    // associations can be defined here
    Company.hasMany(models.employees, {
      foreignKey: 'company_id',
      onDelete: 'CASCADE'
    });
    Company.hasOne(models.company_settings, {
      foreignKey: 'company_id',
      onDelete: 'CASCADE',
      as: 'setting'
    });
    Company.hasMany(models.digital_assets, {
      foreignKey: 'uploadable_id',
      scope: {
        uploadable_type: 'companies'
      },
      as: 'assets'
    });
    Company.hasMany(models.abilities_category, {
      foreignKey: 'company_id',
      onDelete: 'CASCADE'
    });
    Company.hasMany(models.salary_groups, {
      foreignKey: 'company_id',
      onDelete: 'CASCADE'
    });
    Company.hasMany(models.divisions, {
      foreignKey: 'company_id',
      onDelete: 'CASCADE'
    });
    Company.hasMany(models.schedule_shifts, {
      foreignKey: 'company_id',
      onDelete: 'CASCADE'
    });
    Company.belongsToMany(models.subscriptions, {
      through: 'subscription_details',
      foreignKey: 'company_id',
      otherKey: 'subscribe_id'
    });
    Company.hasMany(models.cron_salary_groups, {
      foreignKey: 'company_id',
      onDelete: 'CASCADE'
    });
    Company.hasMany(models.subscription_details, {
      foreignKey: 'company_id',
      onDelete: 'CASCADE',
      as: 'company_info'
    });
    Company.hasOne(models.cron_payroll_dates, {
      foreignKey: 'company_id',
      onDelete: 'CASCADE'
    });
  };
  return Company;
};
