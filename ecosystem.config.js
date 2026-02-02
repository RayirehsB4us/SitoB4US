module.exports = {
  apps: [
    {
      name: "b4us-backend",
      cwd: "./backend",
      script: "npm",
      args: "run develop",
      watch: false,
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "b4us-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run start",
      watch: false,
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
