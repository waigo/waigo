# Creating plugins

Creating and publishing a plugin is as simple as creating and publishing an 
NPM module.

Please follow these general guidelines:

1. Check to see if what you've made is worth putting into a plugin. For instance 
it's very easy to re-use existing [koa](http://koajs.com) middleware in Waigo without 
needing to create plugins.
2. Add automated unit tests for your plugin. Look at existing plugins to learn 
best practices.
3. Ensure your plugin name is prefixed with `waigo-plugin-` so that other users 
of Waigo can easily find it and use it. This is also the default convention used 
by Waigo's module loader to scan for available plugins. 
4. In your plugin's `package.json`:
  * Ensure the `main` key is set to `index.js`. Create a dummy `index.js` in your 
  plugin's project folder.
  * Add `waigoplugin` to the `keywords` list to help with discoverability.
5. Write a good `README.md` for your plugin explaining what it's for and how to use it.

To see a list of all available plugins visit 
[https://www.npmjs.org/browse/keyword/waigoplugin](https://www.npmjs.org/browse/keyword/waigoplugin).
