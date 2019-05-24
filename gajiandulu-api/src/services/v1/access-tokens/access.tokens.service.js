require('module-alias/register');
const { jwtHelpers, response, abilityFinder } = require('@helpers');
const {
  users: User,
  access_tokens: AccessToken,
  employees: Employee,
  companies: Company,
  abilities: Abilities,
  pins: Pins,
  salary_groups: SalaryGroups
} = require('@models');
const crypt = require('bcrypt');
const config = require('config');
const Sequelize = require('sequelize');
const { Op } = Sequelize;

const accessTokenService = {
  create: async (req, res) => {
    const { data } = req.body;
    const expires = 24 * 60 * 60;

    try {
      let showWelcoming = false;
      let welcomeMode = 1;
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: data.email_phone }, { phone: data.email_phone }]
        },
        include: [
          {
            model: Employee,
            attributes: ['id', 'flag', 'role', 'active', 'company_id'],
            include: [
              { model: Company, attributes: ['id'] },
              { model: Abilities },
              { model: Pins, required: false }
            ]
          }
        ]
      });
      if (user === null) {
        return res.status(400).json(response(false, 'User not found!'));
      }

      if (!user.registration_complete) {
        return res.status(400).json(response(false, 'Please complete your registration first!'));
      }

      const findSalaryGroups = await SalaryGroups.findAll({
        where: { company_id: user.employees[0].company.id }
      });
      if (findSalaryGroups.length) {
        await User.update({ login_attempt: user.login_attempt + 1 }, { where: { id: user.id } });
      }
      if (!findSalaryGroups.length && user.created_at <= '2019-03-30 00:00:00') {
        showWelcoming = true;
        welcomeMode = 1;
      }
      if (
        findSalaryGroups.length &&
        user.created_at <= '2019-03-30 00:00:00' &&
        user.login_attempt < 3
      ) {
        showWelcoming = true;
        welcomeMode = 2;
      }

      // @TODO Uncomment this when email service activated
      // if (!user.is_confirmed_email) {
      //   return res
      //     .status(400)
      //     .json(response(false, 'We sent you an email confirmation, please do confirm your email first!'));
      // }

      let accessToken = await AccessToken.findOne({
        where: {
          user_id: user.id,
          [Op.or]: [{ client_id: null }, { client_id: 'app' }]
        }
      });

      if (crypt.compareSync(data.password, user.password)) {
        const token = jwtHelpers.createJWT(
          Object.assign({
            email: user.email,
            phone: user.phone,
            id: user.id,
            employeeId: user.employees[0].id,
            employeeRole: user.employees[0].role
          }),
          config.authentication.secret,
          expires
        );
        const payload = {
          access_token: token,
          refresh_token: jwtHelpers.refreshToken(),
          provider: data.provider,
          user_id: user.id,
          expiry_in: expires,
          client_id: 'app'
        };

        if (!accessToken) {
          await AccessToken.create(payload);
        } else {
          await AccessToken.update(payload, {
            where: {
              user_id: user.id,
              [Op.or]: [{ client_id: null }, { client_id: 'app' }]
            }
          });
        }

        accessToken = await AccessToken.findOne({
          where: {
            user_id: user.id,
            [Op.or]: [{ client_id: null }, { client_id: 'app' }]
          },
          include: [{ model: User, as: 'user' }]
        });
        accessToken = Object.assign({}, accessToken.dataValues, {
          company_id: user.employees[0].company.id,
          employee_id: user.employees[0].id,
          flag: user.employees[0].flag,
          role: user.employees[0].role,
          active: user.employees[0].active,
          ability: await abilityFinder(user),
          pin: user.employees[0].pin,
          show_welcoming: showWelcoming,
          welcome_mode: welcomeMode
        });

        if (!accessToken) {
          return res.status(400).json(response(false, 'Login failed'));
        }

        return res
          .status(200)
          .json(
            response(
              true,
              'Login successfully',
              accessToken.length > 0 ? accessToken[0] : accessToken,
              null
            )
          );
      }

      return res.status(422).json(response(false, 'Username atau password salah'));
    } catch (error) {
      if (error.errors) {
        return res.status(400).json(response(false, error.errors));
      }
      return res.status(400).json(response(false, error.message));
    }
  },

  update: async (req, res) => {
    const { data } = req.body;
    const expires = 24 * 60 * 60;

    try {
      let accessToken = await AccessToken.findOne({
        where: { refresh_token: data.refresh_token }
      });
      if (!accessToken) {
        return res
          .status(400)
          .json(response(false, 'invalid refresh token or access token not found'));
      }

      const user = await User.findOne({
        where: { id: accessToken.user_id },
        include: [
          {
            model: Employee,
            attributes: ['id', 'flag', 'role', 'company_id'],
            include: [{ model: Company, attributes: ['id'] }, { model: Abilities }]
          }
        ]
      });

      const token = jwtHelpers.createJWT(
        Object.assign({
          email: user.email,
          phone: user.phone,
          id: user.id,
          employeeId: user.employees[0].id,
          employeeRole: user.employees[0].role
        }),
        config.authentication.secret,
        expires
      );
      const payload = {
        access_token: token,
        refresh_token: jwtHelpers.refreshToken(),
        expiry_in: expires
      };

      accessToken = await AccessToken.update(payload, {
        where: { refresh_token: data.refresh_token }
      });
      accessToken = await AccessToken.findOne({
        where: { user_id: user.id },
        include: [{ model: User, as: 'user' }]
      });

      accessToken = Object.assign({}, accessToken.dataValues, {
        company_id: user.employees[0].company.id,
        employee_id: user.employees[0].id,
        flag: user.employees[0].flag,
        role: user.employees[0].role,
        ability: await abilityFinder(user)
      });

      return res.status(200).json(response(true, 'Access token successfully updated', accessToken));
    } catch (error) {
      if (error.errors) {
        return res.status(400).json(response(false, error.errors));
      }
      return res.status(400).json(response(false, error.message));
    }
  }
};

module.exports = accessTokenService;
