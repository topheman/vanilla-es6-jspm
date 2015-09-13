yuidoc-theme-topheman
=====================

My yuidoc theme, inspired by [royriojas/yuidoc-theme-blue](https://github.com/royriojas/yuidoc-theme-blue)

Usage
=====

###Install yuidoc

Globally

`````
npm install -g yuidocjs
`````

Or locally

`````
npm install yuidocjs --save-dev
`````

###Configure

####With yuidoc.json

`yuidoc.json` example:

```
{
  "name": "twitter-stream-channels",
  "description": "Manage multiple channel search on the same Twitter Stream",
  "url": "http://labs.topheman.com/",
  "options": {
    "linkNatives": "true",
    "attributesEmit": "false",
    "selleck": "false",
    "paths": [
      "./lib",
      "./mocks"
    ],
    "outdir": "./yuidoc",
    "themedir" : "./extras/yuidoc-theme-topheman"
  }
}
```

####Inside package.json

You can put yuidoc's configuration metadata directly inside your `package.json`, so that yuidoc will have directly access to your version, description and name.

Just add a `yuidoc` entry in your `package.json`, like that:

```
  "yuidoc":{
    "options": {
      "linkNatives": "true",
      "attributesEmit": "false",
      "selleck": "false",
      "paths": [
        "./lib",
        "./mocks"
      ],
      "outdir": "./yuidoc",
      "themedir" : "./extras/yuidoc-theme-topheman"
    }
  }
```

###Command

####Using yuidoc.json

From global yuidoc

```
yuidoc -c yuidoc.json --project-version 0.2.4
```

From local yuidoc

```
node_modules/.bin/yuidoc -c yuidoc.json --project-version 0.2.4
```

####Using package.json

From global yuidoc

```
yuidoc
```

From local yuidoc

```
node_modules/.bin/yuidoc
```
