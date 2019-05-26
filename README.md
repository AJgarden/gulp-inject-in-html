# gulp-inject-in-html
Inject or include HTML/CSS/Javascript files into HTML with gulp.

## Install

```shell
npm install gulp-inject-in-html --save-dev
```

## How to use?

```javascript
const gulp = require('gulp');
const injectHTML = require('gulp-inject-in-html');

// After PUG, SASS, SCSS, Typescript, Javascript,... are translated or compiled
gulp.task('inject-in-html', function() {
  gulp.src('dist/**/*.html')
    .pipe(injectHTML())
    .pipe(gulp.dest('dist/'));
});
```

In the .pug or .html files, specify the relative path to injected/included targets.

```pug
html
  head ...
    <!-- inject(css) [css/main.min.css] -->
  body
    <!-- inject(html) [header.html] -->
    <!-- inject(js) [js/main.min.js] -->
```

or

```html
<html>
  <head>
    ...
    <!-- inject(css) [css/main.min.css] -->
  </head>
  <body>
    <!-- inject(html) [header.html] -->
    <!-- inject(js) [js/main.min.js] -->
  </body>
</html>
```

And it will translated to the behind code.

```html
<html>
  <head>
    ...
    <link href="css/main.min.css" rel="stylesheet" />
  </head>
  <body>
    <header>
      ...some html contents of header.html
    </header>
    <script src="js/main.min.js" type="text/javascript"></script>
  </body>
</html>
```

## Options

### Common usage (including mode)

**input**

```html
<!-- inject(css) [css/main.min.css] -->
```

**output**

```html
<link href="css/main.min.css" rel="stylesheet" />
```

### Multiple Files

**input**

```html
<!-- inject(css) [css/main.min.css, css/header.min.css, css/footer.min.css] -->
```

**output**

```html
<link href="css/main.min.css" rel="stylesheet" />
<link href="css/header.min.css" rel="stylesheet" />
<link href="css/footer.min.css" rel="stylesheet" />
```

### Injection mode

**input**

```html
<!-- inject(css)(inject) [css/main.min.css] -->
```

**output**

```html
<style>
body { ... }
...
</style>
```

Note: HTML file can only supported injection mode.

### Async/Defer (only for javascript)

**input**

```html
<!-- inject(js)(async) [js/main.min.js] -->
<!-- inject(js)(inject)(defer) [js/index.min.js] -->
<!-- inject(js)(async)(defer) [js/handler.min.js] -->
```

**output**

```html
<script src="js/main.min.js" type="text/javascript" async></script>
<script type="text/javascript" defer>
  // ...some javascript codes of js/index.min.js
</script>
<script src="js/handler.min.js" type="text/javascript" async defer></script>
```

### Write annotation

**input**

```html
<!-- inject(html) [header.html] {Here is header block} -->
```

**output**

```html
<!-- Here is header block -->
<header>
  ...some html contents of header.html
</header>
```
