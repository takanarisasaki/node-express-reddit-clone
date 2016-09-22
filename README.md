# node-express-reddit-clone
A buzzword-friendly workshop for DecodeMTL


# NodeJS command-line Reddit clone

In this project, we will be using the not-so-secret Reddit JSON API to create a tiny command-line version of Reddit.

## What is an API?
First, let's remind ourselves what an API is: a set of functions that make it easier to build applications. APIs can present themselves in different forms. We have already seen quite a few of them:

### Built-in APIs
JavaScript has a mathematics API. All the functions of this API are located under the `Math` global object. The functions of this API can be accessed by calling them as properties of the global `Math` object. Each function has unique inputs and a unique output. Together, they characterize that function. For example, the `Math.sqrt` function takes a number as input, and returns its square root as output.

### Web APIs
[The web is full of APIs](http://www.programmableweb.com/apis/directory). As an example, the [Big Huge Thesaurus](https://words.bighugelabs.com/api.php) has an API that consists of one function. The function is located under the `http://words.bighugelabs.com/api/{version}/{api key}/{word}/{format}` URL. It can be accessed by making an HTTP request to the `words.bighugelabs.com` server. The function returns its output as an HTTP response (text) with a choice of different representation formats (JSON, XML, ...). The Reddit JSON API which we will be using for this project is another example of web API.

### NodeJS APIs
We can create our own NodeJS APIs by simply writing one or more functions. To package them, we can put them in a JavaScript file. We can use the `module.exports` global to determine which functions will be part of our API. For example, we created a fortune telling API that has only one function called `getFortune`. The module of this API contained a few other things: an array of fortunes, maybe even a random number generator. But we chose to expose only the `getFortune` function, which is what our API consists of. The rest is **encapsulated** in our module and cannot/should not be used by the outside world.

## Getting acquainted with the Reddit JSON API
If you haven't before, get to https://www.reddit.com/ and browse for a bit. When you are done looking at the cat photos, I'd like you to notice the following points:

1. The Reddit site, like most other sites can be decomposed in two strictly non-overlapping parts: the *data* and the *presentation*.
2. The **data** on the main Reddit page consists of a list of links. Each link is associated to the user who posted it, the number of votes, the created date and so on.
3. The **presentation** consists of mostly everything else: the fonts, colors, spacing, layout and so on.

Now, I'd like you to load the following URL: https://www.reddit.com/.json. Notice that there are only five more characters than the previous URL. We simply added `.json` at the end.

If you are seeing an unintelligible pile of letters and symbols, you may need to install the [JSONView Plugin](https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc?hl=en).

This my friends is the Reddit JSON API. Any page you are looking at on the Reddit site, you simply add `.json` to it and suddenly you **only get the data part**. Unfortunately not all web APIs are *that* nice, but in essence they work the same way. A URL is linked to a function, and its content is the "return value" of that function.

## The project
For this project, we are going to build a command-line Reddit browser. Our application will make HTTP requests to the Reddit API and output the data in as nice a way as possible in the confines of the command-line. You'd be surprised how far we can get. There's even an [NPM module to display images using colored text on the command-line](https://www.npmjs.com/package/image-to-ascii)!

### Baby steps

#### A survey of Reddit API URLs
All the Reddit API functions we are interested in return "listings". A "listing" is an object with a `data` property which is itself an object. The `data` object contains an array of items called `children`, and properties called `before` and `after`. The `before` and `after` properties can be used for navigating the prev/next pages on the Reddit site.

Here are a few examples of Reddit API URLs and the data that they would return. If in doubt, remember you can always remove the `.json` part to look at the actual web page. For each URL, go to it in your browser and identify all the elements we are interested in:

* https://www.reddit.com/.json

  This is the Reddit homepage data. It lists the posts that appear on reddit.com when a user is not logged in. By default, the posts are listed in order of "hot", so that the page can stay relevant.

* https://www.reddit.com/.json?after=XXXX

  This is the "next page" of the reddit homepage. The XXXX part would be replaced with whatever is the value of `after` in the result you get from the previous page.

* https://www.reddit.com/controversial.json

  This is also the Reddit homepage, but with posts listed in order of their controversy score. It's another way at looking at all the posts on Reddit.

* https://www.reddit.com/subreddits.json

  This is a listing of popular subreddits.

* https://www.reddit.com/r/SUBREDDIT.json

  This is a listing of all the posts for the subreddit called SUBREDDIT, again in order of "hotness", the default. For example, if you want to see all the Montreal posts in JSON format ordered by hotness, you would go to https://www.reddit.com/r/montreal.json

* https://www.reddit.com/r/SUBREDDIT/comments/POST_ID/POST_TITLE.json

  This is a listing of the top comments for a certain Reddit posting. When looking at a listing of posts, the `permalink` property of a post object will give you the URL of the comments link.

  In contrast to the other listings, comments are a beast! Instead of getting back a regular list, comments are nested. This is because a comment can come as a reply to another comment, and we want to be able to display this fact perhaps by nudging the text to the right by a bit.

Using the NPM `request` module and the built-in `JSON.parse` function, create a module called `reddit.js` and expose the following functions:

```javascript
/*
This function should "return" the default homepage posts as an array of objects
*/
function getHomepage(callback) {
  // Load reddit.com/.json and call back with the array of posts
}

/*
This function should "return" the default homepage posts as an array of objects.
In contrast to the `getHomepage` function, this one accepts a `sortingMethod` parameter.
*/
function getSortedHomepage(sortingMethod, callback) {
  // Load reddit.com/{sortingMethod}.json and call back with the array of posts
  // Check if the sorting method is valid based on the various Reddit sorting methods
}

/*
This function should "return" the posts on the front page of a subreddit as an array of objects.
*/
function getSubreddit(subreddit, callback) {
  // Load reddit.com/r/{subreddit}.json and call back with the array of posts
}

/*
This function should "return" the posts on the front page of a subreddit as an array of objects.
In contrast to the `getSubreddit` function, this one accepts a `sortingMethod` parameter.
*/
function getSortedSubreddit(subreddit, sortingMethod, callback) {
  // Load reddit.com/r/{subreddit}/{sortingMethod}.json and call back with the array of posts
  // Check if the sorting method is valid based on the various Reddit sorting methods
}

/*
This function should "return" all the popular subreddits
*/
function getSubreddits(callback) {
  // Load reddit.com/subreddits.json and call back with an array of subreddits
}
```

#### The browsing interface
Since we are in command-line mode, we will be using text and the keyboard as our main sources of interactivity.

The [Inquirer.js](https://github.com/sboudrias/Inquirer.js) module is pretty good for that. It can let us display a list of things, and give the user a choice of what to do, like a menu.

Before starting the project, it would pay off to start getting familiar with the Inquirer module. In a new workspace, use NPM to install inquirer. Then run this example:

```javascript
var inquirer = require('inquirer');

var menuChoices = [
  {name: 'Show homepage', value: 'HOMEPAGE'},
  {name: 'Show subreddit', value: 'SUBREDDIT'},
  {name: 'List subreddits', value: 'SUBREDDITS'}
];

inquirer.prompt({
  type: 'list',
  name: 'menu',
  message: 'What do you want to do?',
  choices: menuChoices
}).then(
  function(answers) {
    console.log(answers);
  }
);
```

Note that since prompting the user is a long-running function, we are using a callback to receive the answers. Contrary to other callbacks you have used before, here we are doing `.then(callback)`. This is because inquirer uses [JavaScript Promises](http://www.html5rocks.com/en/tutorials/es6/promises/) instead of "regular callbacks". We will not be studying the Promise at this time, so for the moment you can see this as simply passing a callback to get your answers.

### Let's do it!
Building upon the "baby steps" section, let's code the actual project. This will be done by implementing feature after feature. The different features are quite independent of each other so you can tackle them in any order you wish. Some of them are more challenging than others. They will be marked with :star:.

#### Basic feature: the main menu
An example of main menu prompt was provided to you. This should be the starting point of the application. When someone runs `node reddit.js`, this menu should be displayed. As you keep adding features, you can expand this menu by adding options to it.

#### Basic feature: the homepage posts
When the user chooses the homepage option, you should display the list of posts from the `getHomepage` function you created previously. For each post, list at least some of the info that appears on reddit: title, url, votes, username. After the list of posts is displayed, you should display the main menu again.

#### Basic feature: subreddit posts
When the user chooses the subreddit posts option, you should ask him -- again using inquirer -- which subreddit he wants to see. Then, display the list of posts in the same way as the homepage.

#### Feature: list of subreddits :star:
When the user chooses the list of subreddits option, you should load the list of subreddits using the `getSubreddits` function you created previously. Then, using inquirer, show the list of subreddits to the user. The user will be able to choose a subreddit to display its posts, or go back to the main menu. You can use an [Inquirer Separator](https://github.com/SBoudrias/Inquirer.js/#separator) to create a visual separation between the list of subreddits and the "go back to main menu" option.

#### Feature: post selection and "image" display :star::star:

When the user is shown a list of posts, instead of going back to the main menu every post should be selectable -- again using inquirer. When selecting a post, the terminal screen should be cleared and only that post should be displayed (title + url + username). In addition to this, if the URL of the post turns out to be an image -- ends in `.jpg`, `.gif` or `.png` -- you should use the [`image-to-ascii`](https://github.com/IonicaBizau/image-to-ascii) module to load the image and display it on the command line. After the post details are displayed, you should show the main menu again.

#### Feature: comments listing :star::star::star:
When the user is shown a list of posts, instead of going back to the main menu every post should be selectable -- again using inquirer. When selecting a post, the user should be shown a listing of comments for that post. Since comments are threaded -- replies to replies to replies ... -- we would like to **indent** each level of comments , perhaps by two or three spaces. To do this properly, we can make use of the [`word-wrap` NPM module](https://www.npmjs.com/package/word-wrap). After displaying the list of threaded comments, display the main menu again.

One of the difficulties of implementing this feature is to *properly iterate through the comments and their replies*. To do this, you will first have to analyze the way the comment listing is presented in the JSON.


# Reddit NodeJS API

In this project, we're going to build a tiny Reddit API. But wait, don't we need to learn about
web servers, HTTP, REST and all these buzzwords before building an API?? Not really!

We won't be building a *Web* API yet, only a set of NodeJS callback-receiving functions that will
do the dirty work of taking our data and putting it in our database.

The project has already been initialized with a few files to get you started:

* `reddit.sql`: This file contains `CREATE TABLE` statements for users and posts
* `reddit.js`: This file contains the actual Reddit API. The only things that should
be in there are functions that talk to our database
* `index.js`: This is the starting point of our application.

In the next section, we will review in detail the contents of `reddit.js` and `index.js`.

## Initial files

### `reddit.sql`
This file contains two `CREATE TABLE` statements, which we are already used to.

### `index.js`
This is the "main" file of our application, meaning it's the one we will run to get things done.
First, we load the `mysql` NodeJS library. This library will let us communicate with MySQL similarly
to what we have been doing with the command-line: writing queries and getting responses.

Next, we create a connection to a MySQL server. On Cloud9, our database does not need to be 100% secure,
so we are setup with a MySQL server that we can login to with our Cloud9 username and no password. The
connection is using the `reddit` database, which we haven't created yet.

After that, we load the `./reddit` module, which exports a single function: the reason for this is
that all the functions of our API require a database connection. Instead of establishing the database
connection inside the `reddit.js` file, we choose to keep it pure: we pass the connection to the
function, and it returns to us the actual API. This is a common pattern in development. This is a good
time to make sure you understand what is going on, and ask questions if not.

Finally, after having initialized the API, we can start doing ad-hoc requests to it. In the current
example, we are creating a new user, then using its `id` to create a new post.

### `reddit.js`
This is the core file of the project. Even though it only exports one function, this function is only
there for the purpose of accepting a database connection object. Once it receives a connection, it
returns the actual API of our Reddit clone.

#### `createUser`
The first function we see being exported is `createUser`. It takes an object of user properties, and a callback.
This is required, because the mysql library we are using is also callback-based. Since we are getting
our result in a callback, we also have to accept a callback to pass the final result to.

The first thing our `createUser` function does is "hash" the user's password using the `bcrypt` library. This step
is necessary to protect our users' information. **It is computationaly infeasible to recover the actual password
from the hash**. The way this works is that when the user logs in, we hash the provided password using the
same function. If both hashes match, then it's a success. Otherwise we can safely say it's the wrong password.

Once the hash is completed, we get back the hashed password in our callback. We use the hashed password
to do an `INSERT` in our database.

Another thing you will notice is the `?`s in the SQL query. These placeholders are **super important**. First off,
they make it so that we don't have to concatenate strings together to infinity. But more importantly,
they will make sure to **properly escape** any string we give to them. To make this work, we pass the
`conn.query` function an array of the strings that should replace the `?`s, and it puts the query together for us.

#### `createPost`
This works similarly to the `createUser` function, except we don't need the password hashing step.

#### `getAllPosts`
This function is different from the previous two in that it doesn't add any data to our system. It uses
a regular `SELECT` to retrieve all the posts. The function requires an `options` object, which for the moment
can contain a `numPerPage` and a `page`. These will be translated to a `LIMIT` and `OFFSET` to allow
for pagination of our posts.

## Your work
Your work will consist in incrementally adding features to the API to make it more complete. Most of the
features are independent, so they can be worked on separately. If you want to work on more than one
feature at a time, it would be a good idea to create a branch for each feature until you are ready
to merge it to master ;)

### Improve the `getAllPosts` function
At the moment, the `getAllPosts` function is returning an array of posts. The problem is that it's
hard to figure out the username associated to each post. Since our database schema is somewhat
**normalized**, the posts table only contains a **reference** to the users table, through the `userId`
column. Your job is to improve this function by returning the user associated with each post.

For example, instead of returning:

```json
[
    {
        "id": 1,
        "title": "hi reddit!",
        "url": "https://www.noob.com",
        "createdAt": "...",
        "updatedAt": "...",
        "userId": 1
    }
]
```
You should return:
```json
[
    {
        "id": 42,
        "title": "hi reddit!",
        "url": "https://www.noob.com",
        "createdAt": "...",
        "updatedAt": "...",
        "userId": 1,
        "user": {
            "id": 12,
            "username": "n00bster",
            "createdAt": "...",
            "updatedAt": "..."
        }
    }
]
```

You can achieve this by completing the current query and adding a `JOIN` to it.

### Add a `getAllPostsForUser(userId, options, callback)` function
The function `getAllPosts` returns all the posts for all the users in the system (with a limit). Here,
we want to return only the posts for one userId. It will be quite similar to the `getAllPosts` function,
except that it will take an additional `userId` parameter. Your function should also use the `numPerPage` and `page` options to provide a paginated result set.


### Add a `getSinglePost(postId, callback)` function
Currently there is no way to retrieve a single post by its ID. This would be important for eventually
displaying this data on a webpage. Create this function, and make it return a **single post**, without array.


### Add subreddits functionality
This feature will be more complicated to implement, because it will require not only adding new functions,
but also modifying existing ones.

#### Step 1:
The first step will be to create a `subreddits` table. Each subreddit should have a unique, auto incrementing
`id`, a `name` anywhere from 1 to 30 characters, and an optional description of up to 200 characters. Each sub
should also have `createdAt` and `updatedAt` timestamps that you can copy from an existing table. To guarantee
the integrity of our data, we should make sure that the `name` column is **unique**.

Once you figure out the correct `CREATE TABLE` statement, add it to `reddit.sql` with a comment.

#### Step 2:
Then we need to add a `subredditId` column to the posts table, with associated foreign key. Once you figure
out the correct `ALTER TABLE` statement, make sure to add it to `reddit.sql` with a comment.

#### Step 3:
In the `reddit.js` API, add a `createSubreddit(sub, callback)` function. It should take a subreddit object which
contains a `name` and optional `description` property. It should insert the new subreddit, and either
return an error or the newly created subreddit. You can take some inspiration from the `createPost` function
which operates in a similar way :)

#### Step 4:
In the `reddit.js` API, add a `getAllSubreddits(callback)` function. It should return the list of all
subreddits, ordered by the newly created one first.

#### Step 5:
In the `reddit.js` API, modify the `createPost` function to take a `subredditId` parameter and use it.

#### Step 6
In the `reddit.js` API, modify the `getAllPosts` function to return the **full subreddit** associated with each post.
You will have to do an extra `JOIN` to accomplish this.


### Add comments functionality
This feature will be complicated to implement because it will require not only adding new code, but also
modifying existing code and databases. For this reason the steps are outlined in detail.

#### Step 1:
The first step will be to create a `comments` table. Each comment should have a unique, auto incrementing
`id` and a `text` anywhere from 1 to 10000 characters. It should also have `createdAt` and `updatedAt`
timestamps that you can copy from an existing table. Each comment should also have a `userId` linking
it to the user who created the comment (using a foreign key), a `postId` linking it to the post which is
being commented on, and a `parentId` linking it to the comment it is replying to. A top-level comment should
have `parentId` set to `NULL`.

Once you figure out the correct `CREATE TABLE` statement, add it to `reddit.sql` with a comment.

#### Step 2:
In the `reddit.js` API, add a `createComment(comment, callback)` function. It should take a comment object which
contains a `text`, `userId`, `postId` and optional `parentId`. It should insert the new comment, and either
return an error or the newly created comment. If `parentId` is not defined, it should be set to `NULL`. You can
take some inspiration from the `createPost` function which operates in a similar way :)

#### Step 4:
In the `reddit.js` API, add a `getCommentsForPost(postId, callback)` function. It should return a **thread**
of comments in an array. The array should contain the top-level comments, and each comment can optionally have
a `replies` array. This array will contain the comments that are replies to the current one. Since you will be
using one `LEFT JOIN` per level of comment, we will limit this exercise to retrieving 3 levels of comments.
The comments should be sorted by their `createdAt` date at each level.

**NOTE**: The way this exercise is done, the comments will be returned without the associated usernames. We will
be getting only the `userId` instead. The next exercise asks you to add the username to the data.

The final output should look something like this:

```json
[
    {
        "id": 456,
        "text": "the illuminati have their eye set on us",
        "createdAt": "...",
        "updatedAt": "...",
        "replies": [
            {
                "id": 499,
                "text": "what are you talking about????",
                "createdAt": "...",
                "updatedAt": "..."
            },
            {
                "id": 526,
                "text": "i agree with you",
                "createdAt": "...",
                "updatedAt": "...",
                "replies": [
                    {
                        "id": 599,
                        "text": "where is your tinfoil hat dude?",
                        "createdAt": "...",
                        "updatedAt": "..."
                    }
                ]
            }
        ]
    },
    {
        "id": 458,
        "text": "Douglas Adams must be rolling over in his grave!",
        "createdAt": "...",
        "updatedAt": "...",
        "replies": [
            {
                "id": 486,
                "text": "You mean George Orwell?",
                "createdAt": "...",
                "updatedAt": "..."
            }
        ]
    }
]
```

#### Step 6
In the `reddit.js` API, modify the `getSinglePost` function to return the full thread of comments in
addition to the post data itself. This will require re-using your `JOIN` logic from `getCommentsForPost`.


### Add usernames to the comments functionality
Return to the comments functionality and add the username for each comment. Since we are only requiring the
username and not the full user object, you don't need to nest a user object with each comment. A `username`
property will be sufficient. For example:

```json
{
    "id": 486,
    "text": "You mean George Orwell?",
    "createdAt": "...",
    "updatedAt": "...",
    "username": "PM_ME_YOUR_BOOKIES"
}
```

### Add the voting system for posts only
Reddit wouldn't be what it is without its voting system. The mix of up/down votes and good scoring
functions makes it possible to view the world of Reddit from all kinds of points of view.

To make the rest of the instructions clearer, let's define some terms that are proper to us and
that describe the vote parameters and scoring functions. Note that the scoring functions are made
for simplicity and not accuracy. They certainly wouldn't give rise to the same dynamism that is
seen on reddit.

* **`numUpvotes`**: The number of upvotes for a given post
* **`numDownvotes`**: The number of downvotes for a given post
* **`totalVotes`**: `= numUpvotes + numDownvotes`
* **`voteScore`**: `= numUpvotes - numDownvotes`
* **Top ranking**: `= voteScore`
* **Hotness ranking**: `= voteScore / (amount of time the post has been online)`
* **Newest ranking**: `= createdAt`
* **Controversial ranking**: ```= numUpvotes < numDownvotes ? totalVotes * (numUpvotes / numDownvotes) : totalVotes * (numDownvotes / numUpvotes)``` we can filter out posts that have few votes (< 100) since they may not be meaningful.

#### Step 1:
Add a `votes` table to your database. The way our `votes` table will be setup is often referred to as a "join table". Its goal
is to allow so-called many-to-many relations. In this case, a single user can vote on many posts, and a single post can
be voted on by many users. For this reason, we can't simply have a `voterId` in the `posts` table. Neither can we have a `postVotedOn`
or something like that in the `users` table.

When creating the `votes` table, the primary key -- a unique key -- will be set to the pair `(postId, userId)`. This will ensure that
a single user can only vote once on the same post. It will do so by disallowing queries that would introduce a pair that already exists
in the database. It's common for a join table to not have its own automatically incrementing, unique ID. The link between the two tables
is unique enough, and makes more sense. To do this you can simply write `PRIMARY KEY (userId, postId)` in your `CREATE TABLE`. Finally,
each of these two ID columns will need a foreign key referencing their respective tables.

In addition to the two ID columns, the `votes` table will need a `vote` column which can be set to `TINYINT`. It will take the value of
`1` to signify an upvote, and a value of `-1` to signify a downvote. This way, when we `GROUP BY postId`, we can do a `SUM` over the `vote`
column and easily get the `voteScore` for each post we are interested in. We can also add `createdAt` and `updatedAt` columns to this table.

#### Step 2:
Add a function called `createVote(vote, callback)` to your Reddit API. This function will take a `vote` object with `postId`, `userId`, `vote`.
It should make sure that the `vote` is either `1`, `0` (to cancel a vote) or `-1`. Otherwise it should reject the request.

If we query with a regular `INSERT` we can run into errors. The first time a user votes on a given post will pass. But
if they try to change their vote direction, the query will fail because of a duplicate key. While we could check for this and do an `UPDATE`
query instead, MySQL has a better way: the "[`ON DUPLICATE KEY UPDATE`](https://dev.mysql.com/doc/refman/5.7/en/insert-on-duplicate.html)". With
it, we can write our voting query like this:
```sql
INSERT INTO `votes` SET `postId`=1, `userId`=1, `vote`=1 ON DUPLICATE KEY UPDATE `vote`=1;
```
This way, the first time user#1 votes for post#1, a new row will be created. If they change their minds or try to trick the system, then the `vote`
column of the same row will be updated instead.

Before you move on to the next step, it would be nice to rename your function from `createVote` to `createOrUpdateVote` to reflect more closely
what it is doing.

#### Step 3:
Go back to your `getAllPosts` function. Add a `sortingMethod` option to the function, which will default to `new` -- the sorting we are currently using.
Then, one at a time, start implementing the different sorting methods mentioned above. The easiest one is `top` because it's simply ranking by the
`voteScore` in descending order.

As a first step, add a `voteScore` property to each post that you retrieve. Do this by `JOIN`ing the `posts` table with the `votes` table, and grouping by `postId`.
Add a `SUM` on the `vote` column of the `votes` table, and give it an alias of `voteScore`.

Then start implementing each sorting method as you see fit, changing the `ORDER BY` clause of your query.


# Let's build a tiny Reddit clone -- the "full thing" edition
In a previous workshop, we set out to build a Reddit clone from the data perspective, Finishing that workshop gave us many functions that we'll still be able to use for this one like `createPost`, `getAllPosts`, ...

In this workshop, we are going to take the functionality that we already built, and make a website out of it! To do this, we are going to use many of the technologies we have already seen, but we will also be adding a bit more stuff on top.

At the end of this workshop, we should have a Reddit clone with the following functionality:

  * Non-logged in users will be able to view a paginated list of posts ordered by one of hot, top, newest and controversial
  * Non-logged in users will be able to signup or login to the site
  * Logged in users will be able to view the same paginated list of posts. But in addition, they will also be able to cast either an up or down vote for each post.
  * Logged in users will be able to add new posts to the site. A post will be a combination of a URL and a title.

## Getting started
Since we already have some code going in our `reddit-nodejs-api` project, as well as a MySQL database and some pre-existing data, we will be starting from this project.

Currently, the `index.js` file has been the place where you test your API, making requests like `redditAPI.createUser`, or `redditAPI.createPost`, ... For this workshop, we are going to make `index.js` the centerpiece of our project: in addition to establishing a connection to our database, we'll be creating an Express server and making it listen to `process.env.PORT`. Eventually we'll be adding our `app.get`s and `app.post`s to make our Reddit clone happen!

## How does this work relate to the Reddit API we built last week?
Last week we started building a Reddit API in Node: a series of data functions that are going to drive the site. Each of us is at a different stage of this process, which is fine. This workshop is 100% related to the API workshop. If you only built the `getAllPosts` function, then you can still build parts of the web server. You can go back and forth between the API functions and the web server as you add more functionality.

## Creating our web server
Before starting to write any code, let's figure out the different pages we will need:

  * **Homepage**:

    The homepage lists up to 25 posts, by default sorted by descending "hotness" (more on that later). The homepage is accessible at the `/` resource path. But in addition to showing the top 25 "hot" posts, the homepage resource can take a **query string parameter** called `sort` that can have the following values:

      1. **top**: Sort the posts by decreasing "vote score". The "vote score" is simply the difference between the number of upvotes and the number of downvotes.
      2. **hot**: Sort the posts by decreasing "hotness score". The "hotness score" is simply the ratio of the "vote score" (see 1.) to the number of seconds since a post has been created. Basically, given the same number of "vote score", a newer post will get a better "hotness score"
      3. **new**: Sort the posts by increasing order of `createdAt`, basically the newest posts first.
      4. **controversial**: A post is considered  controversial if it has almost as many upvotes as it has downvotes. The more of each it has the better! I don't have a perfect formula for this, but perhaps something like `min(numUpvotes, numDownvotes) / (numUpvotes - numDownvotes)^2`?

      *Hint: Do we need to implement this functionality from the start? Can we get away with maybe only one sorting function, then add more?*

  * **Signup page**:

    The signup page will be a simple page with an HTML `<form>`. The form will have username and password fields, as well as a "signup" submit button. More on that later.

  * **Login page**:

    The login page will be a simple page with an HTML `<form>`. The form will have username and password fields, as well as a "login" submit button. More on that later.

  * **Create post page**

  The create post page will also be a simple page with an HTML `<form>`. The form will have title and URL fields, as well as a "create" submit button.

## Handling form submissions
We will have at least three form submissions to handle: login, signup and create post. Each form should be sent using a **POST** request to the server. Sending a **POST** request is an indication that we want to create new data on the target system. Therefore it's very important to not submit such data more than once.

Browsers are good at helping with this: notice that if you submit a form through POST, and try to refresh the resulting web page, the browser will warn that you are about to re-submit a form.

We can avoid this though: a good practice is to [**always redirect the user after a POST**](https://en.wikipedia.org/wiki/Post/Redirect/Get) (read this Wikipedia article). If you redirect the user to another page using an HTTP [`303 See Other` status code](https://en.wikipedia.org/wiki/Post/Redirect/Get) then the browser will load that other page with a GET request and all will be well. The user will not even be able to re-submit the same form data!

For the signup form, we could redirect the user to the login page after they're done. For the login form we can redirect users to the homepage. For the create post form, we could also redirect the user to the homepage. If we had a page per post (with comments for example) then we could also redirect the user to the new post page that they created, like they do over at Reddit.

To redirect users, we can use the [Express `res.redirect`](http://expressjs.com/en/api.html#res.redirect) function.

## User signup and login processes
One of the most sensitive aspects of a website is its security. As we've seen in the past years, even some of the largest sites out there are not immune to hacks. As web developers, it's our job to make sure that a site we build is as secure as possible. This will reduce the chances of compromising our customers' personal data and/or putting us out of business.

One field where this is super important is the user signup and login process. During this process, we are asking the user to provide us with a **username and password combination** that will be used to identify them. Some of our users will re-use that same password for all their accounts. *It would be pretty bad if we stored their password in plain text and our database got compromised.*

**WARNING**: The signup/login method described below is not meant to be 100% secure. It's only meant to give you a bit of insight into how complicated this process can be. In fact, [many](https://stormpath.com/) [companies](https://www.userapp.io/) make a business out of providing user management functionalities to other businesses. This lets us concentrate on what makes our product different!

### Hashing passwords
For this reason and many others, we will never store our customers' passwords in plain text in our database. When creating a new user, we will instead store a **hashed version of their password**.

Hashing is a function that takes a string as an input (like a password for example), and uses an **irreversible but consistent transformation** of that string to generate its output.

Let’s imagine your password was a number. My hashing function could be:

1. take the password (number) and divide it by 100 using integer division
2. return the remainder of the division as the hash.

So if your password is `1234` I would store it as `34` (`1234 % 100 = 34`). While I cannot recover your password, if you give me an input password I can check that it has the same hash. This would work well as long as there are no collisions. If you tell me your password is `134` or `2234`, they will all hash to `34` and you will be able to login!

For these reasons, n the real world we will be using hashing functions that have little chance for collision. An example of such a hashing function is SHA-1. If I pass the string `Hunter2` through the SHA-1 function I will get back `a8a00adebf1411b8baf07bdc688ce3889e8f7cb2`. Simply changing the string to `hunter2` (note the lack of capital H) then the SHA-1 will be `f3bbbd66a63d4bf1747940578ec3d0103530e21d`. While this is not a demonstration of any security feature, you can see that even a slight change in the input string will result in a completely different hash.

We can compute the number of possible combinations of SHA-1 outputs: if we see the output as a set of 40 hexadecimal digits, then the number of combinations would be `16^40` which is a huuuuge number. However big that number may be, the number of possible password strings is infinite! This means that our hashing function will definitely have collisions, meaning that two passwords will hash to the same string. However up until 2016, there has still not been a practical way to create a collision with this hashing function.

Moreover, we will not simply be storing the password has a hash of the input string. That would still be too easy to crack! For example, the `Hunter2` password above is a "popular string": it comes from an old internet joke that you may lookup in your own time. [There exists a few websites out there that can "reverse" SHA-1 outputs of popular strings](https://isc.sans.edu/tools/reversehash.html). There's no magic involved: they simply have a large database of SHA-1 input/output combinations.

For all these reasons, we will be using a library called [bcrypt](https://github.com/ncb000gt/node.bcrypt.js/) to take care of our password hashing. When signing up a new user, we will use [bcrypt's `hash` function](https://github.com/ncb000gt/node.bcrypt.js/#usage) to generate a hashed version of the password.

If you look at the Reddit API we built last week, the `createUser` function uses `bcrypt` to hash a password. In this case the output will look like this:

```json
{
  "id": 2,
  "username": "thompson",
  "password": "$2a$10$26OFMwEvtb4.6nWuYOPg6OJYlyl.uh7barqO5wfKrI9J9wJOZFIei",
  "updatedAt": "2016-04-16T22:45:34.000Z",
  "createdAt": "2016-04-16T22:45:34.000Z"
}
```

### Verifying passwords
Eventually we'll have to build a login function. In there, we will receive again a username and a password. This time, we will go to our database to find a user with the same username.

If we don't find a user, then we can respond with "username or password incorrect". This will prevent attackers from knowing whether or not the username exists.

If we do find a user, we can use bcrypt's `compare` function to compare the found user's hashed password with the password we received from the login process. It would go a bit like this:

1. User loads the `/login` page
2. Browser displays an HTML form with a username field and a password field
3. User fills in both fields and clicks on the LOGIN button
4. Browser constructs a query string like `username=john&password=Hunter2`
5. Browser looks at the `action` and `method` of the `<form>` and sends an HTTP request -- usually a `POST`
6. Server receives the request and parses it into appropriate objects like `request.body`
7. In our web server callback, we use the `request.body.username` and `request.body.password` to call a function of our API, perhaps called `checkLogin`
8. Our `checkLogin` function:
  a. Takes a username, password and callback
  b. Does an SQL request to our database like `SELECT * FROM users WHERE username = ?`
  c. After retrieving the SQL result, uses `bcrypt.compare` function to check if it matches the input password
  d. If the passwords match, the function calls back perhaps the full user object
  e. If the passwords don't match, the function can callback with an error

The code might look a bit like this:
```javascript
function checkLogin(user, pass, cb) {
  conn.query('SELECT * FROM users WHERE username = ?', [user], function(err, result) {
    // check for errors, then...
    if (result.length === 0) {
      callback(new Error('username or password incorrect')); // in this case the user does not exists
    }
    else {
      var user = result[0];
      var actualHashedPassword = user.password;
      bcrypt.compare(pass, actualHashedPassword, function(err, result) {
        if(result === true) { // let's be extra safe here
          callback(null, user);
        }
        else {
          callback(new Error('username or password incorrect')); // in this case the password is wrong, but we reply with the same error
        }
      });
    }
  });
}
```

What do we do if the user provided us with a good combination of username/password? Remember that **HTTP is stateless**, so if we don't do anything right now before the login request is finished, it will be too late and we will have lost our user!

### A wild cookie has appeared!
Before terminating a login's POST request, we have to send a cookie to the user using the `Set-Cookie` header. Actually Express has a nice [`res.cookie`](http://expressjs.com/en/4x/api.html#res.cookie) function that does that. We simply need to figure out what to pass as a cookie.

Whatever we set as the cookie, the user's browser will pass that value back to us as long as the cookie has not expired. We can use an ExpressJS middleware called [`cookie-parser`](https://github.com/expressjs/cookie-parser) to get the cookie values as a nice object under `request.cookies`.

Imagine for a second that we set the cookie value as `USER=thompson`. We're doing this to "remember" the user the next time they make an HTTP request. On the next request, the browser will pass a `Cookie` header with the value `USER=thompson`. Do you see anything wrong with this?

Here's what's wrong: **because the browser is the one passing the cookie values, anyone can put a cookie in their browser that says USER=thompson**. Therefore, we have to set a cookie value that will **prove to us that the user is who they say they are**.

There are many ways to do this, but here is the one we will follow: when a user successfully logs in, we will [generate a **random number** using the `secure-random` NPM package](https://www.npmjs.com/package/secure-random) -- it's often called a session token -- and store it in a `sessions` table along with the user ID of the user.

Using the `checkLogin` code above, we can now implement a `POST /login` server function. It will receive the username and password, call `checkLogin`. If everything goes well, we will generate a token for the user and set a cookie with that token. Otherwise we will send an error message to the user. **Type in this code and understand it rather than copy/paste**:

```javascript
// At the top of our reddit.js:
var secureRandom = require('secure-random');
// this function creates a big random string
function createSessionToken() {
  return secureRandom.randomArray(100).map(code => code.toString(36)).join('');
}

function createSession(userId, callback) {
  var token = createSessionToken();
  conn.query('INSERT INTO sessions SET userId = ?, token = ?', [userId, token], function(err, result) {
    if (err) {
      callback(err);
    }
    else {
      callback(null, token); // this is the secret session token :)
    }
  })
}

// In the request handler:
app.post('/login', function(request, response) {
  RedditAPI.checkLogin(request.body.username, request.body.password, function(err, user) {
    if (err) {
      response.status(401).send(err.message);
    }
    else {
      // password is OK!
      // we have to create a token and send it to the user in his cookies, then add it to our sessions table!
      RedditAPI.createSession(user.id, function(err, token) {
        if (err) {
          response.status(500).send('an error occurred. please try again later!');
        }
        else {
          response.cookie('SESSION', token); // the secret token is now in the user's cookies!
          response.redirect('/login');
        }
      });
    }
  });
});
```

### Time to eat that cookie
Cool. We now have set a random, "unguessable" value in the user's browser. Next time they do an HTTP request to our server, their browser will send the random value. We can then check in our database if it exists and what userId it's linked to.

But where are we going to put this code? After all, pretty much every request will need to check if a user is currently "logged in"... What's one thing that we can run on every request? [Express middleware](http://expressjs.com/en/guide/using-middleware.html)!

Let's create a middleware that will run on every request. Here's how our middleware will work:

  1. Check the request cookies for a cookie called `SESSION`
  2. If it does not exist, call `next()` to exit the middleware
  3. If the cookie exists, do a database query to see if the session token belongs to a user:

    1. if it doesn't, then call `next()` again (here we could also "delete" the cookie)
    2. if it does, then we can set a `loggedInUser` property on the `request` object. This way each request handler can pick it up and do what it wants with it.

Here's what the middleware could look like:

```javascript
// At the top of the server code:
var cookieParser = require('cookie-parser');
app.use(cookieParser()); // this middleware will add a `cookies` property to the request, an object of key:value pairs for all the cookies we set

// The middleware
function checkLoginToken(request, response, next) {
  // check if there's a SESSION cookie...
  if (request.cookies.SESSION) {
    RedditAPI.getUserFromSession(request.cookies.SESSION, function(err, user) {
      // if we get back a user object, set it on the request. From now on, this request looks like it was made by this user as far as the rest of the code is concerned
      if (user) {
        request.loggedInUser = user;
      }
      next();
    });
  }
  else {
    // if no SESSION cookie, move forward
    next();
  }
}

// Adding the middleware to our express stack. This should be AFTER the cookieParser middleware
app.use(checkLoginToken);

// And later on in a request handler (this is ***only an example***):
app.post('/createPost', function(request, response) {
  // before creating content, check if the user is logged in
  if (!request.loggedInUser) {
    // HTTP status code 401 means Unauthorized
    response.status(401).send('You must be logged in to create content!');
  }
  else {
    // here we have a logged in user, let's create the post with the user!
    RedditAPI.createPost({
      title: request.body.title,
      url: request.body.url,
      userId: request.loggedInUser.id
    }, function(err, post) {
      // do something with the post object or just response OK to the user :)
    })
  }
})
```

## Votes and voting on content
How will the user cast a vote for a post eventually? Their browser will have to make a **POST** request, perhaps to a resource like `/vote` or `/votePost`? On the posts page, when outputing the `<li>` for each post, you can add two forms like this:

```html
<form action="/vote" method="post">
  <input type="hidden" name="vote" value="1">
  <input type="hidden" name="postId" value="XXXX">
  <button type="submit">upvote this</button>
</form>
<form action="/vote" method="post">
  <input type="hidden" name="vote" value="-1">
  <input type="hidden" name="postId" value="XXXX">
  <button type="submit">downvote this</button>
</form>
```

This is weird though. Imagine if on Reddit every time you cast a vote, the page would refresh? In the next weeks we will learn how to make these kind of requests (GET, POST, ...) to a server but without refreshing the page, perhaps using jQuery or even React!

## Rendering HTML
Rendering HTML by writing code like this:

```javascript
var output = "<ul>";
contents.forEach(function(item) {
  output += "<li><a href='" + item.url + "'>" + item.title + "</a>";
});
output += "</ul>";
```

can quickly get out of hand, especially as you have a more complex page.

As seen in class, Express offers the EJS templating language out of the box. It's a mix of HTML code and special `<% %>` tags that can let us write JavaScript to control HTML.

Here's a full example:

In your `server.js`:
```javascript
app.get('/r/:subreddit', function(request, response) {
  redditAPI.getPostsForSubreddit(request.params.subreddit, function(err, posts) {
    response.render('post-list', {
      posts: posts,
      subreddit: request.params.subreddit
    });
  });
});
```

In your `subreddit.ejs`:

```
<html>
  <head>
    <title>Subreddit: <%= subreddit %></title>
  </head>
  <body>
    <h1>Reddit clone!</h1>
    <hr>
    <h2>Posts for <%= subreddit %></h2>
    
    <ul>
      <% posts.forEach(function(post) { %>
      <li>
        <h3><%= post.title %></h3>
        <p>
          shared by: <%= post.user.username %>
        </p>
      </li>
      <% }); %>
    </ul>
  </body>
</html>
```


# Enhancing our Reddit clone with semantic HTML5, CSS3 and some JavaScript/jQuery

We ended week four of the bootcamp with a basic working Reddit clone. In doing so, we learned many things about HTTP and the web, more specifically on the back-end side of things.

In the next two weeks, we will be concentrating more on the browser side -- so-called front-end development -- keeping in mind that both "sides" are somewhat connected.

This first front-end workshop is more open-ended than the ones we have previously worked on. As a trainee, you are starting to become more independent. You have worked hard to find more and more information by yourself, and it has paid off :)

Therefore, instead of concentrating on one particular subject, today we propose to start discovering the world of front-end development by looking at many different aspects at the same time. In the coming days, we will formalize some of this knowledge with the help of a few short lectures.

## Semantic HTML5 tags
In this section, we will enhance our Reddit clone with HTML5 semantic tags. To do this, we'll have to rewrite some of our rendering functions to take advantage of these new elements. Here are some resources to get you started:

### Resources
* [Let's talk about semantics](http://html5doctor.com/lets-talk-about-semantics/)
* [MDN's HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element#Content_sectioning)
* [Why to use semantic elements instead of DIV?](http://stackoverflow.com/a/17272444/1420728)
* [How to use HTML5 sectioning elements?](http://blog.teamtreehouse.com/use-html5-sectioning-elements)

### Pre-work
Before starting to add or modify the HTML of your pages, you should make sure to have a similar layout for all your pages. Let's say that you generated HTML for the homepage which looks like this:

```html
<h1>home page!</h1>
<ul>
  <li>first post</li>
  <li>second post</li>
  <li>...</li>
</ul>
```

Perhaps you want all your pages to look like this:

```html
<!doctype html>
<html>
  <head>
    <title>Custom title for that page</title>
    <link rel="stylesheet" href="css/app.css"/>
  </head>
  <body>
    <header>
      <nav>same or different nav when logged in / logged out???</nav>
      <h1>Welcome to reddit!</h1>
    </header>
    
    <main>
      <!-- THIS PART SHOULD BE DIFFERENT FOR EACH PAGE -->
    </main>
    
    <footer>&copy; 2016 myself!</footer>
  </body>
</html>
```

First, [make sure you started using EJS](https://scotch.io/tutorials/use-ejs-to-template-your-node-application) by following this guide or many others.

Once you have EJS up and running, check out [`ejs-mate`](https://github.com/JacksonTian/ejs-mate) to add a common layout to your site.

### Work
Using your newly acquired knowledge, as well as your `ejs-mate` functionality, modify the HTML structure of your Reddit clone to take advantage of semantic HTML5 elements. Among other things, you can make use of `<nav>`, `<article>`, `<main>` and `<aside>`.

At the very least, your page should have a constant header and footer, and a main section with all the content of that page.

---

## CSS3, Flexbox and styling forms
Learn more about CSS3 and flexbox using the following resources, and any other you can find:

### Flexbox: layouts the easy way
* http://flexbox.io/#/ Will ask you to register. **DO IT!!**
* http://flexboxin5.com/
* http://flexboxfroggy.com/

Using your newly-acquired knowledge on flexbox, as well as anything else you found out about CSS, refactor the homepage's list of posts to look like the following:

![](https://i.imgur.com/erVHYGq.png)

**STOP**: How are you going to load a CSS file from your HTML page? If you add a `<link>` tag with `href="/css/app.css"`, will it work? Does your web server have a handler for GET requests to `/css/app.css`? It doesn't, but it doesn't need to! [ExpressJS has a middleware for serving so-called "static files"](http://expressjs.com/en/starter/static-files.html). Read up on it and implement it in your server before going forward.

Once it's setup, create a static file at `css/app.css` in your `static` directory to complete this exercise.

Each post item in the list should be organized as a flexbox container.

The left side should take only as much space as it needs to output the up/down vote arrows and the vote score. **If you don't have vote scores in your app, replace it with a random number for the moment**.

The right side should expand to take all remaining space. Inside should be the title, and below that, yet another container.

The bottom of the right side container should have the "created by" on the left, and "created at" all the way to the right.

**HINT**: Remember, the goal here is to use as much of flexbox as possible. You shouldn't need to float things to the left or right, or any vertical alignment.

### Styling forms
Our Reddit clone, however tiny it may be already contains three FORMS! After reading [this MDN article about styling forms](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms/Styling_HTML_forms), use some CSS to make your forms look nice.

Try to implement an overall look for your forms and use some CSS classes to style them as you wish.

### More...
You can come back to this section and keep adding CSS to your page as we discover more together in class.

## Adding interactivity with JavaScript and jQuery
At the moment our Reddit clone is a little bit less user-friendly than it could be. For one thing, voting on content is refreshing the page every time. Another thing we may want to do is suggest a title for a user as they're adding a new URL, to make it easier.

As you know, any interactivity happening in your browser will be mostly due to JavaScript. So far, we've been writing JavaScript for quite a few weeks, but never actually used it in the browser. It turns out that the browser offers us a lot of APIs for doing interactive things **once a webpage has already loaded**. Some of these things include:

* Manipulating the content of the current document using [the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
* [Listening for various events like clicking, hovering, typing](https://developer.mozilla.org/en-US/docs/Web/Events)
* [Making HTTP requests directly from the browser](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)

If you read the above documents, you may get a feeling that these APIs provided by the browser are quite low-level. They're not super straight forward and some pitfalls exist.

You may have heard of [jQuery](http://jquery.com/) as the go-to library for adding interactivity on your page. jQuery is no more than JavaScript code that packages some nice functions for doing the things we mentioned above. As it turns out, some of these things are much easier to do with jQuery, which explains why it has become so popular.

Here are the jQuery references for the above activities:

* [Manipulating the contents of a page with jQuery](https://learn.jquery.com/using-jquery-core/)
* [Listening for events like clicking, typing, etc. on a page](https://learn.jquery.com/events/)
* [Making HTTP requests directly from the browser with jQuery](https://learn.jquery.com/ajax/)
* [Try jQuery!](http://try.jquery.com/)

Based on the above references as well as your own research, try to complete one or two of the following activities:

### Suggesting a title before someone adds new content (browser-side only)
Here we are basically going to reproduce the following functionality:

![](http://g.recordit.co/x9OS40EY9n.gif)

1. Next to the URL field, let's add a button that says "suggest title".
2. **On click** of this button, we want to make an **ajax request** for the URL
3. When we receive the HTML for the page, we want to parse it again using jQuery
4. Using jQuery's DOM functions, find the `title` element and put its content in the title field
5. Optionally show a "loading" text while your are doing the work

**NOTE**: The user stays on the same page while this is going on. Everything happens without refreshing the page.

**NOTE 2**: What happens when you try to make an AJAX request to an external site? It seems like the browser is blocking you. How could you go around this?

You are probably getting an error that looks like this:

`XMLHttpRequest cannot load http://www.domain.com/some-url/ Origin null is not allowed by Access-Control-Allow-Origin.`

Here, you are being blocked by the [same origin policy](https://en.wikipedia.org/wiki/Same-origin_policy). Your browser is preventing the JavaScript on your domain to make AJAX calls to another domain because that could be destructive if not controlled.

For example, imagine if you land on my website, and some JavaScript code makes an AJAX request to your bank's website. If that were let through, my JavaScript could retrieve your bank account numbers and balances and send them over to me over the network.

Since we won't be able to do external request to every website in the world from our own domain, the best way around that will be to make the requests **from our own web server**. Here's how it will work:

Let's say you want to find out the title of the page at https://www.decodemtl.com/web-development-full-time/. If you make an AJAX request to this URL your browser will block you. Instead, make an AJAX call to your own web server, at the resource called, say, `/suggestTitle` and pass it the URL in a query string: `/suggestTitle?url=https://www.decodemtl.com/web-development-full-time/`.

On your server, implement an `app.get('/suggestTitle')` that will use the `request.query.url`, make a request to that web page, and retrieve the HTML code of the page.

Then, you'll need to parse the HTML on the server side to find the content of the `<title>` tag. Wouldn't it be nice if you had jQuery on the server? Well, you do! The [cheerio NPM package](https://cheeriojs.github.io/cheerio/) does specifically that :)

So the process will work like this:

1. User enters a URL in the title field
2. User clicks on the "suggest title" button
3. Your code does an AJAX query to `/suggestTitle?url=...`
4. Your server receives this request, and retrieves the `url` from the query string parameters
5. Your server does a web request (e.g. using the `request` NPM package) to the submitted URL
6. Your server receives the HTML for the web page and passes it to the `cheerio` library
7. `cheerio` returns the `<title>` of the page
8. Your server sends a `response.json` with the title, like `{"title": "web development in montreal"}`
9. Your browser code receives the response from the server
10. Your browser code updates the Title field with the text of the response

### Voting without refreshing the page!
When a user clicks on the submit button of either of the two voting forms, the following happens:

1. The browser takes the form data and makes a query string out of it: `voteDirection=1&contentId=123`
2. The browser looks at the form's `action` and `method` and makes an HTTP request accordingly
3. The server receives the (POST) request and form data, and does what it needs to do
4. The server sends a **redirect response** back to the homepage
5. The browser receives the redirect, and does another HTTP GET to the homepage

While this experience follows the **statelessness** principle of HTTP, it's not super friendly for our users. For one thing, there is a flash of content as the page refreshes. Moreover, the server is indiscriminately redirecting to the homepage, but we may have been on another page that displays posts. Not only that, but we may have been scrolled to the bottom of the page and now we are back to the top.

For all these reasons, it may be nicer for our users if we could take such a small interaction as voting and make it happen **without refreshing the page**. Even though we're staying on the same page, we still have to follow the rules of HTTP. Among other things, it means that *our browser will still have to send an HTTP POST request to make the vote happen*. The difference is, this request will be done by the JavaScript code running in the browser. This is AJAX :)

Here are the high level steps we will be following...

When a user submits either of the two voting forms:

1. Our code should **listen to this submit event** and prevent the submit from taking place
2. Our code should **find the two hidden inputs** inside the form, and [find out their value](https://api.jquery.com/val/)
3. Our code should **do an ajax POST request** to our `/vote` URL, passing it the parameters `voteDirection` and `contentId`
4. At this point, our server will receive the POST and do its usual business of creating the vote
5. For now, our server is sending a redirect response, which our AJAX code may not have much use for...

In the server-side version, our POST handler was redirecting us back to the homepage, the browser was requesting the home page again, and the new votes count would display itself. In this browser-only version, what could we do? We made the POST request, but the vote count stays the same... How could we fix this?

If only we could get the new vote count as the result of our POST request... Well why not? We're the ones who wrote the web server, so we can make it do whatever we want! Let's modify our Reddit server's POST handler to `/vote`. Instead of sending a redirect response to the client, let's find out the new vote score for the content that was voted on, and return it to the user as JSON. Instead of:

1. Check if the user is logged in
2. Create a vote or update existing vote
3. Send a `response.redirect` response to `/` homepage

Let's do the following:

1. Check if the user is logged in (this stays the same)
2. Create a vote or update existing vote (this stays the same)
3. Make a new Sequelize query for the Content with its vote score
4. Send a `response.json` with an object `{newVoteScore: XX}` where `XX` is the new vote score

Then, on the browser side, in the response to our AJAX query, we will receive this JSON. Let's do the following:

1. Receive the JSON response from doing the POST to `/vote` by AJAX
2. Parse the JSON response to an object using `JSON.parse`
3. Retrieve the `newVoteScore` property of the object
4. Update the user interface to represent the new vote score using jQuery's DOM functions

