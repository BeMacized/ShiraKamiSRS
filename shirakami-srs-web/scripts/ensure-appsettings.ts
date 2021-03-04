import fs from 'fs';
import path from 'path';
import replace from 'replace-in-file';

const main = async () => {
    if (fs.existsSync(path.join(__dirname, '../src/assets/appsettings.json')))
        return;
    fs.copyFileSync(
        path.join(__dirname, '../src/assets/appsettings.template.json'),
        path.join(__dirname, '../src/assets/appsettings.json')
    );
    await replace({
        files: path.join(__dirname, '../src/assets/appsettings.json'),
        from: [
            /\${API_BASE_URL}/g,
        ],
        to: [
            'http://localhost:3000/api/v1',
        ],
    });
};

main();
