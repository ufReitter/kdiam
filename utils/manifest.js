

const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const path = require('path');

var dirname = 'xxxxxxx';

if (__dirname.indexOf('\/') > -1) {
    //dirname = __dirname.replace('\/src\/server', '');
} else {
    //dirname = __dirname.replace('\\src\\server', '');
}

dirname = __dirname + '/client-editor';

var package = require('../package.json');

var exclude = [
    'cache_manifest.cfm',
    'index-offline.html',
    'index.html',
    'process.json',
    'opus_',
    'post-receive',
    'server',
    '.js.map',
    'calculations.ts',
    'functions.ts'
];

function getFiles(dir, files_) {
    var files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        //var name = files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            var ex = false;
            for (var j = 0; j < exclude.length; j++) {
                if (name.indexOf(exclude[j]) > -1) {
                   ex = true;
                }

            }
            if (!ex) files_.push(name);
        }
    }
    return files_;
}

var files = [];
var files1 = getFiles('client-editor');
var files2 = getFiles('../kompendia-data/data');

var date = Date();
var manifest = 'CACHE MANIFEST\n\n';
manifest += '# Cache manifest Kompendia ' + package.version + '\n';
manifest += '# created ' + date + ' \n';

var stats;
var fileSizeInMB = 0;
var size = 0;
var sizeImages = 0;
var sizeJson = 0;
var sizeHtml = 0;
var sizeCSS = 0;
var sizeFonts = 0;
var sizeJs = 0;
var sizeBundle = 0;

for (var i = 0; i < files1.length; i++) {
    var file = files1[i];

    stats = fs.statSync(file);
    fileSizeInMB = stats["size"] / 1000000.0;
    size = size + fileSizeInMB;

    if (file.indexOf('.json') > -1) {
        sizeJson = sizeJson + fileSizeInMB;
    }
    if (file.indexOf('.html') > -1) {
        sizeHtml = sizeHtml + fileSizeInMB;
    }
    if (file.indexOf('.html') > -1) {
        sizeCSS = sizeCSS + fileSizeInMB;
    }
    if (file.indexOf('.woff') > -1 || file.indexOf('.otf') > -1 || file.indexOf('.ttf') > -1) {
        sizeFonts = sizeFonts + fileSizeInMB;
    }
    if (file.indexOf('.png') > -1 || file.indexOf('.jpg') > -1 || file.indexOf('.jpeg') > -1) {
        sizeImages = sizeImages + fileSizeInMB;
    }
    if (file.indexOf('.js') > -1) {
        sizeJs = sizeJs + fileSizeInMB;
    }
    if (file.indexOf('.bundle') > -1) {
        sizeBundle = sizeBundle + fileSizeInMB;
    }
}

for (var i = 0; i < files2.length; i++) {
    var file = files2[i];

    stats = fs.statSync(file);
    fileSizeInMB = stats["size"] / 1000000.0;
    size = size + fileSizeInMB;

    if (file.indexOf('.json') > -1) {
        sizeJson = sizeJson + fileSizeInMB;
    }
    if (file.indexOf('.html') > -1) {
        sizeHtml = sizeHtml + fileSizeInMB;
    }
    if (file.indexOf('.html') > -1) {
        sizeCSS = sizeCSS + fileSizeInMB;
    }
    if (file.indexOf('.woff') > -1 || file.indexOf('.otf') > -1 || file.indexOf('.ttf') > -1) {
        sizeFonts = sizeFonts + fileSizeInMB;
    }
    if (file.indexOf('.png') > -1 || file.indexOf('.jpg') > -1 || file.indexOf('.jpeg') > -1) {
        sizeImages = sizeImages + fileSizeInMB;
    }
    if (file.indexOf('.js') > -1) {
        sizeJs = sizeJs + fileSizeInMB;
    }
    if (file.indexOf('.bundle') > -1) {
        sizeBundle = sizeBundle + fileSizeInMB;
    }
}

manifest += '#  in client: ' + files1.length + ' files\n';
manifest += '#    in data: ' + files2.length + ' files\n';
manifest += '#        all: ' + size.toFixed(4) + ' MB\n';
manifest += '#    bundles: ' + sizeBundle.toFixed(4) + ' MB\n';
manifest += '#     images: ' + sizeImages.toFixed(4) + ' MB\n';
manifest += '#       json: ' + sizeJson.toFixed(4) + ' MB\n';
manifest += '#       html: ' + sizeHtml.toFixed(4) + ' MB\n';
manifest += '#        css: ' + sizeCSS.toFixed(4) + ' MB\n';
manifest += '#      fonts: ' + sizeFonts.toFixed(4) + ' MB\n';
manifest += '#         js: ' + sizeJs.toFixed(4) + ' MB\n';


for (var i = 0; i < files1.length; i++) {
    files1[i] = files1[i].replace('client-editor\/', '');
    files1[i] = files1[i].replace('client-rditor\\', '');
    manifest += '\n' + files1[i];
}


for (var i = 0; i < files2.length; i++) {
    files2[i] = files2[i].replace('../kompendia-data\/', '');
    files2[i] = files2[i].replace('../kompendia-data\\', '');
    manifest += '\n' + files2[i];
}

files.push(files1);
files.push(files2);

manifest += '\n\n# NETWORK:\n\n';
manifest += '# data/\n';


var htmlOld = '<html lang="de">';

var htmlNew = '<html lang="de" manifest="../cache_manifest.cfm">';


var metaOld = '<base href="/">';

var metaNew = '<base href="/">\n<meta http-equiv="cache-control" content="max-age=0" />\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">';


async function saveFiles() {
	let html;
	try {
		await writeFile(dirname + '/cache_manifest.cfm', manifest, 'utf8');
	} catch (e) {
		console.log('error: ', e);
    }
	try {
		html = await readFile(dirname + '/index.html', 'utf8');
	} catch (e) {
		console.log('error: ', e);
    }
    html = html.replace(htmlOld, htmlNew);
    html = html.replace(metaOld, metaNew);
	try {
		await writeFile(dirname + '/index-offline.html', html, 'utf8');
	} catch (e) {
		console.log('error: ', e);
    }
}

saveFiles();

