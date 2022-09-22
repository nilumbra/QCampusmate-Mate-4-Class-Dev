"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCourseDetail = exports.Course = exports.CourseContactsDetail = exports.CourseGradingDetail = exports.CourseImplementationDetail = exports.CourseObjectiveDetail = exports.CourseObjective = exports.CourseDetail = exports.Syllabus = exports.CourseMain = void 0;
const trimInbetweenNewline_1 = __importDefault(require("./trimInbetweenNewline"));
const log = console.log;
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
};
;
var Day;
(function (Day) {
    Day["Monday"] = "\u6708";
    Day["Tuesday"] = "\u706B";
    Day["Wednesday"] = "\u6C34";
    Day["Thursday"] = "\u6728";
    Day["Friday"] = "\u91D1";
    Day["Saturday"] = "\u571F";
    Day["Sunday"] = "\u65E5";
})(Day || (Day = {}));
class CourseMain {
    constructor(id) {
        this.id = id;
    }
    setSubjectNumberLink(numberlink) {
        // ENG-MCE3542J --> return ['ENG', 'MCE', '3542J'];
        const reg = /([A-Z]+)-([A-Z]+)([0-9]*[A-Z])/;
        const matched = numberlink.match(reg);
        if (!matched) {
            console.log('Numberlink is undefined', numberlink);
        }
        else if (matched.length < 4) {
            console.error('Set school-major-subjectCode failed:', matched);
        }
        else {
            this.school = matched[1];
            this.major = matched[2];
            this.subject_code = matched[3];
        }
    }
    setKV(key, value) {
        value = value.trim();
        if (value) {
            if (['科目名称', '講義科目名'].includes(key)) {
                this.name = value;
            }
            else if (['科目ナンバリング・コード', '科目ナンバリングコード'].includes(key)) {
                // if cross-listed, set to the first one for now
                let numberlinks = value.split(',');
                this.numberlinks = numberlinks;
                this.setSubjectNumberLink(numberlinks[0]);
            }
            else if (['対象学部等', '開講学部・学府'].includes(key)) {
                this.target_students_from = value;
            }
            else {
                switch (key) {
                    case "講義題目":
                        this.title = value;
                        break;
                    case "担当教員":
                        this.instructors = value === null || value === void 0 ? void 0 : value.split('\n').map(e => e.trim()).filter(e => e !== '');
                        break;
                    case "更新日付":
                        this.updated_at = new Date(value);
                        break;
                    case "授業科目区分": {
                        this.category = value;
                        let schoolMajor = `${this.school}-${this.major}`;
                        if (schoolMajor in CourseMain.subjectCategoryMap) {
                            if (!CourseMain.subjectCategoryMap[schoolMajor].includes(value)) { // 新しい専攻(学部+専攻)-授業科目区分を発見する場合、専攻-授業科目区分Hashmapにデータを追加
                                log(`${schoolMajor}の新しい授業科目区分を発見: ${value}.`);
                                CourseMain.subjectCategoryMap[schoolMajor].push(value);
                                console.log(`${schoolMajor} now has`, CourseMain.subjectCategoryMap[schoolMajor]);
                            }
                        }
                        else {
                            log(`新しい専攻コードを発見: ${schoolMajor}.`);
                            CourseMain.subjectCategoryMap[schoolMajor] = [value];
                            console.log(`${schoolMajor} now has`, CourseMain.subjectCategoryMap[schoolMajor]);
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
                        if (value.includes('選択')) {
                            this.elecCompul = 1;
                        }
                        else if (value.includes('選択必修')) {
                            this.elecCompul = 2;
                        }
                        else if (value.includes('必修')) {
                            this.elecCompul = 3;
                        }
                        else {
                            console.warn("Unexpected value in field 必修選択:", value);
                        }
                        break;
                    case "単位数":
                        if (isNumeric(value)) {
                            this.unit = parseFloat(value);
                        }
                        else {
                            console.warn('Unexpected value in 単位数:', value);
                        }
                        break;
                    case "開講年度":
                        if (Number.isInteger(parseInt(value))) {
                            this.year = parseInt(value);
                        }
                        else {
                            console.warn('Unexpected value in 開講年度:', value);
                        }
                        break;
                    case "開講学期":
                        this.quarter = value;
                        if (!['前期', '夏学期', '前期集中', '春学期', '後期', '秋学期', '後期集中', '冬学期', '通年'].includes(value)) {
                            console.warn('Unexpected value in 開講学期:', value);
                        }
                        break;
                    case "曜日時限":
                        this.day_time = value.split('\n')
                            .map((e) => e.trim())
                            .filter((e) => e)
                            .map((e) => {
                            const _ = e.split(' ');
                            return [_[1], _[2]];
                        });
                        break;
                    case "教室":
                        this.classroom = value;
                        break;
                    case "開講地区":
                        this.area = value;
                        if (!['伊都地区', '箱崎地区', '病院地区', '筑紫地区', '大橋地区', '六本松地区'].includes(value)) {
                            console.warn('Unexpected value in 開講地区:', value);
                        }
                        break;
                    case "授業科目に関する特筆事項":
                        this.more = value;
                        break;
                    default:
                        if (['学部カテゴリ'].includes(key)) {
                            console.warn(`データフィールド ${key} を取得しない方針でございます。${key}: ${value}`);
                        }
                        else {
                            console.warn(`Unknown key type in CourseMain.setKV. key: ${key}, value: ${value}`);
                        }
                        break;
                }
            }
        }
    }
    static mainFieldMap(fieldName) {
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
        };
        return fieldName in fieldMap ? fieldMap[fieldName] : null;
    }
}
exports.CourseMain = CourseMain;
CourseMain.subjectCategoryMap = numberLinkCodeToCategory;
class CourseDetailPartial {
    toString() {
        return JSON.stringify(this);
    }
}
class Syllabus extends CourseDetailPartial {
    static skip(...keys) {
        Syllabus.skipList.concat(...keys);
    }
    setKV(key, ctx, $) {
        key = key.trim();
        if (Syllabus.skipList.includes(key)) {
            console.info(`Field ${key} is configured to be skipped in this run.`);
        }
        else {
            if (key === 'キーワード') {
                let jp_en = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text(), false);
                this.keywords = jp_en.map((e) => e.split(/[、,]/)); // split by 、(jp), or ,(en)
            }
            else if (key === '授業形態（項目）') {
                this.courseTypeItem = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text(), false);
            }
            else if (['到達目標', '授業計画', '成績評価'].includes(key)) {
                this[Syllabus.keyMap[key]] = (0, trimInbetweenNewline_1.default)($('table', ctx).html());
            }
            else if (key in Syllabus.keyMap) {
                this[Syllabus.keyMap[key]] = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
            }
            else {
                console.warn(`Unknown key type in Syllabus.setKV, key: ${key}, go to campusmate page to check for more details.`);
            }
        }
    }
}
exports.Syllabus = Syllabus;
Syllabus.keyMap = {
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
Syllabus.skipList = [];
class CourseDetail {
    setKV(constructorFn, value) {
        switch (constructorFn) {
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
                console.warn('Unknown contructor signature:', constructorFn, 'Are you sure you are passing the right key-value pair? Check you value also.');
                break;
        }
    }
}
exports.CourseDetail = CourseDetail;
class CourseObjective {
    constructor(dMain, dSub, cMain, cSub) {
        // expecting ctx to be THE objective table
        this.degreeObjective = {
            main: dMain,
            sub: dSub
        };
        this.courseObjective = {
            main: cMain,
            sub: cSub
        };
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.CourseObjective = CourseObjective;
// 授業科目の目的・目標・履修条件について
class CourseObjectiveDetail extends CourseDetailPartial {
    setKV(key, ctx, $) {
        switch (key = key.trim()) {
            case '授業科目の目的（日本語）':
                this.obj_jp = (0, trimInbetweenNewline_1.default)($('table', ctx).text());
                break;
            case '授業科目の目的（英語）':
                this.obj_en = (0, trimInbetweenNewline_1.default)($('table', ctx).text());
                break;
            case 'キーワード': {
                let keywords = (0, trimInbetweenNewline_1.default)($('table', ctx).text());
                this.keywords = keywords.split(',');
                break;
            }
            case '履修条件':
                this.prerequisites = (0, trimInbetweenNewline_1.default)($('table', ctx).text());
                break;
            case '目標': {
                // log('In CourseObjectiveDetail.setKV::case(目標)')
                let formDataArr = (0, trimInbetweenNewline_1.default)($('tbody>tr', ctx).text(), false);
                this.courseObjective = new CourseObjective(formDataArr[4], formDataArr[5], formDataArr[7], formDataArr[8]);
                break;
            }
            default:
                if (['カリキュラム・マップ', 'ルーブリック'].includes(key)) {
                    console.warn('Current implementation does not support field', key, 'yet.');
                }
                else {
                    console.warn('Unknown key type:', key);
                }
                break;
        }
    }
}
exports.CourseObjectiveDetail = CourseObjectiveDetail;
const courseImplementationDetailScheduleHeader = {
    theme: '授業のテーマ',
    activity: '授業の内容（90分授業＝2時間）',
    offClassContent: '事前/事後学修の内容',
};
// 授業科目の実施方法について
class CourseImplementationDetail extends CourseDetailPartial {
    setKV(key, ctx, $) {
        switch (key) {
            case '授業の方法':
                this.type = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '教授・学習法':
                this.method = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '遠隔授業':
                this.online = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '使用する教材':
                this.courseMaterial = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '教材の配布方法':
                this.courseMaterialDistr = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case 'テキスト':
                this.textbook = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '参考書等':
                this.references = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '授業計画':
                this.courseAdministration = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '備考':
                this.notes = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).html());
                break;
            case 'スケジュール':
                this.schedule = {
                    header: courseImplementationDetailScheduleHeader,
                    data: parseScheduleTable(ctx, $)
                };
                // log('スケジュール parse is not implemented yet.')
                break;
            default:
                if (['Moodleコース情報'].includes(key)) {
                    console.warn('Current implementation does not support field', key, 'yet.');
                }
                else {
                    console.warn('Unknown key type:', key);
                }
                break;
        }
    }
}
exports.CourseImplementationDetail = CourseImplementationDetail;
// 授業科目の成績評価の方法について
class CourseGradingDetail extends CourseDetailPartial {
    setKV(key, ctx, $) {
        switch (key) {
            case '定期試験':
                this.exams = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '小テスト':
                this.quizzes = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case 'レポート':
                this.report = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '発表':
                this.presentation = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '授業への貢献度':
                this.classContribution = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '作品':
                this.project = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '出席':
                this.attendance = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case 'その他':
                this.other = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '備考':
                this.notes = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            default:
                if (key) {
                    console.warn('Current implementation does not support field', key, 'yet.');
                }
                break;
        }
    }
}
exports.CourseGradingDetail = CourseGradingDetail;
// 授業科目に関する学習相談について
class CourseContactsDetail extends CourseDetailPartial {
    setKV(key, ctx, $) {
        switch (key) {
            case '担当教員による学習相談':
                this.academic = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '合理的配慮について':
                this.accommodation = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            case '修学上の合理的配慮の流れに関する部局HP':
                this.contactInfo = (0, trimInbetweenNewline_1.default)($('table>tbody>tr>td', ctx).text());
                break;
            default:
                if (key) {
                    console.warn('Current implementation does not support field', key, 'yet.');
                }
                break;
        }
    }
}
exports.CourseContactsDetail = CourseContactsDetail;
////////////////////COURSE////////////////////
class Course {
    constructor(courseMain, detail) {
        this.main = courseMain;
        this.detail = detail;
    }
    // Prepare the course for insertion
    objectMapperToRecord() {
    }
    static insert_all(attributes) {
        // if the course is cross-listed, then 
    }
}
exports.Course = Course;
////////////////////////////////
// Utilities
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function isCourseDetail(str) {
    const test = '授業科目の目的・目標・履修条件について';
    return str.includes(test);
}
exports.isCourseDetail = isCourseDetail;
function parseScheduleTable(scheduleTr, $) {
    let data = [];
    $('table>tbody>tr', scheduleTr)
        .filter(function (i) {
        return i > 1 && i % 2 == 0;
    })
        .each(function () {
        var tds = $('td', this);
        const dataRow = tds.map(function () {
            return (0, trimInbetweenNewline_1.default)($(this).html());
        }).toArray().slice(1);
        if (!dataRow || dataRow.length !== 3) {
            data.push(['', '', '']);
        }
        else {
            data.push(dataRow);
        }
    });
    return data;
}
