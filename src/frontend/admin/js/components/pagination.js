var React = require('react');
var pagination = require('pagination');


module.exports = React.createClass({
  propTypes: {
    currentPage : React.PropTypes.number,
    resultsPerPage: React.PropTypes.number,
    totalResults: React.PropTypes.number,
    pageLinks: React.PropTypes.number,
    onSelectPage: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
      currentPage : 1,
      resultsPerPage: 1,
      totalResults: 1,
      pageLinks: 10,
      onSelectPage: null,
    };
  },

  _onSelectPage: function(e) {
    e.preventDefault();

    if (this.props.onSelectPage) {
      var newPage = e.currentTarget.dataset.page;

      // if page empty (i.e. disabled button) then do nothing
      if (!newPage || !newPage.length) {
        return;
      } 

      newPage = parseInt(newPage);

      if (newPage === this.props.currentPage) {
        return;
      }

      this.props.onSelectPage( newPage );
    }
  },


  render: function() {
    var self = this;

    var p = new pagination.SearchPaginator({
      prelink:'/', 
      pageLinks: this.props.pageLinks,
      current: this.props.currentPage, 
      rowsPerPage: this.props.resultsPerPage, 
      totalResult: this.props.totalResults,
    }).getPaginationData();

    var leftCssClass = (!p.previous) ? 'disabled' : 'waves-effect';
    var rightCssClass = (!p.next) ? 'disabled' : 'waves-effect';

    // if range empty then we want a single page
    if (p.current && !p.range.length) {
      p.range = [1];
    }

    var pageNumbers = p.range.map(function(n) {
      var cssClass = (p.current === n) ? 'active' : 'waves-effect';

      return (
        <li className={cssClass}>
          <a href="#!" onClick={self._onSelectPage} data-page={n}>{n}</a>
        </li>
      );
    });

    return (
      <ul className="pagination">
        <li className={leftCssClass}>
          <a href="#!" onClick={self._onSelectPage} data-page={p.previous}>
            <i className="mdi-navigation-chevron-left"></i>
          </a>
        </li>
        {pageNumbers}
        <li className={rightCssClass}>
          <a href="#!" onClick={self._onSelectPage} data-page={p.next}>
            <i className="mdi-navigation-chevron-right"></i>
          </a>
        </li>
      </ul>
    );
  },
});

