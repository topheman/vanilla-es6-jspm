vanilla-es6-jspm
================

[![Build Status](https://travis-ci.org/topheman/vanilla-es6-jspm.svg?branch=master)](https://travis-ci.org/topheman/vanilla-es6-jspm)
[![Sauce Test Status](https://saucelabs.com/buildstatus/vanilla-es6-jspm)](https://saucelabs.com/u/vanilla-es6-jspm)
[![devDependency Status](https://david-dm.org/topheman/vanilla-es6-jspm/dev-status.svg)](https://david-dm.org/topheman/vanilla-es6-jspm#info=devDependencies)

**ES6** is here and you can't avoid it. We have great tools to make it work, one of them is **jspm**.

jspm is great but all-in-one yeoman generators or seed projects (with build/sass/livereload/sourcemaps/unit-tests ...) are still lacking, so I decided to make my own angular/ES6/jspm stack.

This project is the first step: a **vanillaJS/ES6/jspm boilerplate** ([more infos on the Wiki](https://github.com/topheman/vanilla-es6-jspm/wiki)).

* [Requirements](#requirements) / [Installation](#installation) / [Launch](#launch)
* [Build](#build) / [Test](#test)
* [Git workflow & Continuous Integration](#git-workflow--continuous-integration)
* [Generate Docs](#generate-docs)
* [Deployment](#deployment) / [Folder organization](#folder-organization)

##Features

* Simple ES6 app using basic **ES6 features**
	* so that you won't have to struggle to understand the code base
	* but advanced enough to be used as an example
* Use **ES6 Modules** via [SystemJS module loader](https://github.com/systemjs/systemjs) (built on top of [ES6 Module Loader Polyfill](https://github.com/ModuleLoader/es6-module-loader))
* Manage development and production workflow with [jspm](http://jspm.io/), [SystemJS Builder](https://github.com/systemjs/builder) and [Gulp](http://gulpjs.com/).
* Backend mocking / stubs / overriding of the module loader
* **Karma unit tests** (using mocks and stubs)
* **e2e testing** with protractor
* Produce optimized, production ready code for deployment
* **Continuous Integration** ready (tests via [Travis CI](https://travis-ci.org/topheman/vanilla-es6-jspm) with [SauceLabs](https://saucelabs.com/u/vanilla-es6-jspm) integration for e2e tests)
* Automated documentation generation

##TL;DR

Want to get started right now and bother about all the great features later ?

```shell
$ npm install -g jspm
$ git clone https://github.com/topheman/vanilla-es6-jspm.git
$ cd vanilla-es6-jspm
$ npm install
$ gulp serve
```

You're ready to develop in ES6 the project in the `src` folder!

##Requirements

* node/npm (tested on both node v4, v5 & v6 - [see tests](https://travis-ci.org/topheman/vanilla-es6-jspm))
* gulp `npm install -g gulp-cli`
* jspm `npm install -g jspm`

[Why all dependencies in local (see wiki) ?](https://github.com/topheman/vanilla-es6-jspm/wiki/FAQ#dependencies)

##Installation

All you need is to run `npm install`

* `npm install`: install all npm dependencies + will **automatically** triggers the following at postinstall (so **you don't need to run those**):
	* `jspm install`: installs front dependencies via jspm
	* `npm run webdriver-manager-update` installs necessary binaries for Selenium (for e2e testing)

##Launch

You can launch your app in different modes (dev/dist/test):

* `gulp serve` : **will launch a dev server**
* `gulp serve --env dist` : will launch the version of the site built in `build/dist` folder (need to `gulp build` before) - *usefull to check your site before deploying it*.
* `gulp serve --env test` : will launch a dev server with test configuration - *usefull to debug / create unit tests*:
	* jspm configuration overridden by the `test/jspm.override.json` file
	* the app will appear with "TEST" in background, thanks to `test/fixtures/bs.snippet.html` injected on the the fly (containing specific css)

You can pass the following flags to the `gulp serve` command:

* `--env`: accepts `dev`, `dist`, `test` (`dev` by default)
* `--port`: overrides the port of the server you'll launch
* `--disable-watch`: disables watching/reloading
* `--open false`: won't open the site in the browser

##Build

* `gulp build` : builds a production ready version of the site in `build/dist` folder
* `gulp build --env test` : same as `gulp build`, but bundles a test version of your website (using `test/jspm.override.json`)
	* can be usefull if you want to do end-to-end testing on a built version of your website

You can also pass the following flags to `gulp build`:

* `--with-docs`: will generate the documentation from source code in `build/dist/docs` ([see generate docs section](#generate-docs))

##Test

###Unit

The unit tests are in `test/unit/spec`.

You can see exactly which commands match the following npm tasks in the [package.json](https://github.com/topheman/vanilla-es6-jspm/blob/master/package.json#L6).

* `npm test`: runs all the tests (will be triggered on `git-pre-commit`)
* `npm run test-unit`: runs the unit tests through `karma`
* `npm run test-build`: tests the `gulp build` task (will be triggered on `git-pre-push`)
	* if `build/dist` folder is under git management ([see deployment section](#deployment)), this task will git stash/unstash before and after testing.

###e2e

The e2e tests are in `test/e2e/spec`. It's using [protractor](http://www.protractortest.org/) - an end-to-end test framework for AngularJS applications, based on [Selenium Webdriver](http://www.seleniumhq.org/). It can also be used on non-angular websites ([more on wiki](https://github.com/topheman/vanilla-es6-jspm/wiki/FAQ#protractor)).

You can run the e2e tests two ways (either way, they need a server in order to run):

* standalone (no need to have a server launched / **make sure you don't**) - launch : `npm run test-e2e-standalone`: this will:
	* start a test server
	* run the e2e tests
	* stop the test server
* if you want to run them against your current server (this should be a server launched in test mode with `gulp serve --env test`), open a new terminal tab and run `npm run test-e2e`

##Git workflow & Continuous Integration

###Git hooks

To prevent you from sending broken code, some client-side git hooks are enabled:

* pre-commit: will run `npm test` (checks jshint, htmlhint and karma unit tests)
* pre-push: will run `npm run test-build` (checks if the build runs smoothly)
	* I decided to put this check on pre-push because: it takes time and git stash/unstash `build/dist` folder repo - it could be put on pre-commit ...

You can bypass those checks by adding to your git command the flag `--no-verify` (but know that the Travis CI build will fail).

###Travis CI

On each push, [Travis CI](https://travis-ci.org/topheman/vanilla-es6-jspm) will run the following tests/builds (see complete steps in [.travis.yml](https://github.com/topheman/vanilla-es6-jspm/blob/master/.travis.yml)):

* `gulp build`: runs the build routine (to make sure it works fine)
* `gulp build --env test`: builds a test version of the app (to be served for e2e tests)
* `npm test`: runs unit tests
* `npm run test-e2e`: runs end to end tests via [SauceLabs](https://saucelabs.com/u/vanilla-es6-jspm)

If either one of them fails, the build will be flagged as failed.

* [Travis CI setup](https://github.com/topheman/vanilla-es6-jspm/wiki/FAQ#travis-ci-setup)
* The `WITH_DOCS=true` env var is exported at the beginning so that the doc generation should also be tested on the `gulp build` task (without changing the commands)
* As you'll see e2e tests don't run on pull requests. [See explanation on the FAQ](https://github.com/topheman/vanilla-es6-jspm/wiki/FAQ#continuous-integration).

###SauceLabs

*You can skip this if e2e testing isn't part of your Continuous Integration workflow.*

SauceLabs is a cross-browser automation tool built on top of Selenium WebDriver (Protractor uses Selenium WebDriver). It lets you run e2e tests accross multiple devices and is well integrated to Travis CI.

If you want to set it up for your own project, [read this post](http://dev.topheman.com/setup-travis-ci-saucelabs-for-protractor).

To avoid traffic on the Sauce Connect tunnel that could lead to timeouts, SauceLabs tests are run against a server serving the `build/dist` folder, containing a bundled version of the site in `test` mode (to benefit from the stubs and mocks) which was created thanks to `gulp build --env test`.

More infos on this commit: [#7898239](https://github.com/topheman/vanilla-es6-jspm/commit/7898239ea252b9163e3e02b77aef2d6e13c0fa5a)

[See the SauceLabs Report](https://saucelabs.com/u/vanilla-es6-jspm) (much like Travis but for e2e tests)

##Generate Docs

Documentation generation is currently based on [YUIDoc](http://yui.github.io/yuidoc/). A set of tasks is at your disposal:

* `npm run yuidoc`: Will generate documentation in `build/docs`
* `gulp build --with-docs`: Same as above, but will also copy the generated documentation to `build/dist/docs` (can be usefull if you have an opensource project and want to share docs)

The configuration of YUIDoc is specified in the `package.json`, in the `yuidoc` entry - you can override this config (the theme for example).

[Here is an example of the output](http://topheman.github.io/vanilla-es6-jspm/docs/).

Notes:

* I'm still looking for a replacement for yuidoc, feel free to use your own doc generator - if you have one more suited for ES6, please let me know.
* I opened an [issue here](https://github.com/topheman/vanilla-es6-jspm/issues/1), for the moment, the doc doesn't display well when served over https.

##Deployment

###On github pages

You can host your project on github pages like this ([source](https://help.github.com/articles/creating-project-pages-manually/)), pushing to the github pages the `dist` folder where the project is built.

```shell
$ gulp build
$ cd build/dist
$ git init
$ git remote add origin https://github.com/username/vanilla-es6-jspm
$ git fetch origin
$ git checkout --orphan gh-pages
$ gulp build
$ git add .
$ git commit -m "first push to production"
$ git push -u origin gh-pages
```

Next time, you'll only have to do the last 4 steps ...

##Folder Organization

###Development

```
src
├── 404.html
├── analytics.snippet.html  --> analytics snippet (only added at build)
├── app                     --> folder containing app js files
│   ├── bootstrap.js        --> js module entry point
│   ├── components
│   ├── main.js
│   └── services
├── favicon-128x128.png
├── favicon-32x32.png
├── favicon.ico
├── images                  --> images files
├── index.html              --> app main file
└── styles                  --> styles folder (.scss)
```

###Production

```
build
├── dist                    --> distribution source code that goes to production
│   ├── 404.html
│   ├── docs                --> generate doc with "gulp build --with-docs"
│   ├── favicon-128x128.png
│   ├── favicon-32x32.png
│   ├── favicon.ico
│   ├── images              --> images files
│   ├── index.html          --> app main file
│   ├── scripts             --> js files
│   │   └── app.bootstrap.build-597baeaa0a.js  --> concat, minify, reved app js files and cached templates
│   └── styles              --> css files
│       └── main.min-b8451af87d.css  --> concat & minify app css files
└── docs                    --> generate doc with "npm run yuidoc"
```

###Test

```
test
├── e2e
│   ├── spec             --> e2e tests run by protractor with jasmine
│   └── utils.js
├── fixtures
│   └── bs.snippet.html  --> html snippet added on gulp serve:test
├── forever.gulp.serve.dist.json
├── forever.gulp.serve.test.json
├── jspm.override.json   --> file to override jspm.config.js in test mode
├── stubs                --> replacements for existing modules, injected in test mode (configured in jspm.override.json)
│   └── app
│       └── services
└── unit
    └── spec             --> unit tests run by karma with jasmine
        ├── components
        └── services
```

##Changelog

See [releases section](https://github.com/topheman/vanilla-es6-jspm/releases).

##Contributing

*This section is in progress*, you can still take a look at the [public trello board](https://trello.com/c/tCihMVXM/46-introduction).

##FAQ

[See Wiki](https://github.com/topheman/vanilla-es6-jspm/wiki/FAQ)

##Resources

[See Wiki](https://github.com/topheman/vanilla-es6-jspm/wiki/Resources)
