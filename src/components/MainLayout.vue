<!-- eslint-disable max-len -->
<template>
  <el-container style="height: 100vh;">
   <!-- background-color: rgb(238, 241, 246)  border: 1px solid #eee; -->
    <el-aside width="300px" style="padding-bottom:8px;border-right:1px solid #eee">
      <el-header>
         <h4> Degree Requirement Checker</h4>
         <el-tooltip class="item" effect="dark" content="Top Left 提示文字" placement="left-start">
          <el-button icon="el-icon-info" type="text" circle></el-button>
         </el-tooltip>
              <!-- <el-tag size="mini" type="info" color="#f6a3b1" effect="dark" ><b> Info </b>
              </el-tag>&nbsp; -->
      </el-header>
      <deg-req-checker>
      </deg-req-checker>
    </el-aside>
    <el-container>
      <el-header>
        <h2> Academic Planner </h2>
      </el-header>
      <el-main>
        <planner-year-collapse></planner-year-collapse>
      </el-main>
    </el-container>
  </el-container>
</template>
<style scoped>
.el-header {
  background-color: #B4C0D0; /* #83083f;*/
  height: 60px;
}
</style>
<script>
import DegReqChecker from './DegReqChecker.vue';
// import PlannerCard from '../card/PlannerCard.vue';
import PlannerYearCollapse from './PlannerYearCollapse.vue';

/* eslint-disable */
export default {
  components: {
    DegReqChecker, /* DRCTree */ PlannerYearCollapse, /* AP */
  },

  computed: {
    count() {
      if(localStorage.count) {
        localStorage.count++;
      } else {
        localStorage.count = 0;
      }
      return localStorage.count
    }
  }, 

  methods: {
    clearStorage: () => {localStorage.removeItem("GPADATA");},
  },
  data() {
      return {
      }
  }
};
</script>
