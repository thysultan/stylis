# stylis rule-sheet

stylis plugin to extract individual rules to use with the insertRule API

```js
var sheet = document.head.appendChild(document.createElement('style')).sheet
var length = sheet.cssRules.length

var plugin = stylisRuleSheet((rulset, safe) => {
	// indicates that the rule will throw when used with `insertRule`
	if (safe < 0)
		return

	try {
		sheet.insertRule(rulset, length)
		length++
	} catch (e) {
		console.log(e)
	}
})

stylis.use(plugin)
```
