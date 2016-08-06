// 1. https://github.com/takanarisasaki/reddit-cli-project
// 2. https://github.com/decodemtl/reddit-nodejs-api
// 3. https://github.com/ziad-saab/node-express-reddit-clone


var ejs = require('ejs');
var mysql = require('mysql');
var util = require("util");
//middleware that parse incoming request bodies in a middleware before your handlers, availabe under the req.body property.
//The bodyParser object exposes various factories to create middlewares. All middlewares will 
//populate the req.body property with the parsed body, or an empty object ({}) if there was no 
//body to parse (or an error was returned).
var bodyParser = require('body-parser');
//Parse Cookie header and populate req.cookies with an object keyed by the cookie names. 
var cookieParser = require('cookie-parser');
//bcrypt is a password hashing function
var bcrypt = require('bcrypt');
var secureRandom = require('secure-random');
var express = require('express');
var fetch = require("request");
var cheerio = require("cheerio");
//starts the server
var app = express();

// Middleware 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkLoginToken);

app.set('view engine', 'ejs'); 

app.use(express.static(__dirname + '/public'));
//Middleware allows you to define a stack of actions that you should flow through. Express servers themselves are a stack of middlewares.
//Then you can add layers to the middleware stack by calling .use

//By doing app.use() adds these express middleware 'layers' to the middleware stack.
//'use' adds it to a stack. Then every single request goes through the stack.
//For example, by adding bodyParser, you're ensuring your server handles incoming requests through the express 
//middleware. So, now parsing the body of incoming requests is part of the procedure that your 
//middleware takes when handling incoming requests -- all because you called app.use(bodyParser).

//app.use: I want every single request coming in to the server to be runned through this function

//Connect to the database server with 'mysql-ctl start' before running any function

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'takanarisasaki', // CHANGE THIS :)
  password : '',
  database: 'reddit'	//we haven't created this yet
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);


function createUser () {
	// It's request time!
	redditAPI.createUser({
	  username: 'NickThoms',
	  password: 'xxx'
	}, function(err, user) {
	  if (err) {
		console.log(err);
	  }
	  else {
		redditAPI.createPost({
		  title: 'hi iphone!',
		  url: 'https://www.iphone.com',
		  userId: user.id
		}, function(err, post) {
		  if (err) {
			console.log('There is an error', err);
		  }
		  else {
			console.log(post);
		  }
		});
	  }
	});

}

//createUser();


function getAllPosts() {
	redditAPI.getAllPosts({}, function(err, posts) {
		if (err) {
			console.log(err);
		}
		else {
			console.log("HELLO", posts);
		}
		
	});
}

//getAllPosts();


function createPost(inputPost, subredditId) {

	redditAPI.createPost(inputPost, subredditId, function(err, post) {
		if (err) {
			console.log(err);
		}
		else {
			console.log("MOON", post);
		}
		
	});
	
}

//createPost({userId: 1, title: 'mew', url: 'www.mew.com'}, 2);


function getAllPostsForUser(inputUserId) {
	redditAPI.getAllPostsForUser(inputUserId, {}, function(err, userPosts) {
		if (err) {
			console.log(err);
		}
		else {
			console.log("SUN", userPosts);
		}
	});
}

//getAllPostsForUser(1);


function getSinglePost(inputPostId) {
	redditAPI.getSinglePost(inputPostId, function(err, response) {
		if (err) {
			console.log(err);
		}
		else {
			console.log('MERCURY', response);
		}
	});
}

//getSinglePost(1);


function createSubreddit(subredditObj) {

	redditAPI.createSubreddit(subredditObj, function(err, response) {
		if (err) {
			console.log(err);
		}
		else {
			console.log("MARS", response);
		}
	});

}

//createSubreddit({name: 'Pokemon', description: 'pokemon is nice!'});


function getAllSubreddits() {
	redditAPI.getAllSubreddits(function (err, response) {
		if (err) {
			console.log(err);
		}
		else {
			console.log(response);
		}
	});
}

//getAllSubreddits();


function createComment(commentObj) {
	redditAPI.createComment(commentObj, function(err, response) {
		if (err) {
			console.log(err);
		}
		else {
			console.log("JUPITER", response);
		}
	});
}

//createComment({text: 'how much is a pen', userId: 4, postId: 1, commentId: 8});


function getCommentsForPost(postId) {
	
	//can replace getCommentForPost function int
	redditAPI.getCommentsForPost(postId, function(err, response) {
		if (err) {
			console.log(err);
		}
		else {
			console.log(util.inspect(response, {showHidden: true, depth: null, colors: true }));
		}
	});
	
}

//getCommentsForPost(1);


function createVote(inputVoteObj) {
	
	redditAPI.createOrUpdateVote(inputVoteObj, function(err, response) {
		if (err) {
			console.log(err);
		}
		else {
			console.log(response);
		}
		
	});
	
}

//createVote({userId: 3, postId: 10, vote: -1});


function getFivePosts(userId) {
	redditAPI.getFivePosts(userId, function(err, response) {
		if (err) {
			console.log(err);
		}
		else {
			console.log(response);
		}
	});
}

//getFivePosts(5);




// ---------------------------------------------------------------------------------
// https://github.com/ziad-saab/node-express-reddit-clone



//Two commonly used methods for a request-response between a client and server are: GET and POST.
//GET - Requests data from a specified resource
//POST - Submits data to be processed to a specified resource



//login with an existing username and the valid password
app.get('/login', function(request, response) {
	// var username = request.query.username;
	// var password = request.query.password;
	
	// code to display login form
	response.render("pages/login.ejs");
});
//makes a token for the user when login is successful
app.post('/login', function(request, response) {
	//console.log("HALLO", request.body);
	redditAPI.checkLogin(request.body.username, request.body.password, function(err, user) {
		//console.log("ERR", err)
		if (err === 'err') {
			response.send("Username or Password Incorrect");
		}
		else {
			//console.log("WHAT", user);
			// password is OK!
			// we have to create a token and send it to the user in his cookies, then add it to our sessions table!
			
			//ERROR STARTING HERE:
			redditAPI.createSession(user.id, function(err, token) {
				//console.log("PRINTING TOKEN", token);
				if (err) {
					response.status(500).send('an error occurred. please try again later!');
				}
				else {
					//NEED TO MAKE A TABLE IN DATABASE called sessions
					response.cookie('SESSION', token); // the secret token is now in the user's cookies!
					response.redirect('/');
				}
			});
		}
	});
});


app.get('/signup', function(request, response) {
	//creates html on web server with a box to enter username and password
	response.render("pages/signup.ejs");
});
//signup with a non-existing username, hashes the password and store them in the database inside users table
app.post('/signup', function(request, response) {
	
	if (!request.body.username || !request.body.password) {
		response.send('Enter username and password');
	}
	
	else {
		redditAPI.createUser({
			username: request.body.username,
			password: request.body.password
		}, function(err, result) {
			//request.body prints the object with username and password entered from get
			//console.log(request.body);	
			if (err) {
				response.send('username already taken');
			}
			else {
				response.redirect('/login/account-created-success');
			}
		});
	}
});


app.get('/login/account-created-success', function(request, response) {
	
	response.render("pages/signup-successful.ejs");
});

app.post('/login/account-created-success', function(request, response) {
	//console.log("HALLO", request.body);
	redditAPI.checkLogin(request.body.username, request.body.password, function(err, user) {
		if (err) {
			response.status(401).send(err.message);
		}
		else {
			//console.log("WHAT", user);
			// password is OK!
			// we have to create a token and send it to the user in his cookies, then add it to our sessions table!
			
			//ERROR STARTING HERE:
			redditAPI.createSession(user.id, function(err, token) {
				//console.log("PRINTING TOKEN", token);
				if (err) {
					response.status(500).send('an error occurred. please try again later!');
				}
				else {
					//NEED TO MAKE A TABLE IN DATABASE called sessions
					response.cookie('SESSION', token); // the secret token is now in the user's cookies!
					response.redirect('/');
				}
			});
		}
	});
});


app.get('/createPost/post-created-success', function(request, response) {
	
	response.render("post-created-success.ejs");
});


app.post('/logout', function(request, response) {
	redditAPI.removeCookieFromSession(request.cookies.SESSION, function(err, result) {
		if (err) {
			response.status(400).send('Cookie not removed')
		}
		else {
			//if cookie successfully removed, go back to homepage
			//console.log("COMES IN HERE");
			//console.log("COOKIE BEFORE: ", request.cookies.SESSION);
			response.clearCookie('SESSION');
			//console.log("COOKIE AFTER: ", request.cookies.SESSION);
			response.redirect('/');
		}
	});
})

// The middleware
//Every time you see the word 'request', it's the same as the request in other functions above in this code
function checkLoginToken(request, response, next) {
	// check if there's a SESSION cookie...
	//console.log(request);
	//console.log("WHAT IS COOKIES", request.cookies);
	if (request.cookies.SESSION) {
		//request contains a property cookies that contains SESSION, which is the complicated-long-string (cookie)
		redditAPI.getUserFromSession(request.cookies.SESSION, function(err, user) {
			//user is an object that contains userId and token that was sent back from getUserFromSession function
			//console.log("USER", user)
			//if user exists, assign request.loggedInUser to user
			if (user) {
				request.loggedInUser = user;
				//console.log("Logged in User", request.loggedInUser);
			}
			//next() tells your app to run the next middleware.
			next();
		});
	}
	else {
		// if no SESSION cookie, exit the middleware
		next();
	}
}



app.get('/createPost', function(request, response) {

	response.render("pages/create-post.ejs");

});

app.post('/createPost', function(request, response) {
	//inside post function, for the function to execute, I need to sumbit something by clicking the button
	//console.log("BODY", request.body);
	// before creating content, check if the user is logged in
	if (!request.loggedInUser) {
		// HTTP status code 401 means Unauthorized
		response.status(401).send('You must be logged in to create content!');
	}
	else {
		
		// console.log("I come in here");
		// console.log("TITLE", request.body.title);
		// console.log("URL", request.body.url)
		
		//If the user did not enter the title or url
		if (!request.body.title || !request.body.url) {
			response.send("You have to fill in the title and the url");
		}
		
		else {
			//console.log("LOGGED IN USER", request.loggedInUser);
			// here we have a logged in user, let's create the post with the user!
			redditAPI.createPost({
				title: request.body.title,
				url: request.body.url,
				userId: request.loggedInUser.userId
			}, request.body.subredditId, function(err, post) {
				// do something with the post object or just response OK to the user :)
				
				//response.render('pages/post-created-successfully.ejs');
				response.send('You have successfully created the post')
			});
		}
	}
});


app.get('/createPost/created-successfully', function(request, response) {
	response.render('pages/post-created-successfully.ejs');
})


app.post('/suggestTitle', function(request, response) {
	
	//console.log("URL?1", request.body.url)
	//request.body.url contains the url from main.js (what we entered in URL box in web server)
	fetch(request.body.url, function(err, res, body){
		
		if (err) {
			response.send('Enter a valid HTTP URL');
		}
		
		else {
			var $ = cheerio.load(body);
			//console.log('$', $);
			//console.log('$title', $('title').text());
			response.send($('title').text());
		}
	});
	
});


//the question mark after sort means what comes after / is optional. If there was no ?, what comes after / would be neccessary
app.get('/:sort?', function(request, response) {
	
	if(request.loggedInUser) {
	
		//code for the sorting
		var sort = 'hotness';
	
		if(request.params.sort){
			sort = request.params.sort;
		}
		//console.log("HELLO", sort);
	
		redditAPI.getAllPosts({sorting: sort}, function(err, posts) {
		  	if (err) {
		  		response.status(400).send('No such page exist!');
		  	}
		  	else {
		  		//for users that are loggedin
		  		
				//console.log("CHECK", posts)
				response.render('pages/index-for-logged-in.ejs',{
					posts: posts, 
					request: request, 
					response: response, 
					sort: sort
				});
		  	} 
	  	});
	}
	
	else {
		//code for the sorting
		var sort = 'hotness';
	
		if(request.params.sort){
			sort = request.params.sort;
		}
		//console.log("HELLO", sort);
	
		redditAPI.getAllPosts({sorting: sort}, function(err, posts) {
		  	if (err) {
		  		response.status(400).send('No such page exist!');
		  	}
		  	else {
		  		//For users not loggin
				
				response.render('pages/index-for-not-logged-in.ejs', {
					posts: posts, 
					request: request, 
					response: response, 
					sort: sort
				});
		  	} 
	  	});		
		
	}
	
});


app.post('/votePost', function(request, response){
	redditAPI.createOrUpdateVote({userId: request.loggedInUser.userId, postId: parseInt(request.body.postId), vote: parseInt(request.body.vote)}, function(err, result) {
		if (err) {
			response.status(400).send('There is an error');
		}
		else {
			
			redditAPI.getVotesForPost(request.body.postId, function(err, voteScoreForPost) {
				if (err) {
					response.send(err);
				}
				else {
					//response.json(voteScoreForPost);
					//console.log('VOTE SCORE:', voteScoreForPost);
					
					
					response.send({score:voteScoreForPost});
					
				}
			})
			
		}
	});
})



var server = app.listen(process.env.PORT, process.env.IP, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});