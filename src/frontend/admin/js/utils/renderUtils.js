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
          // if (json.stack) {
          //   lines = lines.concat(
          //     json.stack.map(v => <p>{v}</p>)
          //   );
          // }
          // // just got msg
          // else if (json.msg) {
            lines.push(<p>{json.msg}</p>);
          // }

          // add any other remaining data
          if (json.details) {
            for (var k in json.details) {
              lines.push(<p><strong>{k}</strong></p>);

              var detailsJSON = 
                JSON.stringify(json.details[k], null, 2).split("\n");

              detailsJSON.forEach(function(d) {
                lines.push(<pre>{d}</pre>);
              });
            }
          }
        }
      } else {
        lines.push(<strong>{err}</strong>);
      }

      return(
        <div className="msg">
          <div className="panel error">
            <div className="panel-heading">
              <div className="panel-title">{lines.shift()}</div>
            </div>
            <div className="panel-body">{lines}</div>
          </div>
        </div>
      );

    } else {
      return '';
    }
  }
};