## DRC Tree
### Bug Fix
- Bug 1: because at 高年次基幹教育科目  node there’s basically no filterings done, any all remaining courses were added to that node.✅

- Bug 2: 総合科目 is not getting any course added because it has a group key but no courseKeys. ✅

- Bug 3: (The minimum partial sum problem) Before entering the for-loop that adds elective courses to the tree, a <minPartialSumOfUnit> should be called to get the subset of the indices of the courses that sum to a value as barely greater than the category requirement as possible.✅

- Bug 4: The most obvious one: never add a major course to Kikai requirement, and vice versa.✅

- Bug 5: Empty string value appearing in both unit and grade field should be interpreted as on going courses, withdraw: true is unappropriate
  |
  |—Fixe and add feature: Specify some integer to indicate the course’s state. For example, state: -1, indicates failed and write it down in documentation.✅

- Bug 6: Some failed courses (e.g.　史学概論　and 韓国語Ⅲ,東洋史学講義Ⅶ) are added multiple times.
