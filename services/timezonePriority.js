const userStore = require('./userTimezoneStore');
const guildStore = require('./guildTimezoneStore');
const localeResolver = require('./localeTimezone');
const { resolve } = require('./timezoneResolver');

function resolvePriority({ tzInput, userId, guildId, locale }) {

  let tz = resolve(tzInput);
  if (tz) return tz;

  tz = userStore.get(userId);
  if (tz) return tz;

  tz = guildStore.get(guildId);
  if (tz) return tz;

  tz = localeResolver.resolve(locale);
  if (tz) return tz;

  return null;
}

module.exports = { resolvePriority };
