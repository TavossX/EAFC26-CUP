const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  let modified = false;
  
  content = content.replace(/<(Button|IconButton)([\s\S]*?)>/g, (match, tag, inner) => {
    if (inner.includes('variant="outline"') || inner.includes('variant="ghost"') || inner.includes('variant="link"')) {
      modified = true;
      let newInner = inner
        .replace(/variant="outline"/g, 'variant="solid"')
        .replace(/variant="ghost"/g, 'variant="solid"')
        .replace(/variant="link"/g, 'variant="solid"');
      return `<${tag}${newInner}>`;
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
