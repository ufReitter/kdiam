const path = require('path');
const fs = require('fs');
const dada = require.resolve('../package.json');
const appVersion = require('../package.json').version;


const versionFilePath = path.join(__dirname, '..', 'src/environments/version.ts');
const cacheBustFilePath = path.join(__dirname, '..', 'src/environments/cachebust.js');

const src1 = `export const version = '${appVersion}';
`;


let date = new Date().toISOString();
const src2 = `let cacheBustDate = '${date}';
`;

// ensure version module pulls value from package.json 
fs.writeFile(versionFilePath, src1, { flat: 'w' }, function (err) {
    if (err) {
        return console.log(err);
    }
});


fs.writeFile(cacheBustFilePath, src2, { flat: 'w' }, function (err) {
    if (err) {
        return console.log(err);
    }
});