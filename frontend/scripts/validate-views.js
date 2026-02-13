const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const viewsDir = path.join(__dirname, "..", "views");
let errors = 0;

function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      scanDir(fullPath);
    } else if (file.name.endsWith(".ejs")) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        ejs.compile(content, { filename: fullPath });
        console.log(`✅ ${path.relative(viewsDir, fullPath)}`);
      } catch (err) {
        console.error(
          `❌ ${path.relative(viewsDir, fullPath)}: ${err.message}`,
        );
        errors++;
      }
    }
  }
}

if (!fs.existsSync(viewsDir)) {
  console.error("❌ views/ directory not found");
  process.exit(1);
}

scanDir(viewsDir);

if (errors > 0) {
  console.error(`\n❌ ${errors} view(s) have errors`);
  process.exit(1);
} else {
  console.log("\n✅ All views are valid");
}
