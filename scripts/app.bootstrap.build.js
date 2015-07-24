(function(global) {

  var defined = {};

  // indexOf polyfill for IE8
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  function dedupe(deps) {
    var newDeps = [];
    for (var i = 0, l = deps.length; i < l; i++)
      if (indexOf.call(newDeps, deps[i]) == -1)
        newDeps.push(deps[i])
    return newDeps;
  }

  function register(name, deps, declare) {
    if (arguments.length === 4)
      return registerDynamic.apply(this, arguments);
    doRegister(name, {
      declarative: true,
      deps: deps,
      declare: declare
    });
  }

  function registerDynamic(name, deps, executingRequire, execute) {
    doRegister(name, {
      declarative: false,
      deps: deps,
      executingRequire: executingRequire,
      execute: execute
    });
  }

  function doRegister(name, entry) {
    entry.name = name;

    // we never overwrite an existing define
    if (!(name in defined))
      defined[name] = entry; 

    entry.deps = dedupe(entry.deps);

    // we have to normalize dependencies
    // (assume dependencies are normalized for now)
    // entry.normalizedDeps = entry.deps.map(normalize);
    entry.normalizedDeps = entry.deps;
  }


  function buildGroups(entry, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];

      // not in the registry means already linked / ES6
      if (!depEntry || depEntry.evaluated)
        continue;

      // now we know the entry is in our unlinked linkage group
      var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);

      // the group index of an entry is always the maximum
      if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {

        // if already in a group, remove from the old group
        if (depEntry.groupIndex !== undefined) {
          groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);

          // if the old group is empty, then we have a mixed depndency cycle
          if (groups[depEntry.groupIndex].length == 0)
            throw new TypeError("Mixed dependency cycle detected");
        }

        depEntry.groupIndex = depGroupIndex;
      }

      buildGroups(depEntry, groups);
    }
  }

  function link(name) {
    var startEntry = defined[name];

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, groups);

    var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var entry = group[j];

        // link each group
        if (curGroupDeclarative)
          linkDeclarativeModule(entry);
        else
          linkDynamicModule(entry);
      }
      curGroupDeclarative = !curGroupDeclarative; 
    }
  }

  // module binding records
  var moduleRecords = {};
  function getOrCreateModuleRecord(name) {
    return moduleRecords[name] || (moduleRecords[name] = {
      name: name,
      dependencies: [],
      exports: {}, // start from an empty module and extend
      importers: []
    })
  }

  function linkDeclarativeModule(entry) {
    // only link if already not already started linking (stops at circular)
    if (entry.module)
      return;

    var module = entry.module = getOrCreateModuleRecord(entry.name);
    var exports = entry.module.exports;

    var declaration = entry.declare.call(global, function(name, value) {
      module.locked = true;
      exports[name] = value;

      for (var i = 0, l = module.importers.length; i < l; i++) {
        var importerModule = module.importers[i];
        if (!importerModule.locked) {
          var importerIndex = indexOf.call(importerModule.dependencies, module);
          importerModule.setters[importerIndex](exports);
        }
      }

      module.locked = false;
      return value;
    });

    module.setters = declaration.setters;
    module.execute = declaration.execute;

    // now link all the module dependencies
    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];
      var depModule = moduleRecords[depName];

      // work out how to set depExports based on scenarios...
      var depExports;

      if (depModule) {
        depExports = depModule.exports;
      }
      else if (depEntry && !depEntry.declarative) {
        depExports = depEntry.esModule;
      }
      // in the module registry
      else if (!depEntry) {
        depExports = load(depName);
      }
      // we have an entry -> link
      else {
        linkDeclarativeModule(depEntry);
        depModule = depEntry.module;
        depExports = depModule.exports;
      }

      // only declarative modules have dynamic bindings
      if (depModule && depModule.importers) {
        depModule.importers.push(module);
        module.dependencies.push(depModule);
      }
      else
        module.dependencies.push(null);

      // run the setter for this dependency
      if (module.setters[i])
        module.setters[i](depExports);
    }
  }

  // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
  function getModule(name) {
    var exports;
    var entry = defined[name];

    if (!entry) {
      exports = load(name);
      if (!exports)
        throw new Error("Unable to load dependency " + name + ".");
    }

    else {
      if (entry.declarative)
        ensureEvaluated(name, []);

      else if (!entry.evaluated)
        linkDynamicModule(entry);

      exports = entry.module.exports;
    }

    if ((!entry || entry.declarative) && exports && exports.__useDefault)
      return exports['default'];

    return exports;
  }

  function linkDynamicModule(entry) {
    if (entry.module)
      return;

    var exports = {};

    var module = entry.module = { exports: exports, id: entry.name };

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = defined[depName];
        if (depEntry)
          linkDynamicModule(depEntry);
      }
    }

    // now execute
    entry.evaluated = true;
    var output = entry.execute.call(global, function(name) {
      for (var i = 0, l = entry.deps.length; i < l; i++) {
        if (entry.deps[i] != name)
          continue;
        return getModule(entry.normalizedDeps[i]);
      }
      throw new TypeError('Module ' + name + ' not declared as a dependency.');
    }, exports, module);

    if (output)
      module.exports = output;

    // create the esModule object, which allows ES6 named imports of dynamics
    exports = module.exports;
 
    if (exports && exports.__esModule) {
      entry.esModule = exports;
    }
    else {
      var hasOwnProperty = exports && exports.hasOwnProperty;
      entry.esModule = {};
      for (var p in exports) {
        if (!hasOwnProperty || exports.hasOwnProperty(p))
          entry.esModule[p] = exports[p];
      }
      entry.esModule['default'] = exports;
      entry.esModule.__useDefault = true;
    }
  }

  /*
   * Given a module, and the list of modules for this current branch,
   *  ensure that each of the dependencies of this module is evaluated
   *  (unless one is a circular dependency already in the list of seen
   *  modules, in which case we execute it)
   *
   * Then we evaluate the module itself depth-first left to right 
   * execution to match ES6 modules
   */
  function ensureEvaluated(moduleName, seen) {
    var entry = defined[moduleName];

    // if already seen, that means it's an already-evaluated non circular dependency
    if (!entry || entry.evaluated || !entry.declarative)
      return;

    // this only applies to declarative modules which late-execute

    seen.push(moduleName);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      if (indexOf.call(seen, depName) == -1) {
        if (!defined[depName])
          load(depName);
        else
          ensureEvaluated(depName, seen);
      }
    }

    if (entry.evaluated)
      return;

    entry.evaluated = true;
    entry.module.execute.call(global);
  }

  // magical execution function
  var modules = {};
  function load(name) {
    if (modules[name])
      return modules[name];

    var entry = defined[name];

    // first we check if this module has already been defined in the registry
    if (!entry)
      throw "Module " + name + " not present.";

    // recursively ensure that the module and all its 
    // dependencies are linked (with dependency group handling)
    link(name);

    // now handle dependency execution in correct order
    ensureEvaluated(name, []);

    // remove from the registry
    defined[name] = undefined;

    // return the defined module object
    return modules[name] = entry.declarative ? entry.module.exports : entry.esModule;
  };

  return function(mains, declare) {
    return function(formatDetect) {
      formatDetect(function() {
        var System = {
          _nodeRequire: typeof require != 'undefined' && require.resolve && typeof process != 'undefined' && require,
          register: register,
          registerDynamic: registerDynamic,
          get: load, 
          set: function(name, module) {
            modules[name] = module; 
          },
          newModule: function(module) {
            return module;
          },
          'import': function() {
            throw new TypeError('Dynamic System.import calls are not supported for SFX bundles. Rather use a named bundle.');
          }
        };
        System.set('@empty', {});

        declare(System);

        var firstLoad = load(mains[0]);
        if (mains.length > 1)
          for (var i = 1; i < mains.length; i++)
            load(mains[i]);

        return firstLoad;
      });
    };
  };

})(typeof self != 'undefined' ? self : global)
/* (['mainModule'], function(System) {
  System.register(...);
})
(function(factory) {
  if (typeof define && define.amd)
    define(factory);
  // etc UMD / module pattern
})*/

(['app/bootstrap.js'], function(System) {

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.fw.js", [], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function($) {
    $.FW = false;
    $.path = $.core;
    return $;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.6.14/helpers/class-call-check.js", [], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports["default"] = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/fn/object/create.js", ["npm:core-js@0.9.18/library/modules/$.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js");
  module.exports = function create(P, D) {
    return $.create(P, D);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.def.js", ["npm:core-js@0.9.18/library/modules/$.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      global = $.g,
      core = $.core,
      isFunction = $.isFunction;
  function ctx(fn, that) {
    return function() {
      return fn.apply(that, arguments);
    };
  }
  $def.F = 1;
  $def.G = 2;
  $def.S = 4;
  $def.P = 8;
  $def.B = 16;
  $def.W = 32;
  function $def(type, name, source) {
    var key,
        own,
        out,
        exp,
        isGlobal = type & $def.G,
        isProto = type & $def.P,
        target = isGlobal ? global : type & $def.S ? global[name] : (global[name] || {}).prototype,
        exports = isGlobal ? core : core[name] || (core[name] = {});
    if (isGlobal)
      source = name;
    for (key in source) {
      own = !(type & $def.F) && target && key in target;
      if (own && key in exports)
        continue;
      out = own ? target[key] : source[key];
      if (isGlobal && !isFunction(target[key]))
        exp = source[key];
      else if (type & $def.B && own)
        exp = ctx(out, global);
      else if (type & $def.W && target[key] == out)
        !function(C) {
          exp = function(param) {
            return this instanceof C ? new C(param) : C(param);
          };
          exp.prototype = C.prototype;
        }(out);
      else
        exp = isProto && isFunction(out) ? ctx(Function.call, out) : out;
      exports[key] = exp;
      if (isProto)
        (exports.prototype || (exports.prototype = {}))[key] = out;
    }
  }
  module.exports = $def;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.get-names.js", ["npm:core-js@0.9.18/library/modules/$.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      toString = {}.toString,
      getNames = $.getNames;
  var windowNames = typeof window == 'object' && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
  function getWindowNames(it) {
    try {
      return getNames(it);
    } catch (e) {
      return windowNames.slice();
    }
  }
  module.exports.get = function getOwnPropertyNames(it) {
    if (windowNames && toString.call(it) == '[object Window]')
      return getWindowNames(it);
    return getNames($.toObject(it));
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("app/components/Spinner/Spinner.html!github:systemjs/plugin-text@0.0.2.js", [], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = "<div id=\"circularG\">\n  <div id=\"circularG_1\" class=\"circularG\">\n  </div>\n  <div id=\"circularG_2\" class=\"circularG\">\n  </div>\n  <div id=\"circularG_3\" class=\"circularG\">\n  </div>\n  <div id=\"circularG_4\" class=\"circularG\">\n  </div>\n  <div id=\"circularG_5\" class=\"circularG\">\n  </div>\n  <div id=\"circularG_6\" class=\"circularG\">\n  </div>\n  <div id=\"circularG_7\" class=\"circularG\">\n  </div>\n  <div id=\"circularG_8\" class=\"circularG\">\n  </div>\n</div>";
  global.define = __define;
  return module.exports;
});

System.registerDynamic("app/components/Geolocation/Geolocation.html!github:systemjs/plugin-text@0.0.2.js", [], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = "<div class=\"panel panel-default\">\n  <div class=\"panel-heading\">Geolocation example</div>\n  <div class=\"panel-body\">\n    <ul class=\"geolocation-infos pull-right\"></ul>\n    <div class=\"spinner pull-right\"></div>\n    <p>\n      <button class=\"btn btn-primary geolocation-button\" title=\"Via freegeoip.net\">Launch geolocation service</button>\n    </p>\n  </div>\n</div>";
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.shared.js", ["npm:core-js@0.9.18/library/modules/$.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      SHARED = '__core-js_shared__',
      store = $.g[SHARED] || ($.g[SHARED] = {});
  module.exports = function(key) {
    return store[key] || (store[key] = {});
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.uid.js", ["npm:core-js@0.9.18/library/modules/$.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var sid = 0;
  function uid(key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++sid + Math.random()).toString(36));
  }
  uid.safe = require("npm:core-js@0.9.18/library/modules/$.js").g.Symbol || uid;
  module.exports = uid;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.redef.js", ["npm:core-js@0.9.18/library/modules/$.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:core-js@0.9.18/library/modules/$.js").hide;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.string-at.js", ["npm:core-js@0.9.18/library/modules/$.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js");
  module.exports = function(TO_STRING) {
    return function(that, pos) {
      var s = String($.assertDefined(that)),
          i = $.toInteger(pos),
          l = s.length,
          a,
          b;
      if (i < 0 || i >= l)
        return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.assert.js", ["npm:core-js@0.9.18/library/modules/$.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js");
  function assert(condition, msg1, msg2) {
    if (!condition)
      throw TypeError(msg2 ? msg1 + msg2 : msg1);
  }
  assert.def = $.assertDefined;
  assert.fn = function(it) {
    if (!$.isFunction(it))
      throw TypeError(it + ' is not a function!');
    return it;
  };
  assert.obj = function(it) {
    if (!$.isObject(it))
      throw TypeError(it + ' is not an object!');
    return it;
  };
  assert.inst = function(it, Constructor, name) {
    if (!(it instanceof Constructor))
      throw TypeError(name + ": use the 'new' operator!");
    return it;
  };
  module.exports = assert;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.iter-define.js", ["npm:core-js@0.9.18/library/modules/$.def.js", "npm:core-js@0.9.18/library/modules/$.redef.js", "npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.cof.js", "npm:core-js@0.9.18/library/modules/$.iter.js", "npm:core-js@0.9.18/library/modules/$.wks.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $def = require("npm:core-js@0.9.18/library/modules/$.def.js"),
      $redef = require("npm:core-js@0.9.18/library/modules/$.redef.js"),
      $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      cof = require("npm:core-js@0.9.18/library/modules/$.cof.js"),
      $iter = require("npm:core-js@0.9.18/library/modules/$.iter.js"),
      SYMBOL_ITERATOR = require("npm:core-js@0.9.18/library/modules/$.wks.js")('iterator'),
      FF_ITERATOR = '@@iterator',
      KEYS = 'keys',
      VALUES = 'values',
      Iterators = $iter.Iterators;
  module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE) {
    $iter.create(Constructor, NAME, next);
    function createMethod(kind) {
      function $$(that) {
        return new Constructor(that, kind);
      }
      switch (kind) {
        case KEYS:
          return function keys() {
            return $$(this);
          };
        case VALUES:
          return function values() {
            return $$(this);
          };
      }
      return function entries() {
        return $$(this);
      };
    }
    var TAG = NAME + ' Iterator',
        proto = Base.prototype,
        _native = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT],
        _default = _native || createMethod(DEFAULT),
        methods,
        key;
    if (_native) {
      var IteratorPrototype = $.getProto(_default.call(new Base));
      cof.set(IteratorPrototype, TAG, true);
      if ($.FW && $.has(proto, FF_ITERATOR))
        $iter.set(IteratorPrototype, $.that);
    }
    if ($.FW || FORCE)
      $iter.set(proto, _default);
    Iterators[NAME] = _default;
    Iterators[TAG] = $.that;
    if (DEFAULT) {
      methods = {
        keys: IS_SET ? _default : createMethod(KEYS),
        values: DEFAULT == VALUES ? _default : createMethod(VALUES),
        entries: DEFAULT != VALUES ? _default : createMethod('entries')
      };
      if (FORCE)
        for (key in methods) {
          if (!(key in proto))
            $redef(proto, key, methods[key]);
        }
      else
        $def($def.P + $def.F * $iter.BUGGY, NAME, methods);
    }
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.unscope.js", [], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function() {};
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.ctx.js", ["npm:core-js@0.9.18/library/modules/$.assert.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var assertFunction = require("npm:core-js@0.9.18/library/modules/$.assert.js").fn;
  module.exports = function(fn, that, length) {
    assertFunction(fn);
    if (~length && that === undefined)
      return fn;
    switch (length) {
      case 1:
        return function(a) {
          return fn.call(that, a);
        };
      case 2:
        return function(a, b) {
          return fn.call(that, a, b);
        };
      case 3:
        return function(a, b, c) {
          return fn.call(that, a, b, c);
        };
    }
    return function() {
      return fn.apply(that, arguments);
    };
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.iter-call.js", ["npm:core-js@0.9.18/library/modules/$.assert.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var assertObject = require("npm:core-js@0.9.18/library/modules/$.assert.js").obj;
  function close(iterator) {
    var ret = iterator['return'];
    if (ret !== undefined)
      assertObject(ret.call(iterator));
  }
  function call(iterator, fn, value, entries) {
    try {
      return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
    } catch (e) {
      close(iterator);
      throw e;
    }
  }
  call.close = close;
  module.exports = call;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.set-proto.js", ["npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.assert.js", "npm:core-js@0.9.18/library/modules/$.ctx.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      assert = require("npm:core-js@0.9.18/library/modules/$.assert.js");
  function check(O, proto) {
    assert.obj(O);
    assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
  }
  module.exports = {
    set: Object.setPrototypeOf || ('__proto__' in {} ? function(buggy, set) {
      try {
        set = require("npm:core-js@0.9.18/library/modules/$.ctx.js")(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
        set({}, []);
      } catch (e) {
        buggy = true;
      }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy)
          O.__proto__ = proto;
        else
          set(O, proto);
        return O;
      };
    }() : undefined),
    check: check
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.same.js", [], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = Object.is || function is(x, y) {
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.species.js", ["npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.wks.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      SPECIES = require("npm:core-js@0.9.18/library/modules/$.wks.js")('species');
  module.exports = function(C) {
    if ($.DESC && !(SPECIES in C))
      $.setDesc(C, SPECIES, {
        configurable: true,
        get: $.that
      });
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.invoke.js", [], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(fn, args, that) {
    var un = that === undefined;
    switch (args.length) {
      case 0:
        return un ? fn() : fn.call(that);
      case 1:
        return un ? fn(args[0]) : fn.call(that, args[0]);
      case 2:
        return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);
      case 3:
        return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);
      case 4:
        return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
      case 5:
        return un ? fn(args[0], args[1], args[2], args[3], args[4]) : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
    }
    return fn.apply(that, args);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.dom-create.js", ["npm:core-js@0.9.18/library/modules/$.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      document = $.g.document,
      isObject = $.isObject,
      is = isObject(document) && isObject(document.createElement);
  module.exports = function(it) {
    return is ? document.createElement(it) : {};
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:process@0.10.1/browser.js", [], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var process = module.exports = {};
  var queue = [];
  var draining = false;
  function drainQueue() {
    if (draining) {
      return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      var i = -1;
      while (++i < len) {
        currentQueue[i]();
      }
      len = queue.length;
    }
    draining = false;
  }
  process.nextTick = function(fun) {
    queue.push(fun);
    if (!draining) {
      setTimeout(drainQueue, 0);
    }
  };
  process.title = 'browser';
  process.browser = true;
  process.env = {};
  process.argv = [];
  process.version = '';
  process.versions = {};
  function noop() {}
  process.on = noop;
  process.addListener = noop;
  process.once = noop;
  process.off = noop;
  process.removeListener = noop;
  process.removeAllListeners = noop;
  process.emit = noop;
  process.binding = function(name) {
    throw new Error('process.binding is not supported');
  };
  process.cwd = function() {
    return '/';
  };
  process.chdir = function(dir) {
    throw new Error('process.chdir is not supported');
  };
  process.umask = function() {
    return 0;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.mix.js", ["npm:core-js@0.9.18/library/modules/$.redef.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $redef = require("npm:core-js@0.9.18/library/modules/$.redef.js");
  module.exports = function(target, src) {
    for (var key in src)
      $redef(target, key, src[key]);
    return target;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.iter-detect.js", ["npm:core-js@0.9.18/library/modules/$.wks.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var SYMBOL_ITERATOR = require("npm:core-js@0.9.18/library/modules/$.wks.js")('iterator'),
      SAFE_CLOSING = false;
  try {
    var riter = [7][SYMBOL_ITERATOR]();
    riter['return'] = function() {
      SAFE_CLOSING = true;
    };
    Array.from(riter, function() {
      throw 2;
    });
  } catch (e) {}
  module.exports = function(exec) {
    if (!SAFE_CLOSING)
      return false;
    var safe = false;
    try {
      var arr = [7],
          iter = arr[SYMBOL_ITERATOR]();
      iter.next = function() {
        safe = true;
      };
      arr[SYMBOL_ITERATOR] = function() {
        return iter;
      };
      exec(arr);
    } catch (e) {}
    return safe;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.js", ["npm:core-js@0.9.18/library/modules/$.fw.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var global = typeof self != 'undefined' ? self : Function('return this')(),
      core = {},
      defineProperty = Object.defineProperty,
      hasOwnProperty = {}.hasOwnProperty,
      ceil = Math.ceil,
      floor = Math.floor,
      max = Math.max,
      min = Math.min;
  var DESC = !!function() {
    try {
      return defineProperty({}, 'a', {get: function() {
          return 2;
        }}).a == 2;
    } catch (e) {}
  }();
  var hide = createDefiner(1);
  function toInteger(it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  }
  function desc(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  }
  function simpleSet(object, key, value) {
    object[key] = value;
    return object;
  }
  function createDefiner(bitmap) {
    return DESC ? function(object, key, value) {
      return $.setDesc(object, key, desc(bitmap, value));
    } : simpleSet;
  }
  function isObject(it) {
    return it !== null && (typeof it == 'object' || typeof it == 'function');
  }
  function isFunction(it) {
    return typeof it == 'function';
  }
  function assertDefined(it) {
    if (it == undefined)
      throw TypeError("Can't call method on  " + it);
    return it;
  }
  var $ = module.exports = require("npm:core-js@0.9.18/library/modules/$.fw.js")({
    g: global,
    core: core,
    html: global.document && document.documentElement,
    isObject: isObject,
    isFunction: isFunction,
    that: function() {
      return this;
    },
    toInteger: toInteger,
    toLength: function(it) {
      return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;
    },
    toIndex: function(index, length) {
      index = toInteger(index);
      return index < 0 ? max(index + length, 0) : min(index, length);
    },
    has: function(it, key) {
      return hasOwnProperty.call(it, key);
    },
    create: Object.create,
    getProto: Object.getPrototypeOf,
    DESC: DESC,
    desc: desc,
    getDesc: Object.getOwnPropertyDescriptor,
    setDesc: defineProperty,
    setDescs: Object.defineProperties,
    getKeys: Object.keys,
    getNames: Object.getOwnPropertyNames,
    getSymbols: Object.getOwnPropertySymbols,
    assertDefined: assertDefined,
    ES5Object: Object,
    toObject: function(it) {
      return $.ES5Object(assertDefined(it));
    },
    hide: hide,
    def: createDefiner(0),
    set: global.Symbol ? simpleSet : hide,
    each: [].forEach
  });
  if (typeof __e != 'undefined')
    __e = core;
  if (typeof __g != 'undefined')
    __g = global;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.6.14/core-js/object/create.js", ["npm:core-js@0.9.18/library/fn/object/create.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("npm:core-js@0.9.18/library/fn/object/create.js"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/es6.object.statics-accept-primitives.js", ["npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.def.js", "npm:core-js@0.9.18/library/modules/$.get-names.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      $def = require("npm:core-js@0.9.18/library/modules/$.def.js"),
      isObject = $.isObject,
      toObject = $.toObject;
  $.each.call(('freeze,seal,preventExtensions,isFrozen,isSealed,isExtensible,' + 'getOwnPropertyDescriptor,getPrototypeOf,keys,getOwnPropertyNames').split(','), function(KEY, ID) {
    var fn = ($.core.Object || {})[KEY] || Object[KEY],
        forced = 0,
        method = {};
    method[KEY] = ID == 0 ? function freeze(it) {
      return isObject(it) ? fn(it) : it;
    } : ID == 1 ? function seal(it) {
      return isObject(it) ? fn(it) : it;
    } : ID == 2 ? function preventExtensions(it) {
      return isObject(it) ? fn(it) : it;
    } : ID == 3 ? function isFrozen(it) {
      return isObject(it) ? fn(it) : true;
    } : ID == 4 ? function isSealed(it) {
      return isObject(it) ? fn(it) : true;
    } : ID == 5 ? function isExtensible(it) {
      return isObject(it) ? fn(it) : false;
    } : ID == 6 ? function getOwnPropertyDescriptor(it, key) {
      return fn(toObject(it), key);
    } : ID == 7 ? function getPrototypeOf(it) {
      return fn(Object($.assertDefined(it)));
    } : ID == 8 ? function keys(it) {
      return fn(toObject(it));
    } : require("npm:core-js@0.9.18/library/modules/$.get-names.js").get;
    try {
      fn('z');
    } catch (e) {
      forced = 1;
    }
    $def($def.S + $def.F * forced, 'Object', method);
  });
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.wks.js", ["npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.shared.js", "npm:core-js@0.9.18/library/modules/$.uid.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = require("npm:core-js@0.9.18/library/modules/$.js").g,
      store = require("npm:core-js@0.9.18/library/modules/$.shared.js")('wks');
  module.exports = function(name) {
    return store[name] || (store[name] = global.Symbol && global.Symbol[name] || require("npm:core-js@0.9.18/library/modules/$.uid.js").safe('Symbol.' + name));
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.iter.js", ["npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.cof.js", "npm:core-js@0.9.18/library/modules/$.assert.js", "npm:core-js@0.9.18/library/modules/$.wks.js", "npm:core-js@0.9.18/library/modules/$.shared.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      cof = require("npm:core-js@0.9.18/library/modules/$.cof.js"),
      classof = cof.classof,
      assert = require("npm:core-js@0.9.18/library/modules/$.assert.js"),
      assertObject = assert.obj,
      SYMBOL_ITERATOR = require("npm:core-js@0.9.18/library/modules/$.wks.js")('iterator'),
      FF_ITERATOR = '@@iterator',
      Iterators = require("npm:core-js@0.9.18/library/modules/$.shared.js")('iterators'),
      IteratorPrototype = {};
  setIterator(IteratorPrototype, $.that);
  function setIterator(O, value) {
    $.hide(O, SYMBOL_ITERATOR, value);
    if (FF_ITERATOR in [])
      $.hide(O, FF_ITERATOR, value);
  }
  module.exports = {
    BUGGY: 'keys' in [] && !('next' in [].keys()),
    Iterators: Iterators,
    step: function(done, value) {
      return {
        value: value,
        done: !!done
      };
    },
    is: function(it) {
      var O = Object(it),
          Symbol = $.g.Symbol;
      return (Symbol && Symbol.iterator || FF_ITERATOR) in O || SYMBOL_ITERATOR in O || $.has(Iterators, classof(O));
    },
    get: function(it) {
      var Symbol = $.g.Symbol,
          getIter;
      if (it != undefined) {
        getIter = it[Symbol && Symbol.iterator || FF_ITERATOR] || it[SYMBOL_ITERATOR] || Iterators[classof(it)];
      }
      assert($.isFunction(getIter), it, ' is not iterable!');
      return assertObject(getIter.call(it));
    },
    set: setIterator,
    create: function(Constructor, NAME, next, proto) {
      Constructor.prototype = $.create(proto || IteratorPrototype, {next: $.desc(1, next)});
      cof.set(Constructor, NAME + ' Iterator');
    }
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/es6.array.iterator.js", ["npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.unscope.js", "npm:core-js@0.9.18/library/modules/$.uid.js", "npm:core-js@0.9.18/library/modules/$.iter.js", "npm:core-js@0.9.18/library/modules/$.iter-define.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      setUnscope = require("npm:core-js@0.9.18/library/modules/$.unscope.js"),
      ITER = require("npm:core-js@0.9.18/library/modules/$.uid.js").safe('iter'),
      $iter = require("npm:core-js@0.9.18/library/modules/$.iter.js"),
      step = $iter.step,
      Iterators = $iter.Iterators;
  require("npm:core-js@0.9.18/library/modules/$.iter-define.js")(Array, 'Array', function(iterated, kind) {
    $.set(this, ITER, {
      o: $.toObject(iterated),
      i: 0,
      k: kind
    });
  }, function() {
    var iter = this[ITER],
        O = iter.o,
        kind = iter.k,
        index = iter.i++;
    if (!O || index >= O.length) {
      iter.o = undefined;
      return step(1);
    }
    if (kind == 'keys')
      return step(0, index);
    if (kind == 'values')
      return step(0, O[index]);
    return step(0, [index, O[index]]);
  }, 'values');
  Iterators.Arguments = Iterators.Array;
  setUnscope('keys');
  setUnscope('values');
  setUnscope('entries');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.for-of.js", ["npm:core-js@0.9.18/library/modules/$.ctx.js", "npm:core-js@0.9.18/library/modules/$.iter.js", "npm:core-js@0.9.18/library/modules/$.iter-call.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var ctx = require("npm:core-js@0.9.18/library/modules/$.ctx.js"),
      get = require("npm:core-js@0.9.18/library/modules/$.iter.js").get,
      call = require("npm:core-js@0.9.18/library/modules/$.iter-call.js");
  module.exports = function(iterable, entries, fn, that) {
    var iterator = get(iterable),
        f = ctx(fn, that, entries ? 2 : 1),
        step;
    while (!(step = iterator.next()).done) {
      if (call(iterator, f, step.value, entries) === false) {
        return call.close(iterator);
      }
    }
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:process@0.10.1.js", ["npm:process@0.10.1/browser.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = require("npm:process@0.10.1/browser.js");
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/fn/object/define-property.js", ["npm:core-js@0.9.18/library/modules/$.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js");
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.6.14/helpers/inherits.js", ["npm:babel-runtime@5.6.14/core-js/object/create.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _Object$create = require("npm:babel-runtime@5.6.14/core-js/object/create.js")["default"];
  exports["default"] = function(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = _Object$create(superClass && superClass.prototype, {constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }});
    if (superClass)
      subClass.__proto__ = superClass;
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/fn/object/get-own-property-descriptor.js", ["npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/es6.object.statics-accept-primitives.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js");
  require("npm:core-js@0.9.18/library/modules/es6.object.statics-accept-primitives.js");
  module.exports = function getOwnPropertyDescriptor(it, key) {
    return $.getDesc(it, key);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.cof.js", ["npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.wks.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      TAG = require("npm:core-js@0.9.18/library/modules/$.wks.js")('toStringTag'),
      toString = {}.toString;
  function cof(it) {
    return toString.call(it).slice(8, -1);
  }
  cof.classof = function(it) {
    var O,
        T;
    return it == undefined ? it === undefined ? 'Undefined' : 'Null' : typeof(T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
  };
  cof.set = function(it, tag, stat) {
    if (it && !$.has(it = stat ? it : it.prototype, TAG))
      $.hide(it, TAG, tag);
  };
  module.exports = cof;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/es6.string.iterator.js", ["npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.string-at.js", "npm:core-js@0.9.18/library/modules/$.uid.js", "npm:core-js@0.9.18/library/modules/$.iter.js", "npm:core-js@0.9.18/library/modules/$.iter-define.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  var set = require("npm:core-js@0.9.18/library/modules/$.js").set,
      $at = require("npm:core-js@0.9.18/library/modules/$.string-at.js")(true),
      ITER = require("npm:core-js@0.9.18/library/modules/$.uid.js").safe('iter'),
      $iter = require("npm:core-js@0.9.18/library/modules/$.iter.js"),
      step = $iter.step;
  require("npm:core-js@0.9.18/library/modules/$.iter-define.js")(String, 'String', function(iterated) {
    set(this, ITER, {
      o: String(iterated),
      i: 0
    });
  }, function() {
    var iter = this[ITER],
        O = iter.o,
        index = iter.i,
        point;
    if (index >= O.length)
      return step(1);
    point = $at(O, index);
    iter.i += point.length;
    return step(0, point);
  });
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/web.dom.iterable.js", ["npm:core-js@0.9.18/library/modules/es6.array.iterator.js", "npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.iter.js", "npm:core-js@0.9.18/library/modules/$.wks.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("npm:core-js@0.9.18/library/modules/es6.array.iterator.js");
  var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
      Iterators = require("npm:core-js@0.9.18/library/modules/$.iter.js").Iterators,
      ITERATOR = require("npm:core-js@0.9.18/library/modules/$.wks.js")('iterator'),
      ArrayValues = Iterators.Array,
      NL = $.g.NodeList,
      HTC = $.g.HTMLCollection,
      NLProto = NL && NL.prototype,
      HTCProto = HTC && HTC.prototype;
  if ($.FW) {
    if (NL && !(ITERATOR in NLProto))
      $.hide(NLProto, ITERATOR, ArrayValues);
    if (HTC && !(ITERATOR in HTCProto))
      $.hide(HTCProto, ITERATOR, ArrayValues);
  }
  Iterators.NodeList = Iterators.HTMLCollection = ArrayValues;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.1/index.js", ["npm:process@0.10.1.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = System._nodeRequire ? process : require("npm:process@0.10.1.js");
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.6.14/core-js/object/define-property.js", ["npm:core-js@0.9.18/library/fn/object/define-property.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("npm:core-js@0.9.18/library/fn/object/define-property.js"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.6.14/core-js/object/get-own-property-descriptor.js", ["npm:core-js@0.9.18/library/fn/object/get-own-property-descriptor.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("npm:core-js@0.9.18/library/fn/object/get-own-property-descriptor.js"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/es6.object.to-string.js", ["npm:core-js@0.9.18/library/modules/$.cof.js", "npm:core-js@0.9.18/library/modules/$.wks.js", "npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.redef.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var cof = require("npm:core-js@0.9.18/library/modules/$.cof.js"),
      tmp = {};
  tmp[require("npm:core-js@0.9.18/library/modules/$.wks.js")('toStringTag')] = 'z';
  if (require("npm:core-js@0.9.18/library/modules/$.js").FW && cof(tmp) != 'z') {
    require("npm:core-js@0.9.18/library/modules/$.redef.js")(Object.prototype, 'toString', function toString() {
      return '[object ' + cof.classof(this) + ']';
    }, true);
  }
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.1.js", ["github:jspm/nodelibs-process@0.1.1/index.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = require("github:jspm/nodelibs-process@0.1.1/index.js");
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.6.14/helpers/create-class.js", ["npm:babel-runtime@5.6.14/core-js/object/define-property.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _Object$defineProperty = require("npm:babel-runtime@5.6.14/core-js/object/define-property.js")["default"];
  exports["default"] = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        _Object$defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.6.14/helpers/get.js", ["npm:babel-runtime@5.6.14/core-js/object/get-own-property-descriptor.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _Object$getOwnPropertyDescriptor = require("npm:babel-runtime@5.6.14/core-js/object/get-own-property-descriptor.js")["default"];
  exports["default"] = function get(_x, _x2, _x3) {
    var _again = true;
    _function: while (_again) {
      var object = _x,
          property = _x2,
          receiver = _x3;
      desc = parent = getter = undefined;
      _again = false;
      if (object === null)
        object = Function.prototype;
      var desc = _Object$getOwnPropertyDescriptor(object, property);
      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
          return undefined;
        } else {
          _x = parent;
          _x2 = property;
          _x3 = receiver;
          _again = true;
          continue _function;
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;
        if (getter === undefined) {
          return undefined;
        }
        return getter.call(receiver);
      }
    }
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/$.task.js", ["npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.ctx.js", "npm:core-js@0.9.18/library/modules/$.cof.js", "npm:core-js@0.9.18/library/modules/$.invoke.js", "npm:core-js@0.9.18/library/modules/$.dom-create.js", "github:jspm/nodelibs-process@0.1.1.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
        ctx = require("npm:core-js@0.9.18/library/modules/$.ctx.js"),
        cof = require("npm:core-js@0.9.18/library/modules/$.cof.js"),
        invoke = require("npm:core-js@0.9.18/library/modules/$.invoke.js"),
        cel = require("npm:core-js@0.9.18/library/modules/$.dom-create.js"),
        global = $.g,
        isFunction = $.isFunction,
        html = $.html,
        process = global.process,
        setTask = global.setImmediate,
        clearTask = global.clearImmediate,
        MessageChannel = global.MessageChannel,
        counter = 0,
        queue = {},
        ONREADYSTATECHANGE = 'onreadystatechange',
        defer,
        channel,
        port;
    function run() {
      var id = +this;
      if ($.has(queue, id)) {
        var fn = queue[id];
        delete queue[id];
        fn();
      }
    }
    function listner(event) {
      run.call(event.data);
    }
    if (!isFunction(setTask) || !isFunction(clearTask)) {
      setTask = function(fn) {
        var args = [],
            i = 1;
        while (arguments.length > i)
          args.push(arguments[i++]);
        queue[++counter] = function() {
          invoke(isFunction(fn) ? fn : Function(fn), args);
        };
        defer(counter);
        return counter;
      };
      clearTask = function(id) {
        delete queue[id];
      };
      if (cof(process) == 'process') {
        defer = function(id) {
          process.nextTick(ctx(run, id, 1));
        };
      } else if (global.addEventListener && isFunction(global.postMessage) && !global.importScripts) {
        defer = function(id) {
          global.postMessage(id, '*');
        };
        global.addEventListener('message', listner, false);
      } else if (isFunction(MessageChannel)) {
        channel = new MessageChannel;
        port = channel.port2;
        channel.port1.onmessage = listner;
        defer = ctx(port.postMessage, port, 1);
      } else if (ONREADYSTATECHANGE in cel('script')) {
        defer = function(id) {
          html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function() {
            html.removeChild(this);
            run.call(id);
          };
        };
      } else {
        defer = function(id) {
          setTimeout(ctx(run, id, 1), 0);
        };
      }
    }
    module.exports = {
      set: setTask,
      clear: clearTask
    };
  })(require("github:jspm/nodelibs-process@0.1.1.js"));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/modules/es6.promise.js", ["npm:core-js@0.9.18/library/modules/$.js", "npm:core-js@0.9.18/library/modules/$.ctx.js", "npm:core-js@0.9.18/library/modules/$.cof.js", "npm:core-js@0.9.18/library/modules/$.def.js", "npm:core-js@0.9.18/library/modules/$.assert.js", "npm:core-js@0.9.18/library/modules/$.for-of.js", "npm:core-js@0.9.18/library/modules/$.set-proto.js", "npm:core-js@0.9.18/library/modules/$.same.js", "npm:core-js@0.9.18/library/modules/$.species.js", "npm:core-js@0.9.18/library/modules/$.wks.js", "npm:core-js@0.9.18/library/modules/$.uid.js", "npm:core-js@0.9.18/library/modules/$.task.js", "npm:core-js@0.9.18/library/modules/$.mix.js", "npm:core-js@0.9.18/library/modules/$.iter-detect.js", "github:jspm/nodelibs-process@0.1.1.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var $ = require("npm:core-js@0.9.18/library/modules/$.js"),
        ctx = require("npm:core-js@0.9.18/library/modules/$.ctx.js"),
        cof = require("npm:core-js@0.9.18/library/modules/$.cof.js"),
        $def = require("npm:core-js@0.9.18/library/modules/$.def.js"),
        assert = require("npm:core-js@0.9.18/library/modules/$.assert.js"),
        forOf = require("npm:core-js@0.9.18/library/modules/$.for-of.js"),
        setProto = require("npm:core-js@0.9.18/library/modules/$.set-proto.js").set,
        same = require("npm:core-js@0.9.18/library/modules/$.same.js"),
        species = require("npm:core-js@0.9.18/library/modules/$.species.js"),
        SPECIES = require("npm:core-js@0.9.18/library/modules/$.wks.js")('species'),
        RECORD = require("npm:core-js@0.9.18/library/modules/$.uid.js").safe('record'),
        PROMISE = 'Promise',
        global = $.g,
        process = global.process,
        isNode = cof(process) == 'process',
        asap = process && process.nextTick || require("npm:core-js@0.9.18/library/modules/$.task.js").set,
        P = global[PROMISE],
        isFunction = $.isFunction,
        isObject = $.isObject,
        assertFunction = assert.fn,
        assertObject = assert.obj,
        Wrapper;
    function testResolve(sub) {
      var test = new P(function() {});
      if (sub)
        test.constructor = Object;
      return P.resolve(test) === test;
    }
    var useNative = function() {
      var works = false;
      function P2(x) {
        var self = new P(x);
        setProto(self, P2.prototype);
        return self;
      }
      try {
        works = isFunction(P) && isFunction(P.resolve) && testResolve();
        setProto(P2, P);
        P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
        if (!(P2.resolve(5).then(function() {}) instanceof P2)) {
          works = false;
        }
        if (works && $.DESC) {
          var thenableThenGotten = false;
          P.resolve($.setDesc({}, 'then', {get: function() {
              thenableThenGotten = true;
            }}));
          works = thenableThenGotten;
        }
      } catch (e) {
        works = false;
      }
      return works;
    }();
    function isPromise(it) {
      return isObject(it) && (useNative ? cof.classof(it) == 'Promise' : RECORD in it);
    }
    function sameConstructor(a, b) {
      if (!$.FW && a === P && b === Wrapper)
        return true;
      return same(a, b);
    }
    function getConstructor(C) {
      var S = assertObject(C)[SPECIES];
      return S != undefined ? S : C;
    }
    function isThenable(it) {
      var then;
      if (isObject(it))
        then = it.then;
      return isFunction(then) ? then : false;
    }
    function notify(record) {
      var chain = record.c;
      if (chain.length)
        asap.call(global, function() {
          var value = record.v,
              ok = record.s == 1,
              i = 0;
          function run(react) {
            var cb = ok ? react.ok : react.fail,
                ret,
                then;
            try {
              if (cb) {
                if (!ok)
                  record.h = true;
                ret = cb === true ? value : cb(value);
                if (ret === react.P) {
                  react.rej(TypeError('Promise-chain cycle'));
                } else if (then = isThenable(ret)) {
                  then.call(ret, react.res, react.rej);
                } else
                  react.res(ret);
              } else
                react.rej(value);
            } catch (err) {
              react.rej(err);
            }
          }
          while (chain.length > i)
            run(chain[i++]);
          chain.length = 0;
        });
    }
    function isUnhandled(promise) {
      var record = promise[RECORD],
          chain = record.a || record.c,
          i = 0,
          react;
      if (record.h)
        return false;
      while (chain.length > i) {
        react = chain[i++];
        if (react.fail || !isUnhandled(react.P))
          return false;
      }
      return true;
    }
    function $reject(value) {
      var record = this,
          promise;
      if (record.d)
        return;
      record.d = true;
      record = record.r || record;
      record.v = value;
      record.s = 2;
      record.a = record.c.slice();
      setTimeout(function() {
        asap.call(global, function() {
          if (isUnhandled(promise = record.p)) {
            if (isNode) {
              process.emit('unhandledRejection', value, promise);
            } else if (global.console && console.error) {
              console.error('Unhandled promise rejection', value);
            }
          }
          record.a = undefined;
        });
      }, 1);
      notify(record);
    }
    function $resolve(value) {
      var record = this,
          then;
      if (record.d)
        return;
      record.d = true;
      record = record.r || record;
      try {
        if (then = isThenable(value)) {
          asap.call(global, function() {
            var wrapper = {
              r: record,
              d: false
            };
            try {
              then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
            } catch (e) {
              $reject.call(wrapper, e);
            }
          });
        } else {
          record.v = value;
          record.s = 1;
          notify(record);
        }
      } catch (e) {
        $reject.call({
          r: record,
          d: false
        }, e);
      }
    }
    if (!useNative) {
      P = function Promise(executor) {
        assertFunction(executor);
        var record = {
          p: assert.inst(this, P, PROMISE),
          c: [],
          a: undefined,
          s: 0,
          d: false,
          v: undefined,
          h: false
        };
        $.hide(this, RECORD, record);
        try {
          executor(ctx($resolve, record, 1), ctx($reject, record, 1));
        } catch (err) {
          $reject.call(record, err);
        }
      };
      require("npm:core-js@0.9.18/library/modules/$.mix.js")(P.prototype, {
        then: function then(onFulfilled, onRejected) {
          var S = assertObject(assertObject(this).constructor)[SPECIES];
          var react = {
            ok: isFunction(onFulfilled) ? onFulfilled : true,
            fail: isFunction(onRejected) ? onRejected : false
          };
          var promise = react.P = new (S != undefined ? S : P)(function(res, rej) {
            react.res = assertFunction(res);
            react.rej = assertFunction(rej);
          });
          var record = this[RECORD];
          record.c.push(react);
          if (record.a)
            record.a.push(react);
          if (record.s)
            notify(record);
          return promise;
        },
        'catch': function(onRejected) {
          return this.then(undefined, onRejected);
        }
      });
    }
    $def($def.G + $def.W + $def.F * !useNative, {Promise: P});
    cof.set(P, PROMISE);
    species(P);
    species(Wrapper = $.core[PROMISE]);
    $def($def.S + $def.F * !useNative, PROMISE, {reject: function reject(r) {
        return new (getConstructor(this))(function(res, rej) {
          rej(r);
        });
      }});
    $def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {resolve: function resolve(x) {
        return isPromise(x) && sameConstructor(x.constructor, this) ? x : new this(function(res) {
          res(x);
        });
      }});
    $def($def.S + $def.F * !(useNative && require("npm:core-js@0.9.18/library/modules/$.iter-detect.js")(function(iter) {
      P.all(iter)['catch'](function() {});
    })), PROMISE, {
      all: function all(iterable) {
        var C = getConstructor(this),
            values = [];
        return new C(function(res, rej) {
          forOf(iterable, false, values.push, values);
          var remaining = values.length,
              results = Array(remaining);
          if (remaining)
            $.each.call(values, function(promise, index) {
              C.resolve(promise).then(function(value) {
                results[index] = value;
                --remaining || res(results);
              }, rej);
            });
          else
            res(results);
        });
      },
      race: function race(iterable) {
        var C = getConstructor(this);
        return new C(function(res, rej) {
          forOf(iterable, false, function(promise) {
            C.resolve(promise).then(res, rej);
          });
        });
      }
    });
  })(require("github:jspm/nodelibs-process@0.1.1.js"));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@0.9.18/library/fn/promise.js", ["npm:core-js@0.9.18/library/modules/es6.object.to-string.js", "npm:core-js@0.9.18/library/modules/es6.string.iterator.js", "npm:core-js@0.9.18/library/modules/web.dom.iterable.js", "npm:core-js@0.9.18/library/modules/es6.promise.js", "npm:core-js@0.9.18/library/modules/$.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("npm:core-js@0.9.18/library/modules/es6.object.to-string.js");
  require("npm:core-js@0.9.18/library/modules/es6.string.iterator.js");
  require("npm:core-js@0.9.18/library/modules/web.dom.iterable.js");
  require("npm:core-js@0.9.18/library/modules/es6.promise.js");
  module.exports = require("npm:core-js@0.9.18/library/modules/$.js").core.Promise;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.6.14/core-js/promise.js", ["npm:core-js@0.9.18/library/fn/promise.js"], true, function(require, exports, module) {
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("npm:core-js@0.9.18/library/fn/promise.js"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.register('app/components/Component/Component.js', ['npm:babel-runtime@5.6.14/helpers/create-class.js', 'npm:babel-runtime@5.6.14/helpers/class-call-check.js'], function (_export) {
  var _createClass, _classCallCheck, Component;

  return {
    setters: [function (_npmBabelRuntime5614HelpersCreateClassJs) {
      _createClass = _npmBabelRuntime5614HelpersCreateClassJs['default'];
    }, function (_npmBabelRuntime5614HelpersClassCallCheckJs) {
      _classCallCheck = _npmBabelRuntime5614HelpersClassCallCheckJs['default'];
    }],
    execute: function () {
      'use strict';

      Component = (function () {
        function Component(domNode, template) {
          _classCallCheck(this, Component);

          if (typeof domNode === 'string') {
            var nodeId = domNode;
            domNode = document.getElementById(domNode);
            if (domNode === null) {
              throw new Error('No element found under #' + nodeId);
            }
          }
          if (domNode instanceof HTMLElement) {
            this.domNode = domNode;
            this.domNode.innerHTML = template;
          } else {
            throw new Error('Invalid param, must be an HTMLElement or a string of the id of one');
          }
        }

        _createClass(Component, [{
          key: 'init',
          value: function init() {
            return this;
          }
        }, {
          key: 'show',
          value: function show() {
            this.domNode.style.display = 'block';
            return this;
          }
        }, {
          key: 'hide',
          value: function hide() {
            this.domNode.style.display = 'none';
            return this;
          }
        }]);

        return Component;
      })();

      _export('default', Component);
    }
  };
});
System.register('app/components/Spinner/Spinner.js', ['npm:babel-runtime@5.6.14/helpers/inherits.js', 'npm:babel-runtime@5.6.14/helpers/get.js', 'npm:babel-runtime@5.6.14/helpers/class-call-check.js', 'app/components/Component/Component.js', 'app/components/Spinner/Spinner.html!github:systemjs/plugin-text@0.0.2.js', 'app/components/Spinner/Spinner.css!github:systemjs/plugin-css@0.1.13.js'], function (_export) {
  var _inherits, _get, _classCallCheck, Component, template, stylesheet, Spinner;

  return {
    setters: [function (_npmBabelRuntime5614HelpersInheritsJs) {
      _inherits = _npmBabelRuntime5614HelpersInheritsJs['default'];
    }, function (_npmBabelRuntime5614HelpersGetJs) {
      _get = _npmBabelRuntime5614HelpersGetJs['default'];
    }, function (_npmBabelRuntime5614HelpersClassCallCheckJs) {
      _classCallCheck = _npmBabelRuntime5614HelpersClassCallCheckJs['default'];
    }, function (_appComponentsComponentComponentJs) {
      Component = _appComponentsComponentComponentJs['default'];
    }, function (_appComponentsSpinnerSpinnerHtmlGithubSystemjsPluginText002Js) {
      template = _appComponentsSpinnerSpinnerHtmlGithubSystemjsPluginText002Js['default'];
    }, function (_appComponentsSpinnerSpinnerCssGithubSystemjsPluginCss0113Js) {
      stylesheet = _appComponentsSpinnerSpinnerCssGithubSystemjsPluginCss0113Js['default'];
    }],
    execute: function () {
      'use strict';

      Spinner = (function (_Component) {
        function Spinner(domNode) {
          _classCallCheck(this, Spinner);

          _get(Object.getPrototypeOf(Spinner.prototype), 'constructor', this).call(this, domNode, template);
        }

        _inherits(Spinner, _Component);

        return Spinner;
      })(Component);

      _export('default', Spinner);
    }
  };
});
System.register("app/services/geolocation/geolocation.js", ["npm:babel-runtime@5.6.14/core-js/promise.js"], function (_export) {
  var _Promise;

  return {
    setters: [function (_npmBabelRuntime5614CoreJsPromiseJs) {
      _Promise = _npmBabelRuntime5614CoreJsPromiseJs["default"];
    }],
    execute: function () {
      "use strict";

      _export("default", function () {
        "use strict";
        var ipAddress = arguments[0] === undefined ? "" : arguments[0];
        var url = "https://freegeoip.net/json/" + ipAddress;
        return new _Promise(function (resolve, reject) {
          fetch(url).then(function (res) {
            return resolve(res.json());
          })["catch"](function (e) {
            return reject(e);
          });
        });
      });
    }
  };
});
System.register('app/components/Geolocation/Geolocation.js', ['npm:babel-runtime@5.6.14/helpers/inherits.js', 'npm:babel-runtime@5.6.14/helpers/get.js', 'npm:babel-runtime@5.6.14/helpers/create-class.js', 'npm:babel-runtime@5.6.14/helpers/class-call-check.js', 'app/components/Component/Component.js', 'app/components/Spinner/Spinner.js', 'app/components/Geolocation/Geolocation.html!github:systemjs/plugin-text@0.0.2.js', 'app/services/geolocation/geolocation.js'], function (_export) {
  var _inherits, _get, _createClass, _classCallCheck, Component, Spinner, template, geoip, Geolocation;

  return {
    setters: [function (_npmBabelRuntime5614HelpersInheritsJs) {
      _inherits = _npmBabelRuntime5614HelpersInheritsJs['default'];
    }, function (_npmBabelRuntime5614HelpersGetJs) {
      _get = _npmBabelRuntime5614HelpersGetJs['default'];
    }, function (_npmBabelRuntime5614HelpersCreateClassJs) {
      _createClass = _npmBabelRuntime5614HelpersCreateClassJs['default'];
    }, function (_npmBabelRuntime5614HelpersClassCallCheckJs) {
      _classCallCheck = _npmBabelRuntime5614HelpersClassCallCheckJs['default'];
    }, function (_appComponentsComponentComponentJs) {
      Component = _appComponentsComponentComponentJs['default'];
    }, function (_appComponentsSpinnerSpinnerJs) {
      Spinner = _appComponentsSpinnerSpinnerJs['default'];
    }, function (_appComponentsGeolocationGeolocationHtmlGithubSystemjsPluginText002Js) {
      template = _appComponentsGeolocationGeolocationHtmlGithubSystemjsPluginText002Js['default'];
    }, function (_appServicesGeolocationGeolocationJs) {
      geoip = _appServicesGeolocationGeolocationJs['default'];
    }],
    execute: function () {
      'use strict';

      Geolocation = (function (_Component) {
        function Geolocation(domNode) {
          _classCallCheck(this, Geolocation);

          _get(Object.getPrototypeOf(Geolocation.prototype), 'constructor', this).call(this, domNode, template);
        }

        _inherits(Geolocation, _Component);

        _createClass(Geolocation, [{
          key: 'init',
          value: function init() {
            var _this = this;

            this.spinner = new Spinner(this.domNode.querySelector('.spinner')).init().hide();

            var geolocationInfosBloc = this.domNode.querySelector('.geolocation-infos');

            this.domNode.querySelector('.geolocation-button').addEventListener('click', function () {
              geolocationInfosBloc.style.display = 'none';
              _this.spinner.show();
              geoip().then(function (result) {
                console.log(result);
                var tpl = '\n          <li>City: ' + result.city + '</li>\n          <li>Country: ' + result.country_name + '</li>\n          <li>Region: ' + result.region_name + '</li>\n          <li>Time zone: ' + result.time_zone + '</li>\n          <li>Region: ' + result.region_name + '</li>\n          <li>Latitude : ' + result.latitude + ' / Longitude: ' + result.longitude + '</li>\n        ';
                _this.spinner.hide();
                geolocationInfosBloc.style.display = 'block';
                geolocationInfosBloc.innerHTML = tpl;
              })['catch'](function (e) {
                console.error(e);
                geolocationInfosBloc.innerHTML = '<li>An error occured</li>';
                _this.spinner.hide();
                geolocationInfosBloc.style.display = 'block';
              });
            }, false);
            return this;
          }
        }]);

        return Geolocation;
      })(Component);

      _export('default', Geolocation);
    }
  };
});
System.register('app/main.js', ['npm:babel-runtime@5.6.14/helpers/create-class.js', 'npm:babel-runtime@5.6.14/helpers/class-call-check.js', 'app/components/Geolocation/Geolocation.js'], function (_export) {
  var _createClass, _classCallCheck, Geolocation, main;

  return {
    setters: [function (_npmBabelRuntime5614HelpersCreateClassJs) {
      _createClass = _npmBabelRuntime5614HelpersCreateClassJs['default'];
    }, function (_npmBabelRuntime5614HelpersClassCallCheckJs) {
      _classCallCheck = _npmBabelRuntime5614HelpersClassCallCheckJs['default'];
    }, function (_appComponentsGeolocationGeolocationJs) {
      Geolocation = _appComponentsGeolocationGeolocationJs['default'];
    }],
    execute: function () {
      'use strict';

      main = (function () {
        function main() {
          _classCallCheck(this, main);
        }

        _createClass(main, null, [{
          key: 'init',
          value: function init() {
            this.initGeolocation();
          }
        }, {
          key: 'initGeolocation',
          value: function initGeolocation() {
            new Geolocation('geolocation').init();
          }
        }]);

        return main;
      })();

      _export('default', main);
    }
  };
});
System.register('app/bootstrap.js', ['npm:babel-runtime@5.6.14/helpers/create-class.js', 'npm:babel-runtime@5.6.14/helpers/class-call-check.js', 'app/main.js'], function (_export) {
  var _createClass, _classCallCheck, main, Bootstrap;

  return {
    setters: [function (_npmBabelRuntime5614HelpersCreateClassJs) {
      _createClass = _npmBabelRuntime5614HelpersCreateClassJs['default'];
    }, function (_npmBabelRuntime5614HelpersClassCallCheckJs) {
      _classCallCheck = _npmBabelRuntime5614HelpersClassCallCheckJs['default'];
    }, function (_appMainJs) {
      main = _appMainJs['default'];
    }],
    execute: function () {
      //import bootstrap from 'bootstrap';
      //import $ from 'jquery';

      'use strict';

      Bootstrap = (function () {
        function Bootstrap() {
          _classCallCheck(this, Bootstrap);
        }

        _createClass(Bootstrap, null, [{
          key: 'init',
          value: function init() {
            console.log('Bootstrap.init !!!');
            main.init();
          }
        }]);

        return Bootstrap;
      })();

      _export('default', Bootstrap);

      Bootstrap.init();
    }
  };
});
System.register('app/components/Spinner/Spinner.css!github:systemjs/plugin-css@0.1.13.js', [], false, function() {});
(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
("#circularG{position:relative;width:64px;height:64px}.circularG{position:absolute;background-color:#900000;width:15px;height:15px;-moz-border-radius:10px;-moz-animation-name:bounce_circularG;-moz-animation-duration:.64s;-moz-animation-iteration-count:infinite;-moz-animation-direction:normal;-webkit-border-radius:10px;-webkit-animation-name:bounce_circularG;-webkit-animation-duration:.64s;-webkit-animation-iteration-count:infinite;-webkit-animation-direction:normal;-ms-border-radius:10px;-ms-animation-name:bounce_circularG;-ms-animation-duration:.64s;-ms-animation-iteration-count:infinite;-ms-animation-direction:normal;-o-border-radius:10px;-o-animation-name:bounce_circularG;-o-animation-duration:.64s;-o-animation-iteration-count:infinite;-o-animation-direction:normal;border-radius:10px;animation-name:bounce_circularG;animation-duration:.64s;animation-iteration-count:infinite;animation-direction:normal}#circularG_1{left:0;top:25px;-moz-animation-delay:.24s;-webkit-animation-delay:.24s;-ms-animation-delay:.24s;-o-animation-delay:.24s;animation-delay:.24s}#circularG_2{left:7px;top:7px;-moz-animation-delay:.32s;-webkit-animation-delay:.32s;-ms-animation-delay:.32s;-o-animation-delay:.32s;animation-delay:.32s}#circularG_3{top:0;left:25px;-moz-animation-delay:.4s;-webkit-animation-delay:.4s;-ms-animation-delay:.4s;-o-animation-delay:.4s;animation-delay:.4s}#circularG_4{right:7px;top:7px;-moz-animation-delay:.48s;-webkit-animation-delay:.48s;-ms-animation-delay:.48s;-o-animation-delay:.48s;animation-delay:.48s}#circularG_5{right:0;top:25px;-moz-animation-delay:.56s;-webkit-animation-delay:.56s;-ms-animation-delay:.56s;-o-animation-delay:.56s;animation-delay:.56s}#circularG_6{right:7px;bottom:7px;-moz-animation-delay:.64s;-webkit-animation-delay:.64s;-ms-animation-delay:.64s;-o-animation-delay:.64s;animation-delay:.64s}#circularG_7{left:25px;bottom:0;-moz-animation-delay:.72s;-webkit-animation-delay:.72s;-ms-animation-delay:.72s;-o-animation-delay:.72s;animation-delay:.72s}#circularG_8{left:7px;bottom:7px;-moz-animation-delay:.8s;-webkit-animation-delay:.8s;-ms-animation-delay:.8s;-o-animation-delay:.8s;animation-delay:.8s}@-moz-keyframes bounce_circularG{0%{-moz-transform:scale(1)}100%{-moz-transform:scale(.3)}}@-webkit-keyframes bounce_circularG{0%{-webkit-transform:scale(1)}100%{-webkit-transform:scale(.3)}}@-ms-keyframes bounce_circularG{0%{-ms-transform:scale(1)}100%{-ms-transform:scale(.3)}}@-o-keyframes bounce_circularG{0%{-o-transform:scale(1)}100%{-o-transform:scale(.3)}}@keyframes bounce_circularG{0%{transform:scale(1)}100%{transform:scale(.3)}}");
})
(function(factory) {
  factory();
});
//# sourceMappingURL=app.bootstrap.build.js.map