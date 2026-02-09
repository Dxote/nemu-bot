const tzStore = require('../services/userTimezoneStore');
const { resolve } = require('../services/timezoneResolver');

module.exports = {
  name: 'set',

  async execute(message, args) {
    const sub = args.shift()?.toLowerCase();

    if (sub !== 'timezone') {
      return message.reply('Usage: `!set timezone <timezone>`');
    }

    const input = args.join(' ');
    const timezone = resolve(input);

    if (!timezone) {
      return message.reply(
        'Invalid timezone.\n\n' +
        'Examples:\n' +
        '`!set timezone WIB`\n' +
        '`!set timezone GMT+7`\n' +
        '`!set timezone Asia/Jakarta`\n' +
        '`!set timezone America/New_York`'
      );
    }

    tzStore.set(message.author.id, timezone);

    message.reply(`Timezone set to **${timezone}**`);
  }
};
