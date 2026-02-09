const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/guild-timezones.json');

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function set(guildId, timezone) {
  const data = load();
  data[guildId] = timezone;
  save(data);
}

function get(guildId) {
  return load()[guildId] || null;
}

module.exports = { set, get };
