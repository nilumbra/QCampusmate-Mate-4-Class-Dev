import * as cheerio from 'cheerio';
import { toArray } from 'cheerio/lib/api/traversing';
import trimInbetweenNewline from './trimInbetweenNewline'

const log = console.log;

// 学部のみ
type School = 
'KEG'| //基幹・大学院基幹
'ISI'| //共創
'EDU'| //教育学部・教職課程
'LAW'| //法学
'ECO'| //経済
'MED'| //医学部医学科・医学部生命科学科・医学部保健学科
'DEN'| //歯
'PHS'| //薬
'ENG'| //工
'DES'| //芸工
'AGR'| //農
undefined;

type Major = 'INF' | string | undefined;
type SubjectCode = string | undefined; 
///////////////////////////////////////////////////
// 授業科目区分
type Category = string | undefined;  // e.g. '総合科目', '専攻教育科目  /  Specialized Courses'

var numberLinkCodeToCategory = {
  'KED-KES': ['基幹教育セミナー'],
  'KED-ASD': ['高年次基幹教育科目'],
  'KED-GES': ['総合科目'],
  'KED-LCB': ['言語文化基礎科目'],
  'KED-SLE': ['理系ディシプリン科目　専門基礎系'],
  'KED-SMA': ['理系ディシプリン科目　専門基礎系'],
  'KED-SPH': ['理系ディシプリン科目　専門基礎系'],
  'KED-SBI': ['理系ディシプリン科目　教養系'],
  'KED-CSC': ['サイバーセキュリティ科目'],
  'KED-HSS': ['文系ディシプリン科目'],
  'KED-ICL': ['課題協学科目'],
  'KED-IUP': ['Subjects in Science', 'Subjects in Humanities and Social Science ', 'Subject for Health and Sports Science'],
  'DES-IND': ['コース専門科目　Course Specialized Subjects', '芸術工学部　インダストリアルデザインコース　Industrial Design Course'],
  'DES-ACD': ['コース基礎科目　Course Fundamental Subjects', '芸術工学部　音響設計コース　Acoustic Design Course']
}

// Alias type
type HTML_Link = string | undefined;
type HTML_Table = string | undefined;
type HTML_String = string | undefined;;

// enum Electivity {
// 	elective='選択 / Elective',
// 	elec_req='選択必修 / Elective Required',
// 	required='必修 / Required'
// }

// Course Info type
type Elec = 1 | //選択 / Elective
            2 | //選択必修 / Elective Required
            3 | //必修 / Required
            undefined;
type Quarter = '前期' | '夏学期' | '前期集中' | '春学期' | '後期' | '秋学期' | '後期集中' | '冬学期' | '通年' | undefined;
type Time = 1 | 2 | 3 | 4 | 5 | 6 | undefined;
type DayTime = Array<[Day, Time]> | undefined;
type Area = '伊都地区' | '箱崎地区' | '病院地区' | '筑紫地区' | '大橋地区' | '六本松地区' | undefined;

enum Day {
  Monday="月",
  Tuesday="火",
  Wednesday="水",
  Thursday="木",
  Friday="金",
  Saturday="土",
  Sunday="日"
}

type CoursePartialConstrutorType<T> = new () => T;

export class CourseMain {
	id: number | undefined; //講義コード
	name: string | undefined; //科目名称。講義科目名
	title: string | undefined; //講義題目
  numberlinks: string[] | undefined; // 科目ナンバリング・コード
	school: School; 
	major: Major;
	subject_code: SubjectCode;
  updated_at: Date | undefined; //更新日付
  instructors: string[] | undefined; // 担当教員
  category: Category; //授業科目区分;
	lang: string | undefined; // 使用言語
	target_year: string | undefined; // 対象学年; use enum?
  elecCompul: Elec; // 必修選択
  target_students_from: string | undefined; // 対象学部等, 開講学部・学府 
	unit: number | undefined; // 単位数
	year: number | undefined; // 開講年度
  quarter: Quarter; //開講学期
	day_time: Array<[string, string]> | undefined;	// 曜日時限
  classroom: string | undefined; //教室
	area: Area; //開講地区
	more: string | undefined;

  constructor(id: number | undefined) {
    this.id = id;
  }

  static subjectCategoryMap = numberLinkCodeToCategory;

  setSubjectNumberLink(numberlink: string) {
    // ENG-MCE3542J --> return ['ENG', 'MCE', '3542J'];
    const reg = /([A-Z]+)-([A-Z]+)([0-9]*[A-Z])/;
    const matched  = numberlink.match(reg);
    if (!matched) {
      console.log('Numberlink is undefined', numberlink);
    } else if (matched.length < 4) {
      console.error('Set school-major-subjectCode failed:', matched);
    } else {
      this.school = matched[1] as School;
      this.major = matched[2] as Major;
      this.subject_code = matched[3] as SubjectCode;
    }
  }

  setKV(key: string, value: string) {
    value = value.trim();
    if(value) {
      if(['科目名称', '講義科目名'].includes(key)) {
        this.name = value;
      } else if (['科目ナンバリング・コード', '科目ナンバリングコード'].includes(key)) { 
        // if cross-listed, set to the first one for now
        let numberlinks = value.split(',');
        this.numberlinks = numberlinks;
        this.setSubjectNumberLink(numberlinks[0]);
      } else if (['対象学部等', '開講学部・学府'].includes(key)) {
        this.target_students_from = value;
      } else {
        switch(key) {
          case "講義題目":
            this.title = value;
          break;

          case "担当教員":
            this.instructors = value?.split('\n').map(e=>e.trim()).filter(e=>e!=='')
          break;
          
          case "更新日付":
            this.updated_at = new Date(value);
          break;
    
          case "授業科目区分": {
            this.category = value as Category;
            
            let schoolMajor = `${this.school}-${this.major}`;
            if (schoolMajor in CourseMain.subjectCategoryMap) { 
              if (!CourseMain.subjectCategoryMap[schoolMajor].includes(value)){ // 新しい専攻(学部+専攻)-授業科目区分を発見する場合、専攻-授業科目区分Hashmapにデータを追加
                log(`${schoolMajor}の新しい授業科目区分を発見: ${value}.`)
                CourseMain.subjectCategoryMap[schoolMajor].push(value);
                console.log(`${schoolMajor} now has`, CourseMain.subjectCategoryMap[schoolMajor])
              }
            } else {
              log(`新しい専攻コードを発見: ${schoolMajor}.`)
              CourseMain.subjectCategoryMap[schoolMajor] = [value];
              console.log(`${schoolMajor} now has`, CourseMain.subjectCategoryMap[schoolMajor])
            }
          break;
          }

          case "使用言語":
            this.lang = value;
          break;
    
          case "対象学年":
            this.target_year = value;
          break;
    
          case "必修選択":
            if(value.includes('選択')){
              this.elecCompul = 1;
            } else if (value.includes('選択必修')) {
              this.elecCompul = 2;
            } else if (value.includes('必修')) {
              this.elecCompul = 3
            } else {
              console.warn("Unexpected value in field 必修選択:", value);
            }
          break;  
          
          case "単位数":
            if (isNumeric(value)) {
              this.unit = parseFloat(value);
            } else {
              console.warn('Unexpected value in 単位数:', value);
            }
          break;
    
          case "開講年度":
            if (Number.isInteger(parseInt(value))) {
              this.year = parseInt(value);
            } else {
              console.warn('Unexpected value in 開講年度:', value);
            }
          break;
          
          case "開講学期":
            this.quarter = value as Quarter;
            if (!['前期','夏学期','前期集中','春学期','後期','秋学期','後期集中','冬学期','通年'].includes(value)) {
              console.warn('Unexpected value in 開講学期:', value);
            }
          break;
  
          case "曜日時限":
            this.day_time = value.split('\n')
            .map((e: string) =>e.trim())
            .filter((e: string) => e)
            .map((e: string) => {
              const _ = e.split(' ');
              return [_[1], _[2]]
            });
          break;
  
          case "教室":
            this.classroom = value;
          break;
  
          case "開講地区":
            this.area = value as Area;
            if (!['伊都地区','箱崎地区','病院地区','筑紫地区','大橋地区','六本松地区'].includes(value)) {
              console.warn('Unexpected value in 開講地区:', value);
            }
          break;
            
          case "授業科目に関する特筆事項":
            this.more = value;
          break;
          
          default:
            if (['学部カテゴリ'].includes(key)) {
              console.warn(`データフィールド ${key} を取得しない方針でございます。${key}: ${value}`);
            } else {
              console.warn(`Unknown key type in CourseMain.setKV. key: ${key}, value: ${value}`);
            }
          break;          
        }
      }

    } 
  }

  static mainFieldMap(fieldName): string | null{
    const fieldMap = {
      "科目名称": "name",
      "講義題目": "title",
      "担当教員": "instructors",
      "科目ナンバリング・コード": "numberlink", 
      "更新日付": "updated_at",
      "授業科目区分": "category",
      "使用言語": "lang",
      "対象学部等": "target_year",
      "対象学年": "target_year",
      "必修選択": "elecCompul",
      "単位数": "unit",
      "開講年度": "year",
      "開講学期": "quarter",
      "曜日時限": "day_time",
      "教室": "classroom",
      "開講地区": "area",
      "授業科目に関する特筆事項": "more",
    }
    return fieldName in fieldMap ? fieldMap[fieldName] : null
  }
}


abstract class CourseDetailPartial {
  abstract setKV<T>(key: string, ctx:  cheerio.BasicAcceptedElems<cheerio.AnyNode>, $: cheerio.CheerioAPI):void;

  toString(): string {
    return JSON.stringify(this);
  }
}

interface SyllabusSchedule {
  header: string[];
  data: Array<HTML_String[]>;
}


export class Syllabus extends CourseDetailPartial{
	outline: HTML_Table; //授業概要
	keywords: string[][] | undefined; //キーワード
  courseTypeItem: string[] | undefined; //授業形態（項目）
  courseTypeContent: string | undefined; //授業形態（内容）
  courseMaterial: string | undefined; //使用する教材等
  prerequisites: string | undefined; //履修条件等
  prereqDetail: string | undefined; //履修に必要な知識・能力
  goal: HTML_Table | undefined; //到達目標 2種類
  schedule: HTML_Table | undefined; //授業計画
  offTimeStudy: string | undefined; //授業以外での学習にあたって
  textbook: string | undefined; //テキスト
  references: string | undefined; //参考書
  handout: string | undefined; //授業資料
  evaluation: HTML_Table | undefined; //成績評価
  evaluationRemarks: string | undefined; //成績評価基準に関わる補足事項
  rubrics: string | undefined; //ルーブリック
  counseling: string | undefined; //学習相談
  files: string | undefined // 添付ファイル
  isIndustrial: string | undefined //授業担当者の実務経験有無
  industrialExp: string | undefined //授業担当者の実務経験内容
  others: string | undefined; //その他
  updatedAt: Date | undefined //更新日付
  
  static keyMap = {
    "授業概要": "outline",
    "キーワード": "keywords",
    "授業形態（項目）": "courseTypeItem",
    "授業形態（内容）": "courseTypeContent",
    "使用する教材等": "courseMaterial",
    "履修条件等": "prerequisites",
    "履修に必要な知識・能力": "prereqDetail",
    "到達目標": "goal",
    "授業計画": "schedule",
    "授業以外での学習にあたって": "offTimeStudy",
    "テキスト": "textbook",
    "参考書": "references",
    "授業資料": "handout",
    "成績評価": "evaluation",
    "成績評価基準に関わる補足事項": "evaluationRemarks",
    "ルーブリック": "rubrics",
    "学習相談": "counseling",
    "添付ファイル": "files",
    "授業担当者の実務経験有無": "isIndustrial",
    "授業担当者の実務経験内容": "industrialExp",
    "その他": "others",
    "更新日付": "updatedAt",
  };
  static skipList: string[] = [];
  static skip(...keys) {
    Syllabus.skipList.concat(...keys);
  }

  setKV(key: string, ctx:  cheerio.BasicAcceptedElems<cheerio.AnyNode>, $: cheerio.CheerioAPI):void {
    key = key.trim()
    if (Syllabus.skipList.includes(key)){
      console.info(`Field ${key} is configured to be skipped in this run.`)
    } else {
      if (key === 'キーワード') {
        let jp_en = trimInbetweenNewline($('table>tbody>tr>td', ctx).text(), false) as string[];
        this.keywords = jp_en.map((e) => e.split(/[、,]/)) // split by 、(jp), or ,(en)
      } else if (key === '授業形態（項目）') {
        this.courseTypeItem = trimInbetweenNewline($('table>tbody>tr>td', ctx).text(), false) as string[];
      } else if (['到達目標', '授業計画', '成績評価'].includes(key)) {
        this[Syllabus.keyMap[key]] = trimInbetweenNewline($('table', ctx).html()) as string;
      } else if (key in Syllabus.keyMap) {
        this[Syllabus.keyMap[key]] = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
      } else {
        console.warn(`Unknown key type in Syllabus.setKV, key: ${key}, go to campusmate page to check for more details.`);
      }
    }    
  } 
}


export type DetailPartialConstructors =             
                                  CoursePartialConstrutorType<CourseObjectiveDetail> | 
                                  CoursePartialConstrutorType<CourseImplementationDetail> |
                                  CoursePartialConstrutorType<CourseGradingDetail> |
                                  CoursePartialConstrutorType<CourseContactsDetail>;

export class CourseDetail {
  courseObjectiveDetail: CourseObjectiveDetail | undefined;
  courseImplementationDetail: CourseImplementationDetail | undefined;
  courseGradingDetail: CourseGradingDetail | undefined;
  courseContactsDetail: CourseContactsDetail | undefined;

  setKV(constructorFn: DetailPartialConstructors, value) {
    switch(constructorFn) {
      case CourseObjectiveDetail:
        this.courseObjectiveDetail = value;
      break;
      case CourseImplementationDetail:
        this.courseImplementationDetail = value;
      break;
      case CourseGradingDetail:
        this.courseGradingDetail = value;
      break;
      case CourseContactsDetail:
        this.courseContactsDetail = value;
      break;
      default:
        console.warn('Unknown contructor signature:', constructorFn, 'Are you sure you are passing the right key-value pair? Check you value also.')
      break;
    }
  }
}

export class CourseObjective {
  degreeObjective: { // 学位プログラムの学修目標
    main: string | undefined; //主
    sub: string | undefined; //従
  };
  courseObjective: { //授業科目の到達目標（評価の観点）
    main: string | undefined; //主
    sub: string | undefined; //従
  }

  constructor(dMain, dSub, cMain, cSub) {
    // expecting ctx to be THE objective table
    this.degreeObjective = {
      main: dMain,
      sub: dSub
    }

    this.courseObjective = {
      main: cMain,
      sub: cSub
    }
  }

  toString(): string {
    return JSON.stringify(this);
  }
}


// 授業科目の目的・目標・履修条件について
export class CourseObjectiveDetail extends CourseDetailPartial{ 
	obj_jp: string | undefined;
	obj_en: string | undefined;
	keywords: string[] | undefined;
	prerequisites: string | undefined;
  courseObjective: CourseObjective;
  curriculumMap: HTML_Link;
  rubrics: HTML_Link;

  setKV(key: string, ctx: cheerio.BasicAcceptedElems<cheerio.AnyNode>, $: cheerio.CheerioAPI):void {
    switch (key = key.trim()) {
      case '授業科目の目的（日本語）':
        this.obj_jp = trimInbetweenNewline($('table', ctx).text()) as string;
        break;
      case '授業科目の目的（英語）':
        this.obj_en = trimInbetweenNewline($('table', ctx).text()) as string;
        break;
      case 'キーワード': {
        let keywords = trimInbetweenNewline($('table', ctx).text()) as string;
        this.keywords = keywords.split(',');
        break;
      }
      case '履修条件':
        this.prerequisites = trimInbetweenNewline($('table', ctx).text()) as string;
        break;
      case '目標': {
        // log('In CourseObjectiveDetail.setKV::case(目標)')
        let formDataArr = trimInbetweenNewline($('tbody>tr', ctx).text(), false) as string[];

        this.courseObjective = new CourseObjective(formDataArr[4], formDataArr[5], formDataArr[7], formDataArr[8]);
        break;
      }
      default:
        if (['カリキュラム・マップ', 'ルーブリック'].includes(key)) {
          console.warn('Current implementation does not support field', key, 'yet.');
        } else {
          console.warn('Unknown key type:', key);
        }
        break;
    }
  }
}

const courseImplementationDetailScheduleHeader = {
  theme: '授業のテーマ', 
  activity: '授業の内容（90分授業＝2時間）',
  offClassContent: '事前/事後学修の内容',
};

interface CourseImplementationDetailSchedule {
  header: {
    theme: string, 
    activity: string,
    offClassContent: string,
  };
  data: Array<[HTML_String, HTML_String, HTML_String]>;
}

// 授業科目の実施方法について
export class CourseImplementationDetail extends CourseDetailPartial{ 
  type: HTML_String ; //授業の方法
  method: HTML_String ; //教授・学習法
  online: HTML_String ; //遠隔授業
  moodle: HTML_String ; //Moodleコース情報
  courseMaterial: HTML_String ; //使用する教材
  courseMaterialDistr: HTML_String ; //教材の配布方法
  textbook: HTML_String ; //テキスト
  references: HTML_String ; //参考書等
  courseAdministration: HTML_String ; //授業計画
  schedule: CourseImplementationDetailSchedule; //授業スケジュール
  notes: HTML_String ; //備考

  setKV(key: string, ctx: cheerio.BasicAcceptedElems<cheerio.AnyNode>, $: cheerio.CheerioAPI):void {
    switch (key) {
      case '授業の方法':
        this.type = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '教授・学習法':
        this.method = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '遠隔授業':
        this.online = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '使用する教材':
        this.courseMaterial = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '教材の配布方法':
        this.courseMaterialDistr = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case 'テキスト':
        this.textbook = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '参考書等':
        this.references = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '授業計画':
        this.courseAdministration = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '備考':
        this.notes = trimInbetweenNewline($('table>tbody>tr>td', ctx).html()) as string;
        break;
      case 'スケジュール':
        this.schedule = {
          header: courseImplementationDetailScheduleHeader,
          data: parseScheduleTable(ctx,$)
        }
        // log('スケジュール parse is not implemented yet.')
        break;        
      default:
        if (['Moodleコース情報'].includes(key)) {
          console.warn('Current implementation does not support field', key, 'yet.');
        } else {
          console.warn('Unknown key type:', key);
        }
        break;
    }
  }
}

// 授業科目の成績評価の方法について
export class CourseGradingDetail extends CourseDetailPartial{
  exams: string | undefined; //定期試験
  quizzes: string | undefined; //小テスト
  report:  string | undefined; //レポート
  presentation:  string | undefined; //発表
  classContribution: string | undefined; //授業への貢献度
  project: string | undefined; //作品
  attendance: string | undefined; //出席
  other: string | undefined; //その他
  notes: string | undefined; //備考

  setKV(key: string, ctx: cheerio.BasicAcceptedElems<cheerio.AnyNode>, $: cheerio.CheerioAPI):void {
    switch (key) {
      case '定期試験':
        this.exams = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '小テスト':
        this.quizzes = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case 'レポート':
        this.report = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '発表':
        this.presentation = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '授業への貢献度':
        this.classContribution = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '作品':
        this.project = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '出席':
        this.attendance = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case 'その他':
        this.other = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '備考':
        this.notes = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      default: 
        if (key) {
          console.warn('Current implementation does not support field', key, 'yet.');
        } 
        break;
    }
  }
}

// 授業科目に関する学習相談について
export class CourseContactsDetail extends CourseDetailPartial{
  academic: string | undefined; //担当教員による学習相談
  accommodation: string | undefined; //合理的配慮について
  contactInfo : HTML_Link // 修学上の合理的配慮の流れに関する部局HP

  setKV(key: string, ctx: cheerio.BasicAcceptedElems<cheerio.AnyNode>, $: cheerio.CheerioAPI):void {
    switch (key) {
      case '担当教員による学習相談':
        this.academic = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '合理的配慮について':
        this.accommodation = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;
      case '修学上の合理的配慮の流れに関する部局HP':
        this.contactInfo = trimInbetweenNewline($('table>tbody>tr>td', ctx).text()) as string;
        break;

      default: 
        if (key) {
          console.warn('Current implementation does not support field', key, 'yet.');
        } 
        break;
    }
  }
}

////////////////////COURSE////////////////////
export class Course {
	main: CourseMain; // Store every field seperately
	detail: Syllabus | CourseDetail | undefined; // Store as JSON in DB 

  constructor(courseMain: CourseMain, detail: Syllabus | CourseDetail | undefined){
    this.main = courseMain;
    this.detail = detail;
  }

  // Prepare the course for insertion
  objectMapperToRecord() {

  }

  static insert_all(attributes: Course[]) {
    // if the course is cross-listed, then 

  }
}

////////////////////////////////
// Utilities
function isNumeric(n): boolean {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function isCourseDetail(str: string): boolean {
  const test = '授業科目の目的・目標・履修条件について';
  return str.includes(test);
}

function parseScheduleTable(scheduleTr: cheerio.BasicAcceptedElems<cheerio.AnyNode>, $: cheerio.CheerioAPI): Array<[string, string, string]> {
  let data: Array<[string, string, string]> = [];

  $('table>tbody>tr',scheduleTr)
    .filter(function (i) { // for every even row except for the first row
      return i > 1 && i % 2 == 0;
    })
    .each(function () {
      var tds = $('td', this); 
      const dataRow = tds!.map(function() {
        return trimInbetweenNewline($(this).html())
      })!.toArray()!.slice(1);
      if (!dataRow || dataRow.length !== 3) {
        data.push(['', '', ''])
      } else {
        data.push(dataRow as [string, string, string])
      }
    })

  return data
}
