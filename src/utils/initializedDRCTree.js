/* eslint-disable no-unused-vars */
/**
 * Assume at the invokation, the function will be provided
 * with a context <this> whose `meta` and `data` properties are expected to be initialized as specified in 卒業要件データ定義
 * 
 * @params {Object} degree_requirement - see degree_requirement.js
 * @returns void
 */
function initializeRequirementTree(degree_requirement) {
  const seen = new Set();
  const course_grades = this.course_grades;
  /**
   * 
   * STATUS = {failed: -2, withdraw: -1, ongoing: 0, passed_retakable: 1, passed_unretakable: 2}
   * @params {number} index - the index of the course record of the gpaData in global storage
   * @params {Object} course_node - the course_node whose status is undetermined yet 
   * @returns {number} status - the set status of the course node
   */
  function setNodeStatus(course_record, course_node){
    course_node.label = course_record.subject;
    course_node.units = parseFloat(course_record.unit) || 0;

    // console.log(`${course_record.subject} has ${course_node.units} units; Setting ${course_record.subject} to be a leaf node of ${curr_node.label}`)

    // Passed/Not passed detection
    if (course_record.letter_evaluation.charCodeAt(0) - 65248 === 70) {
      // If 'F', don't increment the passed unit
      course_node.status = -2;
    } else if ([65, 66, 67, 68, 82] // 'A', 'B', 'C', 'D', 'R'
      .includes(course_record.letter_evaluation.charCodeAt(0) - 65248)) {
      if (course_record.letter_evaluation.charCodeAt(0) - 65248 === 68) {
        // Mark 'D' courses as retakable;
        course_node.status = 1;
      } else {
        course_node.status = 2;
      }
    } else if (course_record.letter_evaluation.
    charCodeAt(0) - 65248 === 87) { // W
      course_node.status = -1;
    } else if (course_record.unit === '' && course_record.last_updated === ''){ // ongoing course
      course_node.status = 0;
    }

    course_node.passed_units = course_node.status >= 1 ? course_node.units : 0;
  
    return course_node.status;
  }

  /**
   * This function determines the state(passed/retakable(i.e.
   * letter_evalution <= 'D')/failed/etc..) of a single courseRecord
   * <gradeRecoard> and set the leaf of current DRC tree node <curr_node> accordingly
   * @params {Object} course_record - gpaData.course_records (DELETE
   * this param upon next refactoring)
   * @params {number} index - index of course_records in gpaData.course_records
   * @params {Object} curr_node - assume to be a leaf node in
   * `degree_requirement`` data structure
   * @returns void
   */
  function setDRCTreeNode(course_record, index, curr_node) {
    const course_node = {};

    // Subroutine to set the node status based on its letter_evaluation et.al.
    setNodeStatus(course_record, course_node); 
    
    curr_node.passed_units = Math.min(curr_node.units, curr_node.passed_units + course_node.passed_units);
    // console.log(`${curr_node.label} = ${curr_node.passed_units}`);
    curr_node.children.push(course_node);
    seen.add(index);
  }

  // Solve the Subset Sum problem using Dynamic programming
  // This function should only be called by
  // <getSubsetOfCoursesThatHasTheMinimumPartialSumOfUnitAboveRequirement>
  function getMinPartialSumSubset_5(arr, target) {
    
    // console.log(`target ${target}, scaled ${(target - 1) / 0.5 + 3}`)
    const [m, n] = [arr.length + 1, (target - 1) / 0.5 + 3];
    const d = [];
    const dp_subset = [];

    for (let i = 0; i < m; i++) {
      d.push(new Array(n).fill(false));
      dp_subset.push(new Array(n).fill(null));
    }

    for (let i = 0; i < m; i++) {
      d[i][0] = true;
      dp_subset[i][0] = new Set();
    }

    for (let j = 1; j < n; j++) {
      d[0][j] = false;
    }

    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        if (arr[i - 1][1] * 2 > j) { // arr = [[index, unit], ...]
          d[i][j] = d[i - 1][j];
          dp_subset[i][j] = dp_subset[i - 1][j];
        } else {
          // d[i][j] = d[i - 1][j] || d[i - 1][j - arr[i - 1] * 2];
          if (d[i - 1][j]) {
            d[i][j] = d[i - 1][j];
            dp_subset[i][j] = dp_subset[i - 1][j];
          } else if (d[i - 1][j - arr[i - 1][1] * 2]) {
            d[i][j] = d[i - 1][j - arr[i - 1][1] * 2];
            dp_subset[i][j] = new Set(dp_subset[i - 1][j - arr[i - 1][1] * 2]);
            dp_subset[i][j].add(arr[i - 1][0]);
            // Found an optimal subset
            if (j / 2 === target) { // unscale j to the original target
              return [true, Array.from(dp_subset[i][j])];
            }
          }
        }
      }
    }
    return [false, null];
  }

  /**
   * Before entering the for-loop that adds elective courses to the tree, <
   * minPartialSumOfUnit> should be called to get the subset of the indices of
   * the courses that sum to a value as barely greater than the category
   * requirement as possible.
   * @params {Array<[number, Object]>}- coursesInCategory: [[index, CourseRecordObject], ...]
   * @returns {Array<number>} - return an array of `index`(`index` refers to the index in `course_grades`)
   */
  function getSubsetOfCoursesThatHasTheMinimumPartialSumOfUnitAboveRequirement(coursesInCategory, curr_node) {
    const required_unit = curr_node.units;
    const index_unit_arr = [];

    let unit_sum = 0;

    for (const index of coursesInCategory) {
      const { unit, letter_evaluation} = course_grades[index];
      if (letter_evaluation.charCodeAt(0) - 65248 === 70 ) {
        setDRCTreeNode(course_grades[index], index, curr_node)
      } else {
        unit_sum += unit;
        index_unit_arr.push([index, unit]);
      }
    }

    if (unit_sum <= required_unit) {
      return coursesInCategory;
    }
    const [isSubsetSum, subset_indices] = getMinPartialSumSubset_5(index_unit_arr, required_unit);

    return isSubsetSum ? subset_indices : coursesInCategory;
  }

  /** This function returns a matcher function that matches all elective courses that are supposed to be categorized under <curr_node>
   * @params {Object} curr_node - Assume to be a leaf node in DegReq tree
   * @returns {Function} - A filter expected by courser_grades.filter call. A call with this fill will find all course that fall under <curr_node>
   *
   */
  function createCourseCategoryMatcher(curr_node) {
    const KIKAN = new Set(['基幹教育セミナー', '課題協学科目', '言語文化基礎科目', '文系ディシプリン科目', '理系ディシプリン科目', '健康・スポーツ科目', '総合科目', 'フロンティア科目', 'サイバーセキュリティ科目', '高年次基幹教育科目', 'その他']);
    const nodeIsKikan = curr_node.grpKey && (KIKAN.has(curr_node.label) || curr_node.grpKey.includes('KED')); // All Kikan course has a grpKey
    const UPPER = ['現代史入門'];

    /* TEMPORARY HEURISTICS FOR MATCHING KIKAN COURSESE */
    // I don't have the list of all 総合科目 yet, hence we use this temporary heursitc so that the matcher will process 総合科目 correctly
    const isSouGou = curr_node.label === '総合科目';
    const isUpper = curr_node.label === '高年次基幹教育科目';
    const isOthers = curr_node.label === 'その他'; // その他

    /// //////////////////////////////////////////////////

    /* TEMPORARY HEURISTICS FOR MATCHING MAJOR COURSESE */
    const isCourseCommons = curr_node.label === 'コース共通科目';
    const isFreeElective = curr_node.label === '自由選択科目';
    const isThesis = curr_node.label === '卒業論文';

    /// //////////////////////////////////////////////////
    return function (course_record, index) {
      // The course is a kikan course only if its category is in KIKAN
      // Or it is listed as a 高年次基幹教育科目(by subject name)
      const courseIsUpperKikan = UPPER.some((key) => course_record.subject.includes(key));
      const courseIsKikan = KIKAN.has(course_record.category) || courseIsUpperKikan;

      // We add the course to the DRC tree node, only if both course and node belongs either KIKAN or MAJOR
      const doesCategoryMatch = !(courseIsKikan ^ nodeIsKikan);

      // MATCH KIKAN COURSES USING HEURISTICS //
      const SouGouMatch = isSouGou && course_record.subject_number.includes(curr_node.grpKey);
      const OthersMatch = isOthers && KIKAN.has(course_record.category); // Note this will make the checker's correctness dependent on the index position of その他 node in the 基幹教育.children[]: the matcher is only expected to work correctly if その他 is the last element of 基幹教育.children[].
      const UpperKikanMatch = isUpper && courseIsUpperKikan;
      /// //////////////////////////////////////

      if (curr_node.label === '高年次基幹教育科目' && course_record.subject.includes('現代史入門')) {
        console.log(`UpperKikanMatch: ${UpperKikanMatch} \n courseIsUpperKikan: ${courseIsUpperKikan}\n courseIsKikan: ${courseIsKikan} \n doesCategoryMatch: ${doesCategoryMatch} \n
        `);
      }
      // MATCH MAJOR COURSES USING HEURISTICS //
      /// //////////////////////////////////////

      return !seen.has(index)
            && doesCategoryMatch
            && (SouGouMatch /* Add to tree node if first condition matches and the course is a 総合科目. Otherwise, use the latter rules to match */
              || UpperKikanMatch || OthersMatch /* If encountering その他 node and there are still KIKAN courses left, add them all to the node */ || curr_node.courseKeys.some((key) => course_record.subject.includes(key)) && course_record.subject_number.includes(curr_node.grpKey)
              || isCourseCommons && curr_node.courseKeys.some((key) => course_record.subject.includes(key)) || course_record.subject === '卒業論文' && isThesis || isFreeElective /* This operation assumes '自由選択科目' is the last element in 専攻教育科目.children[] */
            );
    };
  }

  /** This function recursively initializes the DRC tree's view-model data structure.
   *
   * @params {Object} - At the initial invokation of this function, curr_node should either has a label called "基幹教育" or "専攻教育科目" (See degree_requirement.js);
   * @returns void - This function initialized part of the DRC's view-model, nothing to return
   */
  function initializeNode(curr_node) {
    /* Given a node representing the course structures,
    * 1. fill in the course data for view-model
    * 2. calculate and add the <passed_unit> property to each node appropriately
    */

    if (!curr_node.children) { // BASE CASE
      curr_node.children = [];
      curr_node.passed_units = 0;
      // console.log(JSON.stringify(curr_node, null, "\t"));

      if (!curr_node.elective) { // If course category is not elective, scan <course_grades> until every course in <courseKeys> have been found
        // console.log(`${curr_node.label} is not an elective!`);
        const req = new Set(curr_node.courseKeys); // Assume courseKeys has at least one element in this case, but it shouldn't cause a problem even if there is none.
        // console.log(self.gpaData.course_grades ? "ok" : "ERR");
        for (let i = 0; i < course_grades.length; ++i) {
          const curr = course_grades[i];
          if (req.has(curr.subject)) { // Matched by subject name, add the course to view-model
            if (seen.has(i)) {
              throw Error(`Error: compulsory course gets cross-listed! When processing node: ${curr_node.label}`);
            }

            setDRCTreeNode(curr, i, curr_node);
            req.delete(course_grades[i]); // This course has been checked, delete it
          }

          if (req.size === 0) break; // All requirements of this compulsory category have been met
        }
        // console.log(JSON.stringify(curr_node, null, '\t'));
      } else {
        // This node is an elective category,
        const courseMatcher = createCourseCategoryMatcher(curr_node);

        // Get courses that match the curr_node
        const coursesInCategory = []; // [[index, CourseRecordObject], ...]
        for (let i = 0; i < course_grades.length; ++i) { // ~ O(n)
          const curr = course_grades[i];
          if (courseMatcher(curr, i)) {
            coursesInCategory.push(i);
          }
        }
        // console.log("initializeNode");
        // console.log(`typeof curr_node: ${typeof curr_node}, typeof curr_node.label: ${typeof curr_node.label}, typeof curr_node.units: ${typeof curr_node.units}, ${curr_node.label}, ${curr_node.units}`);
        // Figure out the optimized subset of courses to add, and then
        // add elements of the subset to <curr_node>
        // Running time: O(curr_node.unit * coursesInCategory.length
        // This should be the bottle neck for initializng a tree node
        getSubsetOfCoursesThatHasTheMinimumPartialSumOfUnitAboveRequirement(coursesInCategory, curr_node).forEach((index) => {
          setDRCTreeNode(course_grades[index], index, curr_node);
        });

        // console.log(JSON.stringify(curr_node, null, '\t'));
      }
    } else { // Recursive count passed_unit;
      for (const childNode of curr_node.children) { // Initialized every child
        
        // console.log(`On ${curr_node.label}, starting initializing node ${childNode.label}`);
        initializeNode(childNode);
        // console.log(`On ${curr_node.label}, finishing initializing node ${childNode.label}`);
        // console.log("\n\n")
      }
      
      // all children or curr_node has passed units
      var count = 0;
      for (const childNode of curr_node.children) {
        count += childNode.passed_units;
      }
      curr_node.passed_units = Math.min(curr_node.units,count);
    }
  }

  // Copy the tree structure from degree_requirement.json
  this.meta = degree_requirement.meta;

  // Copy the value of degree_requirement
  // Changing properties of data[0] won't effect the prototype
  // const j = JSON.stringify(degree_requirement);
  // const clone = JSON.parse(j);
  const requirements = degree_requirement.requirements;

  this.data[0] = requirements['基幹教育'];
  this.data[1] = requirements['専攻教育科目'];

  // Initialized tree values
  initializeNode(this.data[0]);
  initializeNode(this.data[1]);
}

export { initializeRequirementTree };