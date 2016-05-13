const React = require('react');
const CodeMirror = require('react-codemirror');
require('codemirror/mode/javascript/javascript');


module.exports = React.createClass({
  propTypes: {
    language : React.PropTypes.string,
    height : React.PropTypes.string,
    width : React.PropTypes.string,
    fontSize : React.PropTypes.number,
    onChange: React.PropTypes.func,
    value: React.PropTypes.string,
    onLoad: React.PropTypes.func,
  },
  getDefaultProps: function() {
    return {
      language: 'javascript',
      height : '100px',
      width  : '700px',
      value  : "",
      fontSize   : 13,
      onChange   : null,
      onLoad     : null,
    };
  },
  getInitialState: function() {
    return {
      error: null,
    };
  },
  componentDidMount: function() {
    if (this.props.onLoad) {
      this.props.onLoad();
    }
  },
  render: function() {
    var divStyle = {
      width: this.props.width,
      height: this.props.height,
      fontSize: this.props.fontSize,
    };

    return (
      <div style={divStyle} className="code-editor">
        <CodeMirror 
          value={this.props.value}
          onChange={this.props.onChange} 
          options={{
            mode: this.props.language,
            lineNumbers: false,
            tabSize: 2,
            indentUnit: 2,
            smartIndent: true,
            dragDrop: false,
          }} />
      </div>
    );
  },
});
