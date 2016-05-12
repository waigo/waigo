var React = require('react');


module.exports = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    actions: React.PropTypes.array,
    onAction: React.PropTypes.func,
    onOpen: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
      id: 'modal' + Math.random().toString(36).substr(2, 5),
      actions: [ 'ok' ],
      onAction: this.close,
      onOpen: null,
    };
  },

  render: function() {
    var self = this;

    var actions = this.props.actions.reverse().map(function(a, index) {
      return (
        <a 
          href="#!" 
          onClick={self._onClickAction}
          className="modal-action modal-close waves-effect waves-green btn-flat"
          data-index={index}>{a}</a>
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

    if (this.props.onAction) {
      this.props.onAction(this.props.actions[actionIndex]);
    }
  },


  open: function() {
    $(this.refs.modalElem).openModal({
      open: this.props.onOpen
    });
  },

  close: function() {
    $(this.refs.modalElem).closeModal();
  }

});