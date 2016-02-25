var _ = require('lodash');
var React = require('react');
var Router = require('react-router');
var moment = require('moment');

var Button = require('../../components/button'),
  Switch = require('../../components/switch'),
  Loader = require('../../components/loader'),
  RenderUtils = require('../../utils/renderUtils'),  
  GuardedStateMixin = require('../../mixins/guardedState');



module.exports = React.createClass({
  mixins: [GuardedStateMixin],

  propTypes: {
    item: React.PropTypes.object,
    reloadItem: React.PropTypes.func,
  },

  getInitialState: function() {
    return {
      loading: false,
      error: null,
    };
  },

  render: function() {
    var item = this.props.item;

    if (item.lastRun) {
      var lastRun = (
        <span>
          <span className="date" title={item.lastRun.when}>
            {moment(item.lastRun.when).fromNow()}
          </span>
          <span className="by">
            {_.get(item.lastRun, 'by.length') ? item.lastRun.by : ''}
          </span>
        </span>
      );
    } else {
      var lastRun = 'never';
    }

    if (!item.disabled) {
      var nextRun = (
        <span className="date" title={item.nextRun}>
          {moment(item.nextRun).fromNow()}
        </span>
      );
    } else {
      var nextRun = (<em>Inactive</em>);
    }


    var loading = (this.state.loading ? <Loader /> : null);


    return (
      <div className="item-body">
        <div className="row">
          <div className="col m12 s12">
            <div className="row">
              <div className="item-label col m2 s12">Schedule:</div>
              <div className="schedule col m1 s12">{item.schedule}</div>
              <div className="item-toggle col m9 s12">
                <Switch data={item} onChange={this._updateStatus} initiallyOn={!item.disabled} />
              </div>
            </div>
            <div className="row">
              <div className="item-label col m2 s12">Last run:</div>
              <div className="lastRun col m10 s12">{ lastRun }</div>
            </div>
            <div className="row">
              <div className="item-label col m2 s12">Next run:</div>
              <div className="nextRun col m10 s12">{ nextRun }</div>
            </div>
          </div>
        </div>
        <Button label="Run now" onClick={this._run} />
        {loading}
        {RenderUtils.buildError(this.state.error)}
      </div>
    );

    // <a href="#" data-name={item.id} onClick={this._run}>
    //   <i className="fa fa-play" />
    // </a>
  },


  _updateStatus: function(setActive) {
    var self = this;

    self.setState({
      error: null,
      loading: true,
    });

    $.ajax({
      method: 'POST',
      url: '/admin/cron/updateStatus?format=json',
      data: {
        id: this.props.item.id,
        active: setActive,
      }
    })
      .done(function(data) {
        Materialize.toast('Status updated', 2000, 'rounded');

        self.props.reloadItem(data.task);
      })
      .fail(function(xhr) {
        self.setStateIfMounted({
          error: xhr
        });
      })
      .always(function() {
        self.setStateIfMounted({
          loading: false
        });
      })
    ;
  },


  _run: function(e) {
    var self = this;

    e.preventDefault();

    self.setState({
      loading: true,
      error: null,
    });

    $.ajax({
      method: 'POST',
      url: '/admin/cron/run?format=json',
      data: {
        id: this.props.item.id,
      }
    })
      .done(function(data) {
        Materialize.toast('Run successful', 2000, 'rounded');

        self.props.reloadItem(data.task);
      })
      .fail(function(xhr) {
        self.setStateIfMounted({
          error: xhr
        });
      })
      .always(function() {
        self.setStateIfMounted({
          loading: false
        });
      })
    ;
  },

});

