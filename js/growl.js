function growl(type, message, duration, dismissable) {
	
	var icon;
	switch (type) {
		case 'success':
			icon = 'thumbs-up';
			break;
		case 'info':
			icon = 'comment';
			break;
		case 'warning', 'danger':
			icon = 'exclamation-triangle';
			break;
	}
	
	if (duration == null) {
		duration = 5; // Default seconds
	} else if (duration == 0) { // Persist
		dismissable = true;
	}
	
	if (dismissable == null) {
		dismissable = true;
	}
	var dismissButton = '';
	if (dismissable) {
		dismissButton = '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>';
	}
	
	var $growlEl = $('<div class="growl" role="alert"><div class="alert alert-' + type + ' col-9 col-md-6">' + dismissButton + '<div class="text-center lead"><i class="fa fa-' + icon + '"></i> ' + message + '</div></div>').appendTo('body');
	
	if (duration > 0) {
		
		$growlEl.one('transitionend', function() { // Done entrance animation.
			var $this = $(this);
			setTimeout(function() {
				$this.one('transitionend', function() { // Done exit animation.
					$this.remove();
				});
				$this.removeClass('growl-show'); // Start exit animation.
			}, duration * 1000);
		});
		
	}
	
	setTimeout(function() {
		$growlEl.addClass('growl-show'); // Start entrance animation.
	}, 100);
	
}
