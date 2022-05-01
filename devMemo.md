## Example procedures to create a Chrome extension( step-by-step)

0. Read [Chrome Developers - Get Started](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
1. Create qcampusmate-mate folder
2. Create manifest.json, add fields such as `name`, `version`, `manifest_version`,`background`, `permissions`, `action` etc...
3. Introduce a user interface


## Test

### Test the extension
  0. Go to `chrome://extensions`

### Publish


4. Translate feature specifications into unimplemented interfaces in code 

	Define resources the extension has access to (e.g. storage, active_tabs, scripting, etc.)

	Define actions (Functional .html pages.)
•	Create pop.html, which defines the extension view

	Button: 成績表をエクスポート
•	Create JS

	onload: page[grade] => getSeisekiHyo
