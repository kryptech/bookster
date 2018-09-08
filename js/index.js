var booksterApp = angular.module("booksterApp", [
	'booksterControllers'
]);

$(document).ready(function () { // jQuery ready to roll.
	
	setTimeout(function() {
		$('body').css('opacity', 1);
		setTimeout(function() {
			$('#splashPage, #splashPageB').css('transform', 'rotateY(-180deg)');
		}, 400);
	}, 400);
	
});

/*document.fonts.ready.then(function () {
	// Doesn't work in IE or NetNanny on Android.
});*/
