# Multi-process clustering

Waigo has built-in support for Node's clustering solution. This means you can tell Waigo to parallelize your app by running identical instances of it in  multiple _worker_ processes. This means you can split incoming request load and other work across several processes (and thus CPU cores).

When you start your Waigo app you will see as the very first log output:

```bash
$ ./start-app.js

No. of worker processes: 1
[worker1] started, pid: 87064
```

_Note: [start-app.js](https://github.com/waigo/waigo/blob/master/start-app.js) which actually launches and manages the worker processes for your app._

As shown above, only one worker process is launched by default, as this aids development. But you can override this setting with the `WAIGO_WORKERS` environment variable:

```bash
$ WAIGO_WORKERS=4 ./start-app.js
No. of worker processes: 4
[worker1] started, pid: 87236
[worker2] started, pid: 87237
[worker4] started, pid: 87239
[worker3] started, pid: 87238
```

You will notice every log line output during the startup phase gets repeated 4 times, one for each worker. Each log line has the worker pid in it, so that you can know which line came from which process:

```bash
(RamMacbookPro.local-87236) [2016-08-08 00:48:58.389] [DEBUG] [app] - Running startup step: db
...
(RamMacbookPro.local-87237) [2016-08-08 00:48:58.408] [DEBUG] [app] - Running startup step: db
...
(RamMacbookPro.local-87238) [2016-08-08 00:48:58.416] [DEBUG] [app] - Running startup step: db
...
(RamMacbookPro.local-87239) [2016-08-08 00:48:58.423] [DEBUG] [app] - Running startup step: db
```

## Best practices

When using clustering it is important to ensure that your app is architected such that no app-level data is stored within the process itself. This is because **you cannot control which worker processs serves which user.** A user may get served by worker 1 for a request, and then later get served by worker 2 for another request.

For example, if you need to store session data for a user then put this into your database or another storage area accessible to all of your worker processes. 

Generally speaking, do not store any app-level data within your Waigo process. This is good practice whether you're using clustering or not.