import fs from 'fs';
import { execSync } from 'child_process';

try {
  execSync('npx tsc --noEmit');
} catch (error) {
  const output = error.stdout.toString();
  const regex = /([a-zA-Z0-9_.\-\/\\]+\.tsx)\((\d+),\d+\): error TS/g;
  let match;
  
  while ((match = regex.exec(output)) !== null) {
    const file = match[1].trim();
    const lineNum = parseInt(match[2], 10);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    console.log(`\n--- ${file}:${lineNum} ---`);
    console.log(lines[lineNum - 3]);
    console.log(lines[lineNum - 2]);
    console.log(lines[lineNum - 1]);
    console.log(lines[lineNum]);
    console.log(lines[lineNum + 1]);
  }
}
