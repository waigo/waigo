# Rendering output

When rendering output from your routes you will normally use [view templates](../ViewTemplates/). However, Waigo supports dynamically rendering to different output formats from each route without having to modify the controller-view logic for each route. 

Thus you can easily build routes which can be re-used for outputting JSON as well as webpages. Nowadays many apps use a Single-Page Architecture (SPA) or provide REST APIs - output formats reduce the pain of building these. 

* [Enabling](Enabling.md)
* [Rendering methods](RenderingMethods.md)
* [JSON output](JsonOutput.md)
* [Setting the output format](SettingOutputFormat.md)
* [Custom formats](CustomFormats.md)
