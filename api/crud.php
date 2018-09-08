<?php
require_once("../config/db.php");
require_once("../libraries/rest.php");

class API extends REST {
	
	private $pdo = NULL;
	// Nice idea but it doesn't work to access this from the functions, for some reason.
	//private $column_names = array('bookTitle', 'authorName', 'seriesName', 'seriesNumber', 'yearPublished', 'copies', 'lentOutDate', 'lentOutTo', 'keptWhere', 'rating', 'haveRead', 'recommend', 'wishList', 'isbn', 'genre');
	
	public function __construct(){
		parent::__construct(); // Init parent contructor
		$this->dbConnect(); // Initiate Database connection
	}
	
	// Connect to Database
	private function dbConnect(){
		try {
			$this->pdo = new PDO("mysql:host=" . dbConfig::$DB_HOST . ";dbname=" . dbConfig::$DB_NAME, dbConfig::$DB_USERNAME, dbConfig::$DB_PASSWORD);
		} catch (PDOException $e) {
			die('Connection failed: ' . $e->getMessage());
		}
	}
	
	// Dynmically call the method based on the query string
	public function processApi(){
		$func = strtolower(trim(str_replace("/","",$_REQUEST['x'])));
		if ((int)method_exists($this,$func) > 0)
			$this->$func();
		else
			$this->response('',404); // If the method not exist with in this class "Page not found".
	}
	
	/*********************
	* BOOK
	*********************/
	
	// Get all books
	private function books() {
		
		if($this->get_request_method() != "GET"){
			$this->response('', 406);
		}
		
		$userId = (int)$this->_request['userId'];
		$filter = '';
		switch (isset($this->_request['mode']) ? $this->_request['mode'] : '') {
			case 'recommend':
				$filter = 'AND recommend=1 ';
				break;
			case 'wishList':
				$filter = 'AND wishList=1 ';
				break;
		}
		
		$statement = $this->pdo->prepare("SELECT * FROM " . dbConfig::$DB_TABLE_PREFIX . "book WHERE userId=:userId " . $filter . "ORDER BY bookTitle;");
		$statement->execute(array(':userId' => $userId));
		$result = array();
		while($row = $statement->fetch(PDO::FETCH_ASSOC)){
			$result[] = $row;
		}
		$this->response($this->json($result), 200); // send user details
		
	}
	
	// Get book by ID
	private function book() {
		
		if($this->get_request_method() != "GET"){
			$this->response('', 406);
		}
		
		$bookId = (int)$this->_request['bookId'];
		$userId = (int)$this->_request['userId'];
		if ($bookId > 0) { 
			$statement = $this->pdo->prepare("SELECT * FROM " . dbConfig::$DB_TABLE_PREFIX . "book WHERE bookId=:bookId AND userId=:userId;");
			$statement->execute(array(':bookId' => $bookId, ':userId' => $userId));
			$result = $statement->fetch(PDO::FETCH_ASSOC);
			$this->response($this->json($result), 200); // send user details
		} else {
			$this->response('', 400); // Bad request
		}
		
	}
	
	// Add new book
	private function insertBook() {
		
		if($this->get_request_method() != "POST"){
			$this->response('', 406); // Use 405 instead? https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
		}
		
		$book = json_decode(file_get_contents("php://input"), true);
		$column_names = array('userId', 'bookTitle', 'authorName', 'seriesName', 'seriesNumber', 'yearPublished', 'copies', 'lentOutDate', 'lentOutTo', 'keptWhere', 'rating', 'haveRead', 'recommend', 'wishList', 'isbn', 'genre');
		
		$statement = $this->pdo->prepare("INSERT INTO " . dbConfig::$DB_TABLE_PREFIX . "book (" . trim(implode($column_names, ', '), ', ') . ") VALUES (:" . trim(implode($column_names, ', :'), ', :') . ");");
		foreach ($column_names as $col) {
			$statement->bindparam(":" . $col, $book[$col]);
		}
		$res = $statement->execute();
		if ($res == true) {
			// header("Location: xxxxx"); // ***** Link to updated record.
			$this->response('', 201); // "Created" status
		} else {
			$this->response('Insert failed', 400); // "Bad request" status
		}
		
	}
	
	// Update book by ID
	private function updateBook() {
		
		//if($this->get_request_method() != "PUT"){
		if($this->get_request_method() != "POST"){
			$this->response('', 406);
		}
		
		$book = json_decode(file_get_contents("php://input"), true);
		$bookId = (int)$book['bookId'];
		$userId = (int)$book['userId'];
		$set_clause = array();
		$column_names = array('bookTitle', 'authorName', 'seriesName', 'seriesNumber', 'yearPublished', 'copies', 'lentOutDate', 'lentOutTo', 'keptWhere', 'rating', 'haveRead', 'recommend', 'wishList', 'isbn', 'genre');
		
		// ***** Refactor
		foreach ($column_names as $col) {
			$set_clause[] = $col . "=:" . $col;
		}
		$statement = $this->pdo->prepare("UPDATE " . dbConfig::$DB_TABLE_PREFIX . "book SET " . trim(implode($set_clause, ', '), ', ') . " WHERE bookId=:bookId AND userId=:userId;");
		foreach ($column_names as $col) {
			$statement->bindparam(":" . $col, $book[$col]);
		}
		$statement->bindparam(':bookId', $bookId);
		$statement->bindparam(':userId', $userId);
		$result = $statement->execute();
		
		if ($result == true) {
			// header("Location: xxxxx"); // ***** Link to updated record.
			$this->response('', 200); // "Created" status
		} else {
			$this->response('', 404); // "Not found" status
		}
	}
	
	// Delete book by ID
	private function deleteBook() {
		
		//if($this->get_request_method() != "DELETE"){
		if($this->get_request_method() != "GET"){
			$this->response('', 406);
		}
		
		$bookId = (int)$this->_request['bookId'];
		$userId = (int)$this->_request['userId'];
		if ($bookId > 0) { 
			$statement = $this->pdo->prepare("DELETE FROM " . dbConfig::$DB_TABLE_PREFIX . "book WHERE bookId=:bookId AND userId=:userId;");
			$statement->bindparam(':bookId', $bookId);
			$statement->bindparam(':userId', $userId);
			$result = $statement->execute();
			if ($result == true) {
				$this->response('', 200); // Send user details
			} else {
				$this->response('', 404); // "Not found" status
			}
		} else {
			$this->response('', 400); // "Bad request" status
		}
		
	}
	
	/*********************
	* USER
	*********************/
	
	// Check for user
	private function userLogin() {
		
		if($this->get_request_method() != "GET"){
			$this->response('', 406);
		}
		
		$email =	$this->_request['email'];
		$password =	$this->_request['password'];
		if ($email != '' && $password != '') { 
			$statement = $this->pdo->prepare("SELECT * FROM " . dbConfig::$DB_TABLE_PREFIX . "user WHERE email=:email LIMIT 1;");
			$statement->execute(array(':email' => $email));
			$result = $statement->fetch(PDO::FETCH_ASSOC);
			
			$correctPassword = password_verify($password, $result['password']);
			//$correctPassword = true; // {TODO} Hack to get around no password_verify in PHP 5.2. Remove in favour of above.

			if ($correctPassword == true) { // Check submitted password against password hash in DB.
				$this->response("{ \"userId\": " . $result['userId'] . " }", 200); // Send user details
			} else {
				$this->response('Bad username / password', 404); // "Not found" status
			}
		} else {
			$this->response('Missing username / password', 404); // "Not found" status
		}
		
	}
	
	// Lookup user
	private function userLookup() {
		
		if($this->get_request_method() != "GET"){
			$this->response('', 406);
		}
		
		$email = $this->_request['email'];
		if ($email != '') { 
			// {TODO} It would be better security to use something additional to only the email address, like a hash of the user ID.
			$statement = $this->pdo->prepare("SELECT userId, userName FROM " . dbConfig::$DB_TABLE_PREFIX . "user WHERE email=:email LIMIT 1;");
			$statement->execute(array(':email' => $email));
			$result = $statement->fetch(PDO::FETCH_ASSOC);
			$this->response("{ \"userId\": " . $result['userId'] . ", \"userName\": \"" . $result['userName'] . "\" }", 200); // Send user details
		} else {
			$this->response('Could not find use', 404); // "Not found" status
		}
		
	}
	
}

// Initiate Library

$api = new API;
$api->processApi();
?>
