/**
 * Created by Josh on 3/16/2015.
 */
var array ={};

//classes 0 -> n
var classes;
//KEY == classes[i].id
var assignments = {};

function convertToJSON(response){
    //converts the XMLHttpRequest to JSON object file and returns it
    var myObject = JSON.parse(response);
    return myObject;
};

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

chrome.browserAction.onClicked.addListener(function(tab) {
    if(array[tab.id]){
        array[tab.id] = false;
        chrome.tabs.executeScript(tab.id, {file: "uninject.js"});
    }else{
        array[tab.id] = true;
        chrome.tabs.executeScript(tab.id, {file: "inject.js"});
    }
});

// ******************************** CHECK FOR NEW ASSIGNMENTS ********************************

/* ******************************** ROAD MAP ********************************

1) Fetch course data from canvas api
    - fectchData();
2) Fetch assignment data based on course data from canvas api
    - getAssignments();
3) Update our local storage
    - updateStorage();
4) Put all assignments from storage in an array
    - getAssignmentsFromStorage();

*** time passes ***

5) respond to front end messages with our array

   ************************************************************************** */
var app_key = '1016~EnIw6S4NDs4swhTCNU7p7xsU4nyhjSuGDxMaDLKCYFx6RBe1RriCukfLY8f8zuU2'; //set by getAssignments message

function fetchData() {
    console.log('b');
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://canvas.instructure.com/api/v1/courses?access_token=" + app_key, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            // innerText does not let the attacker inject HTML elements.
                classes = convertToJSON(xhr.responseText);
                if(classes.errors != null) {
                    assignments_callback({error: "Invalid API Key"});
                } else {
                    getAssignments(classes);
                }
        }
    }
    // DEBUG
    chrome.storage.local.clear(function() { // clears all stored data
        xhr.send();
    });
    // LIVE
    // xhr.send();
}

function getAssignments(classes){
    console.log('c');
    console.log(classes.length);
    var xhr = [];
    for (i = 0; i < classes.length; i++){
        (function (i){
            xhr[i] = new XMLHttpRequest();
            url = "https://canvas.instructure.com/api/v1/courses/"+ classes[i].id +"/assignments?access_token=" + app_key;
            xhr[i].open("GET", url, true);
            xhr[i].onreadystatechange = function () {
                if (xhr[i].readyState == 4) {
                    if (xhr[i].status == 200) {
                        assignments[classes[i].id] = convertToJSON(xhr[i].responseText);
                    } else {
                        assignments[classes[i].id] = [];
                    }
                    bridgeForStepTwo(classes.length);
                }
            };
            xhr[i].send();
        })(i);
    }
};

var class_count = 0;
function bridgeForStepTwo(totalNumClasses) {
    ++class_count;
    if (class_count == totalNumClasses) {
        class_count = 0;
        getAssignmentIDsFromStorage();
    }
}

var full_assignment_id_list = [];
function getAssignmentIDsFromStorage() {
    console.log('d');
    chrome.storage.local.get('assignment_keys', function(response) {
        full_assignment_id_list = isEmpty(response) ? [] : response.assignment_keys;
        mergeAssignmentIDs();
    });
}

function mergeAssignmentIDs() {
    for (var i = 0; i < classes.length; i++) {
        var class_id = classes[i].id;
        var assignment_set = assignments[class_id];
        if (assignment_set) {
            for (var j = 0; j < assignment_set.length; j++) {
                if (full_assignment_id_list.indexOf(assignment_set[j].id) == -1)
                    full_assignment_id_list.push(assignment_set[j].id);
            }
        }
    }
    chrome.storage.local.set({'assignment_keys': full_assignment_id_list}, function () {
        conformAssignmentFields();
    });
}

var conformed_assignments = [];
function conformAssignmentFields() {
    for (var i = 0; i < classes.length; i++) {
        var class_id = classes[i].id;
        var assignment_set = assignments[class_id];
        if (assignment_set) {
            for (var j = 0; j < assignment_set.length; j++) {
                var ass = assignment_set[j];
                var conformed_assignment = {};
                conformed_assignment.CHANGED = false;
                conformed_assignment.checked = false;
                conformed_assignment.completed = 
                    ass.has_submitted_submissions ?
                        "complete" : (ass.locked_for_user ? "missed" : "todo");
                conformed_assignment.course_code = classes[i].course_code;
                conformed_assignment.due_at = ass.due_at;
                conformed_assignment.id = ass.id;
                conformed_assignment.name = ass.name;
                conformed_assignment.passed = 
                    ass.locked_for_user ? "past" : "future";
                conformed_assignment.priority = 2;
                conformed_assignment.status = "Not Started";
                conformed_assignments.push(conformed_assignment);
            }
        }
    }
    updateAssignmentList();
}

function updateAssignmentList() {
    console.log('e');
    for (var i = 0; i < conformed_assignments.length; i++) {
        var ass = conformed_assignments[i];
        (function (ass, i) {
            var ass_id = ass.id + '';
            chrome.storage.local.get(ass_id, function(record) {
                if (!isEmpty(record)) {
                    bridgeForStepThree(i);
                } else {
                    var obj = {};
                    obj[ass_id] = ass;
                    chrome.storage.local.set(obj, function () {
                        bridgeForStepThree(i);
                    });
                }
            });
        })(ass, i);
    }
}

var ass_count = 0;
function bridgeForStepThree(class_num) {
    ++ass_count;
    console.log(ass_count + " " + conformed_assignments.length);
    if (ass_count == conformed_assignments.length) {
        ass_count = 0;
        getAssignmentsFromStorage();
    }
}

var assignments_from_storage = [];
function getAssignmentsFromStorage() {
    console.log("getting assignments from storage");
    assignment_countdown = full_assignment_id_list.length;
    for (var i = 0; i < full_assignment_id_list.length; i++) {
        var ass_id = full_assignment_id_list[i] + '';
        chrome.storage.local.get(ass_id, function (assignment) {
            assignments_from_storage.push(assignment);
            finalBridge();
        });
    }
}
var assignment_countdown = -1; // set by preceding function
var assignments_callback = null; // set by message passer

function finalBridge() {
    console.log(assignment_countdown);
    --assignment_countdown;
    if (assignment_countdown == 0) {
        if (assignments_callback) {
            console.log(assignments_callback);
            assignments_callback({stuff: assignments_from_storage, key: app_key});
        }
    }
}

//
// TODO
// 1) Save priority
// 2) Save new tasks
// 3) IRB
// 4) 
// ******************************** END CHECK FOR ASSIGNMENTS ****************************

// ******************************** APP KEY STORAGE **************************************

// ******************************** END APP KEY STORAGE **********************************

// ******************************** MESSAGE PASSER **********************************

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request.method);
    if (request.method == "getAssignments") {
        console.log('a');
        if(request.key) {
            app_key = request.key;
        }
        assignments_callback = sendResponse;
        fetchData();
        return true;
    } else if (request.method == 'retrieveAppKey') {
        (function(sendResponse) {
            chrome.storage.local.get('app_key', function(key) {
                var value = '';
                if (!isEmpty(key)) {
                    value = key;
                }
                console.log(key);
                sendResponse({'app_key': value});
            });
        })(sendResponse);
        return true; // indicates that I want to send a response asynchronously
    } else if (request.method == 'storeAppKey') {
        console.log(request.key);
        chrome.storage.local.set({'app_key': request.key}); //callback unneccessary
    }
});
