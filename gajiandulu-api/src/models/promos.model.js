module.exports = (sequelize, DataTypes) => {
  const Promo = sequelize.define(
    'promos',
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: 'Please input code' }
        }
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING
      },
      amount: {
        allowNull: false,
        type: DataTypes.INTEGER,
        validate: {
          notEmpty: { msg: 'Please input discount' },
          isNumeric: { msg: 'Please input only format number' }
        }
      },
      expired_date: {
        allowNull: false,
        type: DataTypes.DATEONLY,
        validate: {
          notEmpty: { msg: 'Please input expired date' }
        }
      },
      limit: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      usage: {
        allowNull: true,
        type: DataTypes.INTEGER,
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
  Promo.associate = function(models) {
    // associations can be defined here
  };
  return Promo;
};
