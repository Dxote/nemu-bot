const hasAdminRole = require('../utils/hasAdminRole');
const store = require('../services/scheduleStore');
const tzStore = require('../services/userTimezoneStore');
const { resolve } = require('../services/timezoneResolver');
const { DateTime } = require('luxon');
const { resolvePriority } = require('../services/timezonePriority');
const { parseNatural } = require('../services/naturalParser');

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  name: 'sched',

    async execute(message, args) {
    const sub = args.shift()?.toLowerCase();

    if (!sub) {
        return message.reply(
        'Usage:\n' +
        '`!sched list`\n' +
        '`!sched add <name>, <DD/MM/YYYY HH:mm>` (admin)\n' +
        '`!sched delete <number>` (admin)'
        );
    }

    const isAdmin = hasAdminRole(message.member);

    if (!isAdmin && sub !== 'list') {
        return message.reply('You do not have permission to use this command.');
    }

    if (sub === 'add') return addSchedule(message, args);
    if (sub === 'list') return listSchedules(message);
    if (sub === 'delete') return deleteSchedule(message, args);

    return message.reply('Unknown subcommand.');
    }
};

function addSchedule(message, args) {

  const content = args.join(' ').split(',');

  const name = content[0]?.trim();
  let dateString = content[1]?.trim();
  let tzInput = content[2]?.trim();

  if (!name || !dateString) {
    return message.reply(
      'Usage: `!sched add <name>, <date>, <timezone>`'
    );
  }

  const timezone = resolvePriority({
    tzInput,
    userId: message.author.id,
    guildId: message.guildId,
    locale: message.guild?.preferredLocale
  });

  if (!timezone) {
    return message.reply(
      'Timezone tidak ditemukan.\n' +
      'Contoh:\n' +
      '`!sched add Event, tomorrow 7pm GMT+7`\n' +
      '`!set timezone Asia/Jakarta`'
    );
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
    return message.reply('Invalid date.');
  }

  const timestamp = Math.floor(dt.toSeconds());

  const entry = store.add(message.guildId, { name, timestamp });

  const embed = new EmbedBuilder()
    .setTitle('Schedule Added')
    .setColor(0x3498db)
    .setDescription(
      `**${entry.name}**\n<t:${entry.timestamp}:F>  <t:${entry.timestamp}:R>`
    );

  message.channel.send({ embeds: [embed] });
}

function listSchedules(message) {
  const schedules = store.getAll(message.guildId);

  if (schedules.length === 0) {
    return message.reply('No schedules found.');
  }

  const isAdmin = hasAdminRole(message.member);

  const embed = new EmbedBuilder()
    .setTitle('Schedules')
    .setColor(0x2ecc71)
    .setDescription('Click schedule name to see details.');

  const rows = [];

  schedules.forEach((s, i) => {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`sched:detail:${i}`)
        .setLabel(`View ${s.name}`)
        .setStyle(ButtonStyle.Primary)
    );

    if (isAdmin) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`sched:edit:${i}`)
          .setLabel('Edit')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`sched:delete:${i}`)
          .setLabel('Delete')
          .setStyle(ButtonStyle.Danger)
      );
    }

    rows.push(row);
  });

  message.channel.send({
    embeds: [embed],
    components: rows.slice(0, 5) 
  });
}

function deleteSchedule(message, args) {
  const index = parseInt(args[0]) - 1;

  if (isNaN(index)) {
    return message.reply(
      'Usage: `!sched delete <number>`'
    );
  }

  const removed = store.remove(message.guildId, index);
  if (!removed) {
    return message.reply('Schedule not found.');
  }

  const embed = new EmbedBuilder()
    .setTitle('Schedule Deleted')
    .setColor(0xe74c3c)
    .setDescription(
      `**${removed.name}**\n<t:${removed.timestamp}:F>`
    );

  message.channel.send({ embeds: [embed] });
}
