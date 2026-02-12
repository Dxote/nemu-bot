const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');
const store = require('../../services/scheduleStore');
const editSession = require('../../services/editSession');
const { resolvePriority } = require('../../services/timezonePriority');
const { parseNatural } = require('../../services/naturalParser');
const { DateTime } = require('luxon');


function hasAdminRole(interaction) {
  const roleId = process.env.ADMIN_ROLE_ID;
  if (!roleId) return false;
  return interaction.member.roles.cache.has(roleId);
}

module.exports = async function handleScheduleButton(interaction) {
  const [, action, indexRaw] = interaction.customId.split(':');
  const index = indexRaw ? Number(indexRaw) : null;

  if (action !== 'cancelEdit') {
    if (index === null || Number.isNaN(index)) {
      return interaction.reply({
        content: 'Invalid schedule index.',
        flags: MessageFlags.Ephemeral
      });
    }
  } 

  const isAdmin = hasAdminRole(interaction);

  if (action === 'detail') {
    const schedules = store.getAll(interaction.guildId);
    const sched = schedules[index];

    if (!sched) {
      return interaction.reply({
        content: 'Schedule not found.',
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('Schedule Detail')
      .setColor(0xf1c40f)
      .setDescription(
        `**${sched.name}**\n\n` +
        `<t:${sched.timestamp}:F>\n(<t:${sched.timestamp}:R>)`
      );

    return interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });
  }

  if (action === 'edit') {
    if (!isAdmin) {
      return interaction.reply({
        content: 'You do not have permission to edit schedules.',
        flags: MessageFlags.Ephemeral
      });
    }

    const schedules = store.getAll(interaction.guildId);
    const sched = schedules[index];

    if (!sched) {
      return interaction.reply({
        content: 'Schedule not found.',
        flags: MessageFlags.Ephemeral
      });
    }

    editSession.set(interaction.user.id, {
      index,
      handler: async (message) => {

        if (message.content.toLowerCase() === '!cancel') {
          editSession.clear(message.author.id);
          await message.reply('Edit cancelled.');
          return;
        }

        const parts = message.content.split(',');

        if (parts.length < 2) {
          await message.reply(
            'Format invalid.\nUse:\n`<name>, <date>, <timezone optional>`'
          );
          return;
        }

        const name = parts[0].trim();
        const dateString = parts[1]?.trim();
        const tzInput = parts[2]?.trim();

        const timezone = resolvePriority({
          tzInput,
          userId: message.author.id,
          guildId: message.guildId,
          locale: message.guild?.preferredLocale
        });

        if (!timezone) {
          await message.reply('Timezone not found.');
          return;
        }

        let dt = DateTime.fromFormat(
          dateString,
          'dd/MM/yyyy HH:mm',
          { zone: timezone }
        );

        if (!dt.isValid) {
          dt = parseNatural(dateString, timezone);
        }

        if (!dt || !dt.isValid) {
          await message.reply('Invalid date.');
          return;
        }

        const timestamp = Math.floor(dt.toSeconds());

        // session safety
        const session = editSession.get(message.author.id);
        if (!session) {
          await message.reply('Edit session expired.');
          return;
        }

        const schedules = store.getAll(message.guildId);
        const targetSchedule = schedules[session.index];

        if (!targetSchedule) {
          await message.reply('Schedule not found.');
          editSession.clear(message.author.id);
          return;
        }

        targetSchedule.name = name;
        targetSchedule.timestamp = timestamp;

        store.update(message.guildId, schedules);
        editSession.clear(message.author.id);

        await message.reply('Schedule updated.');
      }
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
        '`<new name>, <DD/MM/YYYY HH:mm>`',
      components: [row],
      flags: MessageFlags.Ephemeral
    });
  }

  if (action === 'cancelEdit') {
    editSession.clear(interaction.user.id);

    return interaction.reply({
      content: 'Edit cancelled.',
      flags: MessageFlags.Ephemeral
    });
  }

  if (action === 'delete') {
    if (!isAdmin) {
      return interaction.reply({
        content: 'You do not have permission to delete schedules.',
        flags: MessageFlags.Ephemeral
      });
    }

    const schedules = store.getAll(interaction.guildId);
    const sched = schedules[index];

    if (!sched) {
      return interaction.reply({
        content: 'Schedule not found.',
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('Confirm Deletion')
      .setColor(0xe74c3c)
      .setDescription(`Are you sure you want to delete:\n\n**${sched.name}**`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`sched:confirmDelete:${index}`)
        .setLabel('Yes, delete')
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      flags: MessageFlags.Ephemeral
    });
  }

  if (action === 'confirmDelete') {
    if (!isAdmin) {
      return interaction.reply({
        content: 'You are not allowed to perform this action.',
        flags: MessageFlags.Ephemeral
      });
    }

    const schedules = store.getAll(interaction.guildId);
    const sched = schedules[index];

    if (!sched) {
      return interaction.reply({
        content: 'Schedule not found.',
        flags: MessageFlags.Ephemeral
      });
    }

    schedules.splice(index, 1);
    store.update(interaction.guildId, schedules);

    return interaction.update({
      content: `**${sched.name}** deleted.`,
      embeds: [],
      components: []
    });
  }
};