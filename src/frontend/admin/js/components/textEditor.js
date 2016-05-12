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
      height : '400px',
      width  : '100%',
      value  : '',
      fontSize   : 13,
      onChange   : null,
      onLoad     : null,
    };
  },
  onInput: function() {
    var currentContent = this.refs.editorDiv.value;

    if (this.props.onChange) {
      this.props.onChange(currentContent);
    }      
  },
  componentDidMount: function() {
    if (this.props.onLoad) {
      this.props.onLoad();
    }
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return false;
  },
  render: function() {
    var divStyle = {
      width: this.props.width,
      height: this.props.height,
      fontSize: this.props.fontSize,
      overflowY: 'scroll'
    };

    var value = this.props.value;

    return (
      <textarea
        ref="editorDiv"
        className="markdown-editor"
        onInput={this.onInput}
        onKeyDown={this.onKeyDown}
        onBlur={this.onBlur}
        style={divStyle}>{value}</textarea>
    );
  },
  clear: function() {
    this.refs.editorDiv.value = '';
  }
});
