$(document).ready(function(){
	var commands;
	var stopped = true;
	$('#start_stop').center();
	if (annyang) {
		commands = {
			'*arg1': function(arg1) {
				alert(arg1);
			}
		};
		annyang.init(commands);
	}

	$('#start_stop').click(function(){
		if (stopped){
			stopped = false;
			$('#start_stop span').removeClass('glyphicon-record');
			$('#start_stop span').addClass('glyphicon-stop');
			annyang.start();
		}
		else{
			stopped = true;
			$('#start_stop span').removeClass('glyphicon-stop');
			$('#start_stop span').addClass('glyphicon-record');
			annyang.abort();
		}
	});

	

});

jQuery.fn.center = function () {
	this.css("position","absolute");
	this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
	                                            $(window).scrollTop()) + "px");
	this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
	                                            $(window).scrollLeft()) + "px");
	return this;
}

