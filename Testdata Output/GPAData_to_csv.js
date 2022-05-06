const header = Object.values(GPAData.tHeadNameMap),
    categories = GPAData.categories,
    course_grades = GPAData.course_grades;

var csv = [
  header.join(','), // header row
], 
  cat_ptr = 0,
  curr_cat = categories[cat_ptr];

csv.push(curr_cat);
course_grades.forEach(function(e, i, arr) {
  csv.push(Object.values(e).slice(1).join(','));
  if(arr[i+1] && arr[i]['category'] != arr[i+1]['category']){
    csv.push(arr[i+1]['category']);
  } 
})

csv.join('\r\n');

