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
      this.refs.code
    );
  },

  render: function() {
    var mime = this.props.mime,
      lang = 'none';

    if (mime.match(/json|js/i)) {
      lang = 'javascript';
    }
    else if (mime.match(/xml|xsl|htm|svg|sgml/i)) {
      lang = 'markup';
    }

    lang = 'language-' + lang;

    var code = this._formatCode(mime, this.props.code);

    return (
      <pre><code ref="code" className={lang}>{code}</code></pre>
    );
  },

  _formatCode: function(mime, code) {
    try {
      if (mime.match(/json/i)) {
        code = JSON.stringify(JSON.parse(code), null, 2);
      }      

      return code;
    } catch (err) {
      // if any problems just return the original
      return code;
    }
  }
});
