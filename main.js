const http = require('http');
const fs = require('fs');
const url = require('url'); // url 모듈을 url 변수로 위해 선언
const qs = require('querystring');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const app = http.createServer((request,response) => {
    const _url = request.url;
    const queryData = url.parse(_url, true).query;
    let pathname = url.parse(_url, true).pathname
    const title = queryData.id;

    if (pathname === '/') {
      if(queryData.id === undefined) {
        fs.readdir('./data', (error, filelist) => {
          const title = 'Welcome';
          const description = 'Hello, Node.js';
          const list = template.list(filelist);
          const html = template.html(title, list, `
            <h2>${title}</h2><p>${description}</p>`,`
            <a href="/create">create</a>
          `);
          response.writeHead(200);
          response.end(html);
        })
      } else {
        fs.readdir('./data', (error, filelist) => {
          const filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
            const title = queryData.id;
            const list = template.list(filelist);
            const sanitizedTitle = sanitizeHtml(title);
            const sanitizedDescription = sanitizeHtml(description);
            const html = template.html(title, list, `
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
      fs.readdir('./data', (error, filelist) => {
        const title = 'WEB - create';
        const list = template.list(filelist);
        const html = template.html(title, list, `
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
        let body = '';
        request.on('data', data => body = body + data)
        request.on('end', () => {
          const post = qs.parse(body);
          const title = post.title;
          const description = post.description;

        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        })
      })
    } else if (pathname === '/update') {
      const filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
        fs.readdir('./data', (error, filelist) => {
          const title = queryData.id;
          const list = template.list(filelist);
          const html= template.html(title, list, `
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
        let body = '';
        request.on('data', data => body = body + data)
        request.on('end', () => {
          const post = qs.parse(body);
          const id = post.id;
          const title = post.title;
          const description = post.description;

        fs.rename(`data/${id}`, `data/${title}`, (error) => {
          fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
        })
      })
    } else if (pathname === '/delete_process') {
        let body = '';
        request.on('data', data => body = body + data)
        request.on('end', () => {
          const post = qs.parse(body);
          const id = post.id;
          const filteredId = path.parse(id).base;

        fs.unlink(`data/${filteredId}`, (error) => {
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
