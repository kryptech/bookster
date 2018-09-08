angular.module('booksterControllers', [
    'ui.toggle',
    'ngAnimate', // {TODO} Is this still needed for ui.bootstrap?
    'ui.bootstrap',
    'ngRoute'
])

.controller('pageController', function ($scope, $route, $routeParams, $location) {
})

.controller('navController', function ($scope, authenticatedUserService, messageService) {
    
	$scope.searchQuery = ''; // Set the default search/filter
    
    $scope.logOut = function() {
		messageService.sendMessage({
			type: 'logOut'
		});
    }

	$scope.newBook = function() {
		messageService.sendMessage({
			type: 'newBook'
		});
	}
	
	$scope.searchQueryChanged = function() {
		messageService.sendMessage({
			type: 'searchQueryChanged',
			searchQuery: $scope.searchQuery
		});
	}
	
	/*$scope.saveBook = function() {
		messageService.sendMessage({
			type: 'saveBook'
		});
	}
	
	$scope.closeBookForm = function() {
		messageService.sendMessage({
			type: 'loadBooks'
		});
	}
	
	$scope.deleteBook = function() {
		messageService.sendMessage({
			type: 'deleteBook'
		});
	}*/
	
	// Receive broadcasted messages from other controllers
    this.receive = function(message) {
		// Do stuffs with the things.
    };
    messageService.addSubscriber(this);
	
})

.controller('userLoginController', function ($scope, userLoginService, authenticatedUserService, messageService) {
    
	$scope.email	    = null;
	$scope.password	    = null;
	$scope.stayLoggedIn	= false;
    
	if (getCookieValue('userId').length == 0) { // Login isn't remembered.
        $("input[name=email]")[0].focus(); // {TODO} Doesn't work.
    } else { // Stay logged in.
        $scope.stayLoggedIn	= true;
        authenticatedUserService.User.userId = getCookieValue('userId');
        setTimeout(function() { // Delay a bit in order to allow the other controllers to load.
            $(".pickUser").addClass("collapse");
            //$(".pickUser").collapse('hide');
            messageService.sendMessage({ type: "userLoggedIn" });
        }, 100);
	}
	
    // Method to look up user
    $scope.login = function() {
        
        var promiseGetSingle = userLoginService.get($scope.email, $scope.password);
		
        promiseGetSingle.then(function (pl) {
            console.log(pl);
			
			if (pl.status != 200) {
                growl('danger', 'Bad email / password', 3, false);
				return false;
			}
			
			$(".pickUser").addClass("collapse");
			//$(".pickUser").collapse('hide');
			var res = pl.data;
			authenticatedUserService.User.userId = res.userId;
			var expires = new Date(); // Current date
			expires.setYear(expires.getFullYear() + 1); // Add year.
			if ($scope.stayLoggedIn) {
                document.cookie = 'userId=' + res.userId + '; expires=' + expires; // Set cookie.
			} else {
                clearCookie();
			}
			messageService.sendMessage({ type: "userLoggedIn" });
        },
        function (errorPl) {
            growl("danger", "Bad email / password", 3, false);
            console.log(errorPl);
        });
    }
    
    function logOut() {
        authenticatedUserService.User.userId = null;
        clearUser();
        clearCookie();
        $(".pickUser").removeClass("collapse");
        //$(".pickUser").collapse('show');
        $("input[name=email]")[0].focus();
    }

    function clearCookie() {
        document.cookie = 'userId=; expires=' + (new Date().getDate() - 1); // Clear cookie.
    }

    // Clear the Scope models
	function clearUser() {
        $scope.email =			null;
        $scope.password =		null;
        $scope.stayLoggedIn	=	false;
		//$scope.clearBook();
    }
	
	// Receive broadcasted messages from other controllers
    this.receive = function(message) {
		switch (message.type) {
			case "logOut":
				logOut();
				break;
		}
    };
    messageService.addSubscriber(this);
	
})

.controller('bookListController', function ($scope, authenticatedUserService, bookCrudService, messageService) {
	// This controller makes call to methods from the service.
    
	$scope.sortType =		'bookTitle';	// Set the default sort type
	$scope.sortReverse =	false;			// Set the default sort order
	$scope.searchQuery =	'';				// Set the default search/filter

    // Function to load all records
    function loadBooks() {
        var promiseGet = bookCrudService.getBooks(authenticatedUserService.User.userId, ''); //The Method Call from service
 
        promiseGet.then(
			function (pl) {
                $scope.Books = pl.data

                var authorTA = [], seriesNameTA = [], genreTA = [];
                for (var i = 0; i < $scope.Books.length; i++) {
                    if ($scope.Books[i].authorName != null) authorTA.push($scope.Books[i].authorName);
                    if ($scope.Books[i].seriesName != null) seriesNameTA.push($scope.Books[i].seriesName);
                    if ($scope.Books[i].genre != null) genreTA.push($scope.Books[i].genre);
                }
                authorTA = uniq(authorTA);
                seriesNameTA = uniq(seriesNameTA);
                genreTA = uniq(genreTA);
                messageService.sendMessage({
                    type:           'gotTypeaheads',
                    authorTA:       authorTA,
                    seriesNameTA:   seriesNameTA,
                    genreTA:        genreTA
                });

				$(".listElements").removeClass("collapse");
				//$(".listElements").collapse('show');
			},
			function (errorPl) {
				console.log('failure loading Book', errorPl);
			});
    }
	
	// Method to load book in form
	$scope.getBook = function(bookId) {
		messageService.sendMessage({
			type: 'getBook',
			bookId: bookId
		});
	}
	
    // Method to Delete
    $scope.deleteBook = function(book) { //(bookId, bookTitle) {
        if (!confirm("Permanently delete '" + book.bookTitle + "?")) return;
        var promiseDelete = bookCrudService.delete(authenticatedUserService.User.userId, book.bookId);
        promiseDelete.then(function (pl) {
            growl("warning", "Deleted book", 3, false);
            $scope.Books.splice($scope.Books.indexOf(book), 1);
        }, function (err) {
            growl("danger", "Error: " + err, 0, true);
            console.log(err);
        });
    }
    
	// Receive broadcasted messages from other controllers
    this.receive = function(message) {
		switch (message.type) {
			case "logOut":
                $(".listElements").addClass("collapse");
                //$(".listElements").collapse('hide');
                break;
            case "userLoggedIn":
			case "loadBooks": // Do we need "loadBooks"?
			case "closeBookForm":
                loadBooks();
				break;
			case "newBook":
			case "getBook":
				//$(".listElements").addClass("collapse");
				break;
			case "searchQueryChanged":
				$scope.searchQuery = message.searchQuery;
				break;
		}
    };
    messageService.addSubscriber(this);
	
})

.controller('bookFormController', function ($scope, bookCrudService, authenticatedUserService, messageService) {
	// This controller makes call to methods from the service.
    
    $scope.isNewBook =		true;			// The flag for the new record
    $scope.authors =        [];

	$scope.newBook = function(forSeries) {
		// {TODO} If the form is dirty it should prompt the user to continue.
		$scope.clearBook(forSeries);
		$(".editElements").removeClass("collapse");
		//$(".editElements").collapse('show');
        $("html,body").scrollTop(0);
        $("#bookTitle")[0].focus();
	}
	
    // The Save scope method use to define the Book object.
    // In this method if isNewBook is not false then Update Book else
    // Create the Book information to the server
    $scope.saveBook = function ($event, mode) {

        var Book = {
            userId:			authenticatedUserService.User.userId,
            bookId:			$scope.bookId,
            bookTitle:		$scope.bookTitle,
            authorName:		$scope.authorName,
            seriesName:		$scope.seriesName,
            seriesNumber:	$scope.seriesNumber,
            yearPublished:	$scope.yearPublished,
            copies:			$scope.copies,
            lentOutDate:	$scope.lentOutDate,
            lentOutTo:		$scope.lentOutTo,
            keptWhere:		$scope.keptWhere,
            rating:			$scope.rating,
            haveRead:		$scope.haveRead     ? 1 : 0, // true/false to 1/0
            recommend:		$scope.recommend    ? 1 : 0, // true/false to 1/0
            wishList:		$scope.wishList     ? 1 : 0, // true/false to 1/0
            isbn:			$scope.isbn,
            genre:			$scope.genre
        };

        // If the flag is 1 the it is new record
        if ($scope.isNewBook) {
            
            bookCrudService.post(Book).then(
                function (data) { // Success
                    growl("success", "Added book", 3, false);
                    if (mode == 'save') {
                        $scope.bookId = data.bookId;
                        //$scope.closeBookForm();
                        messageService.sendMessage({ type: 'loadBooks' });
                    } else if (mode == 'another') {
                        $scope.newBook(false);
                    } else if (mode == 'series') {
                        $scope.newBook(true);
                    }
                }, function(data) { // Error
                    console.log(".error:" + data);
                    growl("danger", "Error: " + data, 0, true);
                    $scope.modelState = data.ModelState;
                }
            );
            
        } else { // Else Edit the record
            
            bookCrudService.put(Book).then(
                function (data) { // Success
                    growl("success", "Updated book", 3, false);
                    if (mode == 'save') {
                        //$scope.closeBookForm();
                        messageService.sendMessage({ type: 'loadBooks' });
                    } else if (mode == 'another') {
                        $scope.newBook(false);
                    } else if (mode == 'series') {
                        $scope.newBook(true);
                    }
                }, function(data) { // Error
                    console.log(".error:" + data); // Debug
                    growl("danger", "Error: " + data, 0, true);
                    $scope.modelState = data.ModelState;
                }
            );
            
        }
    };
    
	// Method to close the book form
	$scope.closeBookForm = function() {
		messageService.sendMessage({ type: 'loadBooks' });
	}
	
	function closeBookForm() {
		$(".editElements").addClass("collapse");
		//$(".editElements").collapse('hide');
		$scope.clearBook(false);
	}
	
    // Method to Delete
    $scope.deleteBook = function() {
        if (!confirm("Permanently delete this book?")) return;
        var promiseDelete = bookCrudService.delete(authenticatedUserService.User.userId, $scope.bookId);
        promiseDelete.then(function (pl) {
			growl("warning", "Deleted book", 3, false);
            //$scope.closeBookForm();
			messageService.sendMessage({ type: 'loadBooks' });
        }, function (err) {
			growl("danger", "Error: " + err, 0, true);
            console.log(err);
        });
    }
    
    // Method to Get Single Book based on bookId
    $scope.getBook = function(bookId) {
        
		$(".editElements").removeClass("collapse");
		//$(".editElements").collapse('show');
		
		var promiseGetSingle = bookCrudService.get(authenticatedUserService.User.userId, bookId);
        promiseGetSingle.then(function (pl) {
			var res = pl.data;
			$scope.bookId =			res.bookId;
            $scope.bookTitle =		res.bookTitle;
            $scope.authorName =		res.authorName;
            $scope.seriesName =		res.seriesName;
            $scope.seriesNumber =	res.seriesNumber;
            $scope.yearPublished =	parseInt(res.yearPublished);
            $scope.copies =			parseInt(res.copies);
            $scope.lentOutDate =	res.lentOutDate;
            $scope.lentOutTo =		res.lentOutTo;
            $scope.keptWhere =		res.keptWhere;
            $scope.rating =			parseInt(res.rating);
            $scope.haveRead =		res.haveRead == "1";
            $scope.recommend =		res.recommend == "1";
            $scope.wishList =		res.wishList == "1";
            $scope.isbn =			res.isbn;
            $scope.genre =			res.genre;
			
            $scope.modelState = null;
			
            $scope.isNewBook = false;
            
            $("html,body").scrollTop(0);
            $("#bookTitle")[0].focus();
        },
        function (errorPl) {
			growl("danger", "Error: " + errorPl, 0, true);
            console.log(errorPl);
        });
    }
	
    // Clear the Scope models
	$scope.clearBook = function(forSeries) {
        console.log("clearBook()");
        console.log("authorName=" + $scope.authorName);
        
        $scope.isNewBook        = true;
        
        $scope.bookId           = 0;
        $scope.bookTitle        = null;
        if (!forSeries) {
            console.log("Clear all");
            $scope.authorName   = null;
            $scope.seriesName   = null;
            $scope.genre        = null;
        }
        $scope.seriesNumber     = null;
		$scope.yearPublished    = null;
		$scope.copies           = 1;
		$scope.lentOutDate      = null;
		$scope.lentOutTo        = null;
		$scope.keptWhere        = null;
		$scope.rating           = null;
		$scope.haveRead         = false;
		$scope.recommend        = false;
		$scope.wishList         = false;
		$scope.isbn             = null;
		
        $scope.modelState       = null;
    }
	
	// Receive broadcasted messages from other controllers
    this.receive = function(message) {
		switch (message.type) {
            case "logOut":
			case "loadBooks":
                closeBookForm();
                break;
            case "newBook":
                $scope.newBook(false);
                break;
            case "gotTypeaheads":
                $scope.authorTA = message.authorTA;
                $scope.seriesNameTA = message.seriesNameTA;
                $scope.genreTA = message.genreTA;
				break;
			case "getBook":
				$scope.getBook(message.bookId);
				break;
			/*case "saveBook":
				$scope.saveBook();
				break;*/
			case "deleteBook":
				$scope.deleteBook();
				break;
		}
    };
    messageService.addSubscriber(this);
	
})

.controller('wishlistHeaderController', function ($scope, messageService) {
    // This controller makes call to methods from the service.
	
    $scope.userName = '...';

    // Receive broadcasted messages from other controllers
    this.receive = function(message) {
		switch (message.type) {
            case "gotUserInfo":
                $scope.userName = message.userName;
				break;
		}
    };
    messageService.addSubscriber(this);
    
})

.controller('wishlistBookListController', function ($scope, $routeParams, bookCrudService, userLookupService, messageService) {
	// This controller makes call to methods from the service.
    
    $scope.params       = $routeParams;
	$scope.sortType     = 'bookTitle';  // Set the default sort type
	$scope.sortReverse  = false;		// Set the default sort order
    $scope.searchQuery  = '';			// Set the default search/filter
	
    // Method to look up user
    function lookupUser() {
		var promiseGetSingle = userLookupService.get($scope.params.email);
		
        promiseGetSingle.then(
            function (pl) { // Success
                console.log(pl);
                
                if (pl.status != 200) {
                    growl('danger', 'Couldn\' find a wishlist for this person', 0, false);
                    return false;
                }
                
                var res = pl.data;
                messageService.sendMessage({ type: 'gotUserInfo', userName: res.userName });

                loadBooks(res.userId);
            },
            function (errorPl) { // Error
                growl("danger", "Couldn\' find a wishlist for this person", 0, false);
                console.log(errorPl);
            });
    }
    lookupUser();

    // Function to load all records
    function loadBooks(userId) {
        var promiseGet = bookCrudService.getBooks(userId, 'wishList'); //The Method Call from service
 
        promiseGet.then(
			function (pl) { // Success
                $scope.Books = pl.data
			},
			function (errorPl) { // Error
				console.log('failure loading books', errorPl);
			});
    }
	
	// Receive broadcasted messages from other controllers
    this.receive = function(message) {
		switch (message.type) {
			case "searchQueryChanged":
				$scope.searchQuery = message.searchQuery;
				break;
		}
    };
    messageService.addSubscriber(this);
	
})

.config(function($routeProvider, $locationProvider) {

    $routeProvider
    .when('/', {
        templateUrl: 'library.html'
    })
    .when('/wishlist/:email', {
        templateUrl: 'wishlist.html'
    });
 
});


function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}
