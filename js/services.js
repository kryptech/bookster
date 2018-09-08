booksterApp.service('bookCrudService', function ($http) {
     
	var apiBasePath = "api/crud.php?x=";
	 
    // Create new record
    this.post = function (Book) {
        var request = $http.post(
			apiBasePath + "insertBook",
            Book
        );
        return request;
    }
	
    // Get single record
    this.get = function (userId, bookId) {
       return $http.get(apiBasePath + "book&userId=" + userId + "&bookId=" + bookId);
    }
	
    // Get all records
    this.getBooks = function (userId, mode) {
        return $http.get(apiBasePath + "books&userId=" + userId + "&mode=" + mode);
    }
	
    // Update the record
    /*this.put = function (bookId, Book) {
		var request = $http({
            method: "put",
            url: apiBasePath + "updateBook",
            data: Book
        });
        return request;
    }*/
    this.put = function (Book) {
		var request = $http.post(
            apiBasePath + "updateBook",
            Book
        );
        return request;
    }
	
    // Delete the record
    /*this.delete = function (bookId) {
        var request = $http({
            method: "delete",
            url: apiBasePath + "deleteBook&bookId=" + bookId
        });
        return request;
    }*/
    this.delete = function (userId, bookId) {
        var request = $http.get(
			apiBasePath + "deleteBook&userId=" + userId + "&bookId=" + bookId
        );
        return request;
    }
	
});

booksterApp.service('userLoginService', function ($http) {
     
	var apiBasePath = "api/crud.php?x=";
	 
    // Send user credentials
    this.get = function (email, password) {
		var request = $http.get(apiBasePath + "userLogin&email=" + email + "&password=" + password);
		return request;
    }
	
});

// Service for sharing user authentication info between controllers.
booksterApp.service('authenticatedUserService', function ($http) {
	
	this.User = {
		userId:		null,
		userName:	null
	};
	
});

booksterApp.service('userLookupService', function ($http) {
     
	var apiBasePath = "api/crud.php?x=";
	 
    // Send user credentials
    this.get = function (email) {
		var request = $http.get(apiBasePath + "userLookup&email=" + email);
		return request;
    }
	
});

// Service for communicating events between different controllers.
booksterApp.service('messageService', function () {
	
    this._subscribers = [];

    this.addSubscriber = function(sub) {
        this._subscribers.push(sub);
    };

    this.sendMessage = function(message) {
        console.log('sendMessage: type=' + message.type); // Debug.
        var len = this._subscribers.length;
        for (var i = 0; i < len; i++) {
            this._subscribers[i].receive(message);
        }
    };
	
});
