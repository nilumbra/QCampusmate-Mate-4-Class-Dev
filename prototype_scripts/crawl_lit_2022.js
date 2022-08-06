const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const http = require('http');
const fs = require('fs');

const log = console.log;

// cheerio example 
// const htmld = `<ul id="fruits">
//   <li class="apple">Apple</li>
//   <li class="orange">Orange</li>
//   <li class="pear">Pear</li>
// </ul>`;

// const URI = {
//   lit_2022_general: 'https://www2.lit.kyushu-u.ac.jp/~syllabus/cgi-bin/table-even.cgi?show=S2110000&big=B00000'
// }

// Make a http request 'GET' for lit_2022_general
const qlit_2022_course_general_url = "https://www2.lit.kyushu-u.ac.jp/~syllabus/cgi-bin/table-even.cgi?show=S1110000&big=B00000";


/**
 *
 * @return Array<Object> links - links[2:] contains all urls which point to 2022 courses info in KyuDai literature school;
 */
async function getLit2022Courses() {
  const res = await axios({
    method:'get',
    url: qlit_2022_course_general_url, 
    responseType: 'arraybuffer'
  })

  const body = iconv.decode(Buffer.from(res.data), 'windows-31j');
  const $ = cheerio.load(body);

  const linksObjs = $('a');
  const links = [];
  linksObjs.each((index, element) => {
    links.push({
      text: $(element).text(), // get the text
      href: $(element).attr('href'), // get the href attribute
    });
  });

  return links
}

/**
 * @params {String} body - HTML body containing course info
 * @return {Object} a course POJO
 */
function parseCourse(body) {
  // get html
  const $ = cheerio.load(body);

  const info = [];

  // left small
  var school, gakka, course, major, unit,
    isSpecialized,
    course_name_jp,
    course_name_en,
    course_title,
    subject_number,
    instructor_title,
    instructor,
    units,
    compul,
    year,
    term,
    time;
  // 外国語, 人文学科共通科目

  const tdObjs = $('td');

  tdObjs.slice(0, 7).each((index, element) => {
    const t = $(element).text().trim();

    var tt, _;
    switch (index) {
      case 0: // Left small
        // row 1: e.g. 文学部 人文学科 歴史学コース
        tt = t.trim().split('\n');
        _ = tt[0];
        // log(_.split(' '));
        [school, gakka, course] = _.split(' ').slice(0,3);

        // log(school, gakka, course)

        // row 2: e.g. 美学・美術史 専門分野
        _ = tt[1].trim().split(' ');
        if (_.length > 1) {
          major = _[0];
        } else {
          major = "";
        }
        // log(major)

        // row 3: e.g. 美学・美術史 専門分野
        _ = tt[2].trim();
        // log(_)
        var search_idx = _.search("人文学科共通科目");
        isSpecialized = search_idx === -1;

        search_idx = _.search(/[0-9]/);
        units = search_idx === -1 ? 0 : parseInt(_[search_idx]);
        
        // t.search(/[0-9]/)
      break;

      case 1: // middle
        tt = t.trim().split('\n');
        course_name_jp = typeof(tt[0]) === 'undefined' ? '' : tt[0].trim();
        course_name_en = typeof(tt[1]) === 'undefined' ? '' : tt[1].trim();
        course_title = typeof(tt[4]) === 'undefined' ? '' : tt[4].trim();
        instructor_title = typeof(tt[7]) === 'undefined' ? '' : tt[7].trim();
        instructor = typeof(tt[8]) === 'undefined' ? '' : tt[8].trim();
      break;

      case 6: // right:
        tt = t.trim().split('\n');

        // row 1: 科目ナンバリングコード: LET-HUM4354J'
        _ = tt[0].trim().split(' ');
        subject_number = _[1] || '';
        

        // row 3: 2022 前期
        _ = tt[2].trim().split(' ');
        year = parseInt(_[0]);
        term = _[1];

        _ = tt[3].trim().split(' ');
        time = _.at(-1);
    }
  })

  return {
    school,
    gakka,
    course,
    major,
    course_name_jp,
    course_name_en,
    course_title,
    subject_number,
    instructor_title,
    instructor,
    units,
    isSpecialized,
    year, 
    term,
    time,
  }
}

// Course links for test
// const courseQ = [
//   'table-even.cgi?thisyear=2022&num=1150703B&show=S1110000&big=B00000&each=1',
//   'table-even.cgi?thisyear=2022&num=1220211&show=S1110000&big=B00000&each=1',
//   'table-even.cgi?thisyear=2022&num=1200202&show=S1111000&big=B10000&each=1',
//   'table-even.cgi?thisyear=2022&num=1200202A&show=S1111000&big=B10000&each=1',
//   'table-even.cgi?thisyear=2022&num=1420304&show=S1110000&big=B10000&each=1' //文化人類学講義 IV
// ];


getLit2022Courses()
  .then(links => {
    /* An async iterable returns the body of an HTML fetched 
       from one url in links*/
    const coursesIterable = { 
      [Symbol.asyncIterator]() {
        let i = 2;
        let value;
        return {
          next() {
            const done = i === links.length - 1; // iterable is able to produce next value
            return new Promise((resolve, reject) => {
              axios({
                method:'get',
                url: `https://www2.lit.kyushu-u.ac.jp/~syllabus/cgi-bin/${links[i].href}`,
                // responseEncoding: 'Shift_JIS'
                responseType: 'arraybuffer'
              }).then(res => {
                // Make <value> an object and add url field to it
                value = iconv.decode(Buffer.from(res.data), 'windows-31j');
                log(`Course count: ${i - 1}`);
                i++;
                resolve({value, done});
              }).catch(err=> {
                  reject(err);
                }
              );
            });
          },
          return() {
            return { done: true }
          }
        };
      }
    };

    return new Promise((resolve) => {
      var courseData = [];
      (async () => {
        for await (const body of coursesIterable) {
          const a_course = parseCourse(body);
          log(a_course);
          courseData.push(a_course);
        }

        resolve(courseData);
      })();  
    })
}).then(_ => {
  try {
    fs.writeFileSync('courseData.json', JSON.stringify(_));
    log("Success: file saved");
  } catch (err) {
    log(err);
  }
})
