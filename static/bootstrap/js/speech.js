var langs =
	[['Afrikaans',       ['af-ZA']],
	 ['Bahasa Indonesia',['id-ID']],
	 ['Bahasa Melayu',   ['ms-MY']],
	 ['Català',          ['ca-ES']],
	 ['Čeština',         ['cs-CZ']],
	 ['Deutsch',         ['de-DE']],
	 ['English',         ['en-AU', 'Australia'],
						 ['en-CA', 'Canada'],
						 ['en-IN', 'India'],
						 ['en-NZ', 'New Zealand'],
						 ['en-ZA', 'South Africa'],
						 ['en-GB', 'United Kingdom'],
						 ['en-US', 'United States']],
	 ['Español',         ['es-AR', 'Argentina'],
						 ['es-BO', 'Bolivia'],
						 ['es-CL', 'Chile'],
						 ['es-CO', 'Colombia'],
						 ['es-CR', 'Costa Rica'],
						 ['es-EC', 'Ecuador'],
						 ['es-SV', 'El Salvador'],
						 ['es-ES', 'España'],
						 ['es-US', 'Estados Unidos'],
						 ['es-GT', 'Guatemala'],
						 ['es-HN', 'Honduras'],
						 ['es-MX', 'México'],
						 ['es-NI', 'Nicaragua'],
						 ['es-PA', 'Panamá'],
						 ['es-PY', 'Paraguay'],
						 ['es-PE', 'Perú'],
						 ['es-PR', 'Puerto Rico'],
						 ['es-DO', 'República Dominicana'],
						 ['es-UY', 'Uruguay'],
						 ['es-VE', 'Venezuela']],
	 ['Euskara',         ['eu-ES']],
	 ['Français',        ['fr-FR']],
	 ['Galego',          ['gl-ES']],
	 ['Hrvatski',        ['hr_HR']],
	 ['IsiZulu',         ['zu-ZA']],
	 ['Íslenska',        ['is-IS']],
	 ['Italiano',        ['it-IT', 'Italia'],
						 ['it-CH', 'Svizzera']],
	 ['Magyar',          ['hu-HU']],
	 ['Nederlands',      ['nl-NL']],
	 ['Norsk bokmål',    ['nb-NO']],
	 ['Polski',          ['pl-PL']],
	 ['Português',       ['pt-BR', 'Brasil'],
						 ['pt-PT', 'Portugal']],
	 ['Română',          ['ro-RO']],
	 ['Slovenčina',      ['sk-SK']],
	 ['Suomi',           ['fi-FI']],
	 ['Svenska',         ['sv-SE']],
	 ['Türkçe',          ['tr-TR']],
	 ['български',       ['bg-BG']],
	 ['Pусский',         ['ru-RU']],
	 ['Српски',          ['sr-RS']],
	 ['한국어',            ['ko-KR']],
	 ['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
						 ['cmn-Hans-HK', '普通话 (香港)'],
						 ['cmn-Hant-TW', '中文 (台灣)'],
						 ['yue-Hant-HK', '粵語 (香港)']],
	 ['日本語',           ['ja-JP']],
	 ['Lingua latīna',   ['la']]];
	 
function updateCountry() {
	for (var i = select_dialect.options.length - 1; i >= 0; i--) {
		select_dialect.remove(i);
	}
	var list = langs[select_language.selectedIndex];
	for (var i = 1; i < list.length; i++) {
		select_dialect.options.add(new Option(list[i][1], list[i][0]));
	}
	select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

var first_char = /\S/;
function capitalize(s) {
	return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

jQuery.fn.center = function () {
	this.css("position","absolute");
	this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
	                                            $(window).scrollTop()) + "px");
	this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
	                                            $(window).scrollLeft()) + "px");
	return this;
}

$(document).ready(function(){
	// SPEECH RECOGNITION
	var final_transcript = '';
	var recognizing = false;
	var ignore_onend = true;
	var start_timestamp;
	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	
	for (var i = 0; i < langs.length; i++) {
		select_language.options[i] = new Option(langs[i][0], i);
	}
	select_language.selectedIndex = 6;
	updateCountry();
	select_dialect.selectedIndex = 6;
	
	$('#select_language').change(updateCountry());
	
	recognition.onstart = function() {
		recognizing = true;
		$('#recognition-zone').val('Esperando canción...');
	};
	
	recognition.onresult = function(event) {
		var interim_transcript = '';

		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				final_transcript += event.results[i][0].transcript;
			} 
			else {
				interim_transcript += event.results[i][0].transcript;
			}
		}
		$('#recognition-zone').val(capitalize(final_transcript));
		searchAndPlay(final_transcript);
		final_transcript = '';
	};
	
	recognition.onend = function() {
		$('#start_stop').removeClass('btn-danger');
		$('#start_stop').addClass('btn-info');
		$('#start_stop img').attr('src','mic.gif');
		recognizing = false;
		if (ignore_onend) {
			return;
		}
		if (!final_transcript) {
			return;
		}
	};
	
	
	$('#start_stop').click(function(){
		if (recognizing) {
			$('#start_stop').removeClass('btn-danger');
			$('#start_stop').addClass('btn-info');
			$('#start_stop img').attr('src','mic.gif');
			recognition.stop();
			return;
		}
		$('#start_stop').removeClass('btn-info');
		$('#start_stop').addClass('btn-danger');
		$('#start_stop img').attr('src','mic-animate.gif');
		final_transcript = '';
		recognition.lang = select_dialect.value;
		recognition.start();
		ignore_onend = false;
		start_timestamp = event.timeStamp;
	});
	// YOUTUBE-PLAYER
	$("#youtube-player-container").tubeplayer({
		width: 500, // the width of the player
		height: 400, // the height of the player
		allowFullScreen: "true", // true by default, allow user to go full screen
		initialVideo: "DkoeNLuMbcI", // the video that is loaded into the player
		preferredQuality: "default",// preferred quality: default, small, medium, large, hd720
		onPlay: function(id){}, // after the play method is called
		onPause: function(){}, // after the pause method is called
		onStop: function(){}, // after the player is stopped
		onSeek: function(time){}, // after the video has been seeked to a defined point
		onMute: function(){}, // after the player is muted
		onUnMute: function(){} // after the player is unmuted
	});
	
	$("#center-player").hide();
	
});

function searchAndPlay(keyword){
	getVideoID(keyword);
}

function getVideoID(keyword){
	var url = 'http://gdata.youtube.com/feeds/api/videos?q='+encodeURIComponent(keyword)+'&format=5&max-results=1&v=2&alt=jsonc';
	$.getJSON(url,function(data){
		if (data.data.items['0'].id){
			// Reproducir la cancion
			var idv = data.data.items['0'].id;
			var nombre_cancion = data.data.items['0'].title;
			$("#center-player").show();
			$("#title-song").html('<h1>'+nombre_cancion+'</h1>');
			$("#youtube-player-container").tubeplayer('play',idv);
			document.getElementById("center-box").scrollIntoView(true);
			
			// Agregar la cancion a la BD
			var username = $('#link-username').text().trim();
			$.ajax({
				type: "POST",
				url: "/mysongs",
				data: JSON.stringify({data: {'username': $('#link-username').text(), 
											 'id': idv, 
											 'nombre': nombre_cancion}
									 }),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function(data){
				},
				failure: function(err) {
				}
			});
		}
		
	});  
};
