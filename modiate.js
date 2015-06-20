(function (global, execute, undefined) {
  // Main require system
  var
  owns = Object.prototype.hasOwnProperty,

  currentPath = "",

  // Main function
  require = global.require = function (id) {
    var
    rid = realId(id),
    file = resolve(id);

    if (owns.call(cache, rid)) {
      return cache[rid];
    }

    var
    exports = {},
    module = {
      id: rid,
      exports: exports,

      _code: readFile(file, "?" + (+(new Date())))
    },
    res,
    lastPath = currentPath;

    currentPath = rid.slice(0, rid.lastIndexOf("/") + 1);

    res = cache[rid] = execute(global, module, exports, require, undefined);

    currentPath = lastPath;

    return res;
  },

  // Configuration
  // TODO: more extensions (specific parsers)
  config = require.config = {
    path: "./",
    extension: ".js"
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
  // If the file doesn't exist it returns an alert
  readFile = function (file, q) {
    if (q === undefined) { q = ""; }

    var xhr = getRequest(file + q, false);
    xhr.send();

    return xhr.status === 200 ? xhr.responseText : 'alert("Error: file ' + file + ' not found!");';
  },

  realId = function (id) {
    if (id.substr(0, 2) === "./") {
      id = currentPath + id.substr(2);
    }
    else if (id.substr(0, 3) === "../") {
      var dirs = currentPath.split("/");
      dirs.pop();

      do {
        dirs.pop();
        id = id.substr(3);
      } while (id.substr(0, 3) === "../");

      id = dirs.join("/") + "/" + id;
    }

    return id;
  },

  // Translates an id to a file name
  resolve = require.resolve = function (id) {
    return config.path + realId(id) + config.extension;
  };
})(
  this,
  function (global, module, exports, require, undefined) { // This function runs a module and returns its export
    eval(module._code);
    return module.exports;
  }
);
