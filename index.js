/**
 * CHANGELOG
 * 
 * 1.1.5
 * Better debug in case some files are not found
 * 
 * 1.1.4
 * Fixed a bug whenever a file watched is deleted
 * 
 * 1.1.3
 * Fixed a bug in matching <script> and <link> and useing the right port in case of ssl protocol
 * 
 * 1.1.2
 * Damn just to fix the readme!!
 * 
 * 1.1.1
 * Added "net" and "relative" to files option, added rotated refererr to reduce the risk of being banned from polling
 * 
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

	function digForFiles(type) {
		var rex = {
				js : {
					outer : /<script[^>]*?src=\"([^"]*)\"[^>]*?>[\s\S]*?<\/script>/gi,
					inner : /src=\"([^"]*)\"/
				},
				css : {
					outer : /<link[^>]*?href=\"([^"]*)\"[^>]*?\/?>/gi,
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

					if (rel ? type.match(/relative|\*/) : type.match(/net|\*/)) {
						bW.addFile(
							rel ? 'relative' : 'net',
							rel ? path.resolve(baseFolder, tmp[1]) : tmp[1]
						);
					}
				}
			}
		if (styles)
			for (i = 0, l = styles.length; i < l; i++) {
				tmp = styles[i].match(rex.css.inner);
				if (tmp) {
					tmp[1] = tmp[1].replace(/^\/\//, 'http://');
					tmp[1] = tmp[1].replace(/^\//, '');

					rel = isRelative(tmp[1]);
					if (rel ? type.match(/relative|\*/) : type.match(/net|\*/)) {
						bW.addFile(
							rel ? 'relative' : 'net',
							rel ? path.resolve(baseFolder, tmp[1]) : tmp[1]
						);
					}
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
	if (options.files == "*") {
		digForFiles("*");
	} else if (options.files == "net") {
		digForFiles("net");
	} else if (options.files == "relative") {
		digForFiles("relative");
	} else {
		fileNum = options.files.length;
		for (fileI = 0; fileI < fileNum; fileI++) {
			
			tmp = isRelative(options.files[fileI]);
			bW.addFile(
				tmp ? 'relative' : 'net',
				tmp ? path.resolve(baseFolder, options.files[fileI]) : options.files[fileI]
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