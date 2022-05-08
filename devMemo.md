# Scratchy notes during the development of this extension

## v1.0.0 -- (Example procedures to create a Chrome extension( step-by-step))

### Implementation
0. Read [Chrome Developers - Get Started](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
1. Create qcampusmate-mate folder
2. Create manifest.json, add fields such as `name`, `version`, `manifest_version`,`background`, `permissions`, `action` etc...
3. Introduce a user interface
4. Translate feature specifications into unimplemented interfaces in code 

- [x]	Define resources the extension has access to (e.g. storage, active_tabs, scripting, etc.)

- [x]	Define actions (Functional .html pages.)
•	Create pop.html, which defines the extension view

- [x]	Button: 成績表をエクスポート
•	Create JS

- [x]	onload: page[grade] => getSeisekiHyo

### Publish

### UI Interface Implmentation
`main.js` for extension using Vue + ElementUI
```js
import Vue from 'vue';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App.vue';
```


`CoursePlannerTable.vue` 



## Definitions

### passed_course
A functional definition for the purpose of this system: `passed_course` is any course whose prescribed unit we should count towards the acquired units which the DRC uses to check against degree requirement units.

passed_course is any course that has any `letter_evalution` among ["A", "B", "C", "D", "R"]



### My Course Categories (by Campusmate)
```js
// All KIKAN course categories. For all course record in <gpaData.course_grades>, if it is a kikan course, it should have exactly one of the lements from the following array as its `category` key's value.
["基幹教育セミナー","課題協学科目","言語文化基礎科目","文系ディシプリン科目","理系ディシプリン科目","健康・スポーツ科目","総合科目","フロンティア科目","サイバーセキュリティ科目","（文）専攻教育科目","（文）低年次専攻教育科目","（経）専攻教育科目","（理）専攻教育科目","（理）専攻教育科目","（工）専攻教育科目"]
```
