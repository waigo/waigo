var React = require('react');


module.exports = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    actions: React.PropTypes.array,
  },

  getDefaultProps: function() {
    return {
      id: 'modal' + Math.random().toString(36).substr(2, 5),
      actions: [
        {
          label: 'ok',
          onClick: this.close,
        }
      ],
    };
  },

  render: function() {
    var self = this;

    var actions = this.props.actions.map(function(a, index) {
      return (
        <a 
          href="#!" 
          onClick={self._onClickAction}
          className="modal-action modal-close waves-effect waves-green btn-flat"
          data-index={index}>{a.label}</a>
      );
    });

    return (
      <div ref="modalElem" id={this.props.id} className="modal">
        <div className="modal-content">
          {this.props.children}
        </div>
        <div className="modal-footer">
          {actions}
        </div>
      </div>
    );
  },


  _onClickAction: function(e) {
    e.preventDefault();

    var actionIndex = e.currentTarget.dataset.index;

    if (this.props.actions[actionIndex].onClick) {
      this.props.actions[actionIndex].onClick(e);
    }
  },


  open: function() {
    $(React.findDOMNode(this.refs.modalElem)).openModal();
  },

  close: function() {
    $(React.findDOMNode(this.refs.modalElem)).closeModal();
  }

});