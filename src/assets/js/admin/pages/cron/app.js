var React = require('react');

var _ = require('../../utils/lodash');


var Collapsible = require('../../components/collapsible'),
  Loader = require('../../components/loader'),
  RenderUtils = require('../../utils/renderUtils'),  
  GuardedStateMixin = require('../../mixins/guardedState');


var App = React.createClass({
  mixins: [GuardedStateMixin],

  getInitialState: function() {
    return {
      listLoading: true,
      taskRunning: false,
      tasks: [],
    };
  },

  render: function() {
    var list = this._buildList();

    var loader = this.state.taskRunning ? <Loader /> : null;

    return (
      <div className="page-cron">
        <h2>Cron tasks</h2>
        {loader}
        {RenderUtils.buildError(this.state.error)}
        {list}
      </div>
    );
  },

  componentDidMount: function() {
    var self = this;

    $.ajax({
      url: '/admin/cron',
      data: {
        format: 'json',
      }
    })
      .done(function(data) {
        self.setStateIfMounted({
          items: _.values(data.tasks),
        });
      })
      .fail(function(xhr) {
        self.setStateIfMounted({
          error: xhr
        });
      })
      .always(function() {
        self.setStateIfMounted({
          listLoading: false
        });
      })
    ;
  },

  _buildList: function() {
    var self = this;

    if (this.state.listLoading) {
      return (
        <Loader />
      );
    } else {
      var items = this.state.items.map(function(item) {
        return {
          label: self._buildItemLabel(item),
          body: self._buildItemBody(item),
        };
      });

      return (
        <Collapsible items={items} />
      );
    }
  },

  _buildItemLabel: function(item) {
    var status = (item.disabled ? 'inactive' : 'active');

    return (
      <span className="item-label">
        <span className={status}>{item.name}</span>
      </span>
    );
  },

  _buildItemBody: function(item) {
    return (
      <div>
        <a href="#" data-name={item.name} onClick={this._run}>
          <i className="fa fa-play" />
        </a>
      </div>
    );
  },

  _run: function(e) {
    var self = this;

    e.preventDefault();

    // do one at a time
    if (this.state.taskRunning) {
      return;
    }

    self.setState({
      taskRunning: true,
      error: null,
    });

    var name = e.currentTarget.dataset.name;

    $.ajax({
      method: 'POST',
      url: '/admin/cron/run?format=json',
      data: {
        name: name,
      }
    })
      .done(function(data) {
        Materialize.toast('Run successful: ' + name, 2000, 'rounded');
      })
      .fail(function(xhr) {
        self.setStateIfMounted({
          error: xhr
        });
      })
      .always(function() {
        self.setStateIfMounted({
          taskRunning: false
        });
      })
    ;
  },

});


React.render(<App />, document.getElementById('react-root'));

