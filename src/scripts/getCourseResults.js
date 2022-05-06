/* eslint-disable no-unused-vars */

function extract(){
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

    [...rows[0].children].map(td => td.textContent).forEach((text, idx) => {tHeadNameMapping[theadNames[idx]] = text;} );

    // Data Structure for final output
    var GPAData = {
        tHeadNameMap: tHeadNameMapping,
        categories: [],
        course_grades: [],
    };

    var category = "",
    newswitch = true;

    for (let i = 1; i < rows.length; i++) {
        if (rows[i].className === 'column_even') {
            if (rows[i+1].className === 'column_odd') { // New category
                category = rows[i].cells[0].textContent.trim();
                GPAData.categories.push(category);    
            }
            // newswitch = rows[i+1].className === 'column_odd'
        } else if (rows[i].className === 'column_odd') {
            let row = [...rows[i].cells].map(td => td.textContent.trim());
            GPAData.course_grades.push(new CourseGradeEntry(category, ...row));
        } 
    }

    /////////////////////////////////MAIN END/////////////////////////////////
    for (const x of GPAData.course_grades) {
        console.log(...Object.values(x));
    }

    saveTemplateAsFile("course_data.json", GPAData)

    // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    // Function that downloads the json object to file system
    function saveTemplateAsFile (filename, dataObjToWrite) {
        const blob = new Blob([JSON.stringify(dataObjToWrite)], { type: "text/json" });
        const link = document.createElement("a");

        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

        const evt = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        });

        link.dispatchEvent(evt);
        link.remove()
    }
}









