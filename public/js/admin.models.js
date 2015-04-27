webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var DefaultRoute = Router.DefaultRoute;
	var RouteHandler = Router.RouteHandler;
	var Route = Router.Route;
	
	var Models = __webpack_require__(216);
	var Model = __webpack_require__(217);
	var Row = __webpack_require__(218);
	
	var App = React.createClass({
	  displayName: "App",
	
	  render: function render() {
	    return React.createElement(RouteHandler, this.props);
	  }
	});
	
	var routes = React.createElement(
	  Route,
	  { handler: App },
	  React.createElement(DefaultRoute, { name: "models", handler: Models }),
	  React.createElement(Route, { name: "model", path: "/:key", handler: Model }),
	  React.createElement(Route, { name: "modelRow", path: "/:key/:id", handler: Row })
	);
	
	Router.run(routes, Router.HashLocation, function (Handler, state) {
	  React.render(React.createElement(Handler, { routes: state.routes, params: state.params, query: state.query }), document.getElementById("react-root"));
	});

/***/ },

/***/ 216:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	
	var Router = __webpack_require__(166),
	    Link = Router.Link;
	
	var FilterList = __webpack_require__(207),
	    RenderUtils = __webpack_require__(209);
	
	module.exports = React.createClass({
	  displayName: "exports",
	
	  render: function render() {
	    return React.createElement(
	      "div",
	      { className: "page-models" },
	      React.createElement(FilterList, {
	        ajaxUrl: "/admin/models?format=json",
	        ajaxResponseDataMapper: this._mapAjaxData,
	        itemDisplayNameFormatter: this._getItemDisplayName,
	        itemRoute: "model" })
	    );
	  },
	
	  _mapAjaxData: function _mapAjaxData(data) {
	    data = data || {};
	
	    return (data.models || []).map(function (r) {
	      return {
	        key: r,
	        name: r };
	    });
	  },
	
	  _getItemDisplayName: function _getItemDisplayName(item) {
	    return React.createElement(
	      "span",
	      null,
	      item.name
	    );
	  } });

/***/ },

/***/ 217:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var Link = Router.Link;
	
	var Timer = __webpack_require__(1).Timer;
	
	var _ = __webpack_require__(215),
	    Loader = __webpack_require__(208),
	    RenderUtils = __webpack_require__(209),
	    JsonEditor = __webpack_require__(211),
	    Pagination = __webpack_require__(213),
	    Button = __webpack_require__(205),
	    SubmitButton = __webpack_require__(214),
	    GuardedStateMixin = __webpack_require__(210);
	
	module.exports = React.createClass({
	  displayName: "exports",
	
	  contextTypes: {
	    router: React.PropTypes.func
	  },
	
	  mixins: [GuardedStateMixin],
	
	  getInitialState: function getInitialState() {
	    return {
	      modelName: decodeURIComponent(this.context.router.getCurrentParams().key),
	      loading: true,
	      error: null,
	      perPage: 10,
	      filter: {},
	      sort: {},
	      page: 1 };
	  },
	
	  _onRowClick: function _onRowClick(e) {
	    e.preventDefault();
	
	    this.context.router.transitionTo("modelRow", {
	      key: this.context.router.getCurrentParams().key,
	      id: e.currentTarget.id
	    });
	  },
	
	  _onLimitChange: function _onLimitChange(e) {
	    try {
	      this.setState({
	        perPage: parseInt(e.currentTarget.value)
	      });
	    } catch (err) {
	      this.setState({
	        perPage: null
	      });
	    }
	  },
	
	  _onFilterChange: function _onFilterChange(val) {
	    try {
	      this.setState({
	        filter: JSON.parse(val) });
	    } catch (err) {
	      this.setState({
	        filter: null });
	    }
	  },
	
	  _onSortChange: function _onSortChange(val) {
	    try {
	      this.setState({
	        sort: JSON.parse(val) });
	    } catch (err) {
	      this.setState({
	        sort: null });
	    }
	  },
	
	  _isQueryValid: function _isQueryValid() {
	    return null !== this.state.filter && null !== this.state.sort && null !== this.state.perPage;
	  },
	
	  _buildTableFilter: function _buildTableFilter() {
	    var isQueryValid = this._isQueryValid();
	
	    var canRefreshResults = this.state.filter && this.state.perPage && this.state.sort;
	
	    return React.createElement(
	      "div",
	      { className: "row" },
	      React.createElement(
	        "div",
	        { className: "col s12 m7" },
	        React.createElement(
	          "ul",
	          { className: "model-filters collapsible", ref: "querySettings" },
	          React.createElement(
	            "li",
	            null,
	            React.createElement(
	              "div",
	              { className: "collapsible-header active" },
	              React.createElement("i", { className: "fa fa-gear" }),
	              React.createElement(
	                "span",
	                null,
	                "Query settings"
	              )
	            ),
	            React.createElement(
	              "div",
	              { className: "collapsible-body" },
	              React.createElement(
	                "form",
	                { onSubmit: this._submitSettingsForm },
	                React.createElement(
	                  "div",
	                  { className: "filter" },
	                  React.createElement(
	                    "label",
	                    null,
	                    "Filter:"
	                  ),
	                  React.createElement(JsonEditor, {
	                    value: "{}",
	                    onChange: this._onFilterChange,
	                    height: "100px",
	                    width: "200px" })
	                ),
	                React.createElement(
	                  "div",
	                  { className: "filter" },
	                  React.createElement(
	                    "label",
	                    null,
	                    "Sort:"
	                  ),
	                  React.createElement(JsonEditor, {
	                    value: "{}",
	                    onChange: this._onSortChange,
	                    height: "100px",
	                    width: "200px" })
	                ),
	                React.createElement(
	                  "div",
	                  { className: "filter" },
	                  React.createElement(
	                    "label",
	                    null,
	                    "Per page:"
	                  ),
	                  React.createElement("input", { type: "text", value: "10", onChange: this._onLimitChange })
	                ),
	                React.createElement(
	                  "div",
	                  { className: "action" },
	                  React.createElement(SubmitButton, { label: "Apply", disabled: !canRefreshResults })
	                )
	              )
	            )
	          )
	        )
	      )
	    );
	  },
	
	  _buildTable: function _buildTable() {
	    var self = this;
	
	    var columns = this.state.columns,
	        rows = this.state.rows || [];
	
	    var header = columns.map(function (c) {
	      return React.createElement(
	        "th",
	        null,
	        c.name
	      );
	    });
	
	    var body = null;
	    if (this.state.loading) {
	      body = React.createElement(
	        "tr",
	        null,
	        React.createElement(
	          "td",
	          null,
	          React.createElement(Loader, null)
	        )
	      );
	    } else {
	      body = rows.map(function (row) {
	        var values = columns.map(function (col) {
	
	          var value = row[col.name],
	              flipValue = null;
	
	          // if value is a date
	          if ("Date" === col.type) {
	            flipValue = value;
	            value = new Date(value).toString();
	          }
	          // else if value is an array
	          else if (Array.isArray(value)) {
	            // extract sub key
	            if (col.subKey) {
	              value = _.pluck(value, col.subKey);
	            }
	
	            // construct list
	            value = value.map(function (v) {
	              return React.createElement(
	                "li",
	                { key: v },
	                v
	              );
	            });
	
	            value = React.createElement(
	              "ul",
	              null,
	              value
	            );
	          }
	          // stringify objects
	          else if ("object" === typeof value) {
	            value = JSON.stringify(value);
	          }
	
	          return React.createElement(
	            "td",
	            { key: col.name, dataFlipValue: flipValue },
	            value
	          );
	        });
	
	        return React.createElement(
	          "tr",
	          { id: row._id, key: row._id, onClick: self._onRowClick },
	          values
	        );
	      });
	    }
	
	    var tableFilter = this._buildTableFilter();
	
	    return React.createElement(
	      "div",
	      null,
	      tableFilter,
	      RenderUtils.buildError(this.state.error),
	      React.createElement(Pagination, {
	        currentPage: this.state.page,
	        resultsPerPage: this.state.perPage,
	        totalResults: this.state.totalRows,
	        onSelectPage: this._onSelectPage }),
	      React.createElement(
	        "table",
	        { className: "hoverable bordered" },
	        React.createElement(
	          "thead",
	          null,
	          React.createElement(
	            "tr",
	            null,
	            header
	          )
	        ),
	        React.createElement(
	          "tbody",
	          null,
	          body
	        )
	      ),
	      React.createElement(Button, { icon: "plus-circle", label: "Add", className: "add-button" })
	    );
	  },
	
	  render: function render() {
	    var result = null;
	
	    if (!this.state.columns) {
	      result = React.createElement(
	        "div",
	        null,
	        React.createElement(Loader, { text: "Loading structure" }),
	        RenderUtils.buildError(this.state.error)
	      );
	    } else {
	      result = this._buildTable();
	    }
	
	    return React.createElement(
	      "div",
	      { className: "page-model" },
	      React.createElement(
	        "h2",
	        null,
	        "Collection: ",
	        this.state.modelName
	      ),
	      result
	    );
	  },
	
	  componentDidUpdate: function componentDidUpdate() {
	    if (!this.state.querySettingsInitialised) {
	      $(React.findDOMNode(this.refs.querySettings)).collapsible();
	
	      this.setState({
	        querySettingsInitialised: true
	      });
	    }
	  },
	
	  componentDidMount: function componentDidMount() {
	    var self = this;
	
	    // fetch column info
	    $.ajax({
	      url: "/admin/models/model/columns",
	      data: {
	        format: "json",
	        name: this.state.modelName }
	    }).done(function (data) {
	      self.setStateIfMounted({
	        columns: data.columns
	      });
	
	      self._fetchRows();
	    }).fail(function (xhr) {
	      self.setStateIfMounted({
	        error: xhr
	      });
	    });
	    ;
	  },
	
	  _submitSettingsForm: function _submitSettingsForm(e) {
	    e.preventDefault();
	
	    // reset page
	    this.setState({
	      page: 1
	    });
	
	    this._fetchRows();
	  },
	
	  _onSelectPage: function _onSelectPage(newPage) {
	    this.setState({
	      page: newPage
	    });
	
	    this._fetchRows();
	  },
	
	  _fetchRows: function _fetchRows() {
	    var self = this;
	
	    // give time for values to propagate
	    if (self._fetchRowsTimer) {
	      self._fetchRowsTimer.stop();
	    }
	
	    self._fetchRowsTimer = Timer(function () {
	
	      self.setState({
	        loading: true,
	        error: null });
	
	      var columnNames = _.pluck(self.state.columns, "name");
	
	      // fetch collection rows
	      $.ajax({
	        url: "/admin/models/model/rows?format=json",
	        method: "POST",
	        data: {
	          name: self.state.modelName,
	          filter: JSON.stringify(self.state.filter),
	          sort: JSON.stringify(self.state.sort),
	          perPage: self.state.perPage,
	          page: self.state.page }
	      }).done(function (data) {
	        self.setStateIfMounted({
	          totalRows: data.count,
	          rows: data.rows });
	      }).fail(function (xhr) {
	        self.setStateIfMounted({
	          error: xhr
	        });
	      }).always(function () {
	        self.setStateIfMounted({
	          loading: false
	        });
	      });
	    }, 200).start();
	  } });

/***/ },

/***/ 218:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _core = __webpack_require__(2)["default"];
	
	var React = __webpack_require__(11);
	var Router = __webpack_require__(166);
	var Link = Router.Link;
	
	var Loader = __webpack_require__(208),
	    Button = __webpack_require__(205),
	    JsonEditor = __webpack_require__(211),
	    Modal = __webpack_require__(212),
	    RenderUtils = __webpack_require__(209),
	    GuardedStateMixin = __webpack_require__(210);
	
	module.exports = React.createClass({
	  displayName: "exports",
	
	  contextTypes: {
	    router: React.PropTypes.func
	  },
	
	  mixins: [GuardedStateMixin],
	
	  getInitialState: function getInitialState() {
	    var params = this.context.router.getCurrentParams();
	
	    return {
	      modelName: decodeURIComponent(params.key),
	      id: decodeURIComponent(params.id),
	      error: null };
	  },
	
	  render: function render() {
	    var editingForm = this._buildEditingForm();
	
	    return React.createElement(
	      "div",
	      { className: "page-modelRow" },
	      React.createElement(
	        "h2",
	        { className: "title" },
	        this.state.modelName,
	        "/",
	        this.state.id
	      ),
	      RenderUtils.buildError(this.state.error),
	      editingForm
	    );
	  },
	
	  _onSubmit: function _onSubmit(e) {
	    e.preventDefault();
	
	    var self = this;
	
	    this.setState({
	      submitting: true
	    });
	
	    $.ajax({
	      method: "PUT",
	      url: "/admin/models/model/doc?format=json&name=" + this.state.modelName + "&id=" + this.state.id,
	      data: {
	        doc: this.state.json
	      }
	    }).then(function () {
	      Materialize.toast("Update successful", 2000, "rounded");
	    }).fail(function (xhr) {
	      self.setStateIfMounted({
	        error: xhr
	      });
	    }).always(function () {
	      self.setStateIfMounted({
	        submitting: false
	      });
	    });
	  },
	
	  _onDelete: function _onDelete(e) {
	    this.refs.deleteModal.open();
	  },
	
	  _onDataChange: function _onDataChange(data) {
	    try {
	      var json = JSON.parse(data);
	
	      // must not be empty object
	      if (!json || !_core.Object.keys(json).length) {
	        throw new Error();
	      }
	
	      this.setState({
	        json: json
	      });
	    } catch (err) {
	      this.setState({
	        json: null
	      });
	    }
	  },
	
	  _buildEditingForm: function _buildEditingForm() {
	    var json = this.state.json;
	
	    if (undefined === json) {
	      return React.createElement(Loader, { text: "Loading data" });
	    }
	
	    return React.createElement(
	      "div",
	      null,
	      React.createElement(JsonEditor, {
	        onChange: this._onDataChange,
	        value: JSON.stringify(json, null, 2),
	        height: "400px" }),
	      React.createElement(
	        "div",
	        { className: "actions" },
	        React.createElement(Button, { label: "Update", disabled: !json, onClick: this._onSubmit }),
	        React.createElement(Button, { label: "Delete", disabled: !json, color: "red", onClick: this._onDelete }),
	        React.createElement(
	          Modal,
	          { ref: "deleteModal", id: "deleteDocModal" },
	          React.createElement(
	            "span",
	            null,
	            "test"
	          )
	        )
	      )
	    );
	  },
	
	  componentDidMount: function componentDidMount() {
	    var self = this;
	
	    $.ajax({
	      url: "/admin/models/model/doc",
	      data: {
	        format: "json",
	        name: this.state.modelName,
	        id: this.state.id }
	    }).done(function (data) {
	      var doc = data.doc;
	
	      // remove id attribute
	      delete doc._id;
	
	      self.setStateIfMounted({
	        json: doc
	      });
	    }).fail(function (xhr) {
	      self.setStateIfMounted({
	        error: xhr
	      });
	    });
	    ;
	  } });

/***/ }

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9tb2RlbHMvYXBwLmpzIiwid2VicGFjazovLy8uL3BhZ2VzL21vZGVscy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9wYWdlcy9tb2RlbHMvbW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcGFnZXMvbW9kZWxzL3Jvdy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGFBQVksQ0FBQzs7QUFFYixLQUFJLEtBQUssR0FBRyxtQkFBTyxDQUFDLEVBQU8sQ0FBQyxDQUFDO0FBQzdCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsR0FBYyxDQUFDLENBQUM7QUFDckMsS0FBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN2QyxLQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3ZDLEtBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7O0FBRXpCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsR0FBUyxDQUFDLENBQUM7QUFDaEMsS0FBSSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxHQUFTLENBQUMsQ0FBQztBQUMvQixLQUFJLEdBQUcsR0FBRyxtQkFBTyxDQUFDLEdBQU8sQ0FBQyxDQUFDOztBQUUzQixLQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQzVCLEdBQUUsV0FBVyxFQUFFLEtBQUs7O0dBRWxCLE1BQU0sRUFBRSxTQUFTLE1BQU0sR0FBRztLQUN4QixPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0RDtBQUNILEVBQUMsQ0FBQyxDQUFDOztBQUVILEtBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxhQUFhO0dBQzlCLEtBQUs7R0FDTCxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUU7R0FDaEIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFF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QyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDNUIsT0FBTSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3pCOztBQUVBLE9BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDOztPQUVmLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztTQUNyQixJQUFJLEVBQUUsR0FBRztRQUNWLENBQUMsQ0FBQztNQUNKLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUU7T0FDckIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1NBQ3JCLEtBQUssRUFBRSxHQUFHO1FBQ1gsQ0FBQyxDQUFDO01BQ0osQ0FBQyxDQUFDO0tBQ0gsQ0FBQztJQUNGLEVBQUUsQ0FBQyxDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyXCIpO1xudmFyIERlZmF1bHRSb3V0ZSA9IFJvdXRlci5EZWZhdWx0Um91dGU7XG52YXIgUm91dGVIYW5kbGVyID0gUm91dGVyLlJvdXRlSGFuZGxlcjtcbnZhciBSb3V0ZSA9IFJvdXRlci5Sb3V0ZTtcblxudmFyIE1vZGVscyA9IHJlcXVpcmUoXCIuL2luZGV4XCIpO1xudmFyIE1vZGVsID0gcmVxdWlyZShcIi4vbW9kZWxcIik7XG52YXIgUm93ID0gcmVxdWlyZShcIi4vcm93XCIpO1xuXG52YXIgQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogXCJBcHBcIixcblxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChSb3V0ZUhhbmRsZXIsIHRoaXMucHJvcHMpO1xuICB9XG59KTtcblxudmFyIHJvdXRlcyA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gIFJvdXRlLFxuICB7IGhhbmRsZXI6IEFwcCB9LFxuICBSZWFjdC5jcmVhdGVFbGVtZW50KERlZmF1bHRSb3V0ZSwgeyBuYW1lOiBcIm1vZGVsc1wiLCBoYW5kbGVyOiBNb2RlbHMgfSksXG4gIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUm91dGUsIHsgbmFtZTogXCJtb2RlbFwiLCBwYXRoOiBcIi86a2V5XCIsIGhhbmRsZXI6IE1vZGVsIH0pLFxuICBSZWFjdC5jcmVhdGVFbGVtZW50KFJvdXRlLCB7IG5hbWU6IFwibW9kZWxSb3dcIiwgcGF0aDogXCIvOmtleS86aWRcIiwgaGFuZGxlcjogUm93IH0pXG4pO1xuXG5Sb3V0ZXIucnVuKHJvdXRlcywgUm91dGVyLkhhc2hMb2NhdGlvbiwgZnVuY3Rpb24gKEhhbmRsZXIsIHN0YXRlKSB7XG4gIFJlYWN0LnJlbmRlcihSZWFjdC5jcmVhdGVFbGVtZW50KEhhbmRsZXIsIHsgcm91dGVzOiBzdGF0ZS5yb3V0ZXMsIHBhcmFtczogc3RhdGUucGFyYW1zLCBxdWVyeTogc3RhdGUucXVlcnkgfSksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVhY3Qtcm9vdFwiKSk7XG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAvVXNlcnMvcmFtL2Rldi9qcy93YWlnby1mcmFtZXdvcmsvd2FpZ28vfi9iYWJlbC1sb2FkZXI/ZXhwZXJpbWVudGFsJm9wdGlvbmFsPXJ1bnRpbWUhLi9wYWdlcy9tb2RlbHMvYXBwLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIFJvdXRlciA9IHJlcXVpcmUoXCJyZWFjdC1yb3V0ZXJcIiksXG4gICAgTGluayA9IFJvdXRlci5MaW5rO1xuXG52YXIgRmlsdGVyTGlzdCA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2ZpbHRlckxpc3RcIiksXG4gICAgUmVuZGVyVXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvcmVuZGVyVXRpbHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogXCJleHBvcnRzXCIsXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBcImRpdlwiLFxuICAgICAgeyBjbGFzc05hbWU6IFwicGFnZS1tb2RlbHNcIiB9LFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChGaWx0ZXJMaXN0LCB7XG4gICAgICAgIGFqYXhVcmw6IFwiL2FkbWluL21vZGVscz9mb3JtYXQ9anNvblwiLFxuICAgICAgICBhamF4UmVzcG9uc2VEYXRhTWFwcGVyOiB0aGlzLl9tYXBBamF4RGF0YSxcbiAgICAgICAgaXRlbURpc3BsYXlOYW1lRm9ybWF0dGVyOiB0aGlzLl9nZXRJdGVtRGlzcGxheU5hbWUsXG4gICAgICAgIGl0ZW1Sb3V0ZTogXCJtb2RlbFwiIH0pXG4gICAgKTtcbiAgfSxcblxuICBfbWFwQWpheERhdGE6IGZ1bmN0aW9uIF9tYXBBamF4RGF0YShkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEgfHwge307XG5cbiAgICByZXR1cm4gKGRhdGEubW9kZWxzIHx8IFtdKS5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGtleTogcixcbiAgICAgICAgbmFtZTogciB9O1xuICAgIH0pO1xuICB9LFxuXG4gIF9nZXRJdGVtRGlzcGxheU5hbWU6IGZ1bmN0aW9uIF9nZXRJdGVtRGlzcGxheU5hbWUoaXRlbSkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgXCJzcGFuXCIsXG4gICAgICBudWxsLFxuICAgICAgaXRlbS5uYW1lXG4gICAgKTtcbiAgfSB9KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAvVXNlcnMvcmFtL2Rldi9qcy93YWlnby1mcmFtZXdvcmsvd2FpZ28vfi9iYWJlbC1sb2FkZXI/ZXhwZXJpbWVudGFsJm9wdGlvbmFsPXJ1bnRpbWUhLi9wYWdlcy9tb2RlbHMvaW5kZXguanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFJlYWN0ID0gcmVxdWlyZShcInJlYWN0XCIpO1xudmFyIFJvdXRlciA9IHJlcXVpcmUoXCJyZWFjdC1yb3V0ZXJcIik7XG52YXIgTGluayA9IFJvdXRlci5MaW5rO1xuXG52YXIgVGltZXIgPSByZXF1aXJlKFwiY2xvY2ttYWtlclwiKS5UaW1lcjtcblxudmFyIF8gPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvbG9kYXNoXCIpLFxuICAgIExvYWRlciA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2xvYWRlclwiKSxcbiAgICBSZW5kZXJVdGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlscy9yZW5kZXJVdGlsc1wiKSxcbiAgICBKc29uRWRpdG9yID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvanNvbkVkaXRvclwiKSxcbiAgICBQYWdpbmF0aW9uID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvcGFnaW5hdGlvblwiKSxcbiAgICBCdXR0b24gPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9idXR0b25cIiksXG4gICAgU3VibWl0QnV0dG9uID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvc3VibWl0QnV0dG9uXCIpLFxuICAgIEd1YXJkZWRTdGF0ZU1peGluID0gcmVxdWlyZShcIi4uLy4uL21peGlucy9ndWFyZGVkU3RhdGVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogXCJleHBvcnRzXCIsXG5cbiAgY29udGV4dFR5cGVzOiB7XG4gICAgcm91dGVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICB9LFxuXG4gIG1peGluczogW0d1YXJkZWRTdGF0ZU1peGluXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbW9kZWxOYW1lOiBkZWNvZGVVUklDb21wb25lbnQodGhpcy5jb250ZXh0LnJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCkua2V5KSxcbiAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICBlcnJvcjogbnVsbCxcbiAgICAgIHBlclBhZ2U6IDEwLFxuICAgICAgZmlsdGVyOiB7fSxcbiAgICAgIHNvcnQ6IHt9LFxuICAgICAgcGFnZTogMSB9O1xuICB9LFxuXG4gIF9vblJvd0NsaWNrOiBmdW5jdGlvbiBfb25Sb3dDbGljayhlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdGhpcy5jb250ZXh0LnJvdXRlci50cmFuc2l0aW9uVG8oXCJtb2RlbFJvd1wiLCB7XG4gICAgICBrZXk6IHRoaXMuY29udGV4dC5yb3V0ZXIuZ2V0Q3VycmVudFBhcmFtcygpLmtleSxcbiAgICAgIGlkOiBlLmN1cnJlbnRUYXJnZXQuaWRcbiAgICB9KTtcbiAgfSxcblxuICBfb25MaW1pdENoYW5nZTogZnVuY3Rpb24gX29uTGltaXRDaGFuZ2UoZSkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcGVyUGFnZTogcGFyc2VJbnQoZS5jdXJyZW50VGFyZ2V0LnZhbHVlKVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcGVyUGFnZTogbnVsbFxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIF9vbkZpbHRlckNoYW5nZTogZnVuY3Rpb24gX29uRmlsdGVyQ2hhbmdlKHZhbCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmlsdGVyOiBKU09OLnBhcnNlKHZhbCkgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmlsdGVyOiBudWxsIH0pO1xuICAgIH1cbiAgfSxcblxuICBfb25Tb3J0Q2hhbmdlOiBmdW5jdGlvbiBfb25Tb3J0Q2hhbmdlKHZhbCkge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc29ydDogSlNPTi5wYXJzZSh2YWwpIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNvcnQ6IG51bGwgfSk7XG4gICAgfVxuICB9LFxuXG4gIF9pc1F1ZXJ5VmFsaWQ6IGZ1bmN0aW9uIF9pc1F1ZXJ5VmFsaWQoKSB7XG4gICAgcmV0dXJuIG51bGwgIT09IHRoaXMuc3RhdGUuZmlsdGVyICYmIG51bGwgIT09IHRoaXMuc3RhdGUuc29ydCAmJiBudWxsICE9PSB0aGlzLnN0YXRlLnBlclBhZ2U7XG4gIH0sXG5cbiAgX2J1aWxkVGFibGVGaWx0ZXI6IGZ1bmN0aW9uIF9idWlsZFRhYmxlRmlsdGVyKCkge1xuICAgIHZhciBpc1F1ZXJ5VmFsaWQgPSB0aGlzLl9pc1F1ZXJ5VmFsaWQoKTtcblxuICAgIHZhciBjYW5SZWZyZXNoUmVzdWx0cyA9IHRoaXMuc3RhdGUuZmlsdGVyICYmIHRoaXMuc3RhdGUucGVyUGFnZSAmJiB0aGlzLnN0YXRlLnNvcnQ7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJyb3dcIiB9LFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sIHMxMiBtN1wiIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJ1bFwiLFxuICAgICAgICAgIHsgY2xhc3NOYW1lOiBcIm1vZGVsLWZpbHRlcnMgY29sbGFwc2libGVcIiwgcmVmOiBcInF1ZXJ5U2V0dGluZ3NcIiB9LFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sbGFwc2libGUtaGVhZGVyIGFjdGl2ZVwiIH0sXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHsgY2xhc3NOYW1lOiBcImZhIGZhLWdlYXJcIiB9KSxcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFwiUXVlcnkgc2V0dGluZ3NcIlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sbGFwc2libGUtYm9keVwiIH0sXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgXCJmb3JtXCIsXG4gICAgICAgICAgICAgICAgeyBvblN1Ym1pdDogdGhpcy5fc3VibWl0U2V0dGluZ3NGb3JtIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJmaWx0ZXJcIiB9LFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcIkZpbHRlcjpcIlxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSnNvbkVkaXRvciwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJ7fVwiLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5fb25GaWx0ZXJDaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogXCIxMDBweFwiLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogXCIyMDBweFwiIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImZpbHRlclwiIH0sXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFwiU29ydDpcIlxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSnNvbkVkaXRvciwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJ7fVwiLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5fb25Tb3J0Q2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTAwcHhcIixcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiMjAwcHhcIiB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJmaWx0ZXJcIiB9LFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcIlBlciBwYWdlOlwiXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBcIjEwXCIsIG9uQ2hhbmdlOiB0aGlzLl9vbkxpbWl0Q2hhbmdlIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImFjdGlvblwiIH0sXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFN1Ym1pdEJ1dHRvbiwgeyBsYWJlbDogXCJBcHBseVwiLCBkaXNhYmxlZDogIWNhblJlZnJlc2hSZXN1bHRzIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBfYnVpbGRUYWJsZTogZnVuY3Rpb24gX2J1aWxkVGFibGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGNvbHVtbnMgPSB0aGlzLnN0YXRlLmNvbHVtbnMsXG4gICAgICAgIHJvd3MgPSB0aGlzLnN0YXRlLnJvd3MgfHwgW107XG5cbiAgICB2YXIgaGVhZGVyID0gY29sdW1ucy5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcInRoXCIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIGMubmFtZVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHZhciBib2R5ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICBib2R5ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJ0clwiLFxuICAgICAgICBudWxsLFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGRcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTG9hZGVyLCBudWxsKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBib2R5ID0gcm93cy5tYXAoZnVuY3Rpb24gKHJvdykge1xuICAgICAgICB2YXIgdmFsdWVzID0gY29sdW1ucy5tYXAoZnVuY3Rpb24gKGNvbCkge1xuXG4gICAgICAgICAgdmFyIHZhbHVlID0gcm93W2NvbC5uYW1lXSxcbiAgICAgICAgICAgICAgZmxpcFZhbHVlID0gbnVsbDtcblxuICAgICAgICAgIC8vIGlmIHZhbHVlIGlzIGEgZGF0ZVxuICAgICAgICAgIGlmIChcIkRhdGVcIiA9PT0gY29sLnR5cGUpIHtcbiAgICAgICAgICAgIGZsaXBWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdmFsdWUgPSBuZXcgRGF0ZSh2YWx1ZSkudG9TdHJpbmcoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZWxzZSBpZiB2YWx1ZSBpcyBhbiBhcnJheVxuICAgICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAvLyBleHRyYWN0IHN1YiBrZXlcbiAgICAgICAgICAgIGlmIChjb2wuc3ViS2V5KSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gXy5wbHVjayh2YWx1ZSwgY29sLnN1YktleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnN0cnVjdCBsaXN0XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImxpXCIsXG4gICAgICAgICAgICAgICAgeyBrZXk6IHYgfSxcbiAgICAgICAgICAgICAgICB2XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFsdWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICBcInVsXCIsXG4gICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzdHJpbmdpZnkgb2JqZWN0c1xuICAgICAgICAgIGVsc2UgaWYgKFwib2JqZWN0XCIgPT09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInRkXCIsXG4gICAgICAgICAgICB7IGtleTogY29sLm5hbWUsIGRhdGFGbGlwVmFsdWU6IGZsaXBWYWx1ZSB9LFxuICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgeyBpZDogcm93Ll9pZCwga2V5OiByb3cuX2lkLCBvbkNsaWNrOiBzZWxmLl9vblJvd0NsaWNrIH0sXG4gICAgICAgICAgdmFsdWVzXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgdGFibGVGaWx0ZXIgPSB0aGlzLl9idWlsZFRhYmxlRmlsdGVyKCk7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICBudWxsLFxuICAgICAgdGFibGVGaWx0ZXIsXG4gICAgICBSZW5kZXJVdGlscy5idWlsZEVycm9yKHRoaXMuc3RhdGUuZXJyb3IpLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChQYWdpbmF0aW9uLCB7XG4gICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLnN0YXRlLnBhZ2UsXG4gICAgICAgIHJlc3VsdHNQZXJQYWdlOiB0aGlzLnN0YXRlLnBlclBhZ2UsXG4gICAgICAgIHRvdGFsUmVzdWx0czogdGhpcy5zdGF0ZS50b3RhbFJvd3MsXG4gICAgICAgIG9uU2VsZWN0UGFnZTogdGhpcy5fb25TZWxlY3RQYWdlIH0pLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJ0YWJsZVwiLFxuICAgICAgICB7IGNsYXNzTmFtZTogXCJob3ZlcmFibGUgYm9yZGVyZWRcIiB9LFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGhlYWRcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBcInRyXCIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgaGVhZGVyXG4gICAgICAgICAgKVxuICAgICAgICApLFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidGJvZHlcIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIGJvZHlcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQnV0dG9uLCB7IGljb246IFwicGx1cy1jaXJjbGVcIiwgbGFiZWw6IFwiQWRkXCIsIGNsYXNzTmFtZTogXCJhZGQtYnV0dG9uXCIgfSlcbiAgICApO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciByZXN1bHQgPSBudWxsO1xuXG4gICAgaWYgKCF0aGlzLnN0YXRlLmNvbHVtbnMpIHtcbiAgICAgIHJlc3VsdCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTG9hZGVyLCB7IHRleHQ6IFwiTG9hZGluZyBzdHJ1Y3R1cmVcIiB9KSxcbiAgICAgICAgUmVuZGVyVXRpbHMuYnVpbGRFcnJvcih0aGlzLnN0YXRlLmVycm9yKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fYnVpbGRUYWJsZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgXCJkaXZcIixcbiAgICAgIHsgY2xhc3NOYW1lOiBcInBhZ2UtbW9kZWxcIiB9LFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJoMlwiLFxuICAgICAgICBudWxsLFxuICAgICAgICBcIkNvbGxlY3Rpb246IFwiLFxuICAgICAgICB0aGlzLnN0YXRlLm1vZGVsTmFtZVxuICAgICAgKSxcbiAgICAgIHJlc3VsdFxuICAgICk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLnF1ZXJ5U2V0dGluZ3NJbml0aWFsaXNlZCkge1xuICAgICAgJChSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMucXVlcnlTZXR0aW5ncykpLmNvbGxhcHNpYmxlKCk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBxdWVyeVNldHRpbmdzSW5pdGlhbGlzZWQ6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gZmV0Y2ggY29sdW1uIGluZm9cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBcIi9hZG1pbi9tb2RlbHMvbW9kZWwvY29sdW1uc1wiLFxuICAgICAgZGF0YToge1xuICAgICAgICBmb3JtYXQ6IFwianNvblwiLFxuICAgICAgICBuYW1lOiB0aGlzLnN0YXRlLm1vZGVsTmFtZSB9XG4gICAgfSkuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGNvbHVtbnM6IGRhdGEuY29sdW1uc1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX2ZldGNoUm93cygpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGVycm9yOiB4aHJcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIDtcbiAgfSxcblxuICBfc3VibWl0U2V0dGluZ3NGb3JtOiBmdW5jdGlvbiBfc3VibWl0U2V0dGluZ3NGb3JtKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyByZXNldCBwYWdlXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwYWdlOiAxXG4gICAgfSk7XG5cbiAgICB0aGlzLl9mZXRjaFJvd3MoKTtcbiAgfSxcblxuICBfb25TZWxlY3RQYWdlOiBmdW5jdGlvbiBfb25TZWxlY3RQYWdlKG5ld1BhZ2UpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHBhZ2U6IG5ld1BhZ2VcbiAgICB9KTtcblxuICAgIHRoaXMuX2ZldGNoUm93cygpO1xuICB9LFxuXG4gIF9mZXRjaFJvd3M6IGZ1bmN0aW9uIF9mZXRjaFJvd3MoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gZ2l2ZSB0aW1lIGZvciB2YWx1ZXMgdG8gcHJvcGFnYXRlXG4gICAgaWYgKHNlbGYuX2ZldGNoUm93c1RpbWVyKSB7XG4gICAgICBzZWxmLl9mZXRjaFJvd3NUaW1lci5zdG9wKCk7XG4gICAgfVxuXG4gICAgc2VsZi5fZmV0Y2hSb3dzVGltZXIgPSBUaW1lcihmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICBlcnJvcjogbnVsbCB9KTtcblxuICAgICAgdmFyIGNvbHVtbk5hbWVzID0gXy5wbHVjayhzZWxmLnN0YXRlLmNvbHVtbnMsIFwibmFtZVwiKTtcblxuICAgICAgLy8gZmV0Y2ggY29sbGVjdGlvbiByb3dzXG4gICAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IFwiL2FkbWluL21vZGVscy9tb2RlbC9yb3dzP2Zvcm1hdD1qc29uXCIsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBuYW1lOiBzZWxmLnN0YXRlLm1vZGVsTmFtZSxcbiAgICAgICAgICBmaWx0ZXI6IEpTT04uc3RyaW5naWZ5KHNlbGYuc3RhdGUuZmlsdGVyKSxcbiAgICAgICAgICBzb3J0OiBKU09OLnN0cmluZ2lmeShzZWxmLnN0YXRlLnNvcnQpLFxuICAgICAgICAgIHBlclBhZ2U6IHNlbGYuc3RhdGUucGVyUGFnZSxcbiAgICAgICAgICBwYWdlOiBzZWxmLnN0YXRlLnBhZ2UgfVxuICAgICAgfSkuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgICB0b3RhbFJvd3M6IGRhdGEuY291bnQsXG4gICAgICAgICAgcm93czogZGF0YS5yb3dzIH0pO1xuICAgICAgfSkuZmFpbChmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICAgIGVycm9yOiB4aHJcbiAgICAgICAgfSk7XG4gICAgICB9KS5hbHdheXMoZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgICBsb2FkaW5nOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDIwMCkuc3RhcnQoKTtcbiAgfSB9KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAvVXNlcnMvcmFtL2Rldi9qcy93YWlnby1mcmFtZXdvcmsvd2FpZ28vfi9iYWJlbC1sb2FkZXI/ZXhwZXJpbWVudGFsJm9wdGlvbmFsPXJ1bnRpbWUhLi9wYWdlcy9tb2RlbHMvbW9kZWwuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jb3JlID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qc1wiKVtcImRlZmF1bHRcIl07XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyXCIpO1xudmFyIExpbmsgPSBSb3V0ZXIuTGluaztcblxudmFyIExvYWRlciA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2xvYWRlclwiKSxcbiAgICBCdXR0b24gPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9idXR0b25cIiksXG4gICAgSnNvbkVkaXRvciA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2pzb25FZGl0b3JcIiksXG4gICAgTW9kYWwgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9tb2RhbFwiKSxcbiAgICBSZW5kZXJVdGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlscy9yZW5kZXJVdGlsc1wiKSxcbiAgICBHdWFyZGVkU3RhdGVNaXhpbiA9IHJlcXVpcmUoXCIuLi8uLi9taXhpbnMvZ3VhcmRlZFN0YXRlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiZXhwb3J0c1wiLFxuXG4gIGNvbnRleHRUeXBlczoge1xuICAgIHJvdXRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICBtaXhpbnM6IFtHdWFyZGVkU3RhdGVNaXhpbl0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgdmFyIHBhcmFtcyA9IHRoaXMuY29udGV4dC5yb3V0ZXIuZ2V0Q3VycmVudFBhcmFtcygpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVsTmFtZTogZGVjb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5rZXkpLFxuICAgICAgaWQ6IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbXMuaWQpLFxuICAgICAgZXJyb3I6IG51bGwgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgZWRpdGluZ0Zvcm0gPSB0aGlzLl9idWlsZEVkaXRpbmdGb3JtKCk7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJwYWdlLW1vZGVsUm93XCIgfSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwiaDJcIixcbiAgICAgICAgeyBjbGFzc05hbWU6IFwidGl0bGVcIiB9LFxuICAgICAgICB0aGlzLnN0YXRlLm1vZGVsTmFtZSxcbiAgICAgICAgXCIvXCIsXG4gICAgICAgIHRoaXMuc3RhdGUuaWRcbiAgICAgICksXG4gICAgICBSZW5kZXJVdGlscy5idWlsZEVycm9yKHRoaXMuc3RhdGUuZXJyb3IpLFxuICAgICAgZWRpdGluZ0Zvcm1cbiAgICApO1xuICB9LFxuXG4gIF9vblN1Ym1pdDogZnVuY3Rpb24gX29uU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHN1Ym1pdHRpbmc6IHRydWVcbiAgICB9KTtcblxuICAgICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiUFVUXCIsXG4gICAgICB1cmw6IFwiL2FkbWluL21vZGVscy9tb2RlbC9kb2M/Zm9ybWF0PWpzb24mbmFtZT1cIiArIHRoaXMuc3RhdGUubW9kZWxOYW1lICsgXCImaWQ9XCIgKyB0aGlzLnN0YXRlLmlkLFxuICAgICAgZGF0YToge1xuICAgICAgICBkb2M6IHRoaXMuc3RhdGUuanNvblxuICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgTWF0ZXJpYWxpemUudG9hc3QoXCJVcGRhdGUgc3VjY2Vzc2Z1bFwiLCAyMDAwLCBcInJvdW5kZWRcIik7XG4gICAgfSkuZmFpbChmdW5jdGlvbiAoeGhyKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgZXJyb3I6IHhoclxuICAgICAgfSk7XG4gICAgfSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBzdWJtaXR0aW5nOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX29uRGVsZXRlOiBmdW5jdGlvbiBfb25EZWxldGUoZSkge1xuICAgIHRoaXMucmVmcy5kZWxldGVNb2RhbC5vcGVuKCk7XG4gIH0sXG5cbiAgX29uRGF0YUNoYW5nZTogZnVuY3Rpb24gX29uRGF0YUNoYW5nZShkYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBqc29uID0gSlNPTi5wYXJzZShkYXRhKTtcblxuICAgICAgLy8gbXVzdCBub3QgYmUgZW1wdHkgb2JqZWN0XG4gICAgICBpZiAoIWpzb24gfHwgIV9jb3JlLk9iamVjdC5rZXlzKGpzb24pLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGpzb246IGpzb25cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGpzb246IG51bGxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBfYnVpbGRFZGl0aW5nRm9ybTogZnVuY3Rpb24gX2J1aWxkRWRpdGluZ0Zvcm0oKSB7XG4gICAgdmFyIGpzb24gPSB0aGlzLnN0YXRlLmpzb247XG5cbiAgICBpZiAodW5kZWZpbmVkID09PSBqc29uKSB7XG4gICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChMb2FkZXIsIHsgdGV4dDogXCJMb2FkaW5nIGRhdGFcIiB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICBudWxsLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChKc29uRWRpdG9yLCB7XG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLl9vbkRhdGFDaGFuZ2UsXG4gICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShqc29uLCBudWxsLCAyKSxcbiAgICAgICAgaGVpZ2h0OiBcIjQwMHB4XCIgfSksXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcImRpdlwiLFxuICAgICAgICB7IGNsYXNzTmFtZTogXCJhY3Rpb25zXCIgfSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChCdXR0b24sIHsgbGFiZWw6IFwiVXBkYXRlXCIsIGRpc2FibGVkOiAhanNvbiwgb25DbGljazogdGhpcy5fb25TdWJtaXQgfSksXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQnV0dG9uLCB7IGxhYmVsOiBcIkRlbGV0ZVwiLCBkaXNhYmxlZDogIWpzb24sIGNvbG9yOiBcInJlZFwiLCBvbkNsaWNrOiB0aGlzLl9vbkRlbGV0ZSB9KSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBNb2RhbCxcbiAgICAgICAgICB7IHJlZjogXCJkZWxldGVNb2RhbFwiLCBpZDogXCJkZWxldGVEb2NNb2RhbFwiIH0sXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFwic3BhblwiLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIFwidGVzdFwiXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogXCIvYWRtaW4vbW9kZWxzL21vZGVsL2RvY1wiLFxuICAgICAgZGF0YToge1xuICAgICAgICBmb3JtYXQ6IFwianNvblwiLFxuICAgICAgICBuYW1lOiB0aGlzLnN0YXRlLm1vZGVsTmFtZSxcbiAgICAgICAgaWQ6IHRoaXMuc3RhdGUuaWQgfVxuICAgIH0pLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHZhciBkb2MgPSBkYXRhLmRvYztcblxuICAgICAgLy8gcmVtb3ZlIGlkIGF0dHJpYnV0ZVxuICAgICAgZGVsZXRlIGRvYy5faWQ7XG5cbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBqc29uOiBkb2NcbiAgICAgIH0pO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGVycm9yOiB4aHJcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIDtcbiAgfSB9KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAvVXNlcnMvcmFtL2Rldi9qcy93YWlnby1mcmFtZXdvcmsvd2FpZ28vfi9iYWJlbC1sb2FkZXI/ZXhwZXJpbWVudGFsJm9wdGlvbmFsPXJ1bnRpbWUhLi9wYWdlcy9tb2RlbHMvcm93LmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiYWRtaW4ubW9kZWxzLmpzIn0=