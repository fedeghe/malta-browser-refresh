---
[![npm version](https://badge.fury.io/js/malta-browser-refresh.svg)](http://badge.fury.io/js/malta-browser-refresh)
[![Dependencies](https://david-dm.org/fedeghe/malta-browser-refresh.svg)](https://david-dm.org/fedeghe/malta-browser-refresh)
[![npm downloads](https://img.shields.io/npm/dt/malta-browser-refresh.svg)](https://npmjs.org/package/malta-browser-refresh)
[![npm downloads](https://img.shields.io/npm/dm/malta-browser-refresh.svg)](https://npmjs.org/package/malta-browser-refresh)  
---  

This plugin can be used on: **.html** files and even on **.md** and **.pug** files after using the right plugin

Options :   
	- **files** : array containing te list of the files that whenever modified should trigger the browser refresh (the template html is included automatically); it is possible even to specify three special strings:  
	- "*" to include all relevant elements  
	- "relative" to include only relative relevant elements  
	- "net" to include only relevant elements coming from absolute full urls  

Since the polling of request for modifications happens every second it can happen that whenever 'net' or '*' is used, at some point, one request fails. This means that the target server has good reasons to ban all nearly requests and so the plugin will remove that file from the list.  

 **warning** : use this plugin only for development purposes


Sample usage:  
```
malta app/source/index.html public -plugins=malta-browser-refresh[files:\"relative\"]
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
    '-plugins=malta-browser-refresh[files:\"*\"]',
    '-options=showPath:false,watchInterval:500,verbose:0'
    ]).start(function (o) {
        var s = this;
        console.log('name : ' + o.name)
        console.log("content : \n" + o.content);
        'plugin' in o && console.log("plugin : " + o.plugin);
        console.log('=========');
    });
```