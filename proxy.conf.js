const fs = require('fs');
const ROOT = '/Users/uwereitter/Entwicklung/kompendia/data';
const PROXY_CONFIG = [
  {
    context: ['/resources', '/data', '/api'],
    target: 'http://localhost:3100',
    secure: true,
    pathRewrite: {
      '^/resourcesxxx': '../data/resources'
    },
    logLevel: 'info',
    bypass: function(req, res, proxyOptions) {
        /*
      if (req.url.includes('/resources')) {
        if (fs.existsSync(ROOT + req.url)) {
            res.sendFile(req.url, { root: ROOT });
        } else {
            console.log(req.url);
            return req.url;
        }
      }
      if (req.headers.accept) {
        if (req.headers.accept.indexOf('htmlxxx') !== -1) {
          console.log('Skipping proxy for browser request.');
          return '/index.html';
        }
        req.headers['X-Custom-Header'] = 'yes';
      }
      */
    }
  }
];

module.exports = PROXY_CONFIG;
