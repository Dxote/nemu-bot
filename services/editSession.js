const sessions = new Map();

module.exports = {
  set(userId, handler) {
    sessions.set(userId, { handler });
  },

  get(userId) {
    return sessions.get(userId);
  },

  clear(userId) {
    sessions.delete(userId);
  }
};
