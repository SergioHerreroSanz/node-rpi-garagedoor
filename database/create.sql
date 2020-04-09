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
GRANT ALL ON users TO 'admin'@'localhost';
GRANT ALL ON connections TO 'admin'@'localhost';

INSERT INTO users (email) VALUES ('dam.sherrero.1928@iespabloserrano.com');
INSERT INTO users (email) VALUES ('bsoler@iespabloserrano.com');