/** @jsx React.DOM */

var React = require('react');
var Component = require('./component');
var tpl = require('fs').readFileSync(require('path').join(__dirname, 'tpl.html'), {
    encoding: 'utf-8'
});
module.exports = function (app) {
    app.get('/example/code-share/demo.html', function *(next) {
        var count = 10;
        this.body = tpl.replace(/\{content\}/, React.renderToString(<Component count={count}/>))
            .replace(/\{count\}/, count);
    });
};