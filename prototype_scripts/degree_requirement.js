const requirement = {
  meta: {
    enrollment: "",
    school: "",
    major: "",
    field: "", 
    lang1st: "",
    lang2nd:  "" 
  },

  requirements: {
    "基幹教育": {
      label: "基幹教育",
      total: 48,
      freshman_total: 36,
      children: [
        { 
          label: "基幹教育セミナー",
          grpKey: null,
          compulsory: true,
          elective: false, // if the course is not elective, courseKeys should be an exhausted listing of all required courses (in this cases, which shoud probably use a set instead of an array)
          courseKeys: ["基幹教育セミナー"], 
          unit: 1,
        },

        { 
          label: "課題協学科目",
          grpKey: null,
          compulsory: true,
          elective: false,
          courseKeys: ["課題協学科目"],
          unit: 2.5,
        },

        {
          label: "言語文化科目/言語文化基礎科目",
          grpKey: null,
          compulsory: true,
          elective: true,
          unit: 12,
          children: [
            {
              label: "韓国語"
              grpKey: "KED-LCB",
              compulsory: true,
              elective: true,
              courseKeys: ["韓国語Ⅰ", "韓国語Ⅱ", "韓国語Ⅲ","韓国語フォーラム"],
              unit: 7,
            },

            {
              label: "英語"
              grpKey: "KED-LCB",
              compulsory: true,
              elective: true,
              courseKeys: ["学術英語", "Intensive English"],
              unit: 5,
            },
          ]
        },

        ////////////////// To be edited /////////
        {
          label: "文系ディシプリン科目",
            grpKey: null,
            compulsory: true,
            elective: true,
            courseKeys: new Set(),
            unit: 10,
            children: [
              {
                label: "選択必修①",
                grpKey: "KED-H",
                compulsory: true,
                elective: true,
                courseKeys: ["哲学・思想入門", "社会思想史", "先史学入門", "歴史学入門", "文学・言語学入門", "芸術学入門", "文化人類学入門", "地理学入門", "社会学入門", "心理学入門"],
                unit: 8
              },

              { // If 選択必修②"s unit requirement is met, automatically put course under 選択必修①
                label: "選択必修②",
                grpKey: "KED-H",
                compulsory: true,
                elective: true,
                courseKeys: ["現代教育学入門", "教育基礎学入門", "法学入門", "政治学入門", "経済史入門",  "The Law and Politics of International Society"],
                unit: 2
              }
            ]
        },

        { 
          label: "理系ディシプリン科目",
          grpKey: "KED-S",
          compulsory: true,
          elective: true,
          courseKeys: ["社会と数理科学", "微分積分学", "線形代数", "身の回りの物理学", "基幹物理学", "物理学概論A", "身の回りの化学", "基礎化学", "生命の化学", "地球と宇宙の科学", "地球科学", "デザイン思考", "図形科学", "情報科学", "プログラミング演習"],
          unit: 5
        },

        { 
          label: "健康・スポーツ科目",
          grpKey: "KED-HSP",
          compulsory: true,
          elective: false,
          courseKeys: ['健康・スポーツ科学演習'],
          unit: 1
        },

        { 
          label: "サイバーセキュリティ科目",
          grpKey: "KED-CSC",
          compulsory: true,
          elective: false,
          courseKeys: ["サイバーセキュリティ基礎論"],
          unit: 1,
        },

        { 
          label: "総合科目",
          grpKey: "KED-GES",
          compulsory: true,
          elective: true,
          courseKeys: [],
          unit: 2
        },

        { 
          label: "高年次基幹教育科目",
          grpKey: null,
          compulsory: true,
          elective: true,
          rule: function() { /*2年生以上履修可能です e.g. enrollment=2023, can"t add to 2023 schedule*/},
          courseKeys: ["現代史入門Ⅰ"],
          unit: 2
        },

        { 
          label: "その他",
          grpKey: null,
          compulsory: true,
          elective: true,
          rule: function() { /*フロンティア科目の割合?*/},
          courseKeys: ['KED'],
          freshman: 6.5,
          unit: 12.5
        }
      ],    
    },
    "専攻教育科目": { 
        label: '専攻教育科目',
        children: [
          { label: '文学部コア科目',
            unit: 9,
            children: [
              { label: '人文学科基礎科目',
                grpKey: null,
                compulsory: true,
                elective: false,
                courseKeys: ["人文学基礎Ⅰ", "人文学基礎Ⅱ"],
                freshman: 4, 
                unit: 4
              },

              { label: '人文学科共通科目',
                grpKey: "LET-HUM3",
                compulsory: true,
                elective: true,
                courseKeys: ["人文学"],
                unit: 2,
                children: [
                ]
              },
              { label: '古典語および外国語科目',
                grpKey: "LET-HUM",
                compulsory: true,
                elective: true,
                rule: function(){/*中国語1, 英語1 */},
                courseKeys: ["古典語", "英語", "中国語"],
                unit: 3
              },
            ]
          },

          { label: 'コース共通科目',
            grpKey: null,
            compulsory: true,
            elective: true,
            courseKeys: ["史学概論", "日本史学", "朝鮮史学", "考古学", "ヨーロッパ史学", "イスラム史学"],
            unit: 8
          },

          { label: '専門分野科目',
            grpKey: "LET-HUM",
            compulsory: true,
            elective: true,
            courseKeys: ["東洋史学講義"],
            unit: 26
          },

          { label: '自由選択科目',
            grpKey: null,
            compulsory: true,
            elective: true,
            courseKeys: ["LET-HUM", "SCI-INF", "SCI-MAT", "ISI-ISI", "EDU-EDN", "LAW-LAW", "ECO-ECE", "ENG"],
            unit: 27,
            rule: function() {/*他学部の授業は10単位を上限として認める*/ return},
            children: [
              {
                label: "経済工学演習①",
                unit: 4
              },
              {
                label: "コンピュータアーキテクチャⅠ",
                unit: 2
              }
            ]
          },

          { label: '卒業論文',
            rpKey: null,
            compulsory: true,
            elective: true,
            courseKeys: null,
            unit: 10
          },
        ],
      }
  }
}

/*    

- Need a database of courses, containing at least the following identifiable keys: 
  - Course category
  - Target year

- Add up freshman unit requirement fields. If is freshman, show the freshman count tip.

- define a common requirement object COMMONS = {基幹セミナー, 課題協学科目, サイバーセキュリティ科目,健康・スポーツ科目}, and merge it to the `kikan` key under requirement.requirements
- 


{required: {
    requiredGrpKey: "some key that identifies a set of required classes in a 
    "commonly seen requirement group""
}}


基幹セミナー
課題協学科目
言語文化科目
文系ディシプリン科目
 {required: ["現代教育学入門", "経済史入門", "教育基礎学入門"]}
　
理系ディシプリン科目
サイバーセキュリティ科目
健康・スポーツ科目

総合科目
高年次基幹教育科目
その他
専攻教育科目

*/