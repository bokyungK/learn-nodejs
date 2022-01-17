var http = require('http');
var fs = require('fs');
var url = require('url'); // url 모듈을 url 변수로 위해 선언

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    console.log(queryData.id);
    if(_url == '/'){
      _url = '/index.html';
    }
    if(_url == '/favicon.ico'){
      return response.writeHead(404);
    }
    response.writeHead(200);
    console.log(__dirname + _url);
    response.end(queryData.id));

});
app.listen(3000);
