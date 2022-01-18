var testFolder = './data'; // 실행하는 위치 기준으로 작성해야
var fs = require('fs');

fs.readdir(testFolder, function(error, filelist) {
  console.log(filelist);
})
