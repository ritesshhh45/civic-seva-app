import fs from "fs";
import path from "path";

const outDir = "capacitor-www";

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Sanjay Chaudhary</title>
<meta http-equiv="refresh" content="0;url=https://civic-seva-app.vercel.app">
</head>
<body>
Redirecting...
</body>
</html>`;

fs.writeFileSync(path.join(outDir, "index.html"), html);