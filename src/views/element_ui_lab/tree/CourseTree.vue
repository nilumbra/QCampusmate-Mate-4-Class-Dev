<template>
  <el-tree :data="data" :props="defaultProps">
</el-tree>
</template>

<script>
export default {
  data() {
    return {
      data: [{
        label: '基幹教育',
        unit: 48,
        freshman_total: 36,
        children: [
          {
            label: '基幹教育セミナー',
            children: [
              {
                label: '基幹教育セミナー',
                grpKey: null,
                compulsory: true,
                elective: false,
                courseKeys: new Set(),
                unit: 1,
              },
            ],
          },
          { 
            label: '課題協学科目',
            grpKey: null,
            compulsory: true,
            elective: false,
            courseKeys: new Set(),
            unit: 2.5,
            children: [
              {
                label: '課題協学科目',
              }
            ],
          },
          { 
            label: '言語文化科目',
            grpKey: null,
            compulsory: true,
            elective: false,
            courseKeys: new Set(),
            unit: 7,
            children: [
              {
                label: '言語文化基礎科目',
                grpKey: null,
                compulsory: true,
                elective: false,
                courseKeys: new Set(),
                unit: 7,
                children:[
                  {
                    label: '学術英語A・リセプション',
                  },
                  {
                    label: '学術英語A・プロダクション',
                  },
                  {
                    label: '学術英語A・CALL',
                  },
                  {
                    label: '学術英語B・インテグレイト',
                  },
                ]
              }
            ],
          },
          { 
            label: '文系ディシプリン科目',
            grpKey: null,
            compulsory: true,
            elective: true,
            courseKeys: new Set(),
            unit: 10,
            children: [
              {
                label: '選択必修①',
                grpKey: null,
                compulsory: true,
                elective: true,
                courseKeys: new Set(),
                unit: 8,
                children:[
                  {
                    label: '哲学・思想入門',
                  },
                  {
                    label: '経済史入門',
                    failed: true,
                  },
                  {
                    label: '社会思想史',
                    retakable: true
                  },
                ]
              },
              { // If 選択必修②'s unit requirement is met, automatically put course under 選択必修①
                label: '選択必修②',
                grpKey: null,
                compulsory: true,
                elective: true,
                courseKeys: new Set(),
                unit: 2,
                children:[
                  {
                    label: '現代教育学入門',
                    retakable: true,
                  },
                  {
                    label: '教育基礎学入門',
                  },
                ]
              }
            ],
          },
          { 
            label: '理系ディシプリン科目',
            grpKey: null,
            compulsory: true,
            elective: true,
            courseKeys: new Set(),
            unit: 5,
            children: [
              {
                label: '社会と数理科学',
                unit: 1,
              },
              {
                label: '線形代数学・同演習Ａ',
                unit: 1.5,
              }
            ],
          },
          { 
            label: '健康・スポーツ科目',
            grpKey: null,
            compulsory: true,
            elective: false,
            courseKeys: new Set(),
            unit: 1,
            children: [
              {
                label: '健康・スポーツ科学演習',
                unit: 1,
              },
            ],
          },
          { 
            label: 'サイバーセキュリティ科目',
            grpKey: null,
            compulsory: true,
            elective: false,
            courseKeys: new Set(),
            unit: 1,
            children: [
              {
                label: 'サイバーセキュリティ基礎論',
                unit: 1,
              }
            ],
          },
          { 
            label: '総合科目',
            grpKey: null,
            compulsory: true,
            elective: true,
            rule: function() { /*フロンティア科目の割合?*/},
            courseKeys: new Set(),
            unit: 2,
            children: [
              {
                label: 'ソフトウェア技術を利用した創造的サービス構築論Ⅰ',
                unit: 1,
              },
              {
                label: 'サイバーセキュリティ演習',
                unit: 1,
              }
            ],
          },

          { 
            label: '高年次基幹教育科目',
            grpKey: null,
            compulsory: true,
            elective: true,
            rule: function() { /*2年生以上履修可能です e.g. enrollment=2023, can't add to 2023 schedule*/},
            courseKeys: new Set(),
            unit: 2,
            children: [
              {
                label: '現代史入門Ⅰ',
                unit: 2,
                failed: true
              },
            ],
          },

          { 
            label: 'その他',
            grpKey: null,
            compulsory: true,
            elective: true,
            rule: function() { /*フロンティア科目の割合?*/},
            courseKeys: new Set(),
            freshman: 6.5,
            unit: 12.5,
            children: [
              {
                label: '九州大学の歴史Ⅰ',
                unit: 1,
              },
              {
                label: '九州大学の歴史Ⅱ',
                unit: 1,
                retakable: true
              }
            ],
          },
        ],
      },
      { label: '専攻教育科目',
        children: [
          { label: '文学部コア科目',
            children: [
              { label: '人文学科基礎科目',
                grpKey: null,
                compulsory: true,
                elective: false,
                courseKeys: new Set(),
                freshman: 4, 
                unit: 4,
                children: [
                  {
                    label: "人文学基礎Ⅰ",
                    unit: 2,
                  },
                  {
                    label: "人文学基礎Ⅱ",
                    unit: 2,
                  }
                ]
              },
              { label: '人文学科共通科目',
                grpKey: null,
                compulsory: true,
                elective: true,
                courseKeys: new Set(),
                unit: 2,
                children: [
                ]
              },
              { label: '古典語および外国語科目',
                grpKey: null,
                compulsory: true,
                elective: true,
                courseKeys: new Set(),
                rule: function(){return null},
                unit: 3,
                children: [
                  {
                    label: "古典語（漢文）Ⅳ",
                    unit: 1,
                  },
                  {
                    label: "英語Ⅵ",
                    unit: 1
                  }
                ]
              },
            ]
          },
          { label: 'コース共通科目',
            grpKey: null,
            compulsory: true,
            elective: true,
            courseKeys: new Set(),
            unit: 8,
            children: [
              {
                label: "史学概論",
                unit: 2,
                failed: true,
              },
              {
                label: "ヨーロッパ史学講義Ⅶ",
                unit: 2
              }
            ]
          },
          { label: '専門分野科目',
            grpKey: null,
            compulsory: true,
            elective: true,
            courseKeys: new Set(),
            unit: 26,
            children: [
              {
                label: "東洋史学講義Ⅶ",
                unit: 2,
                failed: true,
              },
              {
                label: "東洋史学演習Ⅰ",
                unit: 2
              },
              {
                label: "東洋史学演習Ⅱ",
                unit: 2,
                failed: true,
              },
              {
                label: "東洋史学講義ⅩⅠ",
                unit: 2
              }
            ]
          },
          { label: '自由選択科目',
            grpKey: null,
            compulsory: true,
            elective: true,
            courseKeys: new Set(),
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
            unit: 10,
          },
        ],
      }
      ],
      defaultProps: {
        children: 'children',
        label: 'label',
      }
    }
  },
  methods: {
    handleNodeClick(data) {
      console.log(data);
    },
  },
};
</script>
