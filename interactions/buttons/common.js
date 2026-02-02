module.exports = async function commonButtons(interaction) {
  const [, action] = interaction.customId.split(':');

  if (action === 'cancel') {
    return interaction.update({
      content: 'Action cancelled.',
      embeds: [],
      components: []
    });
  }

  if (action === 'confirm') {
    return interaction.reply({
      content: 'Action confirmed.',
      ephemeral: true
    });
  }
  if (action === 'cancel') {
    return interaction.update({
      content: '❎ Action cancelled.',
      embeds: [],
      components: []
    });
  }
};
