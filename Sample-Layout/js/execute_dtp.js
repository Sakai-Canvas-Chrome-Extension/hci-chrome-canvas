
$( window ).load(function() {
	var links = document.querySelectorAll('.priority');
	var memory = [];
	function remember(i) {
		return function() { return links[i].innerHTML; }
	}
	function performSet(k) {
		return function() { document.getElementById('priorityHeader').innerHTML = links[k].innerHTML; }
	}
    $( "#datepicker" ).datepicker();
    $( "#timepicker1" ).timepicker();
	for (var i = 0; i < links.length; i++) {
		memory[i] = remember(i);
    }
    for (var j = 0; j < links.length; j++) {
    	links[j].onclick = performSet(j);
    }
});