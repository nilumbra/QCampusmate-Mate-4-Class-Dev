<!-- eslint-disable no-trailing-spaces -->
<!-- eslint-disable vue/no-unused-components -->
<!-- eslint-disable max-len -->
<template>
  <el-collapse v-model="activeName" @change="handleCollapseChange">
    <!-- {{course_grades}} -->
    <el-collapse-item  v-for="(gpaInYear, year, index) in course_grades" :name="index" :key="index">
      <template slot="title">
        <span>
          {{`${parseInt(year)} - ${parseInt(year) + 1}`}}
          &nbsp;
          gpa <el-tag size="mini" type="info" color="#428bca" effect="dark" class="unit"><b> {{parseFloat(totalIn(enrollment, 'gpa')).toFixed(1)}} </b>
          </el-tag>&nbsp;
          annual units <el-tag size="mini" type="info" color="#428bca" effect="dark" class="unit"><b> {{parseFloat(totalIn(enrollment, 'unit')).toFixed(1)}} </b>
          </el-tag>
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
                  gpa <el-tag size="mini" type="info" color="#f6a3b1" effect="dark" class="unit"><b> {{totalIn(enrollment, 'gpa', parseInt(index)).toFixed(1)}} </b>
                  </el-tag>&nbsp;
                  semester units <el-tag size="mini" type="info" color="#f6a3b1" effect="dark" class="unit"><b> {{totalIn(enrollment, 'unit', parseInt(index)).toFixed(1)}} </b>
                  </el-tag>
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
    this.FIRSTQUARTER = new Set(['前', '夏学期', '前期集中', '春学期']);
    this.SECONDQUARTER = new Set(['後', '秋学期', '後期集中', '冬学期', '通年']);

    this.provideFinishedCourseDataByQuarter();
    console.log(this.course_grades);
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
        if (y === 2019){
          for (let entry of this.course_grades[2019][0]) {
            console.log(entry);   
          }
        } 
        // console.log(this.course_grades[y])
      }
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
      const quarterSelector = typeof __quarter__ === 'undefined' ? null : (__quarter__ === 0 ? (q => this.FIRSTQUARTER.has(q)): (q => this.SECONDQUARTER.has(q)));
      
      var res;
      // console.log(this.gpaData.categories);
      // console.log(this.gpaData.course_grades);
      if (quarterSelector) {
        console.log(`Filtering by quarter...`);
        // console.log(typeof(this.gpaData.course_grades));
        res = this.gpaData.course_grades.filter(({ quarter }) => quarterSelector(quarter));
        // console.log(res);
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
      // 2019: [
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
    };
  },
};
</script>
