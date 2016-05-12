var React = require('react');
const ReactDOM = require('react-dom');

var _ = require('lodash');

var Collapsible = require('../../components/collapsible'),
  Loader = require('../../components/loader'),
  RenderUtils = require('../../utils/renderUtils'),  
  GuardedStateMixin = require('../../mixins/guardedState');


var CronItemHeader = require('./cronItemHeader'),
  CronItemBody = require('./cronItemBody');


exports.init = function(rootElem) {

  var App = React.createClass({
    mixins: [GuardedStateMixin],

    getInitialState: function() {
      return {
        loading: true,
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
            tasks: _.values(data.tasks),
          });
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

    _setItem: function(itemNewData) {
      // loop through our list, and overwrite item
      this.state.tasks.forEach(function(item) {
        if (item.id === itemNewData.id) {
          _.extend(item, itemNewData);
        }
      });

      // force re-render
      this.forceUpdate();
    },

    _buildList: function() {
      var self = this;

      if (this.state.loading) {
        return (
          <Loader />
        );
      } else {
        var tasks = this.state.tasks.map(function(item) {
          return {
            label: (
              <CronItemHeader item={item} />
            ),
            body: (
              <CronItemBody item={item} reloadItem={self._setItem} />
            ),
          };
        });

        return (
          <Collapsible items={tasks} />
        );
      }
    },

  });


  ReactDOM.render(<App />, rootElem);  

};