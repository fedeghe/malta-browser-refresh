/**
 * CHANGELOG
 * 1.1.0
 * Fixed bug about net failure during fisrt stage to get file last-modified (ignore exception)
 * 
 * 1.0.9
 * Fixed a bug when * is used in files and no script or link tags are found
 * 
 * 1.0.8
 * Fixed a bug about absolute paths
 * 
 * 1.0.7
 * ignore exceptions on http/s HEAD requests for last-modified header
 * 
 * 1.0.6
 * the srv port is not fixed to be 1234, then more than one instance can run at once
 * even absolute urls are watched
 */
var Malta = require('malta'),
	path = require('path')
	fs = require('fs'),
	bWatch = require('./bwatch.js'),
	getbWatch = (function () {
		var bw = new bWatch;
		bw.start();
		return function (){return bw;}
	})();

function malta_browser_refresh(o, options) {
	options = options || {};

	if (!('files' in options)) {
		options.files = [];
	}

	var self = this,
		start = new Date(),
		msg,
		pluginName = path.basename(path.dirname(__filename)),
		tplPath = path.dirname(self.tplPath),
		baseFolder = path.dirname(o.name),
		fileI = 0,
		tmp,
		fileNum,
		bW = getbWatch();
	
	function isRelative(path) {
		return !(path.match(/^http|\/\//));
	}

	function digForFiles() {
		var rex = {
				js : {
					outer : /<script[\s\S]*?src=\"([^"]*)\"*?>[\s\S]*?<\/script>/gi,
					inner : /src=\"([^"]*)\"/
				},
				css : {
					outer : /<link[\s\S]*?href=\"([^"]*)\"*?\/?>/gi,
					inner : /href=\"([^"]*)\"/
				}
			},
			scripts = o.content.match(rex.js.outer),
			styles = o.content.match(rex.css.outer),
			i, l, tmp,  rel;

		if (scripts)
			for (i = 0, l = scripts.length; i < l; i++) {
				tmp = scripts[i].match(rex.js.inner);
				if (tmp) {
					tmp[1] = tmp[1].replace(/^\/\//, 'http://');
					tmp[1] = tmp[1].replace(/^\//, '');
					rel = isRelative(tmp[1]);

					bW.addFile(
						rel ? 'relative' : 'net',
						rel ? path.resolve(baseFolder, tmp[1]) : tmp[1]
					);
				}
			}

		if (styles)
			for (i = 0, l = styles.length; i < l; i++) {
				tmp = styles[i].match(rex.css.inner);
				if (tmp) {
					tmp[1] = tmp[1].replace(/^\/\//, 'http://');
					tmp[1] = tmp[1].replace(/^\//, '');

					rel = isRelative(tmp[1]);

					bW.addFile(
						rel ? 'relative' : 'net',
						rel ? path.resolve(baseFolder, tmp[1]) : tmp[1]
					);
				}
			}
	}

	try {
		o.content = o.content.replace(/\<head\>/, '<head><script>' + bWatch.script() + '</script>');
	} catch (err) {
		self.doErr(err, o, pluginName);
	}

	// add the html by default
	//
	bW.addFile('relative', path.resolve(baseFolder, o.name));

	if (options.files[0] == "*") {
		digForFiles();
	} else {
		fileNum = options.files.length;
		for (fileI = 0; fileI < fileNum; fileI++) {
			
			tmp = isRelative(options.files[fileI]);
			bW.addFile(
				rel ? 'relative' : 'net',
				rel ? path.resolve(baseFolder, options.files[fileI]) : options.files[fileI]
			);
		}
	}

	return function (solve, reject){
		fs.writeFile(o.name, o.content, function(err) {
			err && self.doErr(err, o, pluginName);
			msg = 'plugin ' + pluginName.white() + ' wrote ' + o.name + ' (' + self.getSize(o.name) + ')';
			
			solve(o);
			self.notifyAndUnlock(start, msg);
		});
	};
}
malta_browser_refresh.ext = ['html', 'md', 'pug'];
module.exports = malta_browser_refresh;