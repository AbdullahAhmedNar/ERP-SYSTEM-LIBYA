"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const fs$1 = require("fs");
const path$1 = require("path");
const require$$2 = require("util");
const electron = require("electron");
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var lib = { exports: {} };
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var util$1 = {};
util$1.getBooleanOption = (options, key) => {
  let value = false;
  if (key in options && typeof (value = options[key]) !== "boolean") {
    throw new TypeError(`Expected the "${key}" option to be a boolean`);
  }
  return value;
};
util$1.cppdb = Symbol();
util$1.inspect = Symbol.for("nodejs.util.inspect.custom");
const descriptor = { value: "SqliteError", writable: true, enumerable: false, configurable: true };
function SqliteError$1(message, code) {
  if (new.target !== SqliteError$1) {
    return new SqliteError$1(message, code);
  }
  if (typeof code !== "string") {
    throw new TypeError("Expected second argument to be a string");
  }
  Error.call(this, message);
  descriptor.value = "" + message;
  Object.defineProperty(this, "message", descriptor);
  Error.captureStackTrace(this, SqliteError$1);
  this.code = code;
}
Object.setPrototypeOf(SqliteError$1, Error);
Object.setPrototypeOf(SqliteError$1.prototype, Error.prototype);
Object.defineProperty(SqliteError$1.prototype, "name", descriptor);
var sqliteError = SqliteError$1;
var bindings = { exports: {} };
var fileUriToPath_1;
var hasRequiredFileUriToPath;
function requireFileUriToPath() {
  if (hasRequiredFileUriToPath) return fileUriToPath_1;
  hasRequiredFileUriToPath = 1;
  var sep = path$1.sep || "/";
  fileUriToPath_1 = fileUriToPath;
  function fileUriToPath(uri) {
    if ("string" != typeof uri || uri.length <= 7 || "file://" != uri.substring(0, 7)) {
      throw new TypeError("must pass in a file:// URI to convert to a file path");
    }
    var rest = decodeURI(uri.substring(7));
    var firstSlash = rest.indexOf("/");
    var host = rest.substring(0, firstSlash);
    var path2 = rest.substring(firstSlash + 1);
    if ("localhost" == host) host = "";
    if (host) {
      host = sep + sep + host;
    }
    path2 = path2.replace(/^(.+)\|/, "$1:");
    if (sep == "\\") {
      path2 = path2.replace(/\//g, "\\");
    }
    if (/^.+\:/.test(path2)) ;
    else {
      path2 = sep + path2;
    }
    return host + path2;
  }
  return fileUriToPath_1;
}
var hasRequiredBindings;
function requireBindings() {
  if (hasRequiredBindings) return bindings.exports;
  hasRequiredBindings = 1;
  (function(module2, exports$1) {
    var fs2 = fs$1, path2 = path$1, fileURLToPath = requireFileUriToPath(), join = path2.join, dirname = path2.dirname, exists = fs2.accessSync && function(path22) {
      try {
        fs2.accessSync(path22);
      } catch (e) {
        return false;
      }
      return true;
    } || fs2.existsSync || path2.existsSync, defaults = {
      arrow: process.env.NODE_BINDINGS_ARROW || " → ",
      compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
      platform: process.platform,
      arch: process.arch,
      nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
      version: process.versions.node,
      bindings: "bindings.node",
      try: [
        // node-gyp's linked version in the "build" dir
        ["module_root", "build", "bindings"],
        // node-waf and gyp_addon (a.k.a node-gyp)
        ["module_root", "build", "Debug", "bindings"],
        ["module_root", "build", "Release", "bindings"],
        // Debug files, for development (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Debug", "bindings"],
        ["module_root", "Debug", "bindings"],
        // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Release", "bindings"],
        ["module_root", "Release", "bindings"],
        // Legacy from node-waf, node <= 0.4.x
        ["module_root", "build", "default", "bindings"],
        // Production "Release" buildtype binary (meh...)
        ["module_root", "compiled", "version", "platform", "arch", "bindings"],
        // node-qbs builds
        ["module_root", "addon-build", "release", "install-root", "bindings"],
        ["module_root", "addon-build", "debug", "install-root", "bindings"],
        ["module_root", "addon-build", "default", "install-root", "bindings"],
        // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
        ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
      ]
    };
    function bindings2(opts) {
      if (typeof opts == "string") {
        opts = { bindings: opts };
      } else if (!opts) {
        opts = {};
      }
      Object.keys(defaults).map(function(i2) {
        if (!(i2 in opts)) opts[i2] = defaults[i2];
      });
      if (!opts.module_root) {
        opts.module_root = exports$1.getRoot(exports$1.getFileName());
      }
      if (path2.extname(opts.bindings) != ".node") {
        opts.bindings += ".node";
      }
      var requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : commonjsRequire;
      var tries = [], i = 0, l = opts.try.length, n, b, err;
      for (; i < l; i++) {
        n = join.apply(
          null,
          opts.try[i].map(function(p) {
            return opts[p] || p;
          })
        );
        tries.push(n);
        try {
          b = opts.path ? requireFunc.resolve(n) : requireFunc(n);
          if (!opts.path) {
            b.path = n;
          }
          return b;
        } catch (e) {
          if (e.code !== "MODULE_NOT_FOUND" && e.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(e.message)) {
            throw e;
          }
        }
      }
      err = new Error(
        "Could not locate the bindings file. Tried:\n" + tries.map(function(a) {
          return opts.arrow + a;
        }).join("\n")
      );
      err.tries = tries;
      throw err;
    }
    module2.exports = exports$1 = bindings2;
    exports$1.getFileName = function getFileName(calling_file) {
      var origPST = Error.prepareStackTrace, origSTL = Error.stackTraceLimit, dummy = {}, fileName;
      Error.stackTraceLimit = 10;
      Error.prepareStackTrace = function(e, st) {
        for (var i = 0, l = st.length; i < l; i++) {
          fileName = st[i].getFileName();
          if (fileName !== __filename) {
            if (calling_file) {
              if (fileName !== calling_file) {
                return;
              }
            } else {
              return;
            }
          }
        }
      };
      Error.captureStackTrace(dummy);
      dummy.stack;
      Error.prepareStackTrace = origPST;
      Error.stackTraceLimit = origSTL;
      var fileSchema = "file://";
      if (fileName.indexOf(fileSchema) === 0) {
        fileName = fileURLToPath(fileName);
      }
      return fileName;
    };
    exports$1.getRoot = function getRoot(file) {
      var dir = dirname(file), prev;
      while (true) {
        if (dir === ".") {
          dir = process.cwd();
        }
        if (exists(join(dir, "package.json")) || exists(join(dir, "node_modules"))) {
          return dir;
        }
        if (prev === dir) {
          throw new Error(
            'Could not find module root given file: "' + file + '". Do you have a `package.json` file? '
          );
        }
        prev = dir;
        dir = join(dir, "..");
      }
    };
  })(bindings, bindings.exports);
  return bindings.exports;
}
var wrappers$1 = {};
var hasRequiredWrappers;
function requireWrappers() {
  if (hasRequiredWrappers) return wrappers$1;
  hasRequiredWrappers = 1;
  const { cppdb } = util$1;
  wrappers$1.prepare = function prepare(sql) {
    return this[cppdb].prepare(sql, this, false);
  };
  wrappers$1.exec = function exec(sql) {
    this[cppdb].exec(sql);
    return this;
  };
  wrappers$1.close = function close() {
    this[cppdb].close();
    return this;
  };
  wrappers$1.loadExtension = function loadExtension(...args) {
    this[cppdb].loadExtension(...args);
    return this;
  };
  wrappers$1.defaultSafeIntegers = function defaultSafeIntegers(...args) {
    this[cppdb].defaultSafeIntegers(...args);
    return this;
  };
  wrappers$1.unsafeMode = function unsafeMode(...args) {
    this[cppdb].unsafeMode(...args);
    return this;
  };
  wrappers$1.getters = {
    name: {
      get: function name() {
        return this[cppdb].name;
      },
      enumerable: true
    },
    open: {
      get: function open() {
        return this[cppdb].open;
      },
      enumerable: true
    },
    inTransaction: {
      get: function inTransaction() {
        return this[cppdb].inTransaction;
      },
      enumerable: true
    },
    readonly: {
      get: function readonly() {
        return this[cppdb].readonly;
      },
      enumerable: true
    },
    memory: {
      get: function memory() {
        return this[cppdb].memory;
      },
      enumerable: true
    }
  };
  return wrappers$1;
}
var transaction;
var hasRequiredTransaction;
function requireTransaction() {
  if (hasRequiredTransaction) return transaction;
  hasRequiredTransaction = 1;
  const { cppdb } = util$1;
  const controllers = /* @__PURE__ */ new WeakMap();
  transaction = function transaction2(fn) {
    if (typeof fn !== "function") throw new TypeError("Expected first argument to be a function");
    const db2 = this[cppdb];
    const controller = getController(db2, this);
    const { apply } = Function.prototype;
    const properties = {
      default: { value: wrapTransaction(apply, fn, db2, controller.default) },
      deferred: { value: wrapTransaction(apply, fn, db2, controller.deferred) },
      immediate: { value: wrapTransaction(apply, fn, db2, controller.immediate) },
      exclusive: { value: wrapTransaction(apply, fn, db2, controller.exclusive) },
      database: { value: this, enumerable: true }
    };
    Object.defineProperties(properties.default.value, properties);
    Object.defineProperties(properties.deferred.value, properties);
    Object.defineProperties(properties.immediate.value, properties);
    Object.defineProperties(properties.exclusive.value, properties);
    return properties.default.value;
  };
  const getController = (db2, self) => {
    let controller = controllers.get(db2);
    if (!controller) {
      const shared = {
        commit: db2.prepare("COMMIT", self, false),
        rollback: db2.prepare("ROLLBACK", self, false),
        savepoint: db2.prepare("SAVEPOINT `	_bs3.	`", self, false),
        release: db2.prepare("RELEASE `	_bs3.	`", self, false),
        rollbackTo: db2.prepare("ROLLBACK TO `	_bs3.	`", self, false)
      };
      controllers.set(db2, controller = {
        default: Object.assign({ begin: db2.prepare("BEGIN", self, false) }, shared),
        deferred: Object.assign({ begin: db2.prepare("BEGIN DEFERRED", self, false) }, shared),
        immediate: Object.assign({ begin: db2.prepare("BEGIN IMMEDIATE", self, false) }, shared),
        exclusive: Object.assign({ begin: db2.prepare("BEGIN EXCLUSIVE", self, false) }, shared)
      });
    }
    return controller;
  };
  const wrapTransaction = (apply, fn, db2, { begin, commit, rollback, savepoint, release, rollbackTo }) => function sqliteTransaction() {
    let before, after, undo;
    if (db2.inTransaction) {
      before = savepoint;
      after = release;
      undo = rollbackTo;
    } else {
      before = begin;
      after = commit;
      undo = rollback;
    }
    before.run();
    try {
      const result = apply.call(fn, this, arguments);
      after.run();
      return result;
    } catch (ex) {
      if (db2.inTransaction) {
        undo.run();
        if (undo !== rollback) after.run();
      }
      throw ex;
    }
  };
  return transaction;
}
var pragma;
var hasRequiredPragma;
function requirePragma() {
  if (hasRequiredPragma) return pragma;
  hasRequiredPragma = 1;
  const { getBooleanOption, cppdb } = util$1;
  pragma = function pragma2(source, options) {
    if (options == null) options = {};
    if (typeof source !== "string") throw new TypeError("Expected first argument to be a string");
    if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
    const simple = getBooleanOption(options, "simple");
    const stmt = this[cppdb].prepare(`PRAGMA ${source}`, this, true);
    return simple ? stmt.pluck().get() : stmt.all();
  };
  return pragma;
}
var backup;
var hasRequiredBackup;
function requireBackup() {
  if (hasRequiredBackup) return backup;
  hasRequiredBackup = 1;
  const fs2 = fs$1;
  const path2 = path$1;
  const { promisify } = require$$2;
  const { cppdb } = util$1;
  const fsAccess = promisify(fs2.access);
  backup = async function backup2(filename, options) {
    if (options == null) options = {};
    if (typeof filename !== "string") throw new TypeError("Expected first argument to be a string");
    if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
    filename = filename.trim();
    const attachedName = "attached" in options ? options.attached : "main";
    const handler = "progress" in options ? options.progress : null;
    if (!filename) throw new TypeError("Backup filename cannot be an empty string");
    if (filename === ":memory:") throw new TypeError('Invalid backup filename ":memory:"');
    if (typeof attachedName !== "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');
    if (handler != null && typeof handler !== "function") throw new TypeError('Expected the "progress" option to be a function');
    await fsAccess(path2.dirname(filename)).catch(() => {
      throw new TypeError("Cannot save backup because the directory does not exist");
    });
    const isNewFile = await fsAccess(filename).then(() => false, () => true);
    return runBackup(this[cppdb].backup(this, attachedName, filename, isNewFile), handler || null);
  };
  const runBackup = (backup2, handler) => {
    let rate = 0;
    let useDefault = true;
    return new Promise((resolve, reject) => {
      setImmediate(function step() {
        try {
          const progress = backup2.transfer(rate);
          if (!progress.remainingPages) {
            backup2.close();
            resolve(progress);
            return;
          }
          if (useDefault) {
            useDefault = false;
            rate = 100;
          }
          if (handler) {
            const ret = handler(progress);
            if (ret !== void 0) {
              if (typeof ret === "number" && ret === ret) rate = Math.max(0, Math.min(2147483647, Math.round(ret)));
              else throw new TypeError("Expected progress callback to return a number or undefined");
            }
          }
          setImmediate(step);
        } catch (err) {
          backup2.close();
          reject(err);
        }
      });
    });
  };
  return backup;
}
var serialize;
var hasRequiredSerialize;
function requireSerialize() {
  if (hasRequiredSerialize) return serialize;
  hasRequiredSerialize = 1;
  const { cppdb } = util$1;
  serialize = function serialize2(options) {
    if (options == null) options = {};
    if (typeof options !== "object") throw new TypeError("Expected first argument to be an options object");
    const attachedName = "attached" in options ? options.attached : "main";
    if (typeof attachedName !== "string") throw new TypeError('Expected the "attached" option to be a string');
    if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');
    return this[cppdb].serialize(attachedName);
  };
  return serialize;
}
var _function;
var hasRequired_function;
function require_function() {
  if (hasRequired_function) return _function;
  hasRequired_function = 1;
  const { getBooleanOption, cppdb } = util$1;
  _function = function defineFunction(name, options, fn) {
    if (options == null) options = {};
    if (typeof options === "function") {
      fn = options;
      options = {};
    }
    if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
    if (typeof fn !== "function") throw new TypeError("Expected last argument to be a function");
    if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
    if (!name) throw new TypeError("User-defined function name cannot be an empty string");
    const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
    const deterministic = getBooleanOption(options, "deterministic");
    const directOnly = getBooleanOption(options, "directOnly");
    const varargs = getBooleanOption(options, "varargs");
    let argCount = -1;
    if (!varargs) {
      argCount = fn.length;
      if (!Number.isInteger(argCount) || argCount < 0) throw new TypeError("Expected function.length to be a positive integer");
      if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
    }
    this[cppdb].function(fn, name, argCount, safeIntegers, deterministic, directOnly);
    return this;
  };
  return _function;
}
var aggregate;
var hasRequiredAggregate;
function requireAggregate() {
  if (hasRequiredAggregate) return aggregate;
  hasRequiredAggregate = 1;
  const { getBooleanOption, cppdb } = util$1;
  aggregate = function defineAggregate(name, options) {
    if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
    if (typeof options !== "object" || options === null) throw new TypeError("Expected second argument to be an options object");
    if (!name) throw new TypeError("User-defined function name cannot be an empty string");
    const start = "start" in options ? options.start : null;
    const step = getFunctionOption(options, "step", true);
    const inverse = getFunctionOption(options, "inverse", false);
    const result = getFunctionOption(options, "result", false);
    const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
    const deterministic = getBooleanOption(options, "deterministic");
    const directOnly = getBooleanOption(options, "directOnly");
    const varargs = getBooleanOption(options, "varargs");
    let argCount = -1;
    if (!varargs) {
      argCount = Math.max(getLength(step), inverse ? getLength(inverse) : 0);
      if (argCount > 0) argCount -= 1;
      if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
    }
    this[cppdb].aggregate(start, step, inverse, result, name, argCount, safeIntegers, deterministic, directOnly);
    return this;
  };
  const getFunctionOption = (options, key, required) => {
    const value = key in options ? options[key] : null;
    if (typeof value === "function") return value;
    if (value != null) throw new TypeError(`Expected the "${key}" option to be a function`);
    if (required) throw new TypeError(`Missing required option "${key}"`);
    return null;
  };
  const getLength = ({ length }) => {
    if (Number.isInteger(length) && length >= 0) return length;
    throw new TypeError("Expected function.length to be a positive integer");
  };
  return aggregate;
}
var table;
var hasRequiredTable;
function requireTable() {
  if (hasRequiredTable) return table;
  hasRequiredTable = 1;
  const { cppdb } = util$1;
  table = function defineTable(name, factory) {
    if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
    if (!name) throw new TypeError("Virtual table module name cannot be an empty string");
    let eponymous = false;
    if (typeof factory === "object" && factory !== null) {
      eponymous = true;
      factory = defer(parseTableDefinition(factory, "used", name));
    } else {
      if (typeof factory !== "function") throw new TypeError("Expected second argument to be a function or a table definition object");
      factory = wrapFactory(factory);
    }
    this[cppdb].table(factory, name, eponymous);
    return this;
  };
  function wrapFactory(factory) {
    return function virtualTableFactory(moduleName, databaseName, tableName, ...args) {
      const thisObject = {
        module: moduleName,
        database: databaseName,
        table: tableName
      };
      const def = apply.call(factory, thisObject, args);
      if (typeof def !== "object" || def === null) {
        throw new TypeError(`Virtual table module "${moduleName}" did not return a table definition object`);
      }
      return parseTableDefinition(def, "returned", moduleName);
    };
  }
  function parseTableDefinition(def, verb, moduleName) {
    if (!hasOwnProperty.call(def, "rows")) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "rows" property`);
    }
    if (!hasOwnProperty.call(def, "columns")) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "columns" property`);
    }
    const rows = def.rows;
    if (typeof rows !== "function" || Object.getPrototypeOf(rows) !== GeneratorFunctionPrototype) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "rows" property (should be a generator function)`);
    }
    let columns = def.columns;
    if (!Array.isArray(columns) || !(columns = [...columns]).every((x) => typeof x === "string")) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "columns" property (should be an array of strings)`);
    }
    if (columns.length !== new Set(columns).size) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate column names`);
    }
    if (!columns.length) {
      throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with zero columns`);
    }
    let parameters;
    if (hasOwnProperty.call(def, "parameters")) {
      parameters = def.parameters;
      if (!Array.isArray(parameters) || !(parameters = [...parameters]).every((x) => typeof x === "string")) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "parameters" property (should be an array of strings)`);
      }
    } else {
      parameters = inferParameters(rows);
    }
    if (parameters.length !== new Set(parameters).size) {
      throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate parameter names`);
    }
    if (parameters.length > 32) {
      throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with more than the maximum number of 32 parameters`);
    }
    for (const parameter of parameters) {
      if (columns.includes(parameter)) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with column "${parameter}" which was ambiguously defined as both a column and parameter`);
      }
    }
    let safeIntegers = 2;
    if (hasOwnProperty.call(def, "safeIntegers")) {
      const bool = def.safeIntegers;
      if (typeof bool !== "boolean") {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
      }
      safeIntegers = +bool;
    }
    let directOnly = false;
    if (hasOwnProperty.call(def, "directOnly")) {
      directOnly = def.directOnly;
      if (typeof directOnly !== "boolean") {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "directOnly" property (should be a boolean)`);
      }
    }
    const columnDefinitions = [
      ...parameters.map(identifier).map((str) => `${str} HIDDEN`),
      ...columns.map(identifier)
    ];
    return [
      `CREATE TABLE x(${columnDefinitions.join(", ")});`,
      wrapGenerator(rows, new Map(columns.map((x, i) => [x, parameters.length + i])), moduleName),
      parameters,
      safeIntegers,
      directOnly
    ];
  }
  function wrapGenerator(generator, columnMap, moduleName) {
    return function* virtualTable(...args) {
      const output = args.map((x) => Buffer.isBuffer(x) ? Buffer.from(x) : x);
      for (let i = 0; i < columnMap.size; ++i) {
        output.push(null);
      }
      for (const row of generator(...args)) {
        if (Array.isArray(row)) {
          extractRowArray(row, output, columnMap.size, moduleName);
          yield output;
        } else if (typeof row === "object" && row !== null) {
          extractRowObject(row, output, columnMap, moduleName);
          yield output;
        } else {
          throw new TypeError(`Virtual table module "${moduleName}" yielded something that isn't a valid row object`);
        }
      }
    };
  }
  function extractRowArray(row, output, columnCount, moduleName) {
    if (row.length !== columnCount) {
      throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an incorrect number of columns`);
    }
    const offset = output.length - columnCount;
    for (let i = 0; i < columnCount; ++i) {
      output[i + offset] = row[i];
    }
  }
  function extractRowObject(row, output, columnMap, moduleName) {
    let count = 0;
    for (const key of Object.keys(row)) {
      const index = columnMap.get(key);
      if (index === void 0) {
        throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an undeclared column "${key}"`);
      }
      output[index] = row[key];
      count += 1;
    }
    if (count !== columnMap.size) {
      throw new TypeError(`Virtual table module "${moduleName}" yielded a row with missing columns`);
    }
  }
  function inferParameters({ length }) {
    if (!Number.isInteger(length) || length < 0) {
      throw new TypeError("Expected function.length to be a positive integer");
    }
    const params = [];
    for (let i = 0; i < length; ++i) {
      params.push(`$${i + 1}`);
    }
    return params;
  }
  const { hasOwnProperty } = Object.prototype;
  const { apply } = Function.prototype;
  const GeneratorFunctionPrototype = Object.getPrototypeOf(function* () {
  });
  const identifier = (str) => `"${str.replace(/"/g, '""')}"`;
  const defer = (x) => () => x;
  return table;
}
var inspect;
var hasRequiredInspect;
function requireInspect() {
  if (hasRequiredInspect) return inspect;
  hasRequiredInspect = 1;
  const DatabaseInspection = function Database2() {
  };
  inspect = function inspect2(depth, opts) {
    return Object.assign(new DatabaseInspection(), this);
  };
  return inspect;
}
const fs = fs$1;
const path = path$1;
const util = util$1;
const SqliteError = sqliteError;
let DEFAULT_ADDON;
function Database$1(filenameGiven, options) {
  if (new.target == null) {
    return new Database$1(filenameGiven, options);
  }
  let buffer;
  if (Buffer.isBuffer(filenameGiven)) {
    buffer = filenameGiven;
    filenameGiven = ":memory:";
  }
  if (filenameGiven == null) filenameGiven = "";
  if (options == null) options = {};
  if (typeof filenameGiven !== "string") throw new TypeError("Expected first argument to be a string");
  if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
  if ("readOnly" in options) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
  if ("memory" in options) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');
  const filename = filenameGiven.trim();
  const anonymous = filename === "" || filename === ":memory:";
  const readonly = util.getBooleanOption(options, "readonly");
  const fileMustExist = util.getBooleanOption(options, "fileMustExist");
  const timeout = "timeout" in options ? options.timeout : 5e3;
  const verbose = "verbose" in options ? options.verbose : null;
  const nativeBinding = "nativeBinding" in options ? options.nativeBinding : null;
  if (readonly && anonymous && !buffer) throw new TypeError("In-memory/temporary databases cannot be readonly");
  if (!Number.isInteger(timeout) || timeout < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
  if (timeout > 2147483647) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
  if (verbose != null && typeof verbose !== "function") throw new TypeError('Expected the "verbose" option to be a function');
  if (nativeBinding != null && typeof nativeBinding !== "string" && typeof nativeBinding !== "object") throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');
  let addon;
  if (nativeBinding == null) {
    addon = DEFAULT_ADDON || (DEFAULT_ADDON = requireBindings()("better_sqlite3.node"));
  } else if (typeof nativeBinding === "string") {
    const requireFunc = typeof __non_webpack_require__ === "function" ? __non_webpack_require__ : commonjsRequire;
    addon = requireFunc(path.resolve(nativeBinding).replace(/(\.node)?$/, ".node"));
  } else {
    addon = nativeBinding;
  }
  if (!addon.isInitialized) {
    addon.setErrorConstructor(SqliteError);
    addon.isInitialized = true;
  }
  if (!anonymous && !fs.existsSync(path.dirname(filename))) {
    throw new TypeError("Cannot open database because the directory does not exist");
  }
  Object.defineProperties(this, {
    [util.cppdb]: { value: new addon.Database(filename, filenameGiven, anonymous, readonly, fileMustExist, timeout, verbose || null, buffer || null) },
    ...wrappers.getters
  });
}
const wrappers = requireWrappers();
Database$1.prototype.prepare = wrappers.prepare;
Database$1.prototype.transaction = requireTransaction();
Database$1.prototype.pragma = requirePragma();
Database$1.prototype.backup = requireBackup();
Database$1.prototype.serialize = requireSerialize();
Database$1.prototype.function = require_function();
Database$1.prototype.aggregate = requireAggregate();
Database$1.prototype.table = requireTable();
Database$1.prototype.loadExtension = wrappers.loadExtension;
Database$1.prototype.exec = wrappers.exec;
Database$1.prototype.close = wrappers.close;
Database$1.prototype.defaultSafeIntegers = wrappers.defaultSafeIntegers;
Database$1.prototype.unsafeMode = wrappers.unsafeMode;
Database$1.prototype[util.inspect] = requireInspect();
var database = Database$1;
lib.exports = database;
lib.exports.SqliteError = sqliteError;
var libExports = lib.exports;
const Database = /* @__PURE__ */ getDefaultExportFromCjs(libExports);
const SCHEMA = `
-- ═══════════════════════════════════════════════════════════════
-- PowerCore ERP - Database Schema v1.0
-- ═══════════════════════════════════════════════════════════════

-- الإعدادات
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  system_name TEXT NOT NULL DEFAULT 'PowerCore ERP',
  username TEXT NOT NULL DEFAULT 'admin',
  password TEXT NOT NULL DEFAULT '123456',
  logo TEXT,
  currency TEXT NOT NULL DEFAULT 'دينار',
  theme TEXT NOT NULL DEFAULT 'light',
  language TEXT NOT NULL DEFAULT 'ar',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- المستخدمون
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- الموردون
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  address TEXT,
  balance REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- العملاء
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  address TEXT,
  balance REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- المخازن
CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- المنتجات
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'sale',
  sale_price REAL NOT NULL DEFAULT 0,
  cost_price REAL NOT NULL DEFAULT 0,
  rental_price_per_day REAL,
  min_stock INTEGER NOT NULL DEFAULT 0,
  warehouse_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- حركات المخزون
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  notes TEXT,
  date TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- أوامر الشراء
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  payment_type TEXT NOT NULL DEFAULT 'full',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  date TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- فواتير المبيعات
CREATE TABLE IF NOT EXISTS sale_invoices (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  payment_type TEXT NOT NULL DEFAULT 'immediate',
  profit REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  date TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- المولدات
CREATE TABLE IF NOT EXISTS generators (
  id TEXT PRIMARY KEY,
  serial_number TEXT NOT NULL,
  capacity TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- عقود الإيجار
CREATE TABLE IF NOT EXISTS rental_contracts (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  generator_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  daily_rate REAL NOT NULL,
  deposit REAL NOT NULL DEFAULT 0,
  advance_payment REAL NOT NULL DEFAULT 0,
  total_days INTEGER NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (generator_id) REFERENCES generators(id)
);

-- طلبات خدمة ما بعد البيع
CREATE TABLE IF NOT EXISTS after_sales_requests (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  product_id TEXT,
  generator_id TEXT,
  report_date TEXT NOT NULL,
  problem_type TEXT NOT NULL,
  description TEXT NOT NULL,
  maintenance_cost REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'inspection',
  assigned_to TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (generator_id) REFERENCES generators(id)
);

-- الموظفون
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  salary REAL NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  address TEXT,
  national_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- صرفيات الرواتب
CREATE TABLE IF NOT EXISTS salary_payments (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  amount REAL NOT NULL,
  month TEXT NOT NULL,
  bonuses REAL NOT NULL DEFAULT 0,
  deductions REAL NOT NULL DEFAULT 0,
  net_salary REAL NOT NULL,
  paid_at TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- المدفوعات
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  amount REAL NOT NULL,
  reference_id TEXT,
  notes TEXT,
  date TEXT NOT NULL
);

-- المرتجعات
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  supplier_id TEXT,
  customer_id TEXT,
  total_amount REAL NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  date TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]'
);

-- الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- حالة تسجيل الدخول (للمزامنة)
CREATE TABLE IF NOT EXISTS app_session (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(date);
CREATE INDEX IF NOT EXISTS idx_sale_invoices_date ON sale_invoices(date);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_status ON rental_contracts(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(date);
`;
let db = null;
function getAppDatabase() {
  if (!db) {
    const dbPath = path$1.join(electron.app.getPath("userData"), "powercore-erp.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.exec(SCHEMA);
    ensureDefaults();
  }
  return db;
}
function getDatabasePath() {
  return path$1.join(electron.app.getPath("userData"), "powercore-erp.db");
}
function ensureDefaults() {
  const s = db.prepare("SELECT id FROM settings WHERE id = 1").get();
  if (!s) {
    db.prepare(`
      INSERT INTO settings (id, system_name, username, password, currency, theme, language)
      VALUES (1, 'PowerCore ERP', 'admin', '123456', 'دينار', 'light', 'ar')
    `).run();
  }
  const wh = db.prepare("SELECT COUNT(*) as c FROM warehouses").get();
  if (wh.c === 0) {
    const insert = db.prepare(`
      INSERT INTO warehouses (id, name, location, description, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    insert.run("wh-1", "المخزن الرئيسي", "", "المخزن الرئيسي");
    insert.run("wh-2", "مخزن العرض", "", "مخزن العرض");
    insert.run("wh-3", "مخزن الصيانة", "", "مخزن الصيانة");
  }
}
function loadState() {
  try {
    const database2 = getAppDatabase();
    const settingsRow = database2.prepare("SELECT * FROM settings WHERE id = 1").get();
    const settings = settingsRow ? {
      systemName: settingsRow.system_name,
      username: settingsRow.username,
      password: settingsRow.password,
      logo: settingsRow.logo,
      currency: settingsRow.currency,
      theme: settingsRow.theme,
      language: settingsRow.language
    } : void 0;
    const sessionRow = database2.prepare("SELECT value FROM app_session WHERE key = 'isLoggedIn'").get();
    const isLoggedIn = sessionRow ? sessionRow.value === "1" : false;
    const map = (rows) => (rows || []).map((row) => row ? { ...row } : null).filter(Boolean);
    const suppliers = map(database2.prepare("SELECT * FROM suppliers").all());
    const customers = map(database2.prepare("SELECT * FROM customers").all());
    const users = map(database2.prepare("SELECT * FROM users").all());
    const warehouses = map(database2.prepare("SELECT * FROM warehouses").all());
    const productsRaw = database2.prepare("SELECT * FROM products").all();
    const products = productsRaw.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      type: p.type,
      salePrice: p.sale_price,
      costPrice: p.cost_price,
      rentalPricePerDay: p.rental_price_per_day,
      minStock: p.min_stock,
      warehouseId: p.warehouse_id,
      quantity: p.quantity,
      createdAt: p.created_at
    }));
    const stockMovementsRaw = database2.prepare("SELECT * FROM stock_movements").all();
    const stockMovements = stockMovementsRaw.map((m) => ({
      id: m.id,
      productId: m.product_id,
      warehouseId: m.warehouse_id,
      type: m.type,
      quantity: m.quantity,
      referenceId: m.reference_id,
      referenceType: m.reference_type,
      notes: m.notes,
      date: m.date
    }));
    const purchaseOrdersRaw = database2.prepare("SELECT * FROM purchase_orders").all();
    const purchaseOrders = purchaseOrdersRaw.map((po) => ({
      id: po.id,
      supplierId: po.supplier_id,
      warehouseId: po.warehouse_id,
      items: JSON.parse(po.items_json || "[]"),
      totalAmount: po.total_amount,
      paidAmount: po.paid_amount,
      paymentType: po.payment_type,
      status: po.status,
      notes: po.notes,
      date: po.date
    }));
    const saleInvoicesRaw = database2.prepare("SELECT * FROM sale_invoices").all();
    const saleInvoices = saleInvoicesRaw.map((si) => ({
      id: si.id,
      customerId: si.customer_id,
      warehouseId: si.warehouse_id,
      items: JSON.parse(si.items_json || "[]"),
      totalAmount: si.total_amount,
      paidAmount: si.paid_amount,
      discount: si.discount,
      paymentType: si.payment_type,
      profit: si.profit,
      status: si.status,
      notes: si.notes,
      date: si.date
    }));
    const generatorsRaw = database2.prepare("SELECT * FROM generators").all();
    const generators = generatorsRaw.map((g) => ({
      id: g.id,
      serialNumber: g.serial_number,
      capacity: g.capacity,
      brand: g.brand,
      model: g.model,
      status: g.status,
      notes: g.notes,
      createdAt: g.created_at
    }));
    const rentalContractsRaw = database2.prepare("SELECT * FROM rental_contracts").all();
    const rentalContracts = rentalContractsRaw.map((rc) => ({
      id: rc.id,
      customerId: rc.customer_id,
      generatorId: rc.generator_id,
      startDate: rc.start_date,
      endDate: rc.end_date,
      dailyRate: rc.daily_rate,
      deposit: rc.deposit,
      advancePayment: rc.advance_payment,
      totalDays: rc.total_days,
      totalAmount: rc.total_amount,
      paidAmount: rc.paid_amount,
      status: rc.status,
      notes: rc.notes,
      createdAt: rc.created_at
    }));
    const afterSalesRaw = database2.prepare("SELECT * FROM after_sales_requests").all();
    const afterSalesRequests = afterSalesRaw.map((a) => ({
      id: a.id,
      customerId: a.customer_id,
      productId: a.product_id,
      generatorId: a.generator_id,
      reportDate: a.report_date,
      problemType: a.problem_type,
      description: a.description,
      maintenanceCost: a.maintenance_cost,
      status: a.status,
      assignedTo: a.assigned_to,
      notes: a.notes,
      createdAt: a.created_at
    }));
    const employeesRaw = database2.prepare("SELECT * FROM employees").all();
    const employees = employeesRaw.map((e) => ({
      id: e.id,
      name: e.name,
      phone: e.phone,
      email: e.email,
      position: e.position,
      department: e.department,
      salary: e.salary,
      startDate: e.start_date,
      status: e.status,
      address: e.address,
      nationalId: e.national_id,
      notes: e.notes,
      createdAt: e.created_at
    }));
    const salaryPaymentsRaw = database2.prepare("SELECT * FROM salary_payments").all();
    const salaryPayments = salaryPaymentsRaw.map((sp) => ({
      id: sp.id,
      employeeId: sp.employee_id,
      amount: sp.amount,
      month: sp.month,
      bonuses: sp.bonuses,
      deductions: sp.deductions,
      netSalary: sp.net_salary,
      paidAt: sp.paid_at,
      notes: sp.notes
    }));
    const paymentsRaw = database2.prepare("SELECT * FROM payments").all();
    const payments = paymentsRaw.map((p) => ({
      id: p.id,
      type: p.type,
      entityId: p.entity_id,
      amount: p.amount,
      referenceId: p.reference_id,
      notes: p.notes,
      date: p.date
    }));
    const returnsRaw = database2.prepare("SELECT * FROM returns").all();
    const returns = returnsRaw.map((r) => ({
      id: r.id,
      type: r.type,
      entityId: r.entity_id,
      supplierId: r.supplier_id,
      customerId: r.customer_id,
      items: JSON.parse(r.items_json || "[]"),
      totalAmount: r.total_amount,
      reason: r.reason,
      date: r.date
    }));
    const notificationsRaw = database2.prepare("SELECT * FROM notifications").all();
    const notifications = notificationsRaw.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: !!n.is_read,
      link: n.link,
      createdAt: n.created_at
    }));
    const suppliersNorm = suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      phone: s.phone || "",
      email: s.email,
      address: s.address,
      balance: s.balance ?? 0,
      createdAt: s.created_at
    }));
    const customersNorm = customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || "",
      email: c.email,
      address: c.address,
      balance: c.balance ?? 0,
      createdAt: c.created_at
    }));
    return {
      suppliers: suppliersNorm,
      customers: customersNorm,
      users: users.map((u) => ({ id: u.id, username: u.username, password: u.password })),
      warehouses: warehouses.map((w) => ({
        id: w.id,
        name: w.name,
        location: w.location,
        description: w.description,
        createdAt: w.created_at
      })),
      products,
      stockMovements,
      purchaseOrders,
      saleInvoices,
      generators,
      rentalContracts,
      afterSalesRequests,
      employees,
      salaryPayments,
      payments,
      returns,
      notifications,
      settings: settings || {
        systemName: "PowerCore ERP",
        username: "admin",
        password: "123456",
        currency: "دينار",
        theme: "light",
        language: "ar"
      },
      isLoggedIn
    };
  } catch (err) {
    console.error("loadState error:", err);
    return null;
  }
}
function saveState(state) {
  const database2 = getAppDatabase();
  const tx = database2.transaction(() => {
    var _a, _b, _c, _d, _e, _f, _g;
    database2.prepare("DELETE FROM suppliers").run();
    database2.prepare("DELETE FROM customers").run();
    database2.prepare("DELETE FROM users").run();
    database2.prepare("DELETE FROM warehouses").run();
    database2.prepare("DELETE FROM products").run();
    database2.prepare("DELETE FROM stock_movements").run();
    database2.prepare("DELETE FROM purchase_orders").run();
    database2.prepare("DELETE FROM sale_invoices").run();
    database2.prepare("DELETE FROM generators").run();
    database2.prepare("DELETE FROM rental_contracts").run();
    database2.prepare("DELETE FROM after_sales_requests").run();
    database2.prepare("DELETE FROM employees").run();
    database2.prepare("DELETE FROM salary_payments").run();
    database2.prepare("DELETE FROM payments").run();
    database2.prepare("DELETE FROM returns").run();
    database2.prepare("DELETE FROM notifications").run();
    const insSup = database2.prepare(
      "INSERT INTO suppliers (id, name, phone, email, address, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const s of state.suppliers || []) {
      insSup.run(s.id, s.name, s.phone || "", s.email || null, s.address || null, s.balance ?? 0, s.createdAt);
    }
    const insCust = database2.prepare(
      "INSERT INTO customers (id, name, phone, email, address, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const c of state.customers || []) {
      insCust.run(c.id, c.name, c.phone || "", c.email || null, c.address || null, c.balance ?? 0, c.createdAt);
    }
    const insUser = database2.prepare('INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, datetime("now"))');
    for (const u of state.users || []) {
      insUser.run(u.id, u.username, u.password);
    }
    const insWh = database2.prepare(
      "INSERT INTO warehouses (id, name, location, description, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    for (const w of state.warehouses || []) {
      insWh.run(w.id, w.name, w.location || null, w.description || null, w.createdAt);
    }
    const insProd = database2.prepare(
      "INSERT INTO products (id, code, name, type, sale_price, cost_price, rental_price_per_day, min_stock, warehouse_id, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const p of state.products || []) {
      insProd.run(
        p.id,
        p.code,
        p.name,
        p.type || "sale",
        p.salePrice ?? 0,
        p.costPrice ?? 0,
        p.rentalPricePerDay ?? null,
        p.minStock ?? 0,
        p.warehouseId,
        p.quantity ?? 0,
        p.createdAt
      );
    }
    const insMov = database2.prepare(
      "INSERT INTO stock_movements (id, product_id, warehouse_id, type, quantity, reference_id, reference_type, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const m of state.stockMovements || []) {
      insMov.run(m.id, m.productId, m.warehouseId, m.type, m.quantity, m.referenceId || null, m.referenceType || null, m.notes || null, m.date);
    }
    const insPO = database2.prepare(
      "INSERT INTO purchase_orders (id, supplier_id, warehouse_id, total_amount, paid_amount, payment_type, status, notes, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const po of state.purchaseOrders || []) {
      insPO.run(
        po.id,
        po.supplierId,
        po.warehouseId,
        po.totalAmount ?? 0,
        po.paidAmount ?? 0,
        po.paymentType || "full",
        po.status || "pending",
        po.notes || null,
        po.date,
        JSON.stringify(po.items || [])
      );
    }
    const insSI = database2.prepare(
      "INSERT INTO sale_invoices (id, customer_id, warehouse_id, total_amount, paid_amount, discount, payment_type, profit, status, notes, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const si of state.saleInvoices || []) {
      insSI.run(
        si.id,
        si.customerId,
        si.warehouseId,
        si.totalAmount ?? 0,
        si.paidAmount ?? 0,
        si.discount ?? 0,
        si.paymentType || "immediate",
        si.profit ?? 0,
        si.status || "active",
        si.notes || null,
        si.date,
        JSON.stringify(si.items || [])
      );
    }
    const insGen = database2.prepare(
      "INSERT INTO generators (id, serial_number, capacity, brand, model, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const g of state.generators || []) {
      insGen.run(g.id, g.serialNumber, g.capacity, g.brand || null, g.model || null, g.status || "available", g.notes || null, g.createdAt);
    }
    const insRC = database2.prepare(
      "INSERT INTO rental_contracts (id, customer_id, generator_id, start_date, end_date, daily_rate, deposit, advance_payment, total_days, total_amount, paid_amount, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const rc of state.rentalContracts || []) {
      insRC.run(
        rc.id,
        rc.customerId,
        rc.generatorId,
        rc.startDate,
        rc.endDate,
        rc.dailyRate ?? 0,
        rc.deposit ?? 0,
        rc.advancePayment ?? 0,
        rc.totalDays ?? 0,
        rc.totalAmount ?? 0,
        rc.paidAmount ?? 0,
        rc.status || "active",
        rc.notes || null,
        rc.createdAt
      );
    }
    const insAS = database2.prepare(
      "INSERT INTO after_sales_requests (id, customer_id, product_id, generator_id, report_date, problem_type, description, maintenance_cost, status, assigned_to, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const a of state.afterSalesRequests || []) {
      insAS.run(
        a.id,
        a.customerId,
        a.productId || null,
        a.generatorId || null,
        a.reportDate,
        a.problemType,
        a.description,
        a.maintenanceCost ?? 0,
        a.status || "inspection",
        a.assignedTo || null,
        a.notes || null,
        a.createdAt
      );
    }
    const insEmp = database2.prepare(
      "INSERT INTO employees (id, name, phone, email, position, department, salary, start_date, status, address, national_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const e of state.employees || []) {
      insEmp.run(
        e.id,
        e.name,
        e.phone || "",
        e.email || null,
        e.position,
        e.department,
        e.salary ?? 0,
        e.startDate,
        e.status || "active",
        e.address || null,
        e.nationalId || null,
        e.notes || null,
        e.createdAt
      );
    }
    const insSP = database2.prepare(
      "INSERT INTO salary_payments (id, employee_id, amount, month, bonuses, deductions, net_salary, paid_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const sp of state.salaryPayments || []) {
      insSP.run(sp.id, sp.employeeId, sp.amount, sp.month, sp.bonuses ?? 0, sp.deductions ?? 0, sp.netSalary, sp.paidAt, sp.notes || null);
    }
    const insPay = database2.prepare(
      "INSERT INTO payments (id, type, entity_id, amount, reference_id, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const p of state.payments || []) {
      insPay.run(p.id, p.type, p.entityId, p.amount, p.referenceId || null, p.notes || null, p.date);
    }
    const insRet = database2.prepare(
      "INSERT INTO returns (id, type, entity_id, supplier_id, customer_id, total_amount, reason, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const r of state.returns || []) {
      insRet.run(
        r.id,
        r.type,
        r.entityId,
        r.supplierId || null,
        r.customerId || null,
        r.totalAmount ?? 0,
        r.reason,
        r.date,
        JSON.stringify(r.items || [])
      );
    }
    const insNot = database2.prepare(
      "INSERT INTO notifications (id, type, title, message, is_read, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const n of state.notifications || []) {
      insNot.run(n.id, n.type, n.title, n.message, n.isRead ? 1 : 0, n.link || null, n.createdAt);
    }
    database2.prepare(`
      INSERT OR REPLACE INTO settings (id, system_name, username, password, logo, currency, theme, language, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      ((_a = state.settings) == null ? void 0 : _a.systemName) || "PowerCore ERP",
      ((_b = state.settings) == null ? void 0 : _b.username) || "admin",
      ((_c = state.settings) == null ? void 0 : _c.password) || "123456",
      ((_d = state.settings) == null ? void 0 : _d.logo) || null,
      ((_e = state.settings) == null ? void 0 : _e.currency) || "دينار",
      ((_f = state.settings) == null ? void 0 : _f.theme) || "light",
      ((_g = state.settings) == null ? void 0 : _g.language) || "ar"
    );
    database2.prepare(`
      INSERT OR REPLACE INTO app_session (key, value, updated_at) VALUES ('isLoggedIn', ?, datetime('now'))
    `).run(state.isLoggedIn ? "1" : "0");
  });
  tx();
}
exports.getAppDatabase = getAppDatabase;
exports.getDatabasePath = getDatabasePath;
exports.loadState = loadState;
exports.saveState = saveState;
