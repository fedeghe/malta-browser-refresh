const path = require('path'),
    fs = require('fs'),
    xwatch = require('./xwatch'),
    createbWatch = function (type) {
        bW = new xwatch(type);
        script = bW.getScript();
		bW.start();
    };

let script = null,
    bW = null;

function malta_browser_refresh(obj, options) {
    options = options || {};
    const self = this,
        defaultMode = 'ws',
        mode = options.mode || defaultMode,
        start = new Date(),
        pluginName = path.basename(path.dirname(__filename)),
        baseFolder = path.dirname(obj.name);
    
    !bW && createbWatch(mode);

    let msg;
        
    function digForFiles() {
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
            scripts = obj.content.match(rex.js.outer),
            styles = obj.content.match(rex.css.outer),
            tmp;

        if (scripts) {
            scripts.forEach(script => {
                tmp = script.match(rex.js.inner);
                if (tmp) {
                    bW.addFile(path.resolve(baseFolder, tmp[1]));
                }
            })
        }
        if (styles) {
            styles.forEach(style => {
                tmp = style.match(rex.css.inner);
                if (tmp) {
                    bW.addFile(path.resolve(baseFolder, tmp[1]));
                }
            })
        }
    }
    
    try {
        obj.content = obj.content.replace(/\<\/body\>/, '<script>' + script + '</script></body>');
    } catch (err) {
        self.doErr(err, obj, pluginName);
    } 

    // add the html by default
    bW.addFile(path.resolve(baseFolder, obj.name));

    digForFiles();

	return (solve, reject) => {
        fs.writeFile(obj.name, obj.content, err => {
            err && self.doErr(err, obj, pluginName);
            msg = 'plugin ' + pluginName.white() + ' wrote ' + obj.name + ' (' + self.getSize(obj.name) + ')';
            solve(obj);
            self.notifyAndUnlock(start, msg);
        });
	};
}
malta_browser_refresh.ext = ['html', 'md', 'pug'];
module.exports = malta_browser_refresh;