(function (global, execute, init, undefined) {
  // Main require system
  var
  owns = Object.prototype.hasOwnProperty,
  currentPath = "",

  // Main function
  require = function (id, isMain) {
    var rid = resolve(id);
    if (rid === null) throw "Module " + id + " does not exists.";
    if (owns.call(cache, rid)) return cache[rid];

    var
    exports = {},
    module = {
      id: rid,
      exports: exports,

      _code: readFile(rid)
    },
    res,
    lastPath = currentPath;

    if (!require.main) require.main = module;

    if (/\.json$/.test(rid)) {
      res = cache[rid] = module.exports = JSON.parse(module._code);
    }
    else {
      currentPath = rid.slice(0, rid.lastIndexOf("/") + 1);
      res = cache[rid] = execute(global, module, exports, require, undefined);
      currentPath = lastPath;
    }

    return res;
  },

  // Configuration
  // Todo: more extensions (specific parsers)
  config = require.config = {
    root: "./",
    cache: true
  },

  // Map for caching modules (to not load them again)
  cache = require.cache = {},

  // Cross-browser XMLHttpRequest
  getRequest = require.getRequest = function (file, async, post) {
    var xhr;
    if (global.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    }
    else if (global.ActiveXObject) {
      xhr = new ActiveXObject("MSXML2.XMLHTTP"); // Microsoft.XMLHTTP
    }

    if (xhr) {
      if (post) {
        xhr.open("POST", file, async);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("Content-Length", post.length);
        xhr.setRequestHeader("Connection", "close");
      }
      else {
        xhr.open("GET", file, async);
      }
    }

    return xhr;
  },

  // Returns a content of a text file
  readFile = function (file) {
    if (owns.call(codeCache, file)) return codeCache[file];

    var
    q = config.cache ? "" : "?" + (+(new Date())),
    xhr = getRequest(config.root + file + q, false);

    xhr.send();

    return (xhr.status === 200 && xhr.responseText[0] !== "<") ? xhr.responseText : null;
  },
  codeCache = {},

  // Translates an id to a file name
  // https://nodejs.org/api/modules.html#modules_all_together
  resolve = require.resolve = function (id) {
    var rid, parts = currentPath.replace(/\/+$/, "").split("/");
    if (parts[0] === "") parts = [];

    if (/^\.{0,2}\//.test(id)) {
      var idParts = id.split("/");
      if (idParts[0] === "") {
        idParts.shift();
        parts = [];
      }

      for (var i = 0; i < idParts.length; ++i) {
        var part = idParts[i];

        if (part === ".") continue;
        else if (part === "..") parts.pop();
        else parts.push(part);
      }

      rid = parts.join("/");
      return resolvePath(rid);
    }

    for (var i = parts.length; i >= 0; --i) {
      rid = resolvePath(parts.concat(["node_modules"]).join("/") + "/" + id);
      if (rid !== null) return rid;
      parts.pop();
    }

    return null;
  },

  resolveExt = function (rid, exts) {
    for (var i = 0; i < exts.length; ++i) {
      var file = rid + exts[i];
      if (readFile(file) !== null) return file;
    }

    return null;
  },

  resolveFile = function (rid) {
    return resolveExt(rid, ["", ".js", ".json"]);
  },

  resolveDirectory = function (rid) {
    var package = readFile(rid + "/package.json");
    if (package !== null) {
      package = JSON.parse(package);

      return resolveFile(rid + "/" + package.main);
    }

    return resolveExt(rid, ["/index.js", "/index.json"]);
  },

  resolvePath = function (rid) {
    var file = resolveFile(rid);
    if (file !== null) return file;

    var dir = resolveDirectory(rid);
    if (dir !== null) return dir;

    return null;
  };

  // Execute the main module
  init(global, require);
})(
  this,
  function (global, module, exports, require, undefined) { // This function runs a module and returns its export
    eval(module._code);
    return module.exports;
  },
  function (global, require, undefined) {
    var
    config = require.config,
    scripts = document.getElementsByTagName("script"),
    lastScript = scripts[scripts.length - 1],
    x;

    if (x = lastScript.getAttribute("data-root")) config.root = x;
    if (x = lastScript.getAttribute("data-cache")) config.cache = x === "true";
    if (x = lastScript.getAttribute("data-main")) {
      try {
        require("/" + x);
      }
      catch (err) {
        console.error(err);
        // What the fuck is wrong with you, Chrome?
      }
    }
  }
);
