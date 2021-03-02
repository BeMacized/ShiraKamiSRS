import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Writing build version file');
  // Check for brand id
  if (process.argv.length < 3) {
    console.error('No build version provided');
    return process.exit(1);
  }
  // Get version id
  const buildVersion = process.argv[2];
  // Define version file path
  const buildVersionFilePath = path.join(
    __dirname,
    '..',
    'src/assets/build-version.json',
  );
  // Write version file
  fs.writeFileSync(buildVersionFilePath, JSON.stringify({ buildVersion }));
  console.log(`Written build version '${buildVersion}' to build version file!`);
}

main();
