<!-- eslint-disable no-trailing-spaces -->
<!-- eslint-disable vue/no-unused-components -->
<!-- eslint-disable max-len -->
<template>
  <el-collapse v-model="activeName" @change="handleCollapseChange">
    <!-- {{course_grades}} -->
    <el-collapse-item  v-for="(gpaInYear, year, index) in plannerTable" :name="year" :key="index">
      <template slot="title">
        <span>
          {{`${parseInt(year)} - ${parseInt(year) + 1}`}}
          &nbsp;
          <template v-for="(item, index) in summary(year)">
            {{ index ? 'annual units' : 'gpa' }}
            <el-tag :key="index" size="mini" type="info" color="#428bca" effect="dark" class="unit"><b> {{(item).toString() !== 'NaN' ? item : '-----'}} </b>
            </el-tag>&nbsp;
          </template>
          <!-- gpa 
          annual units <el-tag size="mini" type="info" color="#428bca" effect="dark" class="unit"><b> {{parseFloat(totalIn(enrollment, 'unit')).toFixed(1)}} </b> -->
        </span>       
      </template>

      <el-container>
        <el-row :gutter="20" style="min-width:100%">
          <el-col :span="12" style="min-width:50%" v-for="(grades, index) in gpaInYear" :key="index" :name="index">
            <!-- Course Grade Card -->
            <el-card style="border-style: none" :body-style="{'padding': '0px'}" shadow="never">
              <div slot="header" class="card-header">
                <span>
                  {{ parseInt(index) ? 'Second Semester' : 'First Semester'}}
                  &nbsp;
                  <template v-for="(item, index) in summary(year, index)">
                    {{ index ? 'semeter units' : 'gpa' }}
                    <el-tag :key="index" size="mini" type="info" color="#f6a3b1" effect="dark" class="unit"><b> {{(item).toString() !== 'NaN' ? item : '-----'}} </b>
                    </el-tag>&nbsp;
                  </template>
                </span> 
              </div>
              <div>
                <course-planner-table :grades="grades" :addable="true"></course-planner-table>
                <div style="margin-top: 10px">
                  <el-button v-if="parseInt(year) == new Date().getFullYear()" @click="addCourse(year, index)">
                    追加 {{s}}
                  </el-button>
                </div>
              </div>
            </el-card>
            <!-- Course Grade Card -->
          </el-col>
        </el-row>
      </el-container>
    </el-collapse-item>
  </el-collapse>
</template>
<style lang="scss">

</style>
<script>
/* eslint-disable no-param-reassign */
/* eslint-disable vue/no-unused-components */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
/* eslint-disable */

import PlannerCard from '../card/PlannerCard.vue';
import CoursePlannerTable from '../table/CoursePlannerTable.vue';
import { toRef } from 'vue';

export default {
  components: {
    PlannerCard, CoursePlannerTable,
  },

  created() {
    // Fetch on init
    this.loadGPAData();

    // Provision the plannerTable data structure
    this.provideFinishedCourseDataByQuarter();

    // Compute the summary()

    this.activeName = [`${new Date().getFullYear()}`];
    // console.log(this.course_grades);
  },
  watch: {
    'this.$store.state.plannerTable'(oldVal, newVal) {
      console.log(`old: ${oldVal[2022][0].length}\n new: ${newVal[2022][0].length}`);
    }
  },

  computed: {
    summary() {
      return (year, quarter) => this.aggregate({ year, quarter });
      // (y, q) => this.$store.getters.summary(y, q)
      // return this.$store.getters.len
    },

    s() {
      return this.$store.getters.len
    },


    course_grades_() {
      return this.$store.state.gpaData.course_grades;
    },

    categories_() {
      return this.$store.state.gpaData.categories;
    },

    plannerTable() {
      return this.$store.state.plannerTable;
    }
  },

  methods: {
   
    // printData() {
    //   console.log(this.gpaData);
    // },
    loadGPAData() {
      try {
        this.gpaData.categories = this.categories_;
        this.gpaData.course_grades = this.course_grades_;
      } catch (err) {
        console.log(`In loadGPAData(): ${err}`);
      }
    },

    provideFinishedCourseDataByQuarter() {
      const thisYear = new Date().getFullYear();
      for (let y = parseInt(this.enrollment, 10); y <= thisYear; y++) {
        const zenki = this.getPlannerFormatCourseData(this.filterBy({ quarter: 0, year: y })),
            kouki = this.getPlannerFormatCourseData(this.filterBy({ quarter: 1, year: y }));
        // console.log(zenki);

        this.$store.dispatch('addCourses', {
          year: y,
          quarter: 0,
          courses: zenki,
        })

        this.$store.dispatch('addCourses', {
          year: y,
          quarter: 1,
          courses: kouki,
        })
      }
    },

    /**
     * This functions filters the given courseGrades 
     * @params {Array<CourseRecord>} courseGrades - an Array of courseGrades objects
     * @params {number} quarter - 0: returns 前期, 1: returns 後期
     * @returns filtered courseGrades specifies by `quarter` parameter
     */
    filterQuarter(courseGrades, quarter) {
      if ((typeof courseGrades === 'undefined') || (courseGrades.length === 0)) {
        console.error('Empty input in <filterQuarter(course_grades)>');
      }

      const FIRSTQUARTER = new Set(['前', '夏学期', '前期集中', '春学期']);
      const SECONDQUARTER = new Set(['後', '秋学期', '後期集中', '冬学期', '通年']);

      const quarterSelector = typeof quarter === 'undefined' ? null : (quarter === 0 ? ((q) => FIRSTQUARTER.has(q)) : ((q) => SECONDQUARTER.has(q)));

      return courseGrades.filter(({ quarter }) => quarterSelector(quarter));
    },

    /**
     * @params {Object} obj - expect a filter option object with at
     most four keys: {quarter, year, evaluation, category}
     * @return {}
     */
    filterBy(obj) { // SHOULD BUILD A FILTER FUNCTION INSTEAD OF RETURN A FILTERD OBJECT
      const __quarter__ = obj.quarter;
      const __year__ = obj.year;
      const { evaluation } = obj;
      const __category__ = obj.category;

      let res;
      // console.log("----------------IN filter By--------------")
      // console.log(this.gpaData.categories);
      // console.log(this.gpaData.course_grades);
      if (typeof __quarter__ !== 'undefined') {
        console.log(`Filtering by quarter... ${__quarter__ ? '後期':'前期'}`);
        // console.log(typeof(this.gpaData.course_grades));
        res = this.filterQuarter(this.gpaData.course_grades, __quarter__);
        // console.log(res)
      }

      if (__year__) {
        console.log(`Filtering by year... ${__year__}`);
        res = res.filter(({ year }) => parseInt(year, 10) === parseInt(__year__, 10));
        // console.log(res);
      }

      if (evaluation) {
        // console.log('Filtering by grade...');
        res = res.filter(({ letter_evaluation }) => letter_evaluation === evaluation);
        // console.log(res);
      }

      if (__category__) {
        // console.log('Filtering by ...');
        res = res.filter(({ category }) => category === __category__);
        // console.log(res);
      }

      // console.log(res);
      // console.log('Exiting filterBy()...');
      return res;
    },

    getPlannerFormatCourseData(data) {
      const pick = ({
        subject, unit, letter_evaluation, gpa,
      }) => ({
        subject, letter_evaluation, unit, gpa,
      });
      return data.map((e) => pick(e));
    },

    // Calculate GPA and passed unit base on this.plannerTable
    /**
     * 
     */
    aggregate(obj) {
      // - Not including withdrawn
      const { quarter, year, category } = obj;
      if (!(year)) console.error('Option is missing `year` key');

      const LETTER_TO_GPA = {
        65: 4, 66: 3, 67: 2, 68: 1, 70: 0,
      };
      const plannerTable = typeof quarter === 'undefined' ? this.plannerTable[year].flat() : this.plannerTable[year][quarter];
      // console.log(plannerTable, quarter, year, category);

      const grade_statistics = plannerTable
        .filter(
          (e) => [65, 66, 67, 68, 70]
            .includes(e.letter_evaluation.charCodeAt(0) - 65248),
        )// Process only A, B, C, D, F courses
        .filter((e) => (typeof (category) === 'string' ? e.category === category : true))
        .reduce((agg, e) => {
          const unit = parseFloat(e.unit);
          const letter = e.letter_evaluation.charCodeAt(0) - 65248;
          const gp = parseFloat(e.gpa);
          if (e.subject === '基幹教育セミナー') {
            // console.log(gpa === 0 && letter === 70);
          }
          if (letter === 82) { // == 'R'
            agg[String.fromCharCode(letter)][0] += unit;
            agg.passed_units += unit;
          } else if (gp === 0 && letter === 70) { // == 'F'
            agg.total_gpa_units += unit;
            agg.F[0] += unit;
            // console.log(e['subject'], e['letter_evaluation'])
          } else if ([65, 66, 67, 68].includes(letter)) { // == 'A, B, C, D'
            const totalGpa = unit * LETTER_TO_GPA[letter];
            agg.total_gpa_units += unit;
            agg.total_gpa += totalGpa;
            agg.passed_units += unit;
            agg[String.fromCharCode(letter)][0] += unit;
            agg[String.fromCharCode(letter)][1] += totalGpa;
          }
          return agg;
        }, {
          total_gpa_units: 0,
          passed_units: 0,
          total_gpa: 0,
          A: [0, 0],
          B: [0, 0],
          C: [0, 0],
          D: [0, 0],
          F: [0, 0],
          R: [0, 0],
        });

      const avgGPA = (grade_statistics.total_gpa / grade_statistics.total_gpa_units).toFixed(2);
      // console.log(grade_statistics);
      return [avgGPA, grade_statistics.passed_units.toFixed(1)];
    },

    handleCollapseChange(activeNames) {
      console.log(activeNames);
    },

    addCourse(year, quarter) {
      const semName = quarter ? '後期' : '前期';
      // console.log(`${year} ${semName}`);
      // console.log(this.plannerTable[year][quarter]);
      this.$store.dispatch('addCourses', {
        year,
        quarter,
        courses: [
          { subject: 'English Composition', unit:'2', gpa:'4.0', letter_evaluation: 'A'},  //, unit: 2, gpa: '' 
          { subject: 'Advanced Linear Algebrea', unit:'2', gpa:'4.0', letter_evaluation: 'A'}, //, unit: 2, gpa: '' 
        ]
        })
    }
  },

  data() {
    return {
      FIRSTQUARTER: null,
      SECONDQUARTER: null,
      gpaData: { course_grades: [], categories: [] },
      enrollment: '2019',
      activeName: [],
      // EXAMPLE:
      // course_grades: {
      //   2019: [
      //     [
      //       { subject: 'Kikan Seminar', unit: 1, gpa: '*' },
      //     ],
      //     [
      //       { subject: 'Academic English B: CALL', unit: 1, gpa: '4' },
      //     ],
      //   ],
      //   2020: [
      //     [
      //       { subject: 'Introduction to Philosophy and Thought', unit: 2, gpa: 4 },
      //       { subject: 'Introduction to Art Studies', unit: 2, gpa: 4 },
      //     ],
      //     [
      //       { subject: 'Mathematical Statistics', unit: 1.5, gpa: 4 },
      //     ],
      //   ],
      // }
    };
  },
};
</script>
