<!-- eslint-disable max-len -->
<template>
  <el-card>
    <el-collapse accordion>
      <el-collapse-item name="1">
        <template slot="title">
          Consistency<i class="header-icon el-icon-info"></i>
        </template>
        <div>Consistent with real life: in line with
          the process and logic of real life, and comply with languages and habits that the users are used to;</div>
        <div>Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc.</div>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<style scoped>
  /* .box-card {
      width: 480px;
  } */
</style>

<script>
export default {
  props: {
    boxCard: Boolean,
  },
  data() {
    return {
      box: this.boxCard,
    };
  },
};
</script>
