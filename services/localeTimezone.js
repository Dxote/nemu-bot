const map = {
  id: 'Asia/Jakarta',
  "en-GB": 'Europe/London',
  "en-US": 'America/New_York',
  ja: 'Asia/Tokyo',
  ko: 'Asia/Seoul',
  "zh-CN": 'Asia/Shanghai',
  fr: 'Europe/Paris',
  de: 'Europe/Berlin',
  es: 'Europe/Madrid',
  ru: 'Europe/Moscow',
  th: 'Asia/Bangkok'
};

function resolve(locale) {
  if (!locale) return null;

  return map[locale] || map[locale.split('-')[0]] || null;
}

module.exports = { resolve };
