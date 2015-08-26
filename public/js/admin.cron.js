webpackJsonp([0],{0:function(e,t,a){"use strict";var n=a(20),s=a(17),r=a(5),l=a(9),i=a(18),o=a(16),c=a(25),m=a(26),u=n.createClass({displayName:"App",mixins:[o],getInitialState:function(){return{loading:!0,tasks:[]}},render:function(){var e=this._buildList(),t=this.state.taskRunning?n.createElement(l,null):null;return n.createElement("div",{className:"page-cron"},n.createElement("h2",null,"Cron tasks"),t,i.buildError(this.state.error),e)},componentDidMount:function(){var e=this;$.ajax({url:"/admin/cron",data:{format:"json"}}).done(function(t){e.setStateIfMounted({tasks:s.values(t.tasks)})}).fail(function(t){e.setStateIfMounted({error:t})}).always(function(){e.setStateIfMounted({loading:!1})})},_setItem:function(e){this.state.tasks.forEach(function(t){t._id===e._id&&s.extend(t,e)}),this.forceUpdate()},_buildList:function(){var e=this;if(this.state.loading)return n.createElement(l,null);var t=this.state.tasks.map(function(t){return{label:n.createElement(c,{item:t}),body:n.createElement(m,{item:t,reloadItem:e._setItem})}});return n.createElement(r,{items:t})}});n.render(n.createElement(u,null),document.getElementById("react-root"))},25:function(e,t,a){"use strict";{var n=a(20);a(21)}e.exports=n.createClass({displayName:"exports",propTypes:{item:n.PropTypes.object},getDefaultProps:function(){return{item:null}},render:function(){var e=this.props.item,t="status "+(e.disabled?"inactive":"active");return n.createElement("span",{className:"item-label"},n.createElement("span",{className:t},e.name))}})},26:function(e,t,a){"use strict";var n=a(20),s=(a(21),a(22)),r=a(3),l=a(14),i=a(9),o=a(18),c=a(16);e.exports=n.createClass({displayName:"exports",mixins:[c],propTypes:{item:n.PropTypes.object,reloadItem:n.PropTypes.func},getInitialState:function(){return{loading:!1,error:null}},render:function(){var e=this.props.item;if(e.lastRun)var t=n.createElement("span",null,n.createElement("span",{className:"date",title:e.lastRun.when},s(e.lastRun.when).fromNow()),n.createElement("span",{className:"by"},e.lastRun.by.length?e.lastRun.by:""));else var t="never";if(e.disabled)var a=n.createElement("em",null,"Inactive");else var a=n.createElement("span",{className:"date",title:e.nextRun},s(e.nextRun).fromNow());var c=this.state.loading?n.createElement(i,null):null;return n.createElement("div",{className:"item-body"},n.createElement("div",{className:"row"},n.createElement("div",{className:"col m12 s12"},n.createElement("div",{className:"row"},n.createElement("div",{className:"item-label col m2 s12"},"Schedule:"),n.createElement("div",{className:"schedule col m1 s12"},e.schedule),n.createElement("div",{className:"item-toggle col m9 s12"},n.createElement(l,{data:e,onChange:this._updateStatus,initiallyOn:!e.disabled}))),n.createElement("div",{className:"row"},n.createElement("div",{className:"item-label col m2 s12"},"Last run:"),n.createElement("div",{className:"lastRun col m10 s12"},t)),n.createElement("div",{className:"row"},n.createElement("div",{className:"item-label col m2 s12"},"Next run:"),n.createElement("div",{className:"nextRun col m10 s12"},a)))),n.createElement(r,{label:"Run now",onClick:this._run}),c,o.buildError(this.state.error))},_updateStatus:function(e){var t=this;t.setState({error:null,loading:!0}),$.ajax({method:"POST",url:"/admin/cron/updateStatus?format=json",data:{name:this.props.item.name,active:e}}).done(function(e){Materialize.toast("Status updated",2e3,"rounded"),t.props.reloadItem(e.task)}).fail(function(e){t.setStateIfMounted({error:e})}).always(function(){t.setStateIfMounted({loading:!1})})},_run:function(e){var t=this;e.preventDefault(),t.setState({loading:!0,error:null}),$.ajax({method:"POST",url:"/admin/cron/run?format=json",data:{name:this.props.item.name}}).done(function(e){Materialize.toast("Run successful",2e3,"rounded"),t.props.reloadItem(e.task)}).fail(function(e){t.setStateIfMounted({error:e})}).always(function(){t.setStateIfMounted({loading:!1})})}})}});