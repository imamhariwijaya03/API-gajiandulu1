require('module-alias/register');
const { response } = require('@helpers');
const {
  feedbacks: Feedback,
  feedback_conversations: FeedbackConversation,
  employees: Employee,
  users: User
} = require('@models');

const feedbackService = {
  get: async (req, res) => {
    const { id: userId } = res.local.users;
    try {
      const employee = await Employee.findOne({
        where: { user_id: userId }
      });
      if (!employee) {
        return res
          .status(422)
          .json(response(false, `Employee data with user id ${userId} not found`));
      }
      const feedbacks = await Feedback.findAll({
        where: { employee_id: employee.id },
        include: [
          {
            model: FeedbackConversation,
            as: 'conversations',
            include: [{ model: User, attributes: ['full_name'] }]
          }
        ]
      });

      if (!feedbacks) {
        return res
          .status(422)
          .json(response(false, `Feedbacks data with employee id ${employee.id} not found`));
      }

      return res
        .status(200)
        .json(response(true, 'Feedbacks has been successfully retrieved', feedbacks, null));
    } catch (error) {
      if (error.errors) {
        return res.status(400).json(response(false, error.errors));
      }
      return res.status(400).json(response(false, error.message));
    }
  },

  create: async (req, res) => {
    const { id: userId } = res.local.users;
    const { data } = req.body;
    try {
      const employee = await Employee.findOne({ where: { user_id: userId } });
      if (!employee) {
        return res
          .status(422)
          .json(response(false, `Employee data with user id ${userId} not found`));
      }
      const feedback = await Feedback.create(
        {
          employee_id: employee.id,
          summary: data.summary,
          conversations: {
            commentable_id: userId,
            commentable_type: 'users',
            body: data.message
          }
        },
        {
          include: [
            {
              model: FeedbackConversation,
              as: 'conversations'
            }
          ]
        }
      );

      if (!feedback) {
        return res.status(400).json(response(true, 'Failed to create feedback'));
      }
      return res
        .status(200)
        .json(response(true, 'Feedback has been successfully created', feedback, null));
    } catch (error) {
      if (error.errors) {
        return res.status(400).json(response(false, error.errors));
      }
      return res.status(400).json(response(false, error.message));
    }
  }
};

module.exports = feedbackService;
