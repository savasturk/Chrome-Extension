alert('This page incluse Snake Game extension')
chrome.browserAction.onClicked.addListener(function (tab) {
	// for the current tab, inject the "snake.js" file & execute it
	chrome.tabs.executeScript(tab.ib, {
		file: 'snake.js'
	});
});