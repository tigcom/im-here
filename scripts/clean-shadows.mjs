import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
        results = results.concat(walk(fullPath));
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = [...walk('./app'), ...walk('./components')];
let changedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Thay the cac shadow don tang thanh class rong hoac card-float
  content = content.replace(/\bshadow-(sm|md|lg|xl|2xl)\b/g, '');
  content = content.replace(/\bdrop-shadow-(sm|md|lg|xl|2xl)\b/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log('Updated:', file);
  }
});

console.log('Total files cleaned:', changedCount);
