const { EmbedBuilder } = require('discord.js');
const tzStore = require('../services/userTimezoneStore');
const { DateTime } = require('luxon');

module.exports = {
  name: 'timezone',

  async execute(message, args) {

    const sub = args[0]?.toLowerCase();

    if (sub === 'current') {

      const tz = tzStore.get(message.author.id);

      const now = DateTime.now().setZone(tz);

      const embed = new EmbedBuilder()
        .setTitle('Your Current Timezone')
        .setColor(0x2ecc71)
        .addFields(
          {
            name: 'Timezone',
            value: `\`${tz}\``,
            inline: true
          },
          {
            name: 'Current Time',
            value: now.toFormat('dd LLL yyyy HH:mm:ss'),
            inline: true
          },
          {
            name: 'UTC Offset',
            value: now.toFormat('ZZ'),
            inline: true
          }
        )
        .setFooter({ text: 'Use !set timezone <zone> to change it' });

      return message.reply({ embeds: [embed] });
    }

    if (sub === 'list') {

      const embed = new EmbedBuilder()
        .setTitle('Supported Timezones')
        .setColor(0x3498db)
        .setDescription(
          '`!set timezone <zone>`\n' +
          '`!sched add <name>, <date>, <zone>`'
        )
        .addFields(
          {
            name: 'Indonesia',
            value:
              '`WIB` → Asia/Jakarta\n' +
              '`WITA` → Asia/Makassar\n' +
              '`WIT` → Asia/Jayapura'
          },
          {
            name: 'Asia',
            value:
              '`SGT` → Asia/Singapore\n' +
              '`MYT` → Asia/Kuala_Lumpur\n' +
              '`JST` → Asia/Tokyo\n' +
              '`KST` → Asia/Seoul'
          },
          {
            name: 'America',
            value:
              '`EST` → America/New_York\n' +
              '`PST` → America/Los_Angeles'
          },
          {
            name: 'Offset',
            value:
              '`GMT+7`\n' +
              '`UTC-5`\n' +
              '`UTC+9`'
          }
        );

      return message.reply({ embeds: [embed] });
    }

    return message.reply(
      'Usage:\n' +
      '`!timezone current`\n' +
      '`!timezone list`'
    );
  }
};