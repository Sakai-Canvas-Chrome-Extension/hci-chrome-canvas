/**
 * Created by Josh on 3/16/2015.
 */
if (window.top === window) {

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = chrome.extension.getURL('scheduleSheet.css');
    (document.head||document.documentElement).appendChild(style);

    // Inject the schedule script
    var scheduleScript = document.createElement('iframe');
    scheduleScript.id = "scheduleScript";
    scheduleScript.className = "scheduleScript";
    scheduleScript.type = 'text/javascript';
    document.body.appendChild(scheduleScript);

    scheduleScript.src = chrome.extension.getURL("popup.html");

    // Call this to get the user's upcoming assignments.
    chrome.runtime.sendMessage({method: "getAssignments"}, function(response) {
        console.log(response.stuff);
    });
}
