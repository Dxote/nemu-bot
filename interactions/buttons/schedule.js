const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');


function hasAdminRole(interaction) {
  const roleId = process.env.ADMIN_ROLE_ID;
  if (!roleId) return false;
  return interaction.member.roles.cache.has(roleId);
}

module.exports = async function handleScheduleButton(interaction) {
  const parts = interaction.customId.split(':');
  const action = parts[1];
  const index = parts[2];
  const schedules = store.getAll(interaction.guildId);
  const sched = schedules[Number(index)];

  if (!sched) {
    return interaction.reply({
      content: 'Schedule not found.',
      flags: MessageFlags.Ephemeral
    });
  }

  const isAdmin = hasAdminRole(interaction);

  if (action === 'detail') {
    const embed = new EmbedBuilder()
      .setTitle('Schedule Detail')
      .setColor(0xf1c40f)
      .setDescription(
        `**${sched.name}**\n\n` +
        `<t:${sched.timestamp}:F>\n(<t:${sched.timestamp}:R>)`
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  if (action === 'edit') {
    if (!isAdmin) {
      return interaction.reply({
        content: 'You do not have permission to edit schedules.',
        flags: MessageFlags.Ephemeral
      });
    }

    editSession.set(interaction.user.id, {
      index: Number(index),
      handler: async (message) => {

      if (message.content.toLowerCase() === '!cancel') {
        editSession.clear(message.author.id);
        await message.reply('Edit cancelled.');
        return;
      }
      const parts = message.content.split(',');
      if (parts.length < 2) {
        await message.reply(
          'Format invalid.\nUse:\n`<name>, <DD/MM/YYYY HH:mm>`'
        );
        return;
      }
      const name = parts[0].trim();
      const dateString = parts.slice(1).join(',').trim();
      const match = dateString.match(
        /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/
      );
      if (!match) {
        await message.reply('Date format invalid.');
        return;
      }
      const [, d, m, y, h, min] = match;
      const date = new Date(`${y}-${m}-${d}T${h}:${min}:00`);
      if (isNaN(date)) {
        await message.reply('Invalid date.');
        return;
      }
      const session = editSession.get(message.author.id);
        if (!session) {
          await message.reply('Edit session expired.');
          return;
        }
      const sched = schedules[session.index];
      const schedules = store.getAll(message.guildId);
      if (!sched) {
        await message.reply('Schedule not found.');
        editSession.clear(message.author.id);
        return;
      }
      sched.name = name;
      sched.timestamp = Math.floor(date.getTime() / 1000);
      store.update(message.guildId, schedules);
      editSession.clear(message.author.id);
      await message.reply('Schedule updated.');}
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('sched:cancelEdit')
        .setLabel('Cancel Edit')
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({
      content:
        '**Edit mode started**\n\n' +
        'Send message:\n' +
        '`<new name>, <DD/MM/YYYY HH:mm>`\n\n' +
        'Or press cancel button.',
      components: [row],
      ephemeral: true
    });
  }

  if (action === 'cancelEdit') {
    editSession.clear(interaction.user.id);

    return interaction.reply({
      content: 'Edit cancelled.',
      ephemeral: true
    });
  }

  if (action === 'delete') {
    if (!isAdmin) {
      return interaction.reply({
        content: 'You do not have permission to delete schedules.',
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('Confirm Deletion')
      .setColor(0xe74c3c)
      .setDescription(
        `Are you sure you want to delete:\n\n` +
        `**${sched.name}**`
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`sched:confirmDelete:${index}`)
        .setLabel('Yes, delete')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('common:cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }

  if (action === 'confirmDelete') {
    if (!isAdmin) {
      return interaction.reply({
        content: 'You are not allowed to perform this action.',
        flags: MessageFlags.Ephemeral
      });
    }

    schedules.splice(Number(index), 1);
    store.update(interaction.guildId, schedules);

    return interaction.update({
      content: `**${sched.name}** deleted.`,
      embeds: [],
      components: []
    });
  }
};
