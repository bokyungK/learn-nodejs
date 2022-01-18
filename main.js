var http = require('http');
var fs = require('fs');
var url = require('url'); // url 모듈을 url 변수로 위해 선언
var qs = require('querystring');

function templateHTML(title, list, body, control) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB2 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB2</a></h1>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
  `;
}

function templateList(filelist) {
  var list = '<ul>'
  var i = 0;
  while(i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
    i = i + 1;
  }
  list = list + '</ul>'
  return list;
}

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
          var list = templateList(filelist);
          var template = templateHTML(title, list, `
            <h2>${title}</h2><p>${description}</p>`,`
            <a href="/create">create</a>
          `);
          response.writeHead(200);
          response.end(template);
        })
      } else {
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
          fs.readdir('./data', function(error, filelist) {
            var title = queryData.id;
            var list = templateList(filelist);
            var template = templateHTML(title, list, `
              <h2>${title}</h2><p>${description}</p>`,`
              <a href="/create">create</a> <a href="/update?id=${title}">update</a>
              `);
            response.writeHead(200);
            response.end(template);
          });
        });
      }
    } else if (pathname === '/create') {
      fs.readdir('./data', function(error, filelist) {
        var title = 'WEB - create';
        var list = templateList(filelist);
        var template = templateHTML(title, list, `
          <form action="http://localhost:3000/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `, '');
        response.writeHead(200);
        response.end(template);
      })
    } else if (pathname === '/create_process') {
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;

        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        })
      })
    } else {
      response.writeHead(404); // 파일을 찾을 수 없을 때
      response.end('Not fount');
    }

});
app.listen(3000);
