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
	if (!('files' in options)) {
		options.files = [];
	}

	// add the html by default
	//
	options.files.push(o.name);

	var self = this,
		start = new Date(),
		msg,
		pluginName = path.basename(path.dirname(__filename)),
		tplPath = path.dirname(self.tplPath),
		fileI = 0,
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
			i, l, tmp;

		for (i = 0, l = scripts.length; i < l; i++) {
			tmp = scripts[i].match(rex.js.inner);
			tmp && isRelative(tmp[1])
				&& options.files.push(tmp[1])
		}
		for (i = 0, l = styles.length; i < l; i++) {
			tmp = styles[i].match(rex.css.inner);
			tmp && isRelative(tmp[1])
				&& options.files.push(tmp[1]);
		}
		console.log(options.files)
	}

	try {
		o.content = o.content.replace(/\<head\>/, '<head><script>' + bWatch.script + '</script>');
	} catch (err) {
		self.doErr(err, o, pluginName);
	}
	if (options.files[0] == "*") {
		// remove it
		options.files.splice(0,1);
		digForFiles();
	}
	fileNum = options.files.length;
	for (null; fileI <  fileNum; fileI++) {
		bW.addFile(options.files[fileI]);
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