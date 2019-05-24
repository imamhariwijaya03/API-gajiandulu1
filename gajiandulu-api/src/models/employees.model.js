'use strict';
module.exports = (sequelize, DataTypes) => {
  var Employee = sequelize.define(
    'employees',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      company_id: {
        allowNull: false,
        foreignKey: true,
        type: DataTypes.INTEGER,
        references: {
          model: 'companies',
          key: 'id'
        }
      },
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      role: {
        allowNull: false,
        type: DataTypes.INTEGER(11)
      },
      salary: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      meal_allowance: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      daily_salary_with_meal: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      workdays: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      daily_salary: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      flag: {
        allowNull: false,
        type: DataTypes.INTEGER(11)
      },
      active: {
        allowNull: false,
        type: DataTypes.TINYINT,
        defaultValue: 1
      },
      salary_type: {
        allowNull: true,
        type: DataTypes.TINYINT
      },
      gajiandulu_status: {
        allowNull: true,
        type: DataTypes.TINYINT,
        defaultValue: 1
      },
      date_start_work: {
        allowNull: true,
        type: DataTypes.DATEONLY,
        defaultValue: null
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
  Employee.associate = function(models) {
    // associations can be defined here
    Employee.belongsTo(models.users, {
      foreignKey: 'user_id'
    });
    Employee.belongsTo(models.companies, {
      foreignKey: 'company_id'
    });
    Employee.hasMany(models.feedbacks, {
      foreignKey: 'employee_id',
      onDelete: 'CASCADE',
      hooks: true
    });
    Employee.hasMany(models.notifications, {
      foreignKey: 'employee_id',
      onDelete: 'CASCADE',
      hooks: true
    });
    Employee.hasMany(models.presences, {
      foreignKey: 'employee_id',
      onDelete: 'CASCADE',
      hooks: true
    });
    Employee.hasMany(models.journals, {
      foreignKey: 'employee_id',
      onDelete: 'CASCADE',
      hooks: true
    });
    Employee.hasMany(models.employee_notes, {
      foreignKey: 'employee_id',
      onDelete: 'CASCADE',
      hooks: true
    });
    Employee.hasMany(models.schedule_templates, {
      foreignKey: 'employee_id',
      onDelete: 'CASCADE',
      hooks: true
    });
    Employee.hasMany(models.defined_schedules, {
      foreignKey: 'employee_id',
      onDelete: 'CASCADE',
      hooks: true
    });
    Employee.hasMany(models.digital_assets, {
      foreignKey: 'uploadable_id',
      scope: {
        uploadable_type: 'employees'
      },
      as: 'assets',
      onDelete: 'CASCADE',
      hooks: true
    });
    Employee.hasOne(models.abilities, {
      foreignKey: 'employee_id',
      onDelete: 'CASCADE',
      hooks: true
    });
    Employee.hasMany(models.division_details, {
      foreignKey: 'employee_id',
      onDelete: 'CASCADE'
    });
    Employee.belongsToMany(models.salary_groups, {
      through: 'salary_details',
      foreignKey: 'employee_id',
      otherKey: 'salary_id'
    });
    Employee.hasMany(models.periodic_pieces, {
      foreignKey: 'employee_id',
      onDelete: 'cascade'
    });
    Employee.hasOne(models.pins, {
      foreignKey: 'employee_id',
      onDelete: 'cascade'
    });
    Employee.hasOne(models.cron_members_salary_groups, {
      foreignKey: 'employee_id',
      onDelete: 'cascade'
    });
  };
  return Employee;
};
