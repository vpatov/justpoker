var merge = require('package-merge')
var fs = require('fs');

var dst = fs.readFileSync('package.json');
var src = fs.readFileSync('package2.json');
fs.writeFile("./newPackage.json", merge(dst,src));
