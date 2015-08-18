vanilla-es6-jspm
================

[![Build Status](https://travis-ci.org/topheman/vanilla-es6-jspm.svg?branch=master)](https://travis-ci.org/topheman/vanilla-es6-jspm)
[![devDependency Status](https://david-dm.org/topheman/vanilla-es6-jspm/dev-status.svg)](https://david-dm.org/topheman/vanilla-es6-jspm#info=devDependencies)

**ES6** is here and you can't avoid it. We have great tools to make it work, one of them is **jspm**.

jspm is great but all-in-one yeoman generators or seed projects (with build/sass/livereload/sourcemaps/unit-tests ...) are still lacking, so I decided to make my own angular/ES6/jspm stack.

This project is the first step: a **vanillaJS/ES6/jspm boilerplate** ([more infos on the Wiki](https://github.com/topheman/vanilla-es6-jspm/wiki)).

##Features

* Simple ES6 app using basic **ES6 features**
	* so that you won't have to struggle to understand the code base
	* but advanced enough to be used as an example
* Use **ES6 Modules** via [SystemJS module loader](https://github.com/systemjs/systemjs) (built on top of [ES6 Module Loader Polyfill](https://github.com/ModuleLoader/es6-module-loader))
* Manage development and production workflow with [jspm](http://jspm.io/), [SystemJS Builder](https://github.com/systemjs/builder) and [Gulp](http://gulpjs.com/).
* Backend mocking / stubs / overriding of the module loader
* **Karma unit tests** (using mocks and stubs)
* **e2e testing** with protractor *(in progress)*
* Produce optimized, production ready code for deployment
* **Continuous Integration** ready (tests via [Travis CI](https://travis-ci.org/topheman/vanilla-es6-jspm))

##Requirements

* node/npm
* gulp `npm install -g gulp-cli`
* jspm (latest : `0.16.0-beta.3`) - `npm install -g jspm@beta`
* sass - [installation](http://sass-lang.com/install)

##Installation

* `npm install` (it will automatically trigger the `jspm install` at `postinstall`)

##Launch

You can launch your app in different modes (dev/prod/test):

* `gulp serve` : **will launch a dev server**
* `gulp serve:prod` : will launch the `build/dist` version of the site (need to `gulp build` before) - *usefull to check your site before deploying it*.
* `gulp serve:test` : will launch a dev server with test configuration - *usefull to debug / create unit tests*:
	* jspm configuration overridden by the `test/jspm.override.json` file
	* the app will appear with "TEST" in background, thanks to `test/fixtures/bs.snippet.html` injected on the the fly (containing specific css)

##Build

* `gulp build` : builds a production ready version of the site in `build/dist`

##Test

You can see exactly which commands match the following npm tasks in the [package.json](https://github.com/topheman/vanilla-es6-jspm/blob/master/package.json#L6).

* `npm test`: runs all the tests (will be triggered on `git-pre-commit`)
* `npm run test-unit`: runs the unit tests through `karma`
* `npm run test-build`: tests the `gulp build` task (will be triggered on `git-pre-push`)
	* if `build/dist` is under git management ([see deployment section](#deployment)), this task will git stash/unstash before and after testing.

##Git workflow & Continuous Integration

###Git hooks

To prevent you from sending broken code, some client-side git hooks are enabled:

* pre-commit: will run `npm test` (checks jshint, htmlhint and karma unit tests)
* pre-push: will run `npm run test-build` (checks if the build runs smoothly)
	* I decided to put this check on pre-push because: it takes time and git stash/unstash `build/dist` - it could be put on pre-commit ...

You can bypass those checks by adding to your git command the flag `--no-verify` (but know that the Travis CI build will fail).

###Travis CI

On each push/pull request, [Travis CI](https://travis-ci.org/topheman/vanilla-es6-jspm) will run the following:

* `npm test`
* `npm run test-build`

If either one of them fails, the build will be flagged as failed.

* [travis.yml](https://github.com/topheman/vanilla-es6-jspm/blob/master/.travis.yml)
* [Travis CI setup](https://github.com/topheman/vanilla-es6-jspm/wiki/FAQ#travis-ci-setup)

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

*NB: To move into the Wiki ?*

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
└── dist                    --> distribution source code that goes to production
    ├── 404.html
    ├── favicon-128x128.png
    ├── favicon-32x32.png
    ├── favicon.ico
    ├── images              --> images files
    ├── index.html          --> app main file
    ├── scripts             --> js files
    │   └── app.bootstrap.build-597baeaa0a.js  --> concat, minify, reved app js files and cached templates
    └── styles              --> css files
        └── main.min-b8451af87d.css  --> concat & minify app css files
```

###Test

```
test
├── fixtures
│   └── bs.snippet.html
├── jspm.override.json
├── stubs
│   └── app
│       └── services
└── unit
    └── spec
        ├── components
        └── services
```

##Contributing

*This section is in progress*, you can still take a look at the [public trello board](https://trello.com/c/tCihMVXM/46-introduction).

##FAQ

[See Wiki](https://github.com/topheman/vanilla-es6-jspm/wiki/FAQ)

##Resources

[See Wiki](https://github.com/topheman/vanilla-es6-jspm/wiki/Resources)