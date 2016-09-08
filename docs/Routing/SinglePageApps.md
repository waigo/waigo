# Single-page app routing

If you are developing a single-page app and using the [History API](https://css-tricks.com/using-the-html5-history-api/) to enable [non-hash URLs](http://ericclemmons.com/angular/using-html5-not-hash-routes/) then you will want all routes to be handled by the single-page front-end code. You will most likely just have a single controller method which renders the front-end:

```js
// file: <project folder>/src/controllers/index.js
"use strict"

exports.main = function*() {
  yield this.render('index');
}
```

However, if the user refreshes the browser page then it is important that the above method gets invoked no matter what URL path they are currently viewing. If you're not using hash URLs then the full URL path will be sent to the Waigo backend. Thus you will need to map all the following route paths to the above controller method:

```
/
/path1
/path1/
/path1/path2
/path1/path2/
...etc
/path1/path2/..../pathN/
```

Although you can use regular expressions in your route paths you cannot use them to express the above patterns in a single line, i.e. you cannot do this:

```js
/(.*)
```

*Note: This is a limitation of the [koa-trie-router](https://github.com/koajs/trie-router), on which Waigo depends.*

However, because Waigo routes are defined as Javascript source and not JSON, you can use iteration logic to dynamically generate the above routes paths as such:

```
// file: <project folder>/routes/index.js
"use strict"

const routes = module.exports = {
  '/': {
    GET: 'index.main'
  }
};

/*
Generate the paths...

/:path1
/:path1/
/:path1/:path2
/:path1/:path2/
...etc
/:path1/:path2/:path3/:path4/:path5/
*/
let str = '';
for (let i=1; 5>=i; ++i) {
  str += `/:path${i}`;
  
  routes[str] = {
    GET: 'index.main'
  };

  routes[`${str}/`] = {
    GET: 'index.main'
  };
}
```

If your paths go deeper than 5 levels (as shown above) you can just increase the number of loops to match the number of levels needed.

Dynamically generating the routes paths as shown above makes it easier for you to make changes in future.

