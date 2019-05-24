'use strict';
require('module-alias/register');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const payload = [
      {
        role: 1,
        ability:
          'SCHEDULE_ADD,SCHEDULE_EDIT,SCHEDULE_DELETE,MEMBER_ADD,MEMBER_EDIT,MEMBER_DELETE,MEMBER_RESPONSE,PRESENCE_JOURNAL_EDIT,PRESENCE_ADD,PRESENCE_ADD_OWN_ID,PRESENCE_EDIT,PRESENCE_DELETE,MEMBER_SALARY_SIGHT,PRESENCE_NOTE_EDIT,PRESENCE_FULL_TIME_EDIT,PRESENCE_LI',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role: 3,
        ability:
          'SCHEDULE_ADD,SCHEDULE_EDIT,SCHEDULE_DELETE,MEMBER_ADD,MEMBER_EDIT,MEMBER_DELETE,MEMBER_RESPONSE,PRESENCE_JOURNAL_EDIT,PRESENCE_ADD,PRESENCE_ADD_OWN_ID,PRESENCE_EDIT,PRESENCE_DELETE,MEMBER_SALARY_SIGHT,PRESENCE_NOTE_EDIT,PRESENCE_FULL_TIME_EDIT,PRESENCE_LI',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role: 4,
        ability:
          'SCHEDULE_ADD,SCHEDULE_EDIT,SCHEDULE_DELETE,MEMBER_ADD,MEMBER_EDIT,MEMBER_DELETE,MEMBER_RESPONSE,PRESENCE_JOURNAL_EDIT,PRESENCE_ADD,PRESENCE_ADD_OWN_ID,PRESENCE_EDIT,PRESENCE_DELETE,MEMBER_SALARY_SIGHT,PRESENCE_NOTE_EDIT,PRESENCE_FULL_TIME_EDIT,PRESENCE_LI',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        role: 4,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    return queryInterface.bulkInsert('abilities_categories', payload, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('abilities_categories', null, {});
  }
};
