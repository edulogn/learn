/** @jsx React.DOM */
var React = require('react');
var pkg = require('./package.json');

var HelloWorld = React.createClass({
    render: function() {
        return <h1>Hello {this.props.name}!</h1>;
    }
});

React.render(<HelloWorld name="John" />, document.getElementById('title-test'));
