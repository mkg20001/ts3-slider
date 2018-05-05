# ts3-slider

TeamSpeak3 Slider for your website

## Usage

First put the files in `public/` somewhere on your webserver and embed them onto your website

Next install the ts3-slider app on your server `$ npm i -g ts3-slider`

Now create a config:

```json
{
  "host": "your-server.de",
  "port": 10011,
  "user": "serveradmin",
  "pw": "SECRET",
  "vServer": 1
}
```

You can now launch the server using `$ CONFIG=/path/to/your/config.json ts3-slider`
