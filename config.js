function loadEnv(key) {
  var environmentVariable = process.env[key];

  if (environmentVariable) {
    return environmentVariable;
  }
  console.err('Environment variable', key, 'not set. Exiting');
  process.exit(1); // fail fast
}

module.exports = {
  username:      loadEnv('MONGO_USERNAME'),
  password:      loadEnv('MONGO_PASSWORD'),
}