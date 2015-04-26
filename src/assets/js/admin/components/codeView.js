var React = require('react');
var Prism = require('prism');


module.exports = React.createClass({
  propTypes: {
    mime : React.PropTypes.string,
    code: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      mime: null,
      code: '',
    };
  },

  componentDidMount: function() {
    Prism.highlightElement(
      React.findDOMNode(this.refs.code)
    );
  },

  render: function() {
    var mime = this.props.mime.toLowerCase(),
      lang = 'none';

    if (mime.match(/json|js/)) {
      lang = 'javascript';
    }
    else if (mime.match(/xml|xsl|htm|svg|sgml/)) {
      lang = 'markup';
    }

    lang = 'language-' + lang;

    return (
      <pre><code ref="code" className={lang}>{this.props.code}</code></pre>
    );
  },
});
