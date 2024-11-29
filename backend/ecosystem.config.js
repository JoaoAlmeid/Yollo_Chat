module.exports = {
  apps: [
    {
      name: 'server',
      script: 'dist/server.js',
      watch: true,
      ignore_watch: ['node_modules', 'logs'],
    }
  ]
}
