const aliasMap = {
  // Indonesia
  WIB: 'Asia/Jakarta',
  WITA: 'Asia/Makassar',
  WIT: 'Asia/Jayapura',

  // Asia
  SGT: 'Asia/Singapore',
  MYT: 'Asia/Kuala_Lumpur',
  ICT: 'Asia/Bangkok',
  CST: 'Asia/Shanghai',
  HKT: 'Asia/Hong_Kong',
  JST: 'Asia/Tokyo',
  KST: 'Asia/Seoul',
  IST: 'Asia/Kolkata',
  PKT: 'Asia/Karachi',

  // Australia
  AWST: 'Australia/Perth',
  ACST: 'Australia/Adelaide',
  AEST: 'Australia/Sydney',

  // Europe
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  EET: 'Europe/Helsinki',
  MSK: 'Europe/Moscow',

  // America
  EST: 'America/New_York',
  CST_US: 'America/Chicago',
  MST: 'America/Denver',
  PST: 'America/Los_Angeles',

  UTC: 'UTC'
};

function resolve(input) {
  if (!input) return null;

  input = input.trim();

  const alias = aliasMap[input.toUpperCase()];
  if (alias) return alias;

  const offsetMatch = input.match(/^(GMT|UTC)\s*([+-]\d{1,2})$/i);
  if (offsetMatch) {
    const offset = parseInt(offsetMatch[2]);
    return `UTC${offset >= 0 ? '+' : ''}${offset}`;
  }

  if (Intl.supportedValuesOf('timeZone').includes(input)) {
    return input;
  }

  return null;
}

module.exports = { resolve };
