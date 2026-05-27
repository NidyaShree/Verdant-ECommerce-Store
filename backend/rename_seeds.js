import fs from 'fs';
import path from 'path';

const seedDir = path.resolve('public', 'images', 'seeds');

try {
  const files = fs.readdirSync(seedDir);
  let renamedCount = 0;

  files.forEach(file => {
    // This specifically targets the "seed (X)" format and turns it into "seed_X"
    let newName = file.replace(' (', '_').replace(')', '');

    if (newName !== file) {
      fs.renameSync(path.join(seedDir, file), path.join(seedDir, newName));
      console.log(`Renamed: "${file}" -> "${newName}"`);
      renamedCount++;
    }
  });

  console.log(`\nSuccess! Renamed ${renamedCount} seed files.`);
} catch (err) {
  console.error("Error renaming files:", err);
}