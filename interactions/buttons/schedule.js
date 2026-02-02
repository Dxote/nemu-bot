const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const store = require('../../services/scheduleStore');
const editSession = require('../../services/editSession');

function hasAdminRole(interaction) {
  const roleId = process.env.ADMIN_ROLE_ID;
  if (!roleId) return false;
  return interaction.member.roles.cache.has(roleId);
}

module.exports = async function handleScheduleButton(interaction) {
  const [, action, index] = interaction.customId.split(':');
  const schedules = store.getAll(interaction.guildId);
  const sched = schedules[Number(index)];

  if (!sched) {
    return interaction.reply({
      content: 'Schedule not found.',
      ephemeral: true
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
        ephemeral: true
      });
    }

    editSession.set(interaction.user.id, async (message) => {
    const content = message.content.split(',');
    const name = content[0]?.trim();
    const dateString = content[1]?.trim();

    if (!name || !dateString) {
        await message.reply(
        'Format is invalid.\nUse:\n`<name>, <DD/MM/YYYY HH:mm>`'
        );
        return;
    }

    const match = dateString.match(
        /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/
    );
    if (!match) {
        await message.reply('Date format is invalid.');
        return;
    }

    const [, d, m, y, h, min] = match;
    const date = new Date(`${y}-${m}-${d}T${h}:${min}:00`);
    if (isNaN(date)) {
        await message.reply('Invalid date.');
        return;
    }

    const schedules = store.getAll(message.guildId);
    const sched = schedules[index];

    if (!sched) {
        await message.reply('Schedule not found.');
        editSession.clear(message.author.id);
        return;
    }

    sched.name = name;
    sched.timestamp = Math.floor(date.getTime() / 1000);

    store.update(message.guildId, schedules);
    editSession.clear(message.author.id);

    await message.reply('Schedule updated successfully.');
    });

    return interaction.reply({
      content:
        '**Edit mode started**\n\n' +
        'Send message with format:\n' +
        '`<new name>, <DD/MM/YYYY HH:mm>`\n\n' +
        'Example:\n' +
        '`Server Upgrade, 10/02/2026 22:00`',
      ephemeral: true
    });
  }

  if (action === 'delete') {
    if (!isAdmin) {
      return interaction.reply({
        content: 'You do not have permission to delete schedules.',
        ephemeral: true
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
        ephemeral: true
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
