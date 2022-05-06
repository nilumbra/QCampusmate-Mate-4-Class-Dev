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