---
[![npm version](https://badge.fury.io/js/malta-browser-refresh.svg)](http://badge.fury.io/js/malta-browser-refresh)
[![npm downloads](https://img.shields.io/npm/dt/malta-browser-refresh.svg)](https://npmjs.org/package/malta-browser-refresh)
[![npm downloads](https://img.shields.io/npm/dm/malta-browser-refresh.svg)](https://npmjs.org/package/malta-browser-refresh)  
---  

This plugin can be used on: **.html** files and even on **.md** and **.pug** files after using the right plugin

It observers `js` and `css` files with a relative path and refreshes the browser automatically when one of those changes.

Options :   
	- **mode** : decide use the `xhr` mode or the `ws` mode; default is `ws`  

 **warning** : use this plugin only for development purposes


Sample usage:  
```
malta app/source/index.html public -plugins=malta-browser-refresh[mode:\"xhr\"]
```
or in the .json file :
```
"app/source/index.html" : "public -plugins=malta-browser-refresh"
```
or in a script : 
``` js
var Malta = require('malta');
Malta.get().check([
    'app/source/index.html',
    'public',
    '-plugins=malta-browser-refresh',
    '-options=showPath:false,watchInterval:500,verbose:0'
    ]).start(function (o) {
        var s = this;
        console.log('name : ' + o.name)
        console.log("content : \n" + o.content);
        'plugin' in o && console.log("plugin : " + o.plugin);
        console.log('=========');
    });
```