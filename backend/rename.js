import fs from 'fs';
import path from 'path';

const imageDir = path.resolve('public', 'images');

try {
  // Read all files in the images folder
  const files = fs.readdirSync(imageDir);
  let renamedCount = 0;

  files.forEach(file => {
    // Replace spaces, parentheses, and dashes with underscores
    let newName = file.replace(/[\s\-\(\)]+/g, '_');
    
    // Clean up any double underscores that might get created
    newName = newName.replace(/_+/g, '_');

    // If the name changed, rename the actual file
    if (newName !== file) {
      fs.renameSync(path.join(imageDir, file), path.join(imageDir, newName));
      console.log(`Renamed: "${file}" -> "${newName}"`);
      renamedCount++;
    }
  });

  console.log(`\nSuccess! Renamed ${renamedCount} files to be database-friendly.`);
} catch (err) {
  console.error("Oops, something went wrong:", err);
}