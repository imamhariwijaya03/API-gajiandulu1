require('module-alias/register');
const { response } = require('@helpers');
const { userService } = require('@services/v1');
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator/check');

router.post(
  '/',
  [
    body('full_name', 'full name should be present')
      .matches(/^[A-Za-z\s]+$/i)
      .withMessage('full name can only contain char and space')
      .exists()
      .isLength({
        min: 4
      })
      .withMessage('full name must be at least 4 chars long'),
    body('email', 'email should be present')
      .exists()
      .isEmail()
      .withMessage('must be a valid email'),
    body('birthday')
      .exists()
      .isISO8601()
      .withMessage('birthday format should be YYYY-MM-DD'),
    body('password', 'passwords must be at least 6 chars long')
      .exists()
      .isLength({
        min: 6
      }),
    body('phone')
      .exists()
      .isMobilePhone('id-ID')
      .withMessage('phone must be phone number format')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(response(false, errors.array()));
    }
    userService.create(req, res);
  }
);

router.put(
  '/otp',
  [
    body('*.authorization_code', 'authorization_code should be present').exists(),
    body('*.hash', 'hash should be present').exists()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(response(false, errors.array()));
    }
    userService.put(req, res);
  }
);

module.exports = router;
