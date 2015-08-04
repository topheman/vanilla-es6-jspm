angular-es6-jspm
================

**ES6** is here and you can't avoid it. We have great tools to make it work, one of them is **jspm**.

jspm is a great tool but all-in-one yeoman generators or seed projects (with build/sass/livereload/sourcemaps/unit-tests ...) are still lacking, so I decided to make my own angular/ES6/jspm stack, **starting with vanillaJS**. [more infos on the Wiki](https://github.com/topheman/angular-es6-jspm/wiki)

#Instructions

##Requirements

* node/npm
* gulp `npm install -g gulp-cli`
* jspm (latest : `0.16.0-beta.3`) - `npm install -g jspm@beta`
* sass - [installation](http://sass-lang.com/install)

The npm tasks such as `npm test` rely on local gulp and jspm clients, so they won't have to be installed in global on VMs environments such as Travis to avoid the need to `sudo`.

##Install

`npm install` (it will automatically trigger the `jspm install` at `postinstall`)

##Launch

* `gulp serve` : will launch a dev server

##Build

`gulp build` : builds a production ready version of the site in `build/dist`

*To build only the js part with the jspm cli (only kept for future reference)*

`jspm bundle-sfx app/bootstrap ./.tmp/scripts/app.bootstrap.build.js`

##Test

* `npm run test-unit`: runs the unit tests through `karma`
* `npm test`: runs all the tests

##Deployment

###On github pages

You can host your project on github pages like this ([source](https://help.github.com/articles/creating-project-pages-manually/)), pushing to the github pages the `dist` folder where the project is built.

```shell
$ gulp build
$ cd build/dist
$ git init
$ git remote add origin https://github.com/username/angular-es6-jspm
$ git fetch origin
$ git checkout --orphan gh-pages
$ gulp build
$ git add .
$ git commit -m "first push to production"
$ git push -u origin gh-pages
```

Next time, you'll only have to do the last 4 steps ...

#Resources

[See Wiki](https://github.com/topheman/angular-es6-jspm/wiki/Resources)