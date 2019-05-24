require('module-alias/register');
const { abilities_category: AbilitiesCategory } = require('@models');

const abilityFinder = async user => {
  const getCategory = await AbilitiesCategory.findOne({
    where: { company_id: user.employees[0].company_id, role: user.employees[0].role }
  });

  const getStandardAbility = await AbilitiesCategory.findOne({
    where: { company_id: null, role: user.employees[0].role },
    attibutes: ['ability']
  });

  let ability = '';
  if (getStandardAbility) {
    ability = getStandardAbility.ability;
  }

  if (user.employees[0].ability) {
    if (user.employees[0].ability.type && user.employees[0].ability.ability) {
      ability = user.employees[0].ability.ability;
    } else if (getCategory) {
      ability = getCategory.ability;
    }
  }

  return ability;
};

module.exports = abilityFinder;
