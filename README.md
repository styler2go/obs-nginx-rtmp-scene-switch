# Requirements

For this to work you will need an nginx server which has it's rtmp stats page exposed to at least the device you are running this from.

Example nginx stats config could look like this:

```
http {
    include             mime.types;
    default_type        application/octet-stream;

    sendfile            on;
    keepalive_timeout   65;

    server {
        listen          88;
        server_name     localhost;

        # rtmp stat
        location /stat {
            rtmp_stat all;
            rtmp_stat_stylesheet stat.xsl;
        }
        location /stat.xsl {
            # you can move stat.xsl to a different location
            root html;
        }
    }
}
```

# Usage

## Starting up

Set up your configuration correctly and simply use `node nginx-watcher` and you are good to go.

## Configuration

If the configuration is not self-explanatory, here are some explanations:

|Config|Mandatory|Type|Explanation|Default|
|---|---|---|---|---|
|nginx.url|**yes**|string|URL to your ngins stats page|None|
|nginx.application|**yes**|string|Application name of your stream|None|
|nginx.stream|**yes**|string|Stream name of your stream|None|
|minBandwith|no|int|The minimum bandwith at which it will switch the scene if below this value|3000|
|delayInSecods|no|int|Defines how quickly the scene-change will happen in seconds.|10|
|obs.socket.url|no|string|Your obs websocket endpoint|localhost:4444|
|obs.socket.password|no|string|Your websocket password, if you have one|""|
|obs.scenes.good|**yes**|string|Name of the scene when everything is fine|None|
|obs.scenes.bad|**yes**|string|Name of the scene when bitrate is bad|None|

Save your configuration as `config.json`.

# Need help?

You can find me at `https://discord.gg/Zj8y55G` or open an issue on here
