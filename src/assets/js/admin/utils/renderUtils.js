var React = require('react');

module.exports = {
  buildError: function(err) {
    if (err) {
      console.error(err);

      var lines = [];

      // is XHR object?
      if (undefined !== err.status && undefined !== err.statusText) {
        // XHR error
        var errorMsg = `Error (${err.status}) - ${err.statusText}`;

        lines.push(<strong>{errorMsg}</strong>);

        // server returned JSON error?
        var json = err.responseJSON;
        if (json) {
          lines.push(<p />);

          // got stack too?
          if (json.stack) {
            lines = lines.concat(
              json.stack.map(v => <p>{v}</p>)
            );
          }
          // just got msg
          else if (json.msg) {
            lines.push(<p>{json.msg}</p>);
          }
        }
      } else {
        lines = (<strong>{err}</strong>);
      }

      return <div className="alert alert-danger">{lines}</div>
    } else {
      return '';
    }
  }
};