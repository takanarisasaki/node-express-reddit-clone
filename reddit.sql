-- This creates the users table. The username field is constrained to unique
-- values only, by using a UNIQUE KEY on that column
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` CHAR(60) NOT NULL, -- why 60??? ask me :) because of hashing process
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- This creates the posts table. The userId column references the id column of
-- users. If a user is deleted, the corresponding posts' userIds will be set NULL.
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) DEFAULT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--Creates a table of subreddits with auto-incermenting id, unique name, optional description, createdAt, and updatedAt datetime
CREATE TABLE subreddits(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE KEY,
  description VARCHAR(200) DEFAULT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

--Add subredditId column to posts and add associated foreign key
ALTER TABLE posts 
ADD COLUMN subredditId INT, 
ADD FOREIGN KEY (subredditId) 
REFERENCES subreddits(id);
 
 
 --comments table that has foreign key of userId, postId, commentId
 --comments can also have replies
 CREATE TABLE comments(
  id INT NOT NULL AUTO_INCREMENT PRiMARY KEY,
  text VARCHAR(10000) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  userId INT NOT NULL,
  postId INT NOT NULL,
  commentId INT DEFAULT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY  (postId) REFERENCES posts(id),
  FOREIGN KEY (commentId) REFERENCES comments(id)
 );
 
 
CREATE TABLE votes(
  userId INT NOT NULL,
  postId INT NOT NULL,
  vote TINYINT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (userId, postId),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (postId) REFERENCES posts(id)
);

alter table votes alter column vote set default 0;