webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(14);
	var Router = __webpack_require__(15);
	var DefaultRoute = Router.DefaultRoute;
	var RouteHandler = Router.RouteHandler;
	var Route = Router.Route;
	
	var Models = __webpack_require__(18);
	var Model = __webpack_require__(19);
	var Row = __webpack_require__(20);
	
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

/***/ 18:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var React = __webpack_require__(14);
	
	var Router = __webpack_require__(15),
	    Link = Router.Link;
	
	var FilterList = __webpack_require__(4),
	    RenderUtils = __webpack_require__(12);
	
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

/***/ 19:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _core = __webpack_require__(51)["default"];
	
	var React = __webpack_require__(14);
	var Router = __webpack_require__(15);
	var Link = Router.Link;
	
	var Timer = __webpack_require__(13).Timer;
	
	var _ = __webpack_require__(11),
	    Loader = __webpack_require__(6),
	    RenderUtils = __webpack_require__(12),
	    JsonEditor = __webpack_require__(5),
	    Pagination = __webpack_require__(8),
	    Button = __webpack_require__(2),
	    SubmitButton = __webpack_require__(9),
	    GuardedStateMixin = __webpack_require__(10);
	
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
	      page: 1,
	      newFilter: {},
	      newSort: {},
	      newPerPage: 10 };
	  },
	
	  _onRowClick: function _onRowClick(e) {
	    e.preventDefault();
	
	    this.context.router.transitionTo("modelRow", {
	      key: this.context.router.getCurrentParams().key,
	      id: e.currentTarget.id
	    });
	  },
	
	  _onAddClick: function _onAddClick(e) {
	    this.context.router.transitionTo("modelRow", {
	      key: this.context.router.getCurrentParams().key,
	      id: "new"
	    });
	  },
	
	  _onPerPageChange: function _onPerPageChange(e) {
	    try {
	      var num = parseInt(e.currentTarget.value);
	
	      if (_core.Number.isNaN(num)) {
	        throw new Error();
	      }
	
	      this.setState({
	        newPerPage: num
	      });
	    } catch (err) {
	      this.setState({
	        newPerPage: null
	      });
	    }
	  },
	
	  _onFilterChange: function _onFilterChange(val) {
	    try {
	      this.setState({
	        newFilter: JSON.parse(val)
	      });
	    } catch (err) {
	      this.setState({
	        newFilter: null
	      });
	    }
	  },
	
	  _onSortChange: function _onSortChange(val) {
	    try {
	      this.setState({
	        newSort: JSON.parse(val) });
	    } catch (err) {
	      this.setState({
	        newSort: null
	      });
	    }
	  },
	
	  _canSubmitSettingsForm: function _canSubmitSettingsForm() {
	    return null !== this.state.newFilter && null !== this.state.newSort && null !== this.state.newPerPage;
	  },
	
	  _buildTableFilter: function _buildTableFilter() {
	    var canSubmit = this._canSubmitSettingsForm();
	
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
	              { className: "collapsible-header" },
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
	                    value: this.state.newFilter,
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
	                    value: this.state.newSort,
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
	                  React.createElement("input", { type: "text", value: this.state.newPerPage, onChange: this._onPerPageChange })
	                ),
	                React.createElement(
	                  "div",
	                  { className: "action" },
	                  React.createElement(SubmitButton, { label: "Apply", disabled: !canSubmit })
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
	      )
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
	      React.createElement(Button, { icon: "plus-circle", label: "Add", className: "add-button", onClick: this._onAddClick }),
	      React.createElement(
	        "h2",
	        null,
	        React.createElement(
	          Link,
	          { to: "models" },
	          "Collection"
	        ),
	        React.createElement(
	          "span",
	          null,
	          " / ",
	          this.state.modelName
	        )
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
	      filter: this.state.newFilter,
	      sort: this.state.newSort,
	      perPage: this.state.newPerPage,
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

/***/ 20:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _core = __webpack_require__(51)["default"];
	
	var React = __webpack_require__(14);
	var Router = __webpack_require__(15);
	var Link = Router.Link;
	
	var Loader = __webpack_require__(6),
	    Button = __webpack_require__(2),
	    JsonEditor = __webpack_require__(5),
	    Modal = __webpack_require__(7),
	    RenderUtils = __webpack_require__(12),
	    GuardedStateMixin = __webpack_require__(10);
	
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
	        React.createElement(
	          Link,
	          { to: "model", params: { key: this.state.modelName } },
	          this.state.modelName
	        ),
	        React.createElement(
	          "span",
	          null,
	          " / ",
	          this.state.id
	        )
	      ),
	      RenderUtils.buildError(this.state.error),
	      editingForm
	    );
	  },
	
	  componentDidMount: function componentDidMount() {
	    this._load();
	  },
	
	  _buildEditingForm: function _buildEditingForm() {
	    var json = this.state.json;
	
	    if (undefined === json) {
	      return React.createElement(Loader, { text: "Loading data" });
	    }
	
	    var deleteButton = null,
	        saveBtnLabel = "Create";
	
	    if ("new" !== this.state.id) {
	      saveBtnLabel = "Update";
	
	      deleteButton = React.createElement(Button, { label: "Delete", color: "red", onClick: this._showDeleteModal });
	    }
	
	    return React.createElement(
	      "div",
	      null,
	      React.createElement(JsonEditor, {
	        onChange: this._onDataChange,
	        value: json,
	        height: "400px",
	        ref: "editor" }),
	      React.createElement(
	        "div",
	        { className: "actions" },
	        React.createElement(Button, { label: saveBtnLabel, disabled: !json, onClick: this._save }),
	        deleteButton
	      ),
	      React.createElement(
	        Modal,
	        {
	          ref: "deleteModal",
	          id: "deleteDocModal",
	          actions: ["Yes", "No"],
	          onAction: this._onDeleteModalAction },
	        React.createElement(
	          "span",
	          null,
	          "Are you sure you want to remove this document from the collection?"
	        )
	      )
	    );
	  },
	
	  _onDataChange: function _onDataChange(data) {
	    try {
	      var json = JSON.parse(data);
	
	      // must not be empty object
	      if (!json || !_core.Object.keys(json).length) {
	        throw new Error();
	      }
	
	      this.setState({
	        json: data
	      });
	    } catch (err) {
	      this.setState({
	        json: null
	      });
	    }
	  },
	
	  _load: function _load() {
	    var self = this;
	
	    // if creating a new item then no need to fetch data to start with
	    if ("new" === this.state.id) {
	      return this.setState({
	        json: {}
	      });
	    }
	
	    $.ajax({
	      url: "/admin/models/model/doc",
	      data: {
	        format: "json",
	        name: this.state.modelName,
	        id: this.state.id }
	    }).done(function (data) {
	      var doc = JSON.parse(data.doc);
	
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
	  },
	
	  _update: function _update() {
	    var self = this;
	
	    this.setState({
	      submitting: true,
	      error: null
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
	
	  _create: function _create() {
	    var self = this;
	
	    this.setState({
	      submitting: true,
	      error: null
	    });
	
	    $.ajax({
	      method: "POST",
	      url: "/admin/models/model/doc?format=json&name=" + this.state.modelName,
	      data: {
	        doc: this.state.json
	      }
	    }).then(function (data) {
	      Materialize.toast("Create successful", 2000, "rounded");
	
	      var doc = JSON.parse(data.doc),
	          id = doc._id;
	
	      delete doc._id;
	
	      self.setStateIfMounted({
	        id: id,
	        json: doc });
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
	
	  _save: function _save() {
	    if ("new" === this.state.id) {
	      this._create();
	    } else {
	      this._update();
	    }
	  },
	
	  _delete: function _delete() {
	    var self = this;
	
	    this.setState({
	      submitting: true,
	      error: null });
	
	    $.ajax({
	      method: "DELETE",
	      url: "/admin/models/model/doc?format=json&name=" + this.state.modelName + "&id=" + this.state.id }).then(function () {
	      Materialize.toast("Delete successful", 2000, "rounded");
	
	      self.context.router.transitionTo("model", {
	        key: self.context.router.getCurrentParams().key });
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
	
	  _showDeleteModal: function _showDeleteModal() {
	    this.refs.deleteModal.open();
	  },
	
	  _onDeleteModalAction: function _onDeleteModalAction(action) {
	    if ("yes" === action.toLowerCase()) {
	      this._delete();
	    }
	  } });

/***/ }

});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9tb2RlbHMvYXBwLmpzIiwid2VicGFjazovLy8uL3BhZ2VzL21vZGVscy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9wYWdlcy9tb2RlbHMvbW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcGFnZXMvbW9kZWxzL3Jvdy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGFBQVksQ0FBQzs7QUFFYixLQUFJLEtBQUssR0FBRyxtQkFBTyxDQUFDLEVBQU8sQ0FBQyxDQUFDO0FBQzdCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsRUFBYyxDQUFDLENBQUM7QUFDckMsS0FBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN2QyxLQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3ZDLEtBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7O0FBRXpCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsRUFBUyxDQUFDLENBQUM7QUFDaEMsS0FBSSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxFQUFTLENBQUMsQ0FBQztBQUMvQixLQUFJLEdBQUcsR0FBRyxtQkFBTyxDQUFDLEVBQU8sQ0FBQyxDQUFDOztBQUUzQixLQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQzVCLEdBQUUsV0FBVyxFQUFFLEtBQUs7O0dBRWxCLE1BQU0sRUFBRSxTQUFTLE1BQU0sR0FBRztLQUN4QixPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0RDtBQUNILEVBQUMsQ0FBQyxDQUFDOztBQUVILEtBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxhQUFhO0dBQzlCLEtBQUs7R0FDTCxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUU7R0FDaEIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztHQUN0RSxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7R0FDNUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ25GLEVBQUMsQ0FBQzs7QUFFRixPQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLFVBQVUsT0FBTyxFQUFFLEtBQUssRUFBRTtHQUNoRSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztFQUN2SixDQUFDLEM7Ozs7Ozs7QUM5QkYsYUFBWSxDQUFDOztBQUViLEtBQUksS0FBSyxHQUFHLG1CQUFPLENBQUMsRUFBTyxDQUFDLENBQUM7O0FBRTdCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsRUFBYyxDQUFDO0FBQ3BDLEtBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7O0FBRXZCLEtBQUksVUFBVSxHQUFHLG1CQUFPLENBQUMsQ0FBNkIsQ0FBQztBQUN2RCxLQUFJLFdBQVcsR0FBRyxtQkFBTyxDQUFDLEVBQXlCLENBQUMsQ0FBQzs7QUFFckQsT0FBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQ25DLEdBQUUsV0FBVyxFQUFFLFNBQVM7O0dBRXRCLE1BQU0sRUFBRSxTQUFTLE1BQU0sR0FBRztLQUN4QixPQUFPLEtBQUssQ0FBQyxhQUFhO09BQ3hCLEtBQUs7T0FDTCxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUU7T0FDNUIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUU7U0FDOUIsT0FBTyxFQUFFLDJCQUEyQjtTQUNwQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsWUFBWTtTQUN6Qyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CO1NBQ2xELFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQztNQUN4QixDQUFDO0FBQ04sSUFBRzs7R0FFRCxZQUFZLEVBQUUsU0FBUyxZQUFZLENBQUMsSUFBSSxFQUFFO0FBQzVDLEtBQUksSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7O0tBRWxCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7T0FDMUMsT0FBTztTQUNMLEdBQUcsRUFBRSxDQUFDO1NBQ04sSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO01BQ2IsQ0FBQyxDQUFDO0FBQ1AsSUFBRzs7R0FFRCxtQkFBbUIsRUFBRSxTQUFTLG1CQUFtQixDQUFDLElBQUksRUFBRTtLQUN0RCxPQUFPLEtBQUssQ0FBQyxhQUFhO09BQ3hCLE1BQU07T0FDTixJQUFJO09BQ0osSUFBSSxDQUFDLElBQUk7TUFDVixDQUFDO0lBQ0gsRUFBRSxDQUFDLEM7Ozs7Ozs7QUN6Q04sYUFBWSxDQUFDOztBQUViLEtBQUksS0FBSyxHQUFHLG1CQUFPLENBQUMsRUFBdUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUV4RCxLQUFJLEtBQUssR0FBRyxtQkFBTyxDQUFDLEVBQU8sQ0FBQyxDQUFDO0FBQzdCLEtBQUksTUFBTSxHQUFHLG1CQUFPLENBQUMsRUFBYyxDQUFDLENBQUM7QUFDckMsS0FBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQzs7QUFFdkIsS0FBSSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxFQUFZLENBQUMsQ0FBQyxLQUFLLENBQUM7O0FBRXhDLEtBQUksQ0FBQyxHQUFHLG1CQUFPLENBQUMsRUFBb0IsQ0FBQztLQUNqQyxNQUFNLEdBQUcsbUJBQU8sQ0FBQyxDQUF5QixDQUFDO0tBQzNDLFdBQVcsR0FBRyxtQkFBTyxDQUFDLEVBQXlCLENBQUM7S0FDaEQsVUFBVSxHQUFHLG1CQUFPLENBQUMsQ0FBNkIsQ0FBQztLQUNuRCxVQUFVLEdBQUcsbUJBQU8sQ0FBQyxDQUE2QixDQUFDO0tBQ25ELE1BQU0sR0FBRyxtQkFBTyxDQUFDLENBQXlCLENBQUM7S0FDM0MsWUFBWSxHQUFHLG1CQUFPLENBQUMsQ0FBK0IsQ0FBQztBQUMzRCxLQUFJLGlCQUFpQixHQUFHLG1CQUFPLENBQUMsRUFBMkIsQ0FBQyxDQUFDOztBQUU3RCxPQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDbkMsR0FBRSxXQUFXLEVBQUUsU0FBUzs7R0FFdEIsWUFBWSxFQUFFO0tBQ1osTUFBTSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUNoQyxJQUFHOztBQUVILEdBQUUsTUFBTSxFQUFFLENBQUMsaUJBQWlCLENBQUM7O0dBRTNCLGVBQWUsRUFBRSxTQUFTLGVBQWUsR0FBRztLQUMxQyxPQUFPO09BQ0wsU0FBUyxFQUFFLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsR0FBRyxDQUFDO09BQ3pFLE9BQU8sRUFBRSxJQUFJO09BQ2IsS0FBSyxFQUFFLElBQUk7T0FDWCxPQUFPLEVBQUUsRUFBRTtPQUNYLE1BQU0sRUFBRSxFQUFFO09BQ1YsSUFBSSxFQUFFLEVBQUU7T0FDUixJQUFJLEVBQUUsQ0FBQztPQUNQLFNBQVMsRUFBRSxFQUFFO09BQ2IsT0FBTyxFQUFFLEVBQUU7T0FDWCxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDdkIsSUFBRzs7R0FFRCxXQUFXLEVBQUUsU0FBUyxXQUFXLENBQUMsQ0FBQyxFQUFFO0FBQ3ZDLEtBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDOztLQUVuQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFO09BQzNDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEdBQUc7T0FDL0MsRUFBRSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsRUFBRTtNQUN2QixDQUFDLENBQUM7QUFDUCxJQUFHOztHQUVELFdBQVcsRUFBRSxTQUFTLFdBQVcsQ0FBQyxDQUFDLEVBQUU7S0FDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRTtPQUMzQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHO09BQy9DLEVBQUUsRUFBRSxLQUFLO01BQ1YsQ0FBQyxDQUFDO0FBQ1AsSUFBRzs7R0FFRCxnQkFBZ0IsRUFBRSxTQUFTLGdCQUFnQixDQUFDLENBQUMsRUFBRTtLQUM3QyxJQUFJO0FBQ1IsT0FBTSxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7T0FFMUMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtTQUMzQixNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7QUFDMUIsUUFBTzs7T0FFRCxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ1osVUFBVSxFQUFFLEdBQUc7UUFDaEIsQ0FBQyxDQUFDO01BQ0osQ0FBQyxPQUFPLEdBQUcsRUFBRTtPQUNaLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDWixVQUFVLEVBQUUsSUFBSTtRQUNqQixDQUFDLENBQUM7TUFDSjtBQUNMLElBQUc7O0dBRUQsZUFBZSxFQUFFLFNBQVMsZUFBZSxDQUFDLEdBQUcsRUFBRTtLQUM3QyxJQUFJO09BQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUNaLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUMzQixDQUFDLENBQUM7TUFDSixDQUFDLE9BQU8sR0FBRyxFQUFFO09BQ1osSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUNaLFNBQVMsRUFBRSxJQUFJO1FBQ2hCLENBQUMsQ0FBQztNQUNKO0FBQ0wsSUFBRzs7R0FFRCxhQUFhLEVBQUUsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFO0tBQ3pDLElBQUk7T0FDRixJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ1osT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO01BQy9CLENBQUMsT0FBTyxHQUFHLEVBQUU7T0FDWixJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ1osT0FBTyxFQUFFLElBQUk7UUFDZCxDQUFDLENBQUM7TUFDSjtBQUNMLElBQUc7O0dBRUQsc0JBQXNCLEVBQUUsU0FBUyxzQkFBc0IsR0FBRztLQUN4RCxPQUFPLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQzFHLElBQUc7O0dBRUQsaUJBQWlCLEVBQUUsU0FBUyxpQkFBaUIsR0FBRztBQUNsRCxLQUFJLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDOztLQUU5QyxPQUFPLEtBQUssQ0FBQyxhQUFhO09BQ3hCLEtBQUs7T0FDTCxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUU7T0FDcEIsS0FBSyxDQUFDLGFBQWE7U0FDakIsS0FBSztTQUNMLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRTtTQUMzQixLQUFLLENBQUMsYUFBYTtXQUNqQixJQUFJO1dBQ0osRUFBRSxTQUFTLEVBQUUsMkJBQTJCLEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFBRTtXQUNoRSxLQUFLLENBQUMsYUFBYTthQUNqQixJQUFJO2FBQ0osSUFBSTthQUNKLEtBQUssQ0FBQyxhQUFhO2VBQ2pCLEtBQUs7ZUFDTCxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsRUFBRTtlQUNuQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsQ0FBQztlQUNyRCxLQUFLLENBQUMsYUFBYTtpQkFDakIsTUFBTTtpQkFDTixJQUFJO2lCQUNKLGdCQUFnQjtnQkFDakI7Y0FDRjthQUNELEtBQUssQ0FBQyxhQUFhO2VBQ2pCLEtBQUs7ZUFDTCxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFBRTtlQUNqQyxLQUFLLENBQUMsYUFBYTtpQkFDakIsTUFBTTtpQkFDTixFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7aUJBQ3RDLEtBQUssQ0FBQyxhQUFhO21CQUNqQixLQUFLO21CQUNMLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTttQkFDdkIsS0FBSyxDQUFDLGFBQWE7cUJBQ2pCLE9BQU87cUJBQ1AsSUFBSTtxQkFDSixTQUFTO29CQUNWO21CQUNELEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFO3FCQUM5QixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTO3FCQUMzQixRQUFRLEVBQUUsSUFBSSxDQUFDLGVBQWU7cUJBQzlCLE1BQU0sRUFBRSxPQUFPO3FCQUNmLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztrQkFDcEI7aUJBQ0QsS0FBSyxDQUFDLGFBQWE7bUJBQ2pCLEtBQUs7bUJBQ0wsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO21CQUN2QixLQUFLLENBQUMsYUFBYTtxQkFDakIsT0FBTztxQkFDUCxJQUFJO3FCQUNKLE9BQU87b0JBQ1I7bUJBQ0QsS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUU7cUJBQzlCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87cUJBQ3pCLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYTtxQkFDNUIsTUFBTSxFQUFFLE9BQU87cUJBQ2YsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO2tCQUNwQjtpQkFDRCxLQUFLLENBQUMsYUFBYTttQkFDakIsS0FBSzttQkFDTCxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUU7bUJBQ3ZCLEtBQUssQ0FBQyxhQUFhO3FCQUNqQixPQUFPO3FCQUNQLElBQUk7cUJBQ0osV0FBVztvQkFDWjttQkFDRCxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztrQkFDOUc7aUJBQ0QsS0FBSyxDQUFDLGFBQWE7bUJBQ2pCLEtBQUs7bUJBQ0wsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO21CQUN2QixLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7a0JBQzVFO2dCQUNGO2NBQ0Y7WUFDRjtVQUNGO1FBQ0Y7TUFDRixDQUFDO0FBQ04sSUFBRzs7R0FFRCxXQUFXLEVBQUUsU0FBUyxXQUFXLEdBQUc7QUFDdEMsS0FBSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7O0tBRWhCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTztBQUNwQyxTQUFRLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7O0tBRWpDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7T0FDcEMsT0FBTyxLQUFLLENBQUMsYUFBYTtTQUN4QixJQUFJO1NBQ0osSUFBSTtTQUNKLENBQUMsQ0FBQyxJQUFJO1FBQ1AsQ0FBQztBQUNSLE1BQUssQ0FBQyxDQUFDOztLQUVILElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztLQUNoQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO09BQ3RCLElBQUksR0FBRyxLQUFLLENBQUMsYUFBYTtTQUN4QixJQUFJO1NBQ0osSUFBSTtTQUNKLEtBQUssQ0FBQyxhQUFhO1dBQ2pCLElBQUk7V0FDSixJQUFJO1dBQ0osS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO1VBQ2xDO1FBQ0YsQ0FBQztNQUNILE1BQU07T0FDTCxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUNyQyxTQUFRLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLEVBQUU7O1dBRXRDLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO0FBQ25DLGVBQWMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUMvQjs7V0FFVSxJQUFJLE1BQU0sS0FBSyxHQUFHLENBQUMsSUFBSSxFQUFFO2FBQ3ZCLFNBQVMsR0FBRyxLQUFLLENBQUM7YUFDbEIsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQy9DLFlBQVc7O0FBRVgsZ0JBQWUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFOzthQUU3QixJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUU7ZUFDZCxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pELGNBQWE7QUFDYjs7YUFFWSxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtlQUM3QixPQUFPLEtBQUssQ0FBQyxhQUFhO2lCQUN4QixJQUFJO2lCQUNKLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRTtpQkFDVixDQUFDO2dCQUNGLENBQUM7QUFDaEIsY0FBYSxDQUFDLENBQUM7O2FBRUgsS0FBSyxHQUFHLEtBQUssQ0FBQyxhQUFhO2VBQ3pCLElBQUk7ZUFDSixJQUFJO2VBQ0osS0FBSztjQUNOLENBQUM7QUFDZCxZQUFXOztnQkFFSSxJQUFJLFFBQVEsS0FBSyxPQUFPLEtBQUssRUFBRTthQUNsQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQyxZQUFXOztXQUVELE9BQU8sS0FBSyxDQUFDLGFBQWE7YUFDeEIsSUFBSTthQUNKLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRTthQUMzQyxLQUFLO1lBQ04sQ0FBQztBQUNaLFVBQVMsQ0FBQyxDQUFDOztTQUVILE9BQU8sS0FBSyxDQUFDLGFBQWE7V0FDeEIsSUFBSTtXQUNKLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7V0FDeEQsTUFBTTtVQUNQLENBQUM7UUFDSCxDQUFDLENBQUM7QUFDVCxNQUFLOztBQUVMLEtBQUksSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7O0tBRTNDLE9BQU8sS0FBSyxDQUFDLGFBQWE7T0FDeEIsS0FBSztPQUNMLElBQUk7T0FDSixXQUFXO09BQ1gsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztPQUN4QyxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRTtTQUM5QixXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJO1NBQzVCLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87U0FDbEMsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUztTQUNsQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO09BQ3JDLEtBQUssQ0FBQyxhQUFhO1NBQ2pCLE9BQU87U0FDUCxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsRUFBRTtTQUNuQyxLQUFLLENBQUMsYUFBYTtXQUNqQixPQUFPO1dBQ1AsSUFBSTtXQUNKLEtBQUssQ0FBQyxhQUFhO2FBQ2pCLElBQUk7YUFDSixJQUFJO2FBQ0osTUFBTTtZQUNQO1VBQ0Y7U0FDRCxLQUFLLENBQUMsYUFBYTtXQUNqQixPQUFPO1dBQ1AsSUFBSTtXQUNKLElBQUk7VUFDTDtRQUNGO01BQ0YsQ0FBQztBQUNOLElBQUc7O0dBRUQsTUFBTSxFQUFFLFNBQVMsTUFBTSxHQUFHO0FBQzVCLEtBQUksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDOztLQUVsQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7T0FDdkIsTUFBTSxHQUFHLEtBQUssQ0FBQyxhQUFhO1NBQzFCLEtBQUs7U0FDTCxJQUFJO1NBQ0osS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQztTQUMxRCxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ3pDLENBQUM7TUFDSCxNQUFNO09BQ0wsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNsQyxNQUFLOztLQUVELE9BQU8sS0FBSyxDQUFDLGFBQWE7T0FDeEIsS0FBSztPQUNMLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRTtPQUMzQixLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDdEgsS0FBSyxDQUFDLGFBQWE7U0FDakIsSUFBSTtTQUNKLElBQUk7U0FDSixLQUFLLENBQUMsYUFBYTtXQUNqQixJQUFJO1dBQ0osRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFO1dBQ2hCLFlBQVk7VUFDYjtTQUNELEtBQUssQ0FBQyxhQUFhO1dBQ2pCLE1BQU07V0FDTixJQUFJO1dBQ0osS0FBSztXQUNMLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUztVQUNyQjtRQUNGO09BQ0QsTUFBTTtNQUNQLENBQUM7QUFDTixJQUFHOztHQUVELGtCQUFrQixFQUFFLFNBQVMsa0JBQWtCLEdBQUc7S0FDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUU7QUFDOUMsT0FBTSxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7O09BRTVELElBQUksQ0FBQyxRQUFRLENBQUM7U0FDWix3QkFBd0IsRUFBRSxJQUFJO1FBQy9CLENBQUMsQ0FBQztNQUNKO0FBQ0wsSUFBRzs7R0FFRCxpQkFBaUIsRUFBRSxTQUFTLGlCQUFpQixHQUFHO0FBQ2xELEtBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3BCOztLQUVJLENBQUMsQ0FBQyxJQUFJLENBQUM7T0FDTCxHQUFHLEVBQUUsNkJBQTZCO09BQ2xDLElBQUksRUFBRTtTQUNKLE1BQU0sRUFBRSxNQUFNO1NBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO01BQy9CLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUU7T0FDdEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1NBQ3JCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztBQUM3QixRQUFPLENBQUMsQ0FBQzs7T0FFSCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7TUFDbkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRTtPQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUM7U0FDckIsS0FBSyxFQUFFLEdBQUc7UUFDWCxDQUFDLENBQUM7TUFDSixDQUFDLENBQUM7S0FDSCxDQUFDO0FBQ0wsSUFBRzs7R0FFRCxtQkFBbUIsRUFBRSxTQUFTLG1CQUFtQixDQUFDLENBQUMsRUFBRTtBQUN2RCxLQUFJLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN2Qjs7S0FFSSxJQUFJLENBQUMsUUFBUSxDQUFDO09BQ1osTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUztPQUM1QixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPO09BQ3hCLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7T0FDOUIsSUFBSSxFQUFFLENBQUM7QUFDYixNQUFLLENBQUMsQ0FBQzs7S0FFSCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDdEIsSUFBRzs7R0FFRCxhQUFhLEVBQUUsU0FBUyxhQUFhLENBQUMsT0FBTyxFQUFFO0tBQzdDLElBQUksQ0FBQyxRQUFRLENBQUM7T0FDWixJQUFJLEVBQUUsT0FBTztBQUNuQixNQUFLLENBQUMsQ0FBQzs7S0FFSCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDdEIsSUFBRzs7R0FFRCxVQUFVLEVBQUUsU0FBUyxVQUFVLEdBQUc7QUFDcEMsS0FBSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDcEI7O0tBRUksSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO09BQ3hCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbEMsTUFBSzs7QUFFTCxLQUFJLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLFlBQVk7O09BRXZDLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDWixPQUFPLEVBQUUsSUFBSTtBQUNyQixTQUFRLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDOztBQUV2QixPQUFNLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDNUQ7O09BRU0sQ0FBQyxDQUFDLElBQUksQ0FBQztTQUNMLEdBQUcsRUFBRSxzQ0FBc0M7U0FDM0MsTUFBTSxFQUFFLE1BQU07U0FDZCxJQUFJLEVBQUU7V0FDSixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTO1dBQzFCLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1dBQ3pDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1dBQ3JDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87V0FDM0IsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQzFCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUU7U0FDdEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1dBQ3JCLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSztXQUNyQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRTtTQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUM7V0FDckIsS0FBSyxFQUFFLEdBQUc7VUFDWCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVk7U0FDcEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1dBQ3JCLE9BQU8sRUFBRSxLQUFLO1VBQ2YsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDO01BQ0osRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixFQUFFLENBQUMsQzs7Ozs7OztBQzdhTixhQUFZLENBQUM7O0FBRWIsS0FBSSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxFQUF1QixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRXhELEtBQUksS0FBSyxHQUFHLG1CQUFPLENBQUMsRUFBTyxDQUFDLENBQUM7QUFDN0IsS0FBSSxNQUFNLEdBQUcsbUJBQU8sQ0FBQyxFQUFjLENBQUMsQ0FBQztBQUNyQyxLQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDOztBQUV2QixLQUFJLE1BQU0sR0FBRyxtQkFBTyxDQUFDLENBQXlCLENBQUM7S0FDM0MsTUFBTSxHQUFHLG1CQUFPLENBQUMsQ0FBeUIsQ0FBQztLQUMzQyxVQUFVLEdBQUcsbUJBQU8sQ0FBQyxDQUE2QixDQUFDO0tBQ25ELEtBQUssR0FBRyxtQkFBTyxDQUFDLENBQXdCLENBQUM7S0FDekMsV0FBVyxHQUFHLG1CQUFPLENBQUMsRUFBeUIsQ0FBQztBQUNwRCxLQUFJLGlCQUFpQixHQUFHLG1CQUFPLENBQUMsRUFBMkIsQ0FBQyxDQUFDOztBQUU3RCxPQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDbkMsR0FBRSxXQUFXLEVBQUUsU0FBUzs7R0FFdEIsWUFBWSxFQUFFO0tBQ1osTUFBTSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUNoQyxJQUFHOztBQUVILEdBQUUsTUFBTSxFQUFFLENBQUMsaUJBQWlCLENBQUM7O0dBRTNCLGVBQWUsRUFBRSxTQUFTLGVBQWUsR0FBRztBQUM5QyxLQUFJLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7O0tBRXBELE9BQU87T0FDTCxTQUFTLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztPQUN6QyxFQUFFLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztPQUNqQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDcEIsSUFBRzs7R0FFRCxNQUFNLEVBQUUsU0FBUyxNQUFNLEdBQUc7QUFDNUIsS0FBSSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzs7S0FFM0MsT0FBTyxLQUFLLENBQUMsYUFBYTtPQUN4QixLQUFLO09BQ0wsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFO09BQzlCLEtBQUssQ0FBQyxhQUFhO1NBQ2pCLElBQUk7U0FDSixFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUU7U0FDdEIsS0FBSyxDQUFDLGFBQWE7V0FDakIsSUFBSTtXQUNKLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsRUFBRTtXQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVM7VUFDckI7U0FDRCxLQUFLLENBQUMsYUFBYTtXQUNqQixNQUFNO1dBQ04sSUFBSTtXQUNKLEtBQUs7V0FDTCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7VUFDZDtRQUNGO09BQ0QsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztPQUN4QyxXQUFXO01BQ1osQ0FBQztBQUNOLElBQUc7O0dBRUQsaUJBQWlCLEVBQUUsU0FBUyxpQkFBaUIsR0FBRztLQUM5QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDakIsSUFBRzs7R0FFRCxpQkFBaUIsRUFBRSxTQUFTLGlCQUFpQixHQUFHO0FBQ2xELEtBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7O0tBRTNCLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtPQUN0QixPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDbkUsTUFBSzs7S0FFRCxJQUFJLFlBQVksR0FBRyxJQUFJO0FBQzNCLFNBQVEsWUFBWSxHQUFHLFFBQVEsQ0FBQzs7S0FFNUIsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUU7QUFDakMsT0FBTSxZQUFZLEdBQUcsUUFBUSxDQUFDOztPQUV4QixZQUFZLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7QUFDcEgsTUFBSzs7S0FFRCxPQUFPLEtBQUssQ0FBQyxhQUFhO09BQ3hCLEtBQUs7T0FDTCxJQUFJO09BQ0osS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUU7U0FDOUIsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhO1NBQzVCLEtBQUssRUFBRSxJQUFJO1NBQ1gsTUFBTSxFQUFFLE9BQU87U0FDZixHQUFHLEVBQUUsUUFBUSxFQUFFLENBQUM7T0FDbEIsS0FBSyxDQUFDLGFBQWE7U0FDakIsS0FBSztTQUNMLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRTtTQUN4QixLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDMUYsWUFBWTtRQUNiO09BQ0QsS0FBSyxDQUFDLGFBQWE7U0FDakIsS0FBSztTQUNMO1dBQ0UsR0FBRyxFQUFFLGFBQWE7V0FDbEIsRUFBRSxFQUFFLGdCQUFnQjtXQUNwQixPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO1dBQ3RCLFFBQVEsRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7U0FDdkMsS0FBSyxDQUFDLGFBQWE7V0FDakIsTUFBTTtXQUNOLElBQUk7V0FDSixvRUFBb0U7VUFDckU7UUFDRjtNQUNGLENBQUM7QUFDTixJQUFHOztHQUVELGFBQWEsRUFBRSxTQUFTLGFBQWEsQ0FBQyxJQUFJLEVBQUU7S0FDMUMsSUFBSTtBQUNSLE9BQU0sSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQzs7T0FFTSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFO1NBQzVDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztBQUMxQixRQUFPOztPQUVELElBQUksQ0FBQyxRQUFRLENBQUM7U0FDWixJQUFJLEVBQUUsSUFBSTtRQUNYLENBQUMsQ0FBQztNQUNKLENBQUMsT0FBTyxHQUFHLEVBQUU7T0FDWixJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ1osSUFBSSxFQUFFLElBQUk7UUFDWCxDQUFDLENBQUM7TUFDSjtBQUNMLElBQUc7O0dBRUQsS0FBSyxFQUFFLFNBQVMsS0FBSyxHQUFHO0FBQzFCLEtBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3BCOztLQUVJLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFO09BQzNCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUNuQixJQUFJLEVBQUUsRUFBRTtRQUNULENBQUMsQ0FBQztBQUNULE1BQUs7O0tBRUQsQ0FBQyxDQUFDLElBQUksQ0FBQztPQUNMLEdBQUcsRUFBRSx5QkFBeUI7T0FDOUIsSUFBSSxFQUFFO1NBQ0osTUFBTSxFQUFFLE1BQU07U0FDZCxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTO1NBQzFCLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRTtNQUN0QixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFO0FBQzVCLE9BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckM7O0FBRUEsT0FBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUM7O09BRWYsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1NBQ3JCLElBQUksRUFBRSxHQUFHO1FBQ1YsQ0FBQyxDQUFDO01BQ0osQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRTtPQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUM7U0FDckIsS0FBSyxFQUFFLEdBQUc7UUFDWCxDQUFDLENBQUM7TUFDSixDQUFDLENBQUM7S0FDSCxDQUFDO0FBQ0wsSUFBRzs7R0FFRCxPQUFPLEVBQUUsU0FBUyxPQUFPLEdBQUc7QUFDOUIsS0FBSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7O0tBRWhCLElBQUksQ0FBQyxRQUFRLENBQUM7T0FDWixVQUFVLEVBQUUsSUFBSTtPQUNoQixLQUFLLEVBQUUsSUFBSTtBQUNqQixNQUFLLENBQUMsQ0FBQzs7S0FFSCxDQUFDLENBQUMsSUFBSSxDQUFDO09BQ0wsTUFBTSxFQUFFLEtBQUs7T0FDYixHQUFHLEVBQUUsMkNBQTJDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtPQUNoRyxJQUFJLEVBQUU7U0FDSixHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJO1FBQ3JCO01BQ0YsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZO09BQ2xCLFdBQVcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO01BQ3pELENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUU7T0FDckIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1NBQ3JCLEtBQUssRUFBRSxHQUFHO1FBQ1gsQ0FBQyxDQUFDO01BQ0osQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZO09BQ3BCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztTQUNyQixVQUFVLEVBQUUsS0FBSztRQUNsQixDQUFDLENBQUM7TUFDSixDQUFDLENBQUM7QUFDUCxJQUFHOztHQUVELE9BQU8sRUFBRSxTQUFTLE9BQU8sR0FBRztBQUM5QixLQUFJLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQzs7S0FFaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQztPQUNaLFVBQVUsRUFBRSxJQUFJO09BQ2hCLEtBQUssRUFBRSxJQUFJO0FBQ2pCLE1BQUssQ0FBQyxDQUFDOztLQUVILENBQUMsQ0FBQyxJQUFJLENBQUM7T0FDTCxNQUFNLEVBQUUsTUFBTTtPQUNkLEdBQUcsRUFBRSwyQ0FBMkMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVM7T0FDdkUsSUFBSSxFQUFFO1NBQ0osR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSTtRQUNyQjtNQUNGLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDNUIsT0FBTSxXQUFXLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQzs7T0FFeEQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3BDLFdBQVUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7O0FBRXZCLE9BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDOztPQUVmLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztTQUNyQixFQUFFLEVBQUUsRUFBRTtTQUNOLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO01BQ2hCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUU7T0FDckIsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1NBQ3JCLEtBQUssRUFBRSxHQUFHO1FBQ1gsQ0FBQyxDQUFDO01BQ0osQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZO09BQ3BCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztTQUNyQixVQUFVLEVBQUUsS0FBSztRQUNsQixDQUFDLENBQUM7TUFDSixDQUFDLENBQUM7QUFDUCxJQUFHOztHQUVELEtBQUssRUFBRSxTQUFTLEtBQUssR0FBRztLQUN0QixJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRTtPQUMzQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7TUFDaEIsTUFBTTtPQUNMLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztNQUNoQjtBQUNMLElBQUc7O0dBRUQsT0FBTyxFQUFFLFNBQVMsT0FBTyxHQUFHO0FBQzlCLEtBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztLQUVoQixJQUFJLENBQUMsUUFBUSxDQUFDO09BQ1osVUFBVSxFQUFFLElBQUk7QUFDdEIsT0FBTSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzs7S0FFakIsQ0FBQyxDQUFDLElBQUksQ0FBQztPQUNMLE1BQU0sRUFBRSxRQUFRO09BQ2hCLEdBQUcsRUFBRSwyQ0FBMkMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZO0FBQzNILE9BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7O09BRXhELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUU7U0FDeEMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztNQUN0RCxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFO09BQ3JCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztTQUNyQixLQUFLLEVBQUUsR0FBRztRQUNYLENBQUMsQ0FBQztNQUNKLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWTtPQUNwQixJQUFJLENBQUMsaUJBQWlCLENBQUM7U0FDckIsVUFBVSxFQUFFLEtBQUs7UUFDbEIsQ0FBQyxDQUFDO01BQ0osQ0FBQyxDQUFDO0FBQ1AsSUFBRzs7R0FFRCxnQkFBZ0IsRUFBRSxTQUFTLGdCQUFnQixHQUFHO0tBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2pDLElBQUc7O0dBRUQsb0JBQW9CLEVBQUUsU0FBUyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUU7S0FDMUQsSUFBSSxLQUFLLEtBQUssTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFO09BQ2xDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztNQUNoQjtJQUNGLEVBQUUsQ0FBQyxDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyXCIpO1xudmFyIERlZmF1bHRSb3V0ZSA9IFJvdXRlci5EZWZhdWx0Um91dGU7XG52YXIgUm91dGVIYW5kbGVyID0gUm91dGVyLlJvdXRlSGFuZGxlcjtcbnZhciBSb3V0ZSA9IFJvdXRlci5Sb3V0ZTtcblxudmFyIE1vZGVscyA9IHJlcXVpcmUoXCIuL2luZGV4XCIpO1xudmFyIE1vZGVsID0gcmVxdWlyZShcIi4vbW9kZWxcIik7XG52YXIgUm93ID0gcmVxdWlyZShcIi4vcm93XCIpO1xuXG52YXIgQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogXCJBcHBcIixcblxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChSb3V0ZUhhbmRsZXIsIHRoaXMucHJvcHMpO1xuICB9XG59KTtcblxudmFyIHJvdXRlcyA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gIFJvdXRlLFxuICB7IGhhbmRsZXI6IEFwcCB9LFxuICBSZWFjdC5jcmVhdGVFbGVtZW50KERlZmF1bHRSb3V0ZSwgeyBuYW1lOiBcIm1vZGVsc1wiLCBoYW5kbGVyOiBNb2RlbHMgfSksXG4gIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUm91dGUsIHsgbmFtZTogXCJtb2RlbFwiLCBwYXRoOiBcIi86a2V5XCIsIGhhbmRsZXI6IE1vZGVsIH0pLFxuICBSZWFjdC5jcmVhdGVFbGVtZW50KFJvdXRlLCB7IG5hbWU6IFwibW9kZWxSb3dcIiwgcGF0aDogXCIvOmtleS86aWRcIiwgaGFuZGxlcjogUm93IH0pXG4pO1xuXG5Sb3V0ZXIucnVuKHJvdXRlcywgUm91dGVyLkhhc2hMb2NhdGlvbiwgZnVuY3Rpb24gKEhhbmRsZXIsIHN0YXRlKSB7XG4gIFJlYWN0LnJlbmRlcihSZWFjdC5jcmVhdGVFbGVtZW50KEhhbmRsZXIsIHsgcm91dGVzOiBzdGF0ZS5yb3V0ZXMsIHBhcmFtczogc3RhdGUucGFyYW1zLCBxdWVyeTogc3RhdGUucXVlcnkgfSksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVhY3Qtcm9vdFwiKSk7XG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAvVXNlcnMvcmFtL2Rldi9qcy93YWlnby1mcmFtZXdvcmsvd2FpZ28vfi9iYWJlbC1sb2FkZXI/ZXhwZXJpbWVudGFsJm9wdGlvbmFsPXJ1bnRpbWUhLi9wYWdlcy9tb2RlbHMvYXBwLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIFJvdXRlciA9IHJlcXVpcmUoXCJyZWFjdC1yb3V0ZXJcIiksXG4gICAgTGluayA9IFJvdXRlci5MaW5rO1xuXG52YXIgRmlsdGVyTGlzdCA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2ZpbHRlckxpc3RcIiksXG4gICAgUmVuZGVyVXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvcmVuZGVyVXRpbHNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogXCJleHBvcnRzXCIsXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBcImRpdlwiLFxuICAgICAgeyBjbGFzc05hbWU6IFwicGFnZS1tb2RlbHNcIiB9LFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChGaWx0ZXJMaXN0LCB7XG4gICAgICAgIGFqYXhVcmw6IFwiL2FkbWluL21vZGVscz9mb3JtYXQ9anNvblwiLFxuICAgICAgICBhamF4UmVzcG9uc2VEYXRhTWFwcGVyOiB0aGlzLl9tYXBBamF4RGF0YSxcbiAgICAgICAgaXRlbURpc3BsYXlOYW1lRm9ybWF0dGVyOiB0aGlzLl9nZXRJdGVtRGlzcGxheU5hbWUsXG4gICAgICAgIGl0ZW1Sb3V0ZTogXCJtb2RlbFwiIH0pXG4gICAgKTtcbiAgfSxcblxuICBfbWFwQWpheERhdGE6IGZ1bmN0aW9uIF9tYXBBamF4RGF0YShkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEgfHwge307XG5cbiAgICByZXR1cm4gKGRhdGEubW9kZWxzIHx8IFtdKS5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGtleTogcixcbiAgICAgICAgbmFtZTogciB9O1xuICAgIH0pO1xuICB9LFxuXG4gIF9nZXRJdGVtRGlzcGxheU5hbWU6IGZ1bmN0aW9uIF9nZXRJdGVtRGlzcGxheU5hbWUoaXRlbSkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgXCJzcGFuXCIsXG4gICAgICBudWxsLFxuICAgICAgaXRlbS5uYW1lXG4gICAgKTtcbiAgfSB9KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAvVXNlcnMvcmFtL2Rldi9qcy93YWlnby1mcmFtZXdvcmsvd2FpZ28vfi9iYWJlbC1sb2FkZXI/ZXhwZXJpbWVudGFsJm9wdGlvbmFsPXJ1bnRpbWUhLi9wYWdlcy9tb2RlbHMvaW5kZXguanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jb3JlID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qc1wiKVtcImRlZmF1bHRcIl07XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcbnZhciBSb3V0ZXIgPSByZXF1aXJlKFwicmVhY3Qtcm91dGVyXCIpO1xudmFyIExpbmsgPSBSb3V0ZXIuTGluaztcblxudmFyIFRpbWVyID0gcmVxdWlyZShcImNsb2NrbWFrZXJcIikuVGltZXI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4uLy4uL3V0aWxzL2xvZGFzaFwiKSxcbiAgICBMb2FkZXIgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9sb2FkZXJcIiksXG4gICAgUmVuZGVyVXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvcmVuZGVyVXRpbHNcIiksXG4gICAgSnNvbkVkaXRvciA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL2pzb25FZGl0b3JcIiksXG4gICAgUGFnaW5hdGlvbiA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL3BhZ2luYXRpb25cIiksXG4gICAgQnV0dG9uID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvYnV0dG9uXCIpLFxuICAgIFN1Ym1pdEJ1dHRvbiA9IHJlcXVpcmUoXCIuLi8uLi9jb21wb25lbnRzL3N1Ym1pdEJ1dHRvblwiKSxcbiAgICBHdWFyZGVkU3RhdGVNaXhpbiA9IHJlcXVpcmUoXCIuLi8uLi9taXhpbnMvZ3VhcmRlZFN0YXRlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiZXhwb3J0c1wiLFxuXG4gIGNvbnRleHRUeXBlczoge1xuICAgIHJvdXRlcjogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgfSxcblxuICBtaXhpbnM6IFtHdWFyZGVkU3RhdGVNaXhpbl0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVsTmFtZTogZGVjb2RlVVJJQ29tcG9uZW50KHRoaXMuY29udGV4dC5yb3V0ZXIuZ2V0Q3VycmVudFBhcmFtcygpLmtleSksXG4gICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgZXJyb3I6IG51bGwsXG4gICAgICBwZXJQYWdlOiAxMCxcbiAgICAgIGZpbHRlcjoge30sXG4gICAgICBzb3J0OiB7fSxcbiAgICAgIHBhZ2U6IDEsXG4gICAgICBuZXdGaWx0ZXI6IHt9LFxuICAgICAgbmV3U29ydDoge30sXG4gICAgICBuZXdQZXJQYWdlOiAxMCB9O1xuICB9LFxuXG4gIF9vblJvd0NsaWNrOiBmdW5jdGlvbiBfb25Sb3dDbGljayhlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdGhpcy5jb250ZXh0LnJvdXRlci50cmFuc2l0aW9uVG8oXCJtb2RlbFJvd1wiLCB7XG4gICAgICBrZXk6IHRoaXMuY29udGV4dC5yb3V0ZXIuZ2V0Q3VycmVudFBhcmFtcygpLmtleSxcbiAgICAgIGlkOiBlLmN1cnJlbnRUYXJnZXQuaWRcbiAgICB9KTtcbiAgfSxcblxuICBfb25BZGRDbGljazogZnVuY3Rpb24gX29uQWRkQ2xpY2soZSkge1xuICAgIHRoaXMuY29udGV4dC5yb3V0ZXIudHJhbnNpdGlvblRvKFwibW9kZWxSb3dcIiwge1xuICAgICAga2V5OiB0aGlzLmNvbnRleHQucm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKS5rZXksXG4gICAgICBpZDogXCJuZXdcIlxuICAgIH0pO1xuICB9LFxuXG4gIF9vblBlclBhZ2VDaGFuZ2U6IGZ1bmN0aW9uIF9vblBlclBhZ2VDaGFuZ2UoZSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgbnVtID0gcGFyc2VJbnQoZS5jdXJyZW50VGFyZ2V0LnZhbHVlKTtcblxuICAgICAgaWYgKF9jb3JlLk51bWJlci5pc05hTihudW0pKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbmV3UGVyUGFnZTogbnVtXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBuZXdQZXJQYWdlOiBudWxsXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX29uRmlsdGVyQ2hhbmdlOiBmdW5jdGlvbiBfb25GaWx0ZXJDaGFuZ2UodmFsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBuZXdGaWx0ZXI6IEpTT04ucGFyc2UodmFsKVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbmV3RmlsdGVyOiBudWxsXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX29uU29ydENoYW5nZTogZnVuY3Rpb24gX29uU29ydENoYW5nZSh2YWwpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG5ld1NvcnQ6IEpTT04ucGFyc2UodmFsKSB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBuZXdTb3J0OiBudWxsXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX2NhblN1Ym1pdFNldHRpbmdzRm9ybTogZnVuY3Rpb24gX2NhblN1Ym1pdFNldHRpbmdzRm9ybSgpIHtcbiAgICByZXR1cm4gbnVsbCAhPT0gdGhpcy5zdGF0ZS5uZXdGaWx0ZXIgJiYgbnVsbCAhPT0gdGhpcy5zdGF0ZS5uZXdTb3J0ICYmIG51bGwgIT09IHRoaXMuc3RhdGUubmV3UGVyUGFnZTtcbiAgfSxcblxuICBfYnVpbGRUYWJsZUZpbHRlcjogZnVuY3Rpb24gX2J1aWxkVGFibGVGaWx0ZXIoKSB7XG4gICAgdmFyIGNhblN1Ym1pdCA9IHRoaXMuX2NhblN1Ym1pdFNldHRpbmdzRm9ybSgpO1xuXG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBcImRpdlwiLFxuICAgICAgeyBjbGFzc05hbWU6IFwicm93XCIgfSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwiZGl2XCIsXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcImNvbCBzMTIgbTdcIiB9LFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidWxcIixcbiAgICAgICAgICB7IGNsYXNzTmFtZTogXCJtb2RlbC1maWx0ZXJzIGNvbGxhcHNpYmxlXCIsIHJlZjogXCJxdWVyeVNldHRpbmdzXCIgfSxcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgXCJsaVwiLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImNvbGxhcHNpYmxlLWhlYWRlclwiIH0sXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHsgY2xhc3NOYW1lOiBcImZhIGZhLWdlYXJcIiB9KSxcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFwiUXVlcnkgc2V0dGluZ3NcIlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiY29sbGFwc2libGUtYm9keVwiIH0sXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgXCJmb3JtXCIsXG4gICAgICAgICAgICAgICAgeyBvblN1Ym1pdDogdGhpcy5fc3VibWl0U2V0dGluZ3NGb3JtIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJmaWx0ZXJcIiB9LFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcIkZpbHRlcjpcIlxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSnNvbkVkaXRvciwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5uZXdGaWx0ZXIsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLl9vbkZpbHRlckNoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjEwMHB4XCIsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBcIjIwMHB4XCIgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwiZmlsdGVyXCIgfSxcbiAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIixcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgXCJTb3J0OlwiXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChKc29uRWRpdG9yLCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLm5ld1NvcnQsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLl9vblNvcnRDaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogXCIxMDBweFwiLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogXCIyMDBweFwiIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImZpbHRlclwiIH0sXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCIsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFwiUGVyIHBhZ2U6XCJcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IHRoaXMuc3RhdGUubmV3UGVyUGFnZSwgb25DaGFuZ2U6IHRoaXMuX29uUGVyUGFnZUNoYW5nZSB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogXCJhY3Rpb25cIiB9LFxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTdWJtaXRCdXR0b24sIHsgbGFiZWw6IFwiQXBwbHlcIiwgZGlzYWJsZWQ6ICFjYW5TdWJtaXQgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIF9idWlsZFRhYmxlOiBmdW5jdGlvbiBfYnVpbGRUYWJsZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgY29sdW1ucyA9IHRoaXMuc3RhdGUuY29sdW1ucyxcbiAgICAgICAgcm93cyA9IHRoaXMuc3RhdGUucm93cyB8fCBbXTtcblxuICAgIHZhciBoZWFkZXIgPSBjb2x1bW5zLm1hcChmdW5jdGlvbiAoYykge1xuICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFwidGhcIixcbiAgICAgICAgbnVsbCxcbiAgICAgICAgYy5uYW1lXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgdmFyIGJvZHkgPSBudWxsO1xuICAgIGlmICh0aGlzLnN0YXRlLmxvYWRpbmcpIHtcbiAgICAgIGJvZHkgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcInRyXCIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJ0ZFwiLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChMb2FkZXIsIG51bGwpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvZHkgPSByb3dzLm1hcChmdW5jdGlvbiAocm93KSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBjb2x1bW5zLm1hcChmdW5jdGlvbiAoY29sKSB7XG5cbiAgICAgICAgICB2YXIgdmFsdWUgPSByb3dbY29sLm5hbWVdLFxuICAgICAgICAgICAgICBmbGlwVmFsdWUgPSBudWxsO1xuXG4gICAgICAgICAgLy8gaWYgdmFsdWUgaXMgYSBkYXRlXG4gICAgICAgICAgaWYgKFwiRGF0ZVwiID09PSBjb2wudHlwZSkge1xuICAgICAgICAgICAgZmxpcFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB2YWx1ZSA9IG5ldyBEYXRlKHZhbHVlKS50b1N0cmluZygpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBlbHNlIGlmIHZhbHVlIGlzIGFuIGFycmF5XG4gICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIC8vIGV4dHJhY3Qgc3ViIGtleVxuICAgICAgICAgICAgaWYgKGNvbC5zdWJLZXkpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBfLnBsdWNrKHZhbHVlLCBjb2wuc3ViS2V5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29uc3RydWN0IGxpc3RcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwibGlcIixcbiAgICAgICAgICAgICAgICB7IGtleTogdiB9LFxuICAgICAgICAgICAgICAgIHZcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YWx1ZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgIFwidWxcIixcbiAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHN0cmluZ2lmeSBvYmplY3RzXG4gICAgICAgICAgZWxzZSBpZiAoXCJvYmplY3RcIiA9PT0gdHlwZW9mIHZhbHVlKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFwidGRcIixcbiAgICAgICAgICAgIHsga2V5OiBjb2wubmFtZSwgZGF0YUZsaXBWYWx1ZTogZmxpcFZhbHVlIH0sXG4gICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICB7IGlkOiByb3cuX2lkLCBrZXk6IHJvdy5faWQsIG9uQ2xpY2s6IHNlbGYuX29uUm93Q2xpY2sgfSxcbiAgICAgICAgICB2YWx1ZXNcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciB0YWJsZUZpbHRlciA9IHRoaXMuX2J1aWxkVGFibGVGaWx0ZXIoKTtcblxuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgXCJkaXZcIixcbiAgICAgIG51bGwsXG4gICAgICB0YWJsZUZpbHRlcixcbiAgICAgIFJlbmRlclV0aWxzLmJ1aWxkRXJyb3IodGhpcy5zdGF0ZS5lcnJvciksXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFBhZ2luYXRpb24sIHtcbiAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuc3RhdGUucGFnZSxcbiAgICAgICAgcmVzdWx0c1BlclBhZ2U6IHRoaXMuc3RhdGUucGVyUGFnZSxcbiAgICAgICAgdG90YWxSZXN1bHRzOiB0aGlzLnN0YXRlLnRvdGFsUm93cyxcbiAgICAgICAgb25TZWxlY3RQYWdlOiB0aGlzLl9vblNlbGVjdFBhZ2UgfSksXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcInRhYmxlXCIsXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcImhvdmVyYWJsZSBib3JkZXJlZFwiIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJ0aGVhZFwiLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFwidHJcIixcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBoZWFkZXJcbiAgICAgICAgICApXG4gICAgICAgICksXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJ0Ym9keVwiLFxuICAgICAgICAgIG51bGwsXG4gICAgICAgICAgYm9keVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcmVzdWx0ID0gbnVsbDtcblxuICAgIGlmICghdGhpcy5zdGF0ZS5jb2x1bW5zKSB7XG4gICAgICByZXN1bHQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcImRpdlwiLFxuICAgICAgICBudWxsLFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KExvYWRlciwgeyB0ZXh0OiBcIkxvYWRpbmcgc3RydWN0dXJlXCIgfSksXG4gICAgICAgIFJlbmRlclV0aWxzLmJ1aWxkRXJyb3IodGhpcy5zdGF0ZS5lcnJvcilcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2J1aWxkVGFibGUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICB7IGNsYXNzTmFtZTogXCJwYWdlLW1vZGVsXCIgfSxcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQnV0dG9uLCB7IGljb246IFwicGx1cy1jaXJjbGVcIiwgbGFiZWw6IFwiQWRkXCIsIGNsYXNzTmFtZTogXCJhZGQtYnV0dG9uXCIsIG9uQ2xpY2s6IHRoaXMuX29uQWRkQ2xpY2sgfSksXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcImgyXCIsXG4gICAgICAgIG51bGwsXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgTGluayxcbiAgICAgICAgICB7IHRvOiBcIm1vZGVsc1wiIH0sXG4gICAgICAgICAgXCJDb2xsZWN0aW9uXCJcbiAgICAgICAgKSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBcInNwYW5cIixcbiAgICAgICAgICBudWxsLFxuICAgICAgICAgIFwiIC8gXCIsXG4gICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbE5hbWVcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIHJlc3VsdFxuICAgICk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLnF1ZXJ5U2V0dGluZ3NJbml0aWFsaXNlZCkge1xuICAgICAgJChSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnMucXVlcnlTZXR0aW5ncykpLmNvbGxhcHNpYmxlKCk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBxdWVyeVNldHRpbmdzSW5pdGlhbGlzZWQ6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gZmV0Y2ggY29sdW1uIGluZm9cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBcIi9hZG1pbi9tb2RlbHMvbW9kZWwvY29sdW1uc1wiLFxuICAgICAgZGF0YToge1xuICAgICAgICBmb3JtYXQ6IFwianNvblwiLFxuICAgICAgICBuYW1lOiB0aGlzLnN0YXRlLm1vZGVsTmFtZSB9XG4gICAgfSkuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGNvbHVtbnM6IGRhdGEuY29sdW1uc1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX2ZldGNoUm93cygpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGVycm9yOiB4aHJcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIDtcbiAgfSxcblxuICBfc3VibWl0U2V0dGluZ3NGb3JtOiBmdW5jdGlvbiBfc3VibWl0U2V0dGluZ3NGb3JtKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyByZXNldCBwYWdlXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWx0ZXI6IHRoaXMuc3RhdGUubmV3RmlsdGVyLFxuICAgICAgc29ydDogdGhpcy5zdGF0ZS5uZXdTb3J0LFxuICAgICAgcGVyUGFnZTogdGhpcy5zdGF0ZS5uZXdQZXJQYWdlLFxuICAgICAgcGFnZTogMVxuICAgIH0pO1xuXG4gICAgdGhpcy5fZmV0Y2hSb3dzKCk7XG4gIH0sXG5cbiAgX29uU2VsZWN0UGFnZTogZnVuY3Rpb24gX29uU2VsZWN0UGFnZShuZXdQYWdlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwYWdlOiBuZXdQYWdlXG4gICAgfSk7XG5cbiAgICB0aGlzLl9mZXRjaFJvd3MoKTtcbiAgfSxcblxuICBfZmV0Y2hSb3dzOiBmdW5jdGlvbiBfZmV0Y2hSb3dzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIGdpdmUgdGltZSBmb3IgdmFsdWVzIHRvIHByb3BhZ2F0ZVxuICAgIGlmIChzZWxmLl9mZXRjaFJvd3NUaW1lcikge1xuICAgICAgc2VsZi5fZmV0Y2hSb3dzVGltZXIuc3RvcCgpO1xuICAgIH1cblxuICAgIHNlbGYuX2ZldGNoUm93c1RpbWVyID0gVGltZXIoZnVuY3Rpb24gKCkge1xuXG4gICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgZXJyb3I6IG51bGwgfSk7XG5cbiAgICAgIHZhciBjb2x1bW5OYW1lcyA9IF8ucGx1Y2soc2VsZi5zdGF0ZS5jb2x1bW5zLCBcIm5hbWVcIik7XG5cbiAgICAgIC8vIGZldGNoIGNvbGxlY3Rpb24gcm93c1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiBcIi9hZG1pbi9tb2RlbHMvbW9kZWwvcm93cz9mb3JtYXQ9anNvblwiLFxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgbmFtZTogc2VsZi5zdGF0ZS5tb2RlbE5hbWUsXG4gICAgICAgICAgZmlsdGVyOiBKU09OLnN0cmluZ2lmeShzZWxmLnN0YXRlLmZpbHRlciksXG4gICAgICAgICAgc29ydDogSlNPTi5zdHJpbmdpZnkoc2VsZi5zdGF0ZS5zb3J0KSxcbiAgICAgICAgICBwZXJQYWdlOiBzZWxmLnN0YXRlLnBlclBhZ2UsXG4gICAgICAgICAgcGFnZTogc2VsZi5zdGF0ZS5wYWdlIH1cbiAgICAgIH0pLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgICAgdG90YWxSb3dzOiBkYXRhLmNvdW50LFxuICAgICAgICAgIHJvd3M6IGRhdGEucm93cyB9KTtcbiAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgICBlcnJvcjogeGhyXG4gICAgICAgIH0pO1xuICAgICAgfSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgICAgbG9hZGluZzogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LCAyMDApLnN0YXJ0KCk7XG4gIH0gfSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogL1VzZXJzL3JhbS9kZXYvanMvd2FpZ28tZnJhbWV3b3JrL3dhaWdvL34vYmFiZWwtbG9hZGVyP2V4cGVyaW1lbnRhbCZvcHRpb25hbD1ydW50aW1lIS4vcGFnZXMvbW9kZWxzL21vZGVsLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY29yZSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanNcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG52YXIgUm91dGVyID0gcmVxdWlyZShcInJlYWN0LXJvdXRlclwiKTtcbnZhciBMaW5rID0gUm91dGVyLkxpbms7XG5cbnZhciBMb2FkZXIgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9sb2FkZXJcIiksXG4gICAgQnV0dG9uID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvYnV0dG9uXCIpLFxuICAgIEpzb25FZGl0b3IgPSByZXF1aXJlKFwiLi4vLi4vY29tcG9uZW50cy9qc29uRWRpdG9yXCIpLFxuICAgIE1vZGFsID0gcmVxdWlyZShcIi4uLy4uL2NvbXBvbmVudHMvbW9kYWxcIiksXG4gICAgUmVuZGVyVXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbHMvcmVuZGVyVXRpbHNcIiksXG4gICAgR3VhcmRlZFN0YXRlTWl4aW4gPSByZXF1aXJlKFwiLi4vLi4vbWl4aW5zL2d1YXJkZWRTdGF0ZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiBcImV4cG9ydHNcIixcblxuICBjb250ZXh0VHlwZXM6IHtcbiAgICByb3V0ZXI6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gIH0sXG5cbiAgbWl4aW5zOiBbR3VhcmRlZFN0YXRlTWl4aW5dLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHZhciBwYXJhbXMgPSB0aGlzLmNvbnRleHQucm91dGVyLmdldEN1cnJlbnRQYXJhbXMoKTtcblxuICAgIHJldHVybiB7XG4gICAgICBtb2RlbE5hbWU6IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbXMua2V5KSxcbiAgICAgIGlkOiBkZWNvZGVVUklDb21wb25lbnQocGFyYW1zLmlkKSxcbiAgICAgIGVycm9yOiBudWxsIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgdmFyIGVkaXRpbmdGb3JtID0gdGhpcy5fYnVpbGRFZGl0aW5nRm9ybSgpO1xuXG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICBcImRpdlwiLFxuICAgICAgeyBjbGFzc05hbWU6IFwicGFnZS1tb2RlbFJvd1wiIH0sXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICBcImgyXCIsXG4gICAgICAgIHsgY2xhc3NOYW1lOiBcInRpdGxlXCIgfSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICBMaW5rLFxuICAgICAgICAgIHsgdG86IFwibW9kZWxcIiwgcGFyYW1zOiB7IGtleTogdGhpcy5zdGF0ZS5tb2RlbE5hbWUgfSB9LFxuICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWxOYW1lXG4gICAgICAgICksXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBcIiAvIFwiLFxuICAgICAgICAgIHRoaXMuc3RhdGUuaWRcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIFJlbmRlclV0aWxzLmJ1aWxkRXJyb3IodGhpcy5zdGF0ZS5lcnJvciksXG4gICAgICBlZGl0aW5nRm9ybVxuICAgICk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuX2xvYWQoKTtcbiAgfSxcblxuICBfYnVpbGRFZGl0aW5nRm9ybTogZnVuY3Rpb24gX2J1aWxkRWRpdGluZ0Zvcm0oKSB7XG4gICAgdmFyIGpzb24gPSB0aGlzLnN0YXRlLmpzb247XG5cbiAgICBpZiAodW5kZWZpbmVkID09PSBqc29uKSB7XG4gICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChMb2FkZXIsIHsgdGV4dDogXCJMb2FkaW5nIGRhdGFcIiB9KTtcbiAgICB9XG5cbiAgICB2YXIgZGVsZXRlQnV0dG9uID0gbnVsbCxcbiAgICAgICAgc2F2ZUJ0bkxhYmVsID0gXCJDcmVhdGVcIjtcblxuICAgIGlmIChcIm5ld1wiICE9PSB0aGlzLnN0YXRlLmlkKSB7XG4gICAgICBzYXZlQnRuTGFiZWwgPSBcIlVwZGF0ZVwiO1xuXG4gICAgICBkZWxldGVCdXR0b24gPSBSZWFjdC5jcmVhdGVFbGVtZW50KEJ1dHRvbiwgeyBsYWJlbDogXCJEZWxldGVcIiwgY29sb3I6IFwicmVkXCIsIG9uQ2xpY2s6IHRoaXMuX3Nob3dEZWxldGVNb2RhbCB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgIFwiZGl2XCIsXG4gICAgICBudWxsLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChKc29uRWRpdG9yLCB7XG4gICAgICAgIG9uQ2hhbmdlOiB0aGlzLl9vbkRhdGFDaGFuZ2UsXG4gICAgICAgIHZhbHVlOiBqc29uLFxuICAgICAgICBoZWlnaHQ6IFwiNDAwcHhcIixcbiAgICAgICAgcmVmOiBcImVkaXRvclwiIH0pLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgXCJkaXZcIixcbiAgICAgICAgeyBjbGFzc05hbWU6IFwiYWN0aW9uc1wiIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQnV0dG9uLCB7IGxhYmVsOiBzYXZlQnRuTGFiZWwsIGRpc2FibGVkOiAhanNvbiwgb25DbGljazogdGhpcy5fc2F2ZSB9KSxcbiAgICAgICAgZGVsZXRlQnV0dG9uXG4gICAgICApLFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgTW9kYWwsXG4gICAgICAgIHtcbiAgICAgICAgICByZWY6IFwiZGVsZXRlTW9kYWxcIixcbiAgICAgICAgICBpZDogXCJkZWxldGVEb2NNb2RhbFwiLFxuICAgICAgICAgIGFjdGlvbnM6IFtcIlllc1wiLCBcIk5vXCJdLFxuICAgICAgICAgIG9uQWN0aW9uOiB0aGlzLl9vbkRlbGV0ZU1vZGFsQWN0aW9uIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgXCJzcGFuXCIsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgdGhpcyBkb2N1bWVudCBmcm9tIHRoZSBjb2xsZWN0aW9uP1wiXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9LFxuXG4gIF9vbkRhdGFDaGFuZ2U6IGZ1bmN0aW9uIF9vbkRhdGFDaGFuZ2UoZGF0YSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIganNvbiA9IEpTT04ucGFyc2UoZGF0YSk7XG5cbiAgICAgIC8vIG11c3Qgbm90IGJlIGVtcHR5IG9iamVjdFxuICAgICAgaWYgKCFqc29uIHx8ICFfY29yZS5PYmplY3Qua2V5cyhqc29uKS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBqc29uOiBkYXRhXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBqc29uOiBudWxsXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX2xvYWQ6IGZ1bmN0aW9uIF9sb2FkKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIGlmIGNyZWF0aW5nIGEgbmV3IGl0ZW0gdGhlbiBubyBuZWVkIHRvIGZldGNoIGRhdGEgdG8gc3RhcnQgd2l0aFxuICAgIGlmIChcIm5ld1wiID09PSB0aGlzLnN0YXRlLmlkKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGpzb246IHt9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBcIi9hZG1pbi9tb2RlbHMvbW9kZWwvZG9jXCIsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGZvcm1hdDogXCJqc29uXCIsXG4gICAgICAgIG5hbWU6IHRoaXMuc3RhdGUubW9kZWxOYW1lLFxuICAgICAgICBpZDogdGhpcy5zdGF0ZS5pZCB9XG4gICAgfSkuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgdmFyIGRvYyA9IEpTT04ucGFyc2UoZGF0YS5kb2MpO1xuXG4gICAgICAvLyByZW1vdmUgaWQgYXR0cmlidXRlXG4gICAgICBkZWxldGUgZG9jLl9pZDtcblxuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGpzb246IGRvY1xuICAgICAgfSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbiAoeGhyKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgZXJyb3I6IHhoclxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgO1xuICB9LFxuXG4gIF91cGRhdGU6IGZ1bmN0aW9uIF91cGRhdGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzdWJtaXR0aW5nOiB0cnVlLFxuICAgICAgZXJyb3I6IG51bGxcbiAgICB9KTtcblxuICAgICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiUFVUXCIsXG4gICAgICB1cmw6IFwiL2FkbWluL21vZGVscy9tb2RlbC9kb2M/Zm9ybWF0PWpzb24mbmFtZT1cIiArIHRoaXMuc3RhdGUubW9kZWxOYW1lICsgXCImaWQ9XCIgKyB0aGlzLnN0YXRlLmlkLFxuICAgICAgZGF0YToge1xuICAgICAgICBkb2M6IHRoaXMuc3RhdGUuanNvblxuICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgTWF0ZXJpYWxpemUudG9hc3QoXCJVcGRhdGUgc3VjY2Vzc2Z1bFwiLCAyMDAwLCBcInJvdW5kZWRcIik7XG4gICAgfSkuZmFpbChmdW5jdGlvbiAoeGhyKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgZXJyb3I6IHhoclxuICAgICAgfSk7XG4gICAgfSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuc2V0U3RhdGVJZk1vdW50ZWQoe1xuICAgICAgICBzdWJtaXR0aW5nOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX2NyZWF0ZTogZnVuY3Rpb24gX2NyZWF0ZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHN1Ym1pdHRpbmc6IHRydWUsXG4gICAgICBlcnJvcjogbnVsbFxuICAgIH0pO1xuXG4gICAgJC5hamF4KHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICB1cmw6IFwiL2FkbWluL21vZGVscy9tb2RlbC9kb2M/Zm9ybWF0PWpzb24mbmFtZT1cIiArIHRoaXMuc3RhdGUubW9kZWxOYW1lLFxuICAgICAgZGF0YToge1xuICAgICAgICBkb2M6IHRoaXMuc3RhdGUuanNvblxuICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIE1hdGVyaWFsaXplLnRvYXN0KFwiQ3JlYXRlIHN1Y2Nlc3NmdWxcIiwgMjAwMCwgXCJyb3VuZGVkXCIpO1xuXG4gICAgICB2YXIgZG9jID0gSlNPTi5wYXJzZShkYXRhLmRvYyksXG4gICAgICAgICAgaWQgPSBkb2MuX2lkO1xuXG4gICAgICBkZWxldGUgZG9jLl9pZDtcblxuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGlkOiBpZCxcbiAgICAgICAganNvbjogZG9jIH0pO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGVycm9yOiB4aHJcbiAgICAgIH0pO1xuICAgIH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgc3VibWl0dGluZzogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIF9zYXZlOiBmdW5jdGlvbiBfc2F2ZSgpIHtcbiAgICBpZiAoXCJuZXdcIiA9PT0gdGhpcy5zdGF0ZS5pZCkge1xuICAgICAgdGhpcy5fY3JlYXRlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VwZGF0ZSgpO1xuICAgIH1cbiAgfSxcblxuICBfZGVsZXRlOiBmdW5jdGlvbiBfZGVsZXRlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc3VibWl0dGluZzogdHJ1ZSxcbiAgICAgIGVycm9yOiBudWxsIH0pO1xuXG4gICAgJC5hamF4KHtcbiAgICAgIG1ldGhvZDogXCJERUxFVEVcIixcbiAgICAgIHVybDogXCIvYWRtaW4vbW9kZWxzL21vZGVsL2RvYz9mb3JtYXQ9anNvbiZuYW1lPVwiICsgdGhpcy5zdGF0ZS5tb2RlbE5hbWUgKyBcIiZpZD1cIiArIHRoaXMuc3RhdGUuaWQgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICBNYXRlcmlhbGl6ZS50b2FzdChcIkRlbGV0ZSBzdWNjZXNzZnVsXCIsIDIwMDAsIFwicm91bmRlZFwiKTtcblxuICAgICAgc2VsZi5jb250ZXh0LnJvdXRlci50cmFuc2l0aW9uVG8oXCJtb2RlbFwiLCB7XG4gICAgICAgIGtleTogc2VsZi5jb250ZXh0LnJvdXRlci5nZXRDdXJyZW50UGFyYW1zKCkua2V5IH0pO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKHhocikge1xuICAgICAgc2VsZi5zZXRTdGF0ZUlmTW91bnRlZCh7XG4gICAgICAgIGVycm9yOiB4aHJcbiAgICAgIH0pO1xuICAgIH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnNldFN0YXRlSWZNb3VudGVkKHtcbiAgICAgICAgc3VibWl0dGluZzogZmFsc2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIF9zaG93RGVsZXRlTW9kYWw6IGZ1bmN0aW9uIF9zaG93RGVsZXRlTW9kYWwoKSB7XG4gICAgdGhpcy5yZWZzLmRlbGV0ZU1vZGFsLm9wZW4oKTtcbiAgfSxcblxuICBfb25EZWxldGVNb2RhbEFjdGlvbjogZnVuY3Rpb24gX29uRGVsZXRlTW9kYWxBY3Rpb24oYWN0aW9uKSB7XG4gICAgaWYgKFwieWVzXCIgPT09IGFjdGlvbi50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICB0aGlzLl9kZWxldGUoKTtcbiAgICB9XG4gIH0gfSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogL1VzZXJzL3JhbS9kZXYvanMvd2FpZ28tZnJhbWV3b3JrL3dhaWdvL34vYmFiZWwtbG9hZGVyP2V4cGVyaW1lbnRhbCZvcHRpb25hbD1ydW50aW1lIS4vcGFnZXMvbW9kZWxzL3Jvdy5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImFkbWluLm1vZGVscy5qcyJ9