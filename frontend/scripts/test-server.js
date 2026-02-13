const http = require("http");
const { spawn } = require("child_process");
const path = require("path");

const PORT = process.env.PORT || 3099;
const TIMEOUT = 15000;

process.env.PORT = PORT;

const server = spawn("node", ["server.js"], {
  cwd: path.join(__dirname, ".."),
  env: { ...process.env, PORT, NODE_ENV: "test" },
  stdio: ["pipe", "pipe", "pipe"],
});

let output = "";
server.stdout.on("data", (d) => {
  output += d.toString();
});
server.stderr.on("data", (d) => {
  output += d.toString();
});

const timeout = setTimeout(() => {
  console.error("❌ Server did not start within timeout");
  console.error(output);
  server.kill();
  process.exit(1);
}, TIMEOUT);

function checkServer(retries = 0) {
  if (retries > 20) {
    clearTimeout(timeout);
    console.error("❌ Server never responded");
    console.error(output);
    server.kill();
    process.exit(1);
  }

  setTimeout(() => {
    http
      .get(`http://localhost:${PORT}/`, (res) => {
        clearTimeout(timeout);
        if (res.statusCode >= 200 && res.statusCode < 500) {
          console.log(`✅ Server responded with status ${res.statusCode}`);
          server.kill();
          process.exit(0);
        } else {
          console.error(`❌ Server responded with status ${res.statusCode}`);
          server.kill();
          process.exit(1);
        }
      })
      .on("error", () => {
        checkServer(retries + 1);
      });
  }, 500);
}

server.on("error", (err) => {
  clearTimeout(timeout);
  console.error(`❌ Failed to start server: ${err.message}`);
  process.exit(1);
});

checkServer();
