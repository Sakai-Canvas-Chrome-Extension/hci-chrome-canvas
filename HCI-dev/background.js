/**
 * Created by Josh on 3/16/2015.
 */
var array ={};


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