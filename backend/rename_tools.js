import fs from 'fs';
import path from 'path';

const toolsDir = path.resolve('public', 'images', 'tools');

try {
  // Grab all image files in the tools folder
  const files = fs.readdirSync(toolsDir).filter(file => 
    /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
  );
  
  let count = 1;

  files.forEach(file => {
    // Keep the original extension (e.g., .webp) but rename the front
    const ext = path.extname(file); 
    const newName = `tool_${count}${ext}`;

    // Only rename if it doesn't already match our standard
    if (newName !== file) {
      fs.renameSync(path.join(toolsDir, file), path.join(toolsDir, newName));
      console.log(`Renamed: "${file}" -> "${newName}"`);
    }
    count++;
  });

  console.log(`\n✅ Success! Renamed ${count - 1} tool files to standard format.`);
} catch (err) {
  console.error("Error renaming files:", err);
}