'use strict';
module.exports = (sequelize, DataTypes) => {
  var Journals = sequelize.define(
    'journals',
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
      type: {
        allowNull: false,
        type: DataTypes.STRING(45),
        validate: {
          notEmpty: true
        }
      },
      debet: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      kredit: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      description: {
        allowNull: true,
        type: DataTypes.TEXT
      },
      include_lunch_allowance: {
        allowNull: true,
        type: DataTypes.TINYINT,
        defaultValue: 0
      },
      include_transport_allowance: {
        allowNull: true,
        type: DataTypes.TINYINT,
        defaultValue: 0
      },
      balance: {
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
  Journals.associate = function(models) {
    // associations can be defined here
    Journals.belongsTo(models.employees, {
      foreignKey: 'employee_id'
    });
    Journals.hasOne(models.journal_details, {
      foreignKey: 'journal_id',
      onDelete: 'CASCADE',
      hooks: true
    });
  };
  return Journals;
};
