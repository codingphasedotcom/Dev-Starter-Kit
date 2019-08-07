# Dev-Starter-Kit
 *For My Students* 
If you are doing any of my courses make sure you are using the right version this project is using gulp version 4.0.1 to view previous versions switch branches to older version

So I built this for all the new web developers... My Goal is to save you time from the bullsh*t of spending hours looking for ways to speed up your learning. Sometimes all we want to do is just code.
(if you are coming from my [youtube channel CodingPhase ](https://www.youtube.com/channel/UC46wWUso9H5KPQcoL9iE3Ug) I will base all my tutorials from this starter kit)

I broke it down in simple steps to get you going.

## Steps

**Download or Pull This Repo**
	Top of this page you can see where it says clone or download

 **Install Node**
	https://nodejs.org/en/

**Download Atom (OPTIONAL)**
	https://atom.io/

 **Install all the node packages** 
In the root of this project run on your terminal (if you want you can do this with yarn but thats optional)
We updated to version 4.0 of gulp so you should have no problems
```bash
    npm install gulp-cli -g
    npm install gulp 
    npm install webpack@4.25.1 -g
    npm install webpack-cli@3.1.2 -g
    npm install
```

**Make sure your version of gulp is 4.0**
```bash
    gulp -v    
```

**Make sure webpack is installed**
```bash
  webpack -v
```

**Start the dev server**
```bash
  npm run watch
```

**Start the dev server with proxy**
```bash
  npm run proxy
```

**Build files for production**
```bash
  npm run build
```

**Optimize Your Images**
```bash
  npm run imgs
```

**Static Site Generator Development**
```bash
  npm run static:dev
```

**Static Site Generator Production**
```bash
  npm run static:build
```


## Instructions to run starter kit on any backend
Coming Soon

# EACCESS ERROR FIX
```diff
- how to fix the EACCESS ERROR
- lets say for example you trying to install webpack
- sudo npm install webpack@4.25.1 -g
- and get an error
- Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/webpack/node_modules/fsevents/build'
- then try again to install it but with this at the end "--unsafe-perm=true --allow-root"
- for example
- sudo npm install webpack@4.25.1 -g --unsafe-perm=true --allow-root
```
or 

npm install har-validator@latest --save-dev

