# Bookster

Booker is a web app for managing your personal library, and sharing your wishlist and recommended books.

## Usage

### Requirements

Bookster is built with AngularJS, PHP, and MySQL. To use it you'll need a web host providing PHP 5.5.0 or higher and MySQL.

### Database Setup

You'll need to edit `config/db.php/EDIT_AND_RENAME` to have the necessary settings for your own MySQL database. You'll have to create two database tables:

```
CREATE TABLE `bookster_book` (
	`bookId` MEDIUMINT(9) NOT NULL AUTO_INCREMENT,
	`userId` MEDIUMINT(9) NOT NULL,
	`bookTitle` VARCHAR(120) NOT NULL,
	`authorName` VARCHAR(120) NULL DEFAULT NULL,
	`seriesName` VARCHAR(120) NULL DEFAULT NULL,
	`seriesNumber` SMALLINT(5) UNSIGNED NULL DEFAULT NULL,
	`yearPublished` SMALLINT(5) UNSIGNED NULL DEFAULT NULL,
	`copies` TINYINT(3) UNSIGNED NOT NULL DEFAULT '1',
	`lentOutDate` DATE NULL DEFAULT NULL,
	`lentOutTo` VARCHAR(120) NULL DEFAULT NULL,
	`keptWhere` VARCHAR(120) NULL DEFAULT NULL,
	`rating` TINYINT(1) UNSIGNED NULL DEFAULT NULL,
	`haveRead` TINYINT(3) UNSIGNED NOT NULL DEFAULT '0',
	`recommend` TINYINT(3) UNSIGNED NOT NULL DEFAULT '0',
	`wishList` TINYINT(3) UNSIGNED NOT NULL DEFAULT '0',
	`isbn` VARCHAR(17) NULL DEFAULT NULL,
	`genre` VARCHAR(30) NULL DEFAULT NULL,
	PRIMARY KEY (`bookId`),
	INDEX `userId` (`userId`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;

CREATE TABLE `bookster_user` (
	`userId` MEDIUMINT(9) NOT NULL AUTO_INCREMENT,
	`userName` VARCHAR(50) NOT NULL,
	`email` VARCHAR(50) NOT NULL,
	`password` VARCHAR(64) NULL DEFAULT NULL,
	PRIMARY KEY (`userId`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB
;
```

You'll also need to insert a user into `bookster_user`. You can use `make-hash.php` to create the password hash.

### Installation

Once the database is set up, just upload the files onto your webhost and you're off!

## Acknowledgements

Thanks to my mom for my ancient Java version and thanks to my wife for giving ideas for the new version.
