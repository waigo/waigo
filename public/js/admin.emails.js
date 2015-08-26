webpackJsonp([1],{0:function(e,t,s){"use strict";var r=s(20),a=s(17),n=s(27),l=s(28),c=r.createClass({displayName:"App",getInitialState:function(){return{users:[],template:""}},addUser:function(e){var t=a.find(this.state.users,function(t){return t._id===e._id});t||this.setState({users:this.state.users.concat([e])})},removeUser:function(e){e._id&&(e=e._id);var t=this.state.users.filter(function(t){return t._id!==e});this.setState({users:t})},clearUsers:function(){this.setState({users:[]})},render:function(){return r.createElement("div",{className:"row page-emails"},r.createElement("div",{className:"col s12"},r.createElement("ul",{className:"tabs"},r.createElement("li",{className:"tab col s3"},r.createElement("a",{className:"active",href:"#users"},r.createElement("span",{"class":"badge"},"1.")," Select users")),r.createElement("li",{className:"tab col s3"},r.createElement("a",{href:"#send"},r.createElement("span",{"class":"badge"},"2.")," Send")))),r.createElement("section",{className:"tab-content"},r.createElement("div",{id:"users",className:"col s12"},r.createElement(n,{users:this.state.users,addUser:this.addUser,removeUser:this.removeUser,clearUsers:this.clearUsers})),r.createElement("div",{id:"send",className:"col s12"},r.createElement(l,{users:this.state.users}))))}});r.render(r.createElement(c,null),document.getElementById("react-root"))},27:function(e,t,s){"use strict";var r=s(20),a=s(3),n=s(11);e.exports=r.createClass({displayName:"exports",propTypes:{users:r.PropTypes.array,addUser:r.PropTypes.func},getDefaultProps:function(){return{users:[],addUser:null}},onRowClick:function(e){this.props.addUser(e)},render:function(){var e=this,t=[{name:"username"}],s=r.createElement("em",null,"None selected");return this.props.users.length&&(s=this.props.users.map(function(t){return r.createElement("li",{className:"collection-item"},t.username,r.createElement("a",{href:"#!",className:"secondary-content","data-id":t._id,onClick:e._onRemoveUser},r.createElement("i",{className:"fa fa-remove"})))}),s=r.createElement("div",null,r.createElement(a,{label:"Clear all",size:"small",onClick:this._onClear}),r.createElement("ul",{className:"collection"},s))),r.createElement("div",{className:"row"},r.createElement("div",{className:"col s12 m5"},r.createElement(n,{modelName:"User",columns:t,excludeRows:this.props.users,onRowClick:this.onRowClick})),r.createElement("div",{className:"col s12 m6 offset-m1 selected-users"},r.createElement("h2",null,"Selected users:"),s))},_onRemoveUser:function(e){e.preventDefault(),this.props.removeUser(e.currentTarget.dataset.id)},_onClear:function(){this.props.clearUsers()}})},28:function(e,t,s){"use strict";var r=s(20),a=s(19).Timer,n=s(18),l=s(16),c=s(3),i=s(9),o=s(15);e.exports=r.createClass({displayName:"exports",mixins:[l],getInitialState:function(){return{subject:"",body:"",subjectPreview:"",bodyPreview:"",loading:!1,sending:!1,error:null,sendError:null}},propTypes:{users:r.PropTypes.array},getDefaultProps:function(){return{users:[]}},render:function(){var e=this.props.users.length;if(!e)return r.createElement("em",null,"Please select some users to send to.");var t="{{...}}",s=r.createElement("p",{className:"tips"},"NOTE: All app-level locals as well as ",r.createElement("code",null,"recipient")," are available as template variables. Use ",r.createElement("code",null,t)," syntax to insert."),a=null;return this.state.loading&&(a=r.createElement(i,{size:"small",inline:!0})),r.createElement("form",{className:"content-send"},s,r.createElement("div",{className:"row"},r.createElement("div",{className:"col m6 s12 fields"},r.createElement("h2",null,"Markdown"),r.createElement("input",{type:"text",className:"subject",onKeyUp:this._onSubjectChange,placeholder:"Subject",ref:"subject"}),r.createElement(o,{height:"400px",onChange:this._onBodyChange,ref:"body"})),r.createElement("div",{className:"col m6 m-offset1 s12 preview"},r.createElement("h2",null,r.createElement("span",null,"Preview"),a),n.buildError(this.state.error),r.createElement("input",{type:"text",readonly:!0,value:this.state.subjectPreview,placeholder:"Subject preview..."}),r.createElement("div",{className:"body",dangerouslySetInnerHTML:{__html:this.state.bodyPreview}}))),this._buildSendButton())},_buildSendButton:function(){var e=this.props.users.length,t=null,s=null,a="Send to "+e+" "+(1==e?"user":"users");return this.state.sending?(t=r.createElement(c,{label:a,disabled:!0}),s=r.createElement(i,{inline:!0})):t=r.createElement(c,{label:a,onClick:this._onSend}),r.createElement("div",{className:"send-info"},t,r.createElement("div",{className:"send-result"},s,n.buildError(this.state.sendError)))},_onSubjectChange:function(e){this.setState({subject:e.currentTarget.value}),this._fetchPreview()},_onBodyChange:function(e){this.setState({body:e}),this._fetchPreview()},_fetchPreview:function(){var e=this;this.props.users.length&&(e._fetchPreviewTimer&&e._fetchPreviewTimer.stop(),e._fetchPreviewTimer=a(function(){e.setState({loading:!0,error:null}),$.ajax({url:"/admin/emails/render?format=json",method:"POST",data:{subject:e.state.subject,body:e.state.body,user:e.props.users[0]._id}}).done(function(t){e.setStateIfMounted({subjectPreview:t.subject||"",bodyPreview:t.body||""})}).fail(function(t){e.setStateIfMounted({error:t})}).always(function(){e.setStateIfMounted({loading:!1})})},300).start())},_onSend:function(){var e=this;this.props.users.length&&(this.setState({sending:!0,sendError:null}),$.ajax({url:"/admin/emails/send?format=json",method:"POST",data:{subject:e.state.subject,body:e.state.body,users:e.props.users.map(function(e){return e._id})}}).done(function(){Materialize.toast("Email succesfully sent",2e3,"rounded"),e.refs.body.clear(),r.findDOMNode(e.refs.subject).value="",e.setStateIfMounted({subject:"",body:"",subjectPreview:"",bodyPreview:""})}).fail(function(t){e.setStateIfMounted({sendError:t})}).always(function(){e.setStateIfMounted({sending:!1})}))}})}});