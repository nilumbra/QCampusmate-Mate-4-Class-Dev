const loadBtn = document.getElementById("load");
loadBtn.addEventListener('click', async () => {
  console.log("Loading...")
  // Get reference to current tab (page)
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // If the page is not campusmate? Give a feedback like: you have to go to the course result page to load the data!!

  // Programmatically inject a script and execute it on current tab
  chrome.scripting.executeScript({
    target: {tabId: tab.id}, 
    function: load,
  });
});

function load() {
  function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

  function rand_grade() {
    const rand = randn_bm();
    var gp;
    if(rand > -0.3 && rand < 0.3) {
      gp = '3.0';
    } else if (rand > -1.2 && rand <= -0.3 || rand >= 0.3 && rand < 1.2){
      gp = '4.0';
    } else if (rand > -2 && rand <= -1.2 || rand >= 1.2 && rand < 2) {
      gp = '2.0'; 
    } else if (rand > -2.5 && rand <= -2 || rand >= 2 && rand < 2.5) {
      gp = '1.0';
    } else {
      gp = '0.0'
    }
    return gp;
  }

  function gp_to_letter(gp) {
    const MAP = {'0': 'Ｆ', '1.0': 'Ｄ', '2.0': 'Ｃ', '3.0':'Ｂ', '4.0': 'Ａ'};
    return MAP[gp];
  }


  ////// Data Structure for holding a course's gpa and its administrative information
  class CourseGradeEntry {
    constructor (category, subject, unit, letter_evaluation, gpa, year, quarter, subject_number, course_id, prinstructor, last_updated) {
        this.category = category;
        this.subject = subject;
        this.unit = unit;
        this.letter_evaluation = letter_evaluation; // = { A, B, C, D, F, R }
        this.gpa = gpa; // This might not be a number
        this.year = year; 
        this.quarter = quarter;
        this.subject_number = subject_number;
        this.course_id = course_id;
        this.prinstructor = prinstructor;
        this.last_updated = last_updated;
    }
  }


  const table = document.querySelector('table.list'),
      tBody = table.tBodies[0],
      rows = Array.from(tBody.rows);

  console.log(rows[0].children.length === 10);

  const tHeadNameMapping = {},
        theadNames = ['subject', 'unit', 'letter_evaluation', 'gpa', 'year', 'quarter', 'subject_number', 'course_id', 'prinstructor', 'last_updated'];

  // First row is the column header
  [...rows[0].children].map(td => td.textContent).forEach((text, idx) => {tHeadNameMapping[theadNames[idx]] = text;} );

  // Data Structure for final output
  var GPAData = {
    tHeadNameMap: tHeadNameMapping,
    categories: [],
    course_grades: [],
  };

  var category = "";

  // Fill in GPAData ds
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].className === 'column_even') {
        if (rows[i+1].className === 'column_odd') { // New category
            category = rows[i].cells[0].textContent.trim();
            GPAData.categories.push(category);    
        }
        // newswitch = rows[i+1].className === 'column_odd'
    } else if (rows[i].className === 'column_odd') {
        let courseRecord = {};
        courseRecord['category'] = category;
        [...rows[i].cells].forEach((item, index) => {
          if (index === 3) {
            let gp = item.textContent.trim();
            if (!Number.isNaN(parseFloat(gp))) {
              let fake_gp = rand_grade();
              courseRecord[theadNames[index]] = fake_gp;
              courseRecord['letter_evaluation'] = gp_to_letter(fake_gp);
            } else {
              courseRecord[theadNames[index]] = item.textContent.trim();
            }
          } else {
            courseRecord[theadNames[index]] = item.textContent.trim();  
          }
        })
        GPAData.course_grades.push(courseRecord);
        // let row = [...rows[i].cells].map(td => td.textContent.trim());
        // GPAData.course_grades.push(new CourseGradeEntry(category, ...row));
    } 
  }
  

  // chrome.storage.local.set({GPADATA: GPAData}, function() {
  //   console.log('GPADATA is set.');
  //   alert("Course result is loaded. Ready for export.");
  // });

  /////////////////////////////////MAIN END/////////////////////////////////
  for (const x of GPAData.course_grades) {
    console.log(...Object.values(x));
  }

  return GPAData;
}
