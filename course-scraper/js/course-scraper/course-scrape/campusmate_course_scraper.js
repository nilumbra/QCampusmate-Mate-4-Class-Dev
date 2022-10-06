"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable */
const cheerio = __importStar(require("cheerio"));
const course_types_1 = require("./course-types");
const axios = require('axios');
// const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const fs = require('fs');
// Constants
const detailTitles = [
    '授業科目の目的・目標・履修条件について',
    '授業科目の実施方法について',
    '授業科目の成績評価の方法について',
    '授業科目に関する学習相談について',
];
const detailContructors = {
    '授業科目の目的・目標・履修条件について': course_types_1.CourseObjectiveDetail,
    '授業科目の実施方法について': course_types_1.CourseImplementationDetail,
    '授業科目の成績評価の方法について': course_types_1.CourseGradingDetail,
    '授業科目に関する学習相談について': course_types_1.CourseContactsDetail,
};
const log = console.log;
/**
 * @param courseid
 * @param data
 * @returns Course
 */
function courseSyllabusScrapeFn(courseid, data) {
    // returns a course record object
    log(`Reading in course data. Course ID:${courseid}`);
    if (!data)
        throw Error(`Cannot get document for course ${courseid}! Check url first.`);
    const $ = cheerio.load(data);
    log(`course ${courseid} has document of length ${$.html().length} characters`);
    const courseMain = new course_types_1.CourseMain(courseid);
    var course; // Variable represent a course object
    // Break page into two nodes, main and detail
    const nodeList = $('div.item');
    if (nodeList.length !== 2) {
        console.warn(`course ${courseid} has ${nodeList.length} nodes of div.item!`);
        console.error('Document\'s format is unknown ');
        return null;
    }
    log('Working hard to parse the document...🛠️🛠️🛠️');
    // get CourseMain
    let [main, detail] = nodeList.toArray();
    log('start building CourseMain');
    for (const row of cheerio.load(main)('tr').toArray()) {
        let trNode = $(row);
        if (trNode.children().length > 1) {
            let key = trNode.children('.label_kougi').text().trim();
            let value = trNode.children('.kougi').text().trim();
            courseMain.setKV(key, value);
        }
    }
    log('CourseMain done building ✅\n');
    /**
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
    */
    course = new course_types_1.Course(courseMain, undefined);
    log(JSON.stringify(course, null, 2));
    log('\n');
    // JSON.stringify(course, null, 2)
    return course;
}
function fetchOne(cid, done) {
    return __awaiter(this, void 0, void 0, function* () {
        const courseURL = `https://ku-portal.kyushu-u.ac.jp/campusweb/slbssbdr.do?value(risyunen)=2021&value(semekikn)=1&value(kougicd)=${cid}&value(crclumcd)=ZZ`;
        return new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: courseURL
            })
                .then((res) => {
                resolve({
                    value: done ? undefined : courseSyllabusScrapeFn(cid, res.data),
                    done: done
                });
            })
                .catch((err) => {
                reject({ value: err, done: done });
            });
        });
    });
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
];
const course_id_2021_json_1 = __importDefault(require("../../local-files/course-id-2021.json"));
// const school = 'KEG'; //'KEG' 'ECO' 'ENG' 'EDU-TEP' 'DES' 
function scrapeAllCourseDataIn2022ForOneSchool(school) {
    const coursesIterable = {
        [Symbol.asyncIterator]() {
            let i = 0;
            return {
                next() {
                    return __awaiter(this, void 0, void 0, function* () {
                        const done = i === course_id_2021_json_1.default[school].length; // iterable is able to produce next value
                        log(`# of processing: ${i + 1}, start...`);
                        try {
                            const result = yield fetchOne(course_id_2021_json_1.default[school][i++], done);
                            return result;
                        }
                        catch (err) {
                            return { value: err, done: done };
                        }
                    });
                }
            };
        }
    };
    (() => __awaiter(this, void 0, void 0, function* () {
        var e_1, _a;
        var courseData = [];
        try {
            for (var coursesIterable_1 = __asyncValues(coursesIterable), coursesIterable_1_1; coursesIterable_1_1 = yield coursesIterable_1.next(), !coursesIterable_1_1.done;) {
                const course = coursesIterable_1_1.value;
                courseData.push(course);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (coursesIterable_1_1 && !coursesIterable_1_1.done && (_a = coursesIterable_1.return)) yield _a.call(coursesIterable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        log(course_types_1.CourseMain.subjectCategoryMap);
        log(`Saving results to file: ../data/${school}-2021-courses-augmented.json`);
        fs.writeFileSync(`../data/${school}-2021-courses-augmented.json`, JSON.stringify(courseData, null, 2));
        log(`Saved ${courseData.length} courses ✅`);
    }))();
}
function useSTDIN(cb) {
    process.stdin.setEncoding('utf8');
    var lines = [];
    var reader = require('readline').createInterface({
        input: process.stdin,
    });
    reader.on('line', (line) => {
        //改行ごとに'line'イベントが発火される
        lines.push(line); //ここで、lines配列に、標準入力から渡されたデータを入れる
    });
    reader.on('close', () => {
        //標準入力のストリームが終了すると呼ばれる
        const input = lines.join('\n');
        cb(input);
    });
}
useSTDIN(scrapeAllCourseDataIn2022ForOneSchool);
