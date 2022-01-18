var http = require('http');
var fs = require('fs');
var url = require('url'); // url 모듈을 url 변수로 위해 선언

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname
    var title = queryData.id;

    if (pathname === '/') {
      if(queryData.id === undefined) {
        fs.readdir('./data', function(error, filelist) {
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = '<ul>'

          var i = 0;
          while(i < filelist.length) {
            list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
            i = i + 1;
          }
          list = list + '</ul>'

          var template = `
          <!doctype html>
          <html>
          <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1><a href="/">WEB</a></h1>
            ${list}
            <h2>${title}</h2>
            <p>${description}</p>
          </body>
          </html>
          `;
          response.writeHead(200);
          response.end(template);
        })
      } else {
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
          fs.readdir('./data', function(error, filelist) {
            var title = queryData.id;
            var list = '<ul>'

            var i = 0;
            while(i < filelist.length) {
              list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
              i = i + 1;
            }
            list = list + '</ul>'

            var template = `
            <!doctype html>
            <html>
            <head>
              <title>WEB1 - ${title}</title>
              <meta charset="utf-8">
            </head>
            <body>
              <h1><a href="/">WEB</a></h1>
              ${list}
              <h2>${title}</h2>
              <p>${description}</p>
            </body>
            </html>
            `;
            response.writeHead(200);
            response.end(template);
          });
        });
      }
    } else {
      response.writeHead(404); // 파일을 찾을 수 없을 때
      response.end('Not fount');
    }

});
app.listen(3000);
