// Test if React render works in Node SSR or check bundling
const fs = require('fs');
const js = fs.readFileSync('/home/user/masoud/client/dist/assets/index-oCPRa2gc.js', 'utf8');
console.log('JS bundle length:', js.length);
