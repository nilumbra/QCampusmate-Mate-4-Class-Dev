<!-- eslint-disable max-len -->
<template>
  <el-container style="height: auto; border: 1px solid #eee">
    <el-aside width="300px" style="background-color: rgb(238, 241, 246)">
      <course-tree>
      </course-tree>
    </el-aside>
    <el-container>
      <el-header>
        <h2> Course Planner </h2>
      </el-header>
      <el-main>
        <planner-quarter-collapse></planner-quarter-collapse>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
  .box-card {
        width: 480px;
  }
</style>

<script>
import CourseTree from '../tree/CourseTree.vue';
// import PlannerCard from '../card/PlannerCard.vue';
import PlannerQuarterCollapse from '../collapse/PlannerQuarterCollapse.vue';


export default {
  components: {
    CourseTree, /* PlannerCard, */ PlannerQuarterCollapse,
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
