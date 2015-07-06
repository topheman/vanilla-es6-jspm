angular-es6-jspm
================

*Note: This project is currently is v0.x, so for the moment, no angular involved, [more infos in the roadmap section](#roadmap)*

Summary

* [Presentation](#presentation)
	* [Introduction](#introduction)
	* [Endgoal](#endgoal)
	* [Roadmap](#roadmap)
		* [Releases](https://github.com/topheman/angular-es6-jspm/releases)
* [Instructions](#instructions)
* [Resources](#resources)

#Presentation

##Introduction

For the last two years, we've been hearing a lot about ES6. For the last few months, more and more people have started to embrace it, with the help of tools like [Babel](https://babeljs.io/).

Now, it's just here and we should use it.

New tools come to help us at this task. One of them is [jspm](http://jspm.io/) (a package manager for the SystemJS universal loader).

* No more bower, no more browserify or webpack
* But you can use any type of module (ES6, AMD, CommonJS ...)
* You can install those modules from npm, github, bower (almost anywhere in fact)
* You still have plugins that will let you require css, html or whatever ...

It's used by default in [aurelia.io](http://aurelia.io/).

*Note* : There are a lot of yeoman generators using bower or others with production-ready workflows, for most of the frameworks but I couldn't find some for angular 1.x with ES6 and jspm.

**TL;DR** : I'm gonna make my own angular/ES6/jspm stack.

##Endgoal

The endgoal is to have a fully functionnal workflow for angular 1.x, using ES6+ and jspm, with the following features :

* Development server with livereload
* Sass
* ES6+ debugging (sourcemaps)
* Production build
* Unit Tests
* jshint
* Angular written ES6 style
	* ngInject
	* use ES7 decorators ? (not so sure about that) [¹](#footnotes)
* ...

##Roadmap

I will make a first version **without any angular code**, only a simple project with enough code base in ES6 to get to challenge jspm, this will be the versions tagged **v0.x**.

Once this done, I'll get to the next level : add angular. This will be the versions **v1.x**

See the [Releases section](https://github.com/topheman/angular-es6-jspm/releases) for more informations.

#Instructions

##Requirements

* node/npm
* gulp
* jspm
* sass

At the moment of the writing, the default version of jspm is v0.16.x. A major update has been done for the v0.17.0, so to be working with the versions to be, I've upgraded jspm :

* upgrade jspm to the current latest 0.18.2 - major upgrade was [v0.17.0](https://github.com/systemjs/systemjs/releases/tag/0.17.0)
* upgrade [jspm-cli to the latest beta](https://github.com/jspm/jspm-cli/releases/tag/0.16.0-beta) (so that it would be in sync) :
	* `npm install -g jspm@beta`
	* `jspm init`
	* `jspm install`
	* note : I restarted with a blank config (it became much thiner)

##Install

`npm install` (it will automatically trigger the `jspm install` at `postinstall`)

##Launch

* `gulp serve` : will launch a dev server

##Build

1. `jspm bundle-sfx app/bootstrap ./.tmp/scripts/app.bootstrap.build.js`
2. In `src/index.html` uncomment the `build` part / comment the `build remove` part
3. `gulp serve`

This is only to test the Self Executing build of jspm (still needs to copy over the other assets)

##Deployment

*Section to come*

-----------

###Resources

Among all the posts/videos I read, here are a few ones that I recommend :

* [How to start writing apps with ES6, Angular 1.x and JSPM](http://martinmicunda.com/2015/02/09/how-to-start-writing-apps-with-es6-angular-1x-and-jspm/) by [@martinmicunda](https://github.com/martinmicunda) that I thank here for his post and sharing his code
* [jspm.io](http://jspm.io/) - watch the videos to better understand what it is about

*Previous personal projects on ES6*

* [topheman/react-es6](https://github.com/topheman/react-es6)
* [topheman/react-es6-isomorphic](https://github.com/topheman/react-es6-isomorphic)

###Footnotes

1. There are decorators in Angular 2, but since they changed a lot of concepts, it might be misleading for a team-members (more over, I've seen multiple people implementing them, not one uses them the same way). I may change of advice in time ...