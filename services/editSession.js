const sessions = new Map();

module.exports = {
  set(userId, session) {
    sessions.set(userId, session);
  },

  get(userId) {
    return sessions.get(userId);
  },

  clear(userId) {
    sessions.delete(userId);
  }
};