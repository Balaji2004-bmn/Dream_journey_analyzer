// Shared in-memory demo session store
// Used by both auth routes and authentication middleware during development

const demoSessions = new Map();

module.exports = { demoSessions };
