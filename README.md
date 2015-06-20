# Modiate

A simple JavaScript library that brings support of CommonJS modules to the browser.
You can simply `require()` modules and they will be synchronously loaded, interpreted and exported.
No compilation is needed, this is completely a runtime solution.

## How does it work?

The library uses a synchronous XMLHttpRequest with interpretation using the `eval()` statement.
Of course this is a little bit slower, but for debugging purposes it does its job well.

## Example

point.js
```
module.exports = function(x, y){
  this.x = x;
  this.y = y;
};
module.exports.prototype.showCoords = function(){
  alert(this.x + " : " + this.y);
};
```

main.js
```
var Point = require("./point");
var p = new Point(1, 5);
p.showCoords(); // This will display "1 : 5"
```

index.html
```
<!doctype html>
<meta charset="utf-8">
<title>Modiate example</title>
<script src="modiate.js"></script>
<script src="main.js"></script>
```

## Known issues
- Chrome sometimes breaks
