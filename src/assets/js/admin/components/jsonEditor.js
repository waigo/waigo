/** Based on code from https://www.npmjs.com/package/react-ace */

var React = require('react');


module.exports = React.createClass({
  propTypes: {
    height : React.PropTypes.string,
    width : React.PropTypes.string,
    fontSize : React.PropTypes.number,
    onChange: React.PropTypes.func,
    value: React.PropTypes.string,
    onLoad: React.PropTypes.func,
  },
  getDefaultProps: function() {
    return {
      height : '100px',
      width  : '500px',
      value  : '{}',
      fontSize   : 13,
      onChange   : null,
      onLoad     : null,
    };
  },
  _execCommand: function(command) {
    document.execCommand('styleWithCSS', true, null);
    document.execCommand(command, true, null);
  },
  onKeyDown: function(e) {
    var self = this;

    switch (e.keyCode) {
      // BACkspace
      case 8:
        // HACK: outdent if normal backspace does nothing
        // var currentContent = React.findDOMNode(this.refs.editorDiv).innerText;
        // setTimeout(function() {
        //   // if content not changed then try an outdent
        //   if (React.findDOMNode(self.refs.editorDiv).innerText === currentContent) {
        //     self._execCommand('outdent');
        //   }
        // }, 0);
        break;
      // TAB
      case 9:
        e.preventDefault();
        // this._execCommand('indent');
        break;
    }
  },
  onInput: function() {
    var currentContent = React.findDOMNode(this.refs.editorDiv).innerText;

    if (this.props.onChange) {
      currentContent = currentContent.replace(/\s+/mg, '');

      this.props.onChange(currentContent);
    }      
  },
  getValue: function() {
    return this.editor.getValue();
  },
  componentDidMount: function() {
    if (this.props.onLoad) {
      this.props.onLoad();
    }

    this.props.onChange(this.props.value);
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return false;
  },
  render: function() {
    var divStyle = {
      width: this.props.width,
      height: this.props.height,
      fontSize: this.props.fontSize,
    };

    return (<div contentEditable="true" 
      ref="editorDiv"
      className="json-editor"
      onInput={this.onInput}
      onKeyDown={this.onKeyDown}
      onBlur={this.onBlur}
      style={divStyle}>{this.props.value}</div>
    );
  }
});
