/**
 * Created by Josh on 3/16/2015.
 */
var array ={};

//classes 0 -> n
var classes;
//KEY == classes[i].id
var assignments = [];

function convertToJSON(response){
    //converts the XMLHttpRequest to JSON object file and returns it
    var myObject = JSON.parse(response);
    classes = myObject;
    return myObject;
};


function getAssignments(classes){
    var xhr = [];
    for (i = 0; i < classes.length; i++){
        (function (i){
            xhr[i] = new XMLHttpRequest();
            url = "https://canvas.instructure.com/api/v1/courses/"+ classes[i].id +"/assignments?access_token=1016~EnIw6S4NDs4swhTCNU7p7xsU4nyhjSuGDxMaDLKCYFx6RBe1RriCukfLY8f8zuU2";
            xhr[i].open("GET", url, true);
            xhr[i].onreadystatechange = function () {
                if (xhr[i].readyState == 4 && xhr[i].status == 200) {
                    assignments[classes[i].id] = convertToJSON(xhr[i].responseText);
                    console.log(assignments[classes[i].id]);
                    console.log(assignments);
                }
            };
            xhr[i].send();
        })(i);
    }
};


var xhr = new XMLHttpRequest();
xhr.open("GET", "https://canvas.instructure.com/api/v1/courses?access_token=1016~EnIw6S4NDs4swhTCNU7p7xsU4nyhjSuGDxMaDLKCYFx6RBe1RriCukfLY8f8zuU2", true);
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        // innerText does not let the attacker inject HTML elements.
            classes = convertToJSON(xhr.responseText);
            getAssignments(classes);

    }
}
xhr.send();



chrome.browserAction.onClicked.addListener(function(tab) {
    if(array[tab.id]){
        array[tab.id] = false;
        console.log('background')
        chrome.tabs.executeScript(tab.id, {file: "uninject.js"});
    }else{
        array[tab.id] = true;
        console.log('background')
        chrome.tabs.executeScript(tab.id, {file: "inject.js"});
    }


});