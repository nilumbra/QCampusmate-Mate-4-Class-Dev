/**
 * @param { Array<before> } arr
 * @param {string[]} arrOfKeys 
 * 
 * @return { Array<after> } 
 */
module.exports = function (arr, arrOfKeys) {
  return arr.map((el) => {
    var o = el;
    for (let key of arrOfKeys) 
      o = o[key];
    return o;
  })
}