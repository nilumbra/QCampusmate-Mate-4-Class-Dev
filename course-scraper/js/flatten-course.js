const flatten = require('./flatten-arr-of-objects.js');
// const courses = require('../data/ECO-2021-courses.json');


process.stdin.setEncoding("utf8");

var lines = []; 
var reader = require("readline").createInterface({
  input: process.stdin,
});

reader.on("line", (line) => {
  //改行ごとに"line"イベントが発火される
  lines.push(line); //ここで、lines配列に、標準入力から渡されたデータを入れる
});

reader.on("close", () => {
  //標準入力のストリームが終了すると呼ばれる
  var keychain = ["main"];
  const courses = JSON.parse(lines.join('\n'));
  console.log(JSON.stringify(flatten(courses, keychain), null, 2));
});


