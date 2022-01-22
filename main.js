var http = require('http');
var fs = require('fs');
var url = require('url'); // url 모듈을 url 변수로 위해 선언
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

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
          var list = template.list(filelist);
          var html = template.html(title, list, `
            <h2>${title}</h2><p>${description}</p>`,`
            <a href="/create">create</a>
          `);
          response.writeHead(200);
          response.end(html);
        })
      } else {
        fs.readdir('./data', function(error, filelist) {
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
            var title = queryData.id;
            var list = template.list(filelist);
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description);
            var html = template.html(title, list, `
              <h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,`
              <a href="/create">create</a>
              <a href="/update?id=${sanitizedTitle}">update</a>
              <form action="/delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
              </form>
              `);
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if (pathname === '/create') {
      fs.readdir('./data', function(error, filelist) {
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.html(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"
              rows="5" cols="100">
              </textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `, '');
        response.writeHead(200);
        response.end(html);
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
    } else if (pathname === '/update') {
      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
        fs.readdir('./data', function(error, filelist) {
          var title = queryData.id;
          var list = template.list(filelist);
          var html= template.html(title, list, `
            <form action="update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description" rows="5" cols="100">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>`,`
            <a href="/create">create</a> <a href="/update?id=${title}">update</a>
            `);
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if (pathname === '/update_process') {
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;

        fs.rename(`data/${id}`, `data/${title}`, function(error) {
          fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
        })
      })
    } else if (pathname === '/delete_process') {
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;
        var filteredId = path.parse(id).base;

        fs.unlink(`data/${filteredId}`, function(error) {
          response.writeHead(302, {Location: '/'});
          response.end();
        });
      })
    }
    else {
      response.writeHead(404); // 파일을 찾을 수 없을 때
      response.end('Not fount');
    }

});
app.listen(3000);
