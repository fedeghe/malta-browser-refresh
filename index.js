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
		fileNum = options.files.length,
		bW = getbWatch();
	
	try {
		o.content = o.content.replace(/\<head\>/, '<head><script>' + bWatch.script + '</script>');
	} catch (err) {
		self.doErr(err, o, pluginName);
	}
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