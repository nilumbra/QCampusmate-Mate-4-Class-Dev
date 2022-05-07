<!-- eslint-disable no-trailing-spaces -->
<!-- eslint-disable vue/no-unused-components -->
<!-- eslint-disable max-len -->
<template>
  <el-collapse v-model="activeName" @change="handleCollapseChange">
    <!-- {{course_grades}} -->
    <el-collapse-item  v-for="(gpaInYear, year, index) in course_grades" :name="year" :key="index">
      <template slot="title">
        <span>
          {{`${parseInt(year)} - ${parseInt(year) + 1}`}}
          &nbsp;
          <template v-for="(item, index) in summary(year)">
            {{ index ? 'annual units' : 'gpa' }}
            <el-tag :key="index" size="mini" type="info" color="#428bca" effect="dark" class="unit"><b> {{(item).toString() !== 'NaN' ? item : '---'}} </b>
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
                    <el-tag :key="index" size="mini" type="info" color="#f6a3b1" effect="dark" class="unit"><b> {{(item).toString() !== 'NaN' ? item : '---'}} </b>
                    </el-tag>&nbsp;
                  </template>
                </span> 
              </div>
              <div>
                <course-planner-table :grades="grades"></course-planner-table>
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
  .el-card {
    &__header {
      padding: 0px;
      border-bottom: 0px solid rgb(255, 225, 225);
    }
    &__body {
      padding: 0px;
    }
  }

  .card-header{
    padding: 10px;
    background-color: rgb(255, 240, 240);
    border-style: solid; 
    border-color:rgb(255, 225, 225);
    border-width: 1px;
    border-bottom: 0px solid rgb(255, 225, 225);
  }
</style>
<script>
/* eslint-disable vue/no-unused-components */
/* eslint-disable no-nested-ternary */
import PlannerCard from '../card/PlannerCard.vue';
import CoursePlannerTable from '../table/CoursePlannerTable.vue';
import gpaData from '@/Testdata/example_course_data.json';

export default {
  components: {
    PlannerCard, CoursePlannerTable,
  },

  created() {
    // Fetch on init
    this.loadGPAData();
    
    this.provideFinishedCourseDataByQuarter();
    this.activeName = [''+new Date().getFullYear()];
    console.log(this.course_grades);
  },

  computed: {
    summary() {
      return (year, quarter) => this.aggregate({ year: year, quarter: quarter })
    }
  },

  methods: {
    totalIn(year, type, period) {
      const Y = this.course_grades[year];
      const first = Y[0].reduce((pre, cur) => pre + parseInt(cur[type], 10) || 0, 0);
      const second = Y[1].reduce((pre, cur) => pre + parseInt(cur[type], 10) || 0, 0);

      return typeof period !== 'undefined' ? (period ? second : first) : first + second;
    },

    printData() {
      console.log(this.gpaData);
    },
    
    loadGPAData(){  
      try {
          this.gpaData.course_grades = JSON.parse(gpaData.course_grades);
          this.gpaData.categories = JSON.parse(gpaData.categories);
          // console.log("---------Category------")
          // console.log(category);
          // console.log("---------Grades------")
          // console.log(course_grades);
        } catch(err) {
          console.log(err);
        }
    },

    provideFinishedCourseDataByQuarter() {
      const thisYear = new Date().getFullYear();
      for (let y = parseInt(this.enrollment); y <= thisYear; y++) {
        
        this.course_grades[y] = [
          this.getPlannerFormatCourseData(this.filterBy({quarter: 0, year: y})), 
          this.getPlannerFormatCourseData(this.filterBy({quarter: 1, year: y}))  
        ];

        for (let quarter_grades of this.course_grades[y]) {
          quarter_grades.forEach(e => {console.log(e)});
        }
      }
    },

    filterQuarter(course_grades, quarter) {
      if ((typeof course_grades === 'undefined') || (course_grades.length === 0)){
        console.error("Empty input in <filterQuarter(course_grades)>");
      }

      const FIRSTQUARTER = new Set(['前', '夏学期', '前期集中', '春学期']);
      const SECONDQUARTER = new Set(['後', '秋学期', '後期集中', '冬学期', '通年']);

      const quarterSelector = typeof quarter === 'undefined' ? null : (quarter === 0 ? (q => FIRSTQUARTER.has(q)): (q => SECONDQUARTER.has(q)));

      return course_grades.filter(({ quarter }) => quarterSelector(quarter));
    },
    /*
     * params {Object} obj - expect a filter option object with at most four keys: {quarter, year, evaluation, category}
     * return {}
     */
    filterBy(obj) { // SHOULD BUILD A FILTER FUNCTION INSTEAD OF RETURN A FILTERD OBJECT
      const __quarter__ = obj['quarter'];
      const __year__ = obj['year'];
      const evaluation = obj['evaluation'];
      const __category__ = obj['category'];
      // const quarterSelector = typeof __quarter__ === 'undefined' ? null : (__quarter__ === 0 ? (q => this.FIRSTQUARTER.has(q)): (q => this.SECONDQUARTER.has(q)));
      
      var res;
      // console.log(this.gpaData.categories);
      // console.log(this.gpaData.course_grades);
      if (typeof __quarter__ !== 'undefined') {
        console.log(`Filtering by quarter...`);
        // console.log(typeof(this.gpaData.course_grades));
        res = this.filterQuarter(this.gpaData.course_grades, __quarter__);
      }

      if (__year__) {
        console.log("Filtering by year...");
        res = res.filter(({ year }) => parseInt(year) === parseInt(__year__));
        // console.log(res);
      }

      if (evaluation) {
        console.log("Filtering by grade...");
        res = res.filter(({ letter_evaluation }) => letter_evaluation === evaluation );
        // console.log(res);
      }

      if (__category__) {
        console.log("Filtering by ...");
        res = res.filter(({ category }) => category === __category__ );
        // console.log(res);
      }
      
      
      // console.log(res);
      console.log("Exiting filterBy()...");
      return res;
    },

    getPlannerFormatCourseData(data) {
      const pick = ({subject, unit, letter_evaluation, gpa}) => ({subject, letter_evaluation, unit, gpa});
      return data.map(e => pick(e))
    },

    // Calculate GPA and passed unit base on this.course_grades
    aggregate(obj) {
      // - Not including withdrawn
      const { quarter, year, category } = obj;
      if (!(year)) console.error("Option is missing `year` key")
      
      const LETTER_TO_GPA = {65: 4, 66: 3, 67: 2, 68: 1, 70: 0};
      const course_grades = typeof quarter === 'undefined' ? this.course_grades[year].flat() : this.course_grades[year][quarter];
      console.log(course_grades, quarter, year, category)

      var grade_statistics = course_grades
        .filter(e => [65, 66, 67, 68, 70].includes(e['letter_evaluation'].charCodeAt(0) - 65248)) // Process only A, B, C, D, F courses
        .filter(e => typeof(category) === 'string' ? e['category'] === category : true)
        .reduce((agg, e)=>{
            const unit = parseFloat(e['unit']),
                letter = e['letter_evaluation'].charCodeAt(0) - 65248,
                gpa = parseFloat(e['gpa']);
            if (e['subject'] == '基幹教育セミナー') {
                // console.log(gpa === 0 && letter === 70);
            }
            if (letter === 82) { // == 'R'
                agg[String.fromCharCode(letter)][0] += unit;
                agg['passed_units'] += unit;
            } else if(gpa === 0 && letter === 70){ // == 'F'
                agg['total_gpa_units'] += unit;
                agg['F'][0] += unit;
                // console.log(e['subject'], e['letter_evaluation'])
            } else if ([65, 66, 67, 68].includes(letter)){ // == 'A, B, C, D'
                const gpa = unit * LETTER_TO_GPA[letter];
                agg['total_gpa_units'] += unit;
                agg['total_gpa'] += gpa;
                agg['passed_units'] += unit;
                agg[String.fromCharCode(letter)][0] += unit;
                agg[String.fromCharCode(letter)][1] += gpa; 
            }
            // console.log(e['subject'], String.fromCharCode(letter), letter === 82 ? '-' : letter === 70 ? 0 : unit * letter_to_gpa[letter]);
            // agg['passed_units'] += unit;
            // agg['total_gpa'] += parseFloat(curr['gpa']) * unit;
            return agg 
      }, {total_gpa_units: 0, passed_units: 0, total_gpa: 0, A: [0, 0], B: [0, 0], C: [0, 0], D: [0,0], F:[0,0], R:[0, 0]})

      const avgGPA = (grade_statistics['total_gpa'] / grade_statistics['total_gpa_units']).toFixed(2);
      // console.log(grade_statistics);
      return [avgGPA, grade_statistics['passed_units'].toFixed(1)]
    },

    handleCollapseChange(activeNames) {
      console.log(activeNames)
    }
  },
    
  data() {
    return {
      FIRSTQUARTER: null,
      SECONDQUARTER: null,
      gpaData: {course_grades:[], categories:[]},
      enrollment: '2019',
      course_grades: {},
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
