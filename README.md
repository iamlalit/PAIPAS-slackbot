# PAIPAS-slackbot

//node_modules/slackbot/index.js
```
postMessage(id, text, thread, params) {
    params = extend({
        text: text,
        channel: id,
        thread_ts: thread
    }, params || {});

    return this._api('chat.postMessage', params);
}
```
