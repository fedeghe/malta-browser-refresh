const path = require('path')
	fs = require('fs'),
	bWatch = require('./bwatch.js'),
	getbWatch = (function () {
		let bw = new bWatch;
		bw.start();
		return function (){return bw;}
	})();

function malta_browser_refresh(o, options) {
	options = options || {};

	if (!('files' in options)) {
		options.files = [];
	}

	const self = this,
		start = new Date(),
		pluginName = path.basename(path.dirname(__filename)),
        baseFolder = path.dirname(o.name),
        bW = getbWatch();
        
    let msg,
		fileNum,
		tmp,
		fileI = 0;
	
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
			i, l, tmp, rel;

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
		o.content = o.content.replace(/\<\/body\>/, '<script>' + bWatch.script() + '</script></body>');
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

	return (solve, reject) => {
		fs.writeFile(o.name, o.content, err => {
			err && self.doErr(err, o, pluginName);
			msg = 'plugin ' + pluginName.white() + ' wrote ' + o.name + ' (' + self.getSize(o.name) + ')';
			
			solve(o);
			self.notifyAndUnlock(start, msg);
		});
	};
}
malta_browser_refresh.ext = ['html', 'md', 'pug'];
module.exports = malta_browser_refresh;