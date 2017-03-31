---
[![npm version](https://badge.fury.io/js/malta-browser-refresh.svg)](http://badge.fury.io/js/malta-browser-refresh)
[![Dependencies](https://david-dm.org/fedeghe/malta-browser-refresh.svg)](https://david-dm.org/fedeghe/malta-browser-refresh)
[![npm downloads](https://img.shields.io/npm/dt/malta-browser-refresh.svg)](https://npmjs.org/package/malta-browser-refresh)
[![npm downloads](https://img.shields.io/npm/dm/malta-browser-refresh.svg)](https://npmjs.org/package/malta-browser-refresh)  
---  

This plugin can be used on: **.html** files and even on **.md** and **.pug** files after using the right plugin

Options :   
	- **files** : array containing te list of the files that whenever modified should trigger the browser refresh (the template html is included automatically)  
    is possible to add simply '*' and all `<script>` and `<link>` file references will be added, in this case the `src` and `href` has to be relative (all starting with `http` or `//` will be skipped).

 **warning** : use this plugin only for development purposes


Sample usage:  
```
malta app/source/index.html public -plugins=malta-browser-refresh[files:[\"js/script.js\",\"css/style.css\"]]
```
or in the .json file :
```
"app/source/index.html" : "public -plugins=malta-browser-refresh[files:[\"js/script.js\",\"css/style.css\"]]"
```
or in a script : 
``` js
var Malta = require('malta');
Malta.get().check([
    'app/source/index.html',
    'public',
    '-plugins=malta-browser-refresh[\"js/script.js\",\"css/style.css\"]',
    '-options=showPath:false,watchInterval:500,verbose:0'
    ]).start(function (o) {
        var s = this;
        console.log('name : ' + o.name)
        console.log("content : \n" + o.content);
        'plugin' in o && console.log("plugin : " + o.plugin);
        console.log('=========');
    });
```