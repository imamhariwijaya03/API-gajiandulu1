'use strict';
module.exports = (sequelize, DataTypes) => {
  const Pins = sequelize.define(
    'pins',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      pin: { type: DataTypes.STRING, allowNull: false },
      use_fingerprint: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0 },
      apple_biometric: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0
      },
      sensor_type: {
        type: DataTypes.STRING,
        allowNull: true
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
  Pins.associate = function(models) {
    // associations can be defined here
    Pins.belongsTo(models.employees, {
      foreignKey: 'employee_id'
    });
  };
  return Pins;
};
