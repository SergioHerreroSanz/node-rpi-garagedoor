CREATE DATABASE IF NOT EXISTS garagedoor;
USE garagedoor;

CREATE USER 'node'@'localhost' IDENTIFIED BY 'contraseña';
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'contraseña';

CREATE TABLE IF NOT EXISTS users(
	email VARCHAR(320) PRIMARY KEY,
	enabled TINYINT(1) DEFAULT 1,
	endDate DATE DEFAULT null
);

CREATE TABLE IF NOT EXISTS connections(
	id INT AUTO_INCREMENT PRIMARY KEY,
	email VARCHAR(320) NOT NULL,
	date DATETIME NOT NULL,
	authorised TINYINT(1) NOT NULL,
	FOREIGN KEY (email) REFERENCES users(email) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE USER 'node'@'localhost' IDENTIFIED BY 'contraseña';
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'contraseña';

GRANT SELECT ON users TO 'node'@'localhost';
GRANT INSERT ON users TO 'node'@'localhost';
GRANT INSERT ON connections TO 'node'@'localhost';
GRANT EXECUTE ON PROCEDURE checkPermissions TO 'node'@'localhost'
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost';

DELIMITER ;;
CREATE PROCEDURE checkPermissions() CONTAINS SQL
BEGIN
	UPDATE users SET enabled=0, endDate=null WHERE endDate<NOW();
END;;
DELIMITER ;

/*
DELIMITER ;;
CREATE PROCEDURE checkPermissions() CONTAINS SQL
	DECLARE email VARCHAR;
	DECLARE endDate DATE
	DECLARE curEmail CURSOR FOR SELECT email FROM users;
	DECLARE curEndDate CURSOR FOR SELECT endDate FROM users;
	
	DECLARE done INT DEFAULT FALSE;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
	
	OPEN curEmail;
	OPEN curEndDate;

	read_loop: LOOP
    	FETCH curEmail INTO email;
    	FETCH curEndDate INTO endDate;

		IF done THEN
			LEAVE read_loop;
		END IF;
    
		IF endDate != null & endDate < NOW() THEN
			UPDATE users SET enabled=0, endDate=null WHERE email=email;
		END IF;
	END LOOP;

  CLOSE curEmail;
  CLOSE curEndDate;
END;;
DELIMITER ;
*/

INSERT INTO users (email) VALUES ('dam.sherrero.1928@iespabloserrano.com');
INSERT INTO users (email) VALUES ('bsoler@iespabloserrano.com');