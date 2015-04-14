/**
 * Created by Josh on 3/16/2015.
 */
var array ={};


// var firstTime = true;
// if (firstTime) {
//     chrome.storage.local.clear();
//     firstTime = false;
// }

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
// var app_key = '1016~EnIw6S4NDs4swhTCNU7p7xsU4nyhjSuGDxMaDLKCYFx6RBe1RriCukfLY8f8zuU2'; //set by getAssignments message
var app_key = '';
function fetchData() {
    console.log('b');
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://canvas.instructure.com/api/v1/courses?access_token=" + app_key, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            // innerText does not let the attacker inject HTML elements.
                classes = convertToJSON(xhr.responseText);
                console.log(classes);
                if(classes.errors != null) {
                    assignments_callback({error: "Invalid Access Token"});
                } else {
                    getAssignments(classes);
                }
        }
    }
    xhr.send();
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
                console.log(xhr[i].readyState + " " + xhr[i].status);
                if (xhr[i].readyState == 4) {
                    if (xhr[i].status == 200) {
                        assignments[classes[i].id] = convertToJSON(xhr[i].responseText);
                    } else { // 401
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
        getAssignmentIDsFromStorage(mergeAssignmentIDs);
    }
}

var full_assignment_id_list = [];
function getAssignmentIDsFromStorage(nextFunction) {
    console.log('d');
    chrome.storage.local.get('assignment_keys', function(response) {
        full_assignment_id_list = isEmpty(response) ? [] : response.assignment_keys;
        nextFunction();
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
    chrome.storage.local.remove('assignment_keys', function () {
        chrome.storage.local.set({assignment_keys: full_assignment_id_list}, function () {
            conformAssignmentFields();
        });
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
                conformed_assignment.completed = 
                    ass.has_submitted_submissions ?
                        "complete" : (ass.locked_for_user ? "missed" : "todo");
                conformed_assignment.checked = 
                    conformed_assignment.completed=="complete" ? true : false;
                conformed_assignment.course_code = classes[i].course_code;
                conformed_assignment.due_at = ass.due_at;
                conformed_assignment.id = ass.id;
                conformed_assignment.name = ass.name;
                conformed_assignment.passed = 
                    ass.locked_for_user ? "past" : "future";
                conformed_assignment.priority = 2;
                conformed_assignment.description = ass.description;
                conformed_assignment.status = 
                    !ass.locked_for_user ? (ass.has_submitted_submissions ? "Submitted" : "Not Started") : "Closed";
                conformed_assignments.push(conformed_assignment);
            }
        }
    }
    updateAssignmentList();
}

function updateAssignmentList() {
    if (conformed_assignments.length == 0) {
        finalBridge();
    }
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
                    chrome.storage.local.remove(ass_id, function() {
                        chrome.storage.local.set(obj, function () {
                            bridgeForStepThree(i);
                        });
                    });

                }
            });
        })(ass, i);
    }
}

var ass_count = 0;
function bridgeForStepThree(class_num) {
    ++ass_count;
    if (ass_count == conformed_assignments.length) {
        ass_count = 0;
        getAssignmentsFromStorage();
    }
}

var assignments_from_storage = [];
function getAssignmentsFromStorage() {
    console.log("getting assignments from storage");
    assignments_from_storage = [];
    assignment_countdown = full_assignment_id_list.length;
    console.log(full_assignment_id_list);
    for (var i = 0; i < full_assignment_id_list.length; i++) {
        var ass_id = full_assignment_id_list[i] + '';
        chrome.storage.local.get(ass_id, function (assignment) {
            assignments_from_storage.push(assignment);
            finalBridge();
        });
    }
}
var assignment_countdown = 1; // set by preceding function
var assignments_callback = null; // set by message passer

function finalBridge() {
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
    if (request.method == "fetchAssignments") {
        console.log('a');
        app_key = request.key;
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
                console.log(value);
                sendResponse({'app_key': value});
            });
        })(sendResponse);
        return true; // indicates that I want to send a response asynchronously
    } else if (request.method == 'storeAppKey') {
        console.log(request.key);
        chrome.storage.local.remove('app_key', function() {
           chrome.storage.local.set({'app_key': request.key}); //callback unneccessary
        });
    } else if (request.method == 'modifyAssignment') {
        delete request.ass['$$hashKey'];
        var obj = {};
        obj[request.ass.id] = request.ass;
        console.log('william');
        chrome.storage.local.get(request.ass.id + '', function(response) {
            console.log(response);
        });
        chrome.storage.local.remove(request.ass.id + '', function() {
            chrome.storage.local.set(obj);
        });
    } else if (request.method == 'storeNewAssignment') {
        assignments_callback = sendResponse;
        storeNewAssignment(request.ass);
        return true;
    } else if (request.method == 'getAssignments') {
        assignments_callback = sendResponse;
        grabAssignments();
        return true;
    }
});



// ******************************** END MESSAGE PASSER ********************************

// ******************************** GET ASSIGNMENTS ******************************

function grabAssignments() {
    getAssignmentIDsFromStorage(getAssignmentsFromStorage);
}
// ******************************** STORE NEW ASSIGNMENT ******************************

function storeNewAssignment(ass) {
    chrome.storage.local.get('last_used_id', function(response) {
        console.log(response);
        var id_obj = {};
        id_obj.id = isEmpty(response) ? -1 : response.last_used_id.id;
        ++id_obj.id;
        ass.id = id_obj.id;
        var ass_save_obj = {};
        ass_save_obj[ass.id] = ass;
        chrome.storage.local.set(ass_save_obj);
        chrome.storage.local.set({last_used_id: id_obj});
        chrome.storage.local.get('assignment_keys', function(response) {
            id_list = isEmpty(response) ? [] : response.assignment_keys;
            console.log("id"); console.log(ass.id);
            id_list.push(ass.id);
            chrome.storage.local.remove('assignment_keys', function () {
                chrome.storage.local.set({assignment_keys: id_list});
                assignments_callback({});
            })
        });
    });
}
