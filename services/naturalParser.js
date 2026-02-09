const chrono = require('chrono-node');
const { DateTime } = require('luxon');

function parseNatural(text, timezone) {

  const result = chrono.parseDate(text);

  if (!result) return null;

  return DateTime.fromJSDate(result, { zone: timezone });
}

module.exports = { parseNatural };
