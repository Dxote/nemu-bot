const handleSchedButton = require('./buttons/schedule');
const handleCommonButton = require('./buttons/common');

module.exports = {
  async handle(interaction) {
    if (!interaction.isButton()) return;

    const prefix = interaction.customId.split(':')[0];

    if (prefix === 'sched') {
      return handleSchedButton(interaction);
    }

    if (prefix === 'common') {
      return handleCommonButton(interaction);
    }
  }
};
