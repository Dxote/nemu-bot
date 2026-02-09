const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/user-timezones.json');

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function set(userId, timezone) {
  const data = load();
  data[userId] = timezone;
  save(data);
}

function get(userId) {
  return load()[userId] || null;
}

module.exports = { set, get };
