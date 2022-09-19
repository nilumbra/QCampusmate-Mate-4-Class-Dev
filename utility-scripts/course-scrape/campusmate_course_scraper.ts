/* eslint-disable */
import * as cheerio from 'cheerio';
import { CourseMain, Course, isCourseDetail, Syllabus, CourseDetail, CourseObjective, CourseObjectiveDetail, CourseImplementationDetail, CourseGradingDetail, CourseContactsDetail, DetailPartialConstructors} from './course-types'
import trimInbetweenNewline from './trimInbetweenNewline'

const axios = require('axios');
// const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const fs = require('fs');

// type alias
type CourseDetailPartialsT = CourseObjectiveDetail |
                             CourseImplementationDetail |
                             CourseGradingDetail |
                             CourseContactsDetail |
                             undefined;

// Constants
const detailTitles = [
  '授業科目の目的・目標・履修条件について',
  '授業科目の実施方法について',
  '授業科目の成績評価の方法について',
  '授業科目に関する学習相談について',
];
const detailContructors = {
  '授業科目の目的・目標・履修条件について': CourseObjectiveDetail, 
  '授業科目の実施方法について': CourseImplementationDetail, 
  '授業科目の成績評価の方法について': CourseGradingDetail,
  '授業科目に関する学習相談について': CourseContactsDetail,
}

const log = console.log;


/**
 * @param courseid 
 * @param data 
 * @returns Course
 */
function courseSyllabusScrapeFn(courseid: number, data: string | cheerio.AnyNode | cheerio.AnyNode[] | Buffer){
  // returns a course record object
  log('Reading in course data. Course ID:', courseid);
  if (!data) throw Error(`Cannot get document for course ${courseid}! Check url first.`)
  const $ = cheerio.load(data);

  
  log(`course ${courseid} has document of length ${$.html().length} characters`);

  const courseMain = new CourseMain(courseid)
  var course: Course; // Variable represent a course object
  
  // Break page into two nodes, main and detail
  const nodeList = $('div.item');
  if (nodeList.length !== 2) {
    console.warn(`course ${courseid} has ${nodeList.length} nodes of div.item!`)
    console.error('Document\'s format is unknown ');
    return null;
  }

  log('Working hard to parse the document...🛠️🛠️🛠️');

  // get CourseMain
  let [main, detail] = nodeList.toArray();

  log('start building CourseMain');
  for (const row of cheerio.load(main)('tr').toArray()) {
    let trNode = $(row)
    if (trNode.children().length > 1) {
      let key = trNode.children('.label_kougi').text().trim();
      let value = trNode.children('.kougi').text().trim();
      courseMain.setKV(key, value);
    }
  }
  log('CourseMain done building ✅\n');

  // get CourseDetail or Syllabus
  const tables = $("table.syllabus_detail", detail);
  detail = tables[0];
  $('tbody', detail).first().addClass('root-tbody');
  $('tbody[class="root-tbody"]>tr>td', detail).addClass('content');
 
  
  var courseDetail: CourseDetail | Syllabus;
  var coursedetailPartial: CourseDetailPartialsT;
  var constructorFn: DetailPartialConstructors, title: string;

  const rows = $('tbody[class="root-tbody"]>tr', $(detail));
  const firstRowText = $(rows.get(0)).text().trim();
  if (isCourseDetail(firstRowText)) { // course detail is CourseDetail format
    courseDetail = new CourseDetail();
    const content_rows = rows.filter(function(i){ 
      return i % 2 == 1 || detailTitles.includes($('p', this).text().trim());
    });

    for (let i = 0, row = content_rows[i]; i < content_rows.length; row = content_rows[++i]){
      let childrenTds = $(row).children('.content');
      // need to switch to a new constructor whenever a new title for detail partial starts, 
      // which is distinguished through the number of tds in a tr, for a new title tr, it has 1 td
      if (childrenTds.length === 1) {
        if ((title = $('p', childrenTds)?.text().trim()) in detailContructors){ // if row has one child and is a title, then it's a title row, marking the beginning of a new data type
          if (coursedetailPartial) {
            courseDetail.setKV(constructorFn, coursedetailPartial);
            log(constructorFn, 'done building ✅\n');
            // log(coursedetailPartial);
          }
          // Switch to another constructor
          constructorFn = detailContructors[title];
          coursedetailPartial = new constructorFn();
          log('start building', constructorFn)
        } else if ($(childrenTds).has('table')) { // if row has one child and has table, stringify the table
          if(constructorFn === CourseObjectiveDetail) {
            log(`On row ${i} in constructing`, constructorFn.name, 'serializing HTML Table element');
            coursedetailPartial!.setKV('目標', childrenTds, $)
          } else if (constructorFn === CourseImplementationDetail) {
            log(`On row ${i} in constructing`, constructorFn.name, 'serializing HTML Table element');
            coursedetailPartial!.setKV('スケジュール', childrenTds, $);
          }
          // log(trimInbetweenNewline($('table', childrenTds).html()))
        } 
      } else {
        coursedetailPartial!.setKV(childrenTds.first().text().trim(), childrenTds.last(), $)
      }
    }
    courseDetail.setKV(constructorFn, coursedetailPartial); // for loop ends, and we need to set the last coursedetailPartial
  } else { // course detail is Syllabus format
    courseDetail = new Syllabus();
    const content_rows = rows.filter(function(i){ 
      return i % 2 == 0; 
    });

    for (let i = 0, row = content_rows[i]; i < content_rows.length; row = content_rows[++i]){
      let childrenTds = $(row).children('.content');
      // Syllabus format has not title rows. So just set the first and third td as key and value and we are done
      courseDetail!.setKV(childrenTds.first().text().trim(), childrenTds.last(), $)
    }
  }

  course = new Course(courseMain, courseDetail);
  log(JSON.stringify(course, null, 2));
  log('\n');

  return JSON.stringify(course, null, 2)
}


async function main(cid: number){
  const testURL = `https://ku-portal.kyushu-u.ac.jp/campusweb/slbssbdr.do?value(risyunen)=2021&value(semekikn)=1&value(kougicd)=${cid}&value(crclumcd)=ZZ`;
                  
  return await axios({
    method:'get',
    url: testURL
  }).then((res: { data: string | cheerio.AnyNode | cheerio.AnyNode[] | Buffer; }) => {
    return courseSyllabusScrapeFn(cid, res.data);
  }).catch(err=>{
    log(err)
  })
}

const testCourseId = [
  /*
  // CourseDetail format
  21705201, // 2021 インダストリアルデザイン基礎Ⅰ
  21170085, // 2021 経済工学演習④ 北原知就
  21170001, // 2021 経済・経営学演習① 藤井　美男
  21171113, // 2021 ミクロ経済学Ⅰ（経済・経営） 境　和彦
  21171402, // 2021 外国書講読２（英語経済）② 内田　大輔
  21172114, // 2021 マクロ経済学Ⅰ（経工） 村尾　徹士

  21250206, // 2021 データサイエンス序論（Ⅱ群）宗藤　伸治
  21072002,	// 2021 教育原論Ⅰ  藤田　雄飛  野々村　淑子
  21079002,	// 2021 教育実習研究	伊藤　崇達
  21079064,	// 2012 理科指導法Ⅰ	甲斐　初美
  // Syllabus format
  21250212, // 2021 応用地盤工学I	笠間　清伸
  21250222, // 2021 情報処理概論 木村　元
  */
  // cross-listed course
  21705030 // 2021 Design Pitching Skills 
]

Promise.allSettled(testCourseId.map(cid => main(cid)))
      .then(() => {
        log(CourseMain.subjectCategoryMap);
      })
// main();

