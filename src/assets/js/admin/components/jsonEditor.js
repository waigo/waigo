/** Based on code from https://www.npmjs.com/package/react-ace */

var React = require('react');


module.exports = React.createClass({
  propTypes: {
    name : React.PropTypes.string,
    height : React.PropTypes.string,
    width : React.PropTypes.string,
    fontSize : React.PropTypes.number,
    showGutter : React.PropTypes.bool,
    onChange: React.PropTypes.func,
    value: React.PropTypes.string,
    onLoad: React.PropTypes.func,
    maxLines : React.PropTypes.number,
    readOnly : React.PropTypes.bool,
    highlightActiveLine : React.PropTypes.bool,
    showPrintMargin : React.PropTypes.bool
  },
  getDefaultProps: function() {
    return {
      name   : 'json-editor' + parseInt(Math.random() * 361323),
      height : '100px',
      width  : '500px',
      value  : '{}',
      fontSize   : 12,
      showGutter : false,
      onChange   : null,
      onLoad     : null,
      maxLines   : null,
      highlightActiveLine : true,
      showPrintMargin     : false
    };
  },
  onChange: function() {
    var value = this.editor.getValue();
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  },
  getValue: function() {
    return this.editor.getValue();
  },
  componentDidMount: function() {
    var self = this;
    this.editor = ace.edit(this.props.name);
    this.editor.getSession().setMode('ace/mode/json');
    this.editor.getSession().setUseWorker(false);
    this.editor.setTheme('ace/theme/clouds');
    this.editor.setFontSize(this.props.fontSize);
    this.editor.on('change', this.onChange);
    this.editor.setValue(this.props.value);
    this.editor.renderer.setShowGutter(this.props.showGutter);
    this.editor.setOption('maxLines', this.props.maxLines);
    this.editor.setOption('highlightActiveLine', this.props.highlightActiveLine);
    this.editor.setShowPrintMargin(this.props.setShowPrintMargin);

    if (this.props.onLoad) {
      this.props.onLoad(this.editor);
    }
  },


  shouldComponentUpdate: function(nextProps, nextState) {
    return false;
  },

  render: function() {
    var divStyle = {
      width: this.props.width,
      height: this.props.height
    };
    return (<div id={this.props.name} onChange={this.onChange} style={divStyle}></div>);
  }
});
