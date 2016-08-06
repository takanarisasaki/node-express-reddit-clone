var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;
var secureRandom = require('secure-random');

/*
All the functions of our API require a database connection. Instead of establishing the 
database connection inside the reddit.js file, we choose to keep it pure: we pass the 
connection to the function, and it returns to us the actual API.
*/
module.exports = function RedditAPI(conn) {
  return {
    createUser: function(user, callback) {

      // first we have to hash the password...
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else {
          //we pass the conn.query function an array of the strings that should replace the ?s, and it puts the query together for us.
          conn.query(
            'INSERT INTO users (username, password, createdAt) VALUES (?, ?, ?)', [user.username, hashedPassword, new Date()],
            function(err, result) {
              if (err) {
                /*
                There can be many reasons why a MySQL query could fail. While many of
                them are unknown, there's a particular error about unique usernames
                which we can be more explicit about!
                */
                if (err.code === 'ER_DUP_ENTRY') {
                  callback(new Error('A user with this username already exists'));
                }
                else {
                  callback(err);
                }
              }
              else {
                /*
                Here we are INSERTing data, so the only useful thing we get back
                is the ID of the newly inserted row. Let's use it to find the user
                and return it
                */
                conn.query(
                  'SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', [result.insertId],
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      /*
                      Finally! Here's what we did so far:
                      1. Hash the user's password
                      2. Insert the user in the DB
                      3a. If the insert fails, report the error to the caller
                      3b. If the insert succeeds, re-fetch the user from the DB
                      4. If the re-fetch succeeds, return the object to the caller
                      */
                      callback(null, result[0]);
                    }
                  }
                );
              }
            }
          );
        }
      });
    },
    
    
    createPost: function(post, subredditId, callback) {
      conn.query(
        'INSERT INTO posts (userId, title, url, createdAt, subredditId) VALUES (?, ?, ?, ?, ?)', [post.userId, post.title, post.url, new Date(), subredditId],
        function(err, result) {
          //console.log("HELLO", result);
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            conn.query(
              'SELECT id,title,url,userId, createdAt, updatedAt, subredditId FROM posts WHERE id = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    
    /*MY CODE for getAllPost
    getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      var sorting = options.sorting || 'hotness';
      //making alias for createdAt and UpdatedAt since we cannot have two same name with different values inside an object
      
      conn.query(`
        SELECT p.id as postId, p.title, p.url, p.createdAt as postCreatedAt, p.updatedAt as postUpdatedAt, 
               u.id as usernameId, u.username, u.createdAt as userCreatedAt, u.updatedAt as userUpdatedAt, 
               s.id as subredditId, s.name as subredditName, s.description as subredditDescription, s.createdAt as subredditCreatedAt, s.updatedAt as subredditUpdatedAt,
               SUM(vote) as voteScore,
               SUM(IF(vote = 1, 1, 0)) as numUpvotes,
               SUM(IF(vote = -1, 1, 0)) as numDownvotes,
               SUM(IF(vote != 0, 1, 0))  as totalVotes,
               SUM(vote) / (NOW() - p.createdAt) as hotness
        FROM posts as p
        LEFT JOIN users as u ON u.id = p.userId
        LEFT JOIN subreddits as s ON s.id = p.subredditId
        LEFT JOIN votes as v ON p.id = v.postId
        GROUP BY postId
        ORDER BY ?? DESC
        LIMIT ? OFFSET ?`, [sorting, limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            //console.log("BYE", results);

            var formatedResults = results.map(function(post) {
              //console.log("JAPAN", obj.title);
              var formatedObj = {};
              return {
                id: post.postId,
                title: post.title,
                url: post.url,
                createdAt: post.postCreatedAt,
                updatedAt: post.postUpdatedAt,
                userId: post.userId,
                voteScore: post.voteScore,
                upVotes: post.numUpvotes,
                downVotes: post.numDownvotes,
                totalVotes: post.totalVotes,
                hotness: post.hotness,
                user: {
                  id: post.usernameId,
                  username: post.username,
                  createdAt: post.userCreatedAt,
                  updatedAt: post.userUpdatedAt
                },
                subreddit: {
                  id: post.subredditId,
                  name: post.subredditName,
                  description: post.subredditDescription,
                  createdAt: post.subredditCreatedAt,
                  updatedAt: post.subredditUpdatedAt
                }
              };

            });

            callback(null, formatedResults);
          }
        }
      );
    },
    */
    
    //ZIAD'S CODE for getAllPosts
    getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 100; // if options.numPerPage is falsy then use 25
      var offset = (options.page || 0) * limit;
      var sorting = options.sorting || 'hotness';
      var sortBy;
      //console.log("HELLO", options.sorting);
      
      if (sorting === 'new' || sorting === 'top' || sorting === 'hotness') {
        switch (sorting) {
          case 'new':
            sortBy = 'createdAt'
            break;
          case 'top':
            sortBy = 'voteScore'
            break;
          default:
            sortBy = 'hotness'
        }
      }
      else {
        sortBy = 'error'
      }

      //console.log("HELLO", sortBy);

      conn.query(`
        SELECT
          p.id, p.title, p.url, p.createdAt, p.updatedAt,
          
          u.id AS u_id,
          u.username as u_username,
          u.createdAt as u_createdAt,
          u.updatedAt as u_updatedAt,
          
          s.id as s_id,
          s.name as s_name,
          s.createdAt as s_createdAt,
          s.updatedAt as s_updatedAt,
          
          SUM(IF(vote = 1, 1, 0)) as numUpvotes,
          SUM(IF(vote = -1, 1, 0)) as numDownvotes,
          SUM(IF(vote != 0, 1, 0))  as totalVotes,
          SUM(vote) as voteScore,
          SUM(vote) / (NOW() - p.createdAt) as hotness
          
        FROM posts p
          LEFT JOIN users u ON p.userId = u.id
          LEFT JOIN subreddits s on p.subredditId = s.id
          LEFT JOIN votes v ON v.postId = p.id
        GROUP BY p.id
        ORDER BY ?? DESC
        LIMIT ? OFFSET ?`, [sortBy, limit, offset],
        function(err, posts) {
          if (err) {
            callback(err);
          }
          else {
            posts = posts.map(function(post) {
              return {
                id: post.id,
                title: post.title,
                url: post.url,
                voteScore: post.voteScore,
                upVotes: post.numUpvotes,
                downVotes: post.numDownvotes,
                totalVotes: post.totalVotes,
                voteHotness: post.hotness,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                user: {
                  id: post.u_id,
                  username: post.u_username,
                  createdAt: post.u_createdAt,
                  updatedAt: post.u_updatedAt
                },
                subreddit: {
                  id: post.s_id,
                  name: post.s_name,
                  createdAt: post.s_createdAt,
                  updatedAt: post.s_updatedAt
                }
              };
            });

            callback(null, posts);
          }
        }
      );
    },


    getAllPostsForUser: function(userId, options, callback) {
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      
      conn.query(`
      
        SELECT * FROM posts 
        JOIN users ON users.id = posts.userId
        WHERE users.id = ?
        LIMIT ? OFFSET ?`, [userId, limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results);
          }
        }
      );

    },


    getSinglePost: function(postId, callback) {
      conn.query(`
        SELECT * FROM posts
        WHERE id = ?`, [postId],
        function(err, results) {
          //console.log("VISA", results)
          if (err) {
            callback(err);
          }
          else {
            callback(null, results[0]);
          }
        }
      );
    },


    createSubreddit: function(sub, callback) {
      conn.query(
        'INSERT INTO subreddits (name, description, createdAt) VALUES (?, ? ,?)', [sub.name, sub.description, new Date()],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            conn.query(
                `SELECT * FROM subreddits WHERE id = ?`, [result.insertId],
                function(err, result) {
                  if (err) {
                    callback(err);
                  }
                  else {
                    callback(null, result);
                  }
                }
            )
          }

        }
      );
    },
    
    
    getAllSubreddits: function(callback) {
      var query = `SELECT * FROM subreddits ORDER BY createdAt DESC`;
      conn.query(query, function (err, result) {
        //console.log(result);
        if (err) {
          callback(err);
        }
        else {
          callback(null, result);
        }
      });
      
    },
    
    
    createComment: function(comment, callback) {
      conn.query(
        `INSERT INTO comments (text, userId, postId, commentId, createdAt) VALUES (?, ?, ?, ?, ?)`, 
        [comment.text, comment.userId, comment.postId, comment.commentId, new Date()],
        function (err, result) {
          //console.log('SATURN', result);
          if (err) {
            callback(err);
          }
          else {
            conn.query(
              `SELECT * FROM comments WHERE id = ?`, [result.insertId],
              function(err, result) {
                //console.log('SATURN', result);
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        });
      
    },
    
    
    getCommentsForPost: function(postId, callback) {
      
      conn.query(`
         SELECT c.text, c.id, c.commentId FROM comments AS c
         JOIN posts AS p ON p.id = c.postId
         LEFT JOIN comments ON c.id = c.commentId
         WHERE c.postId = ?
         ORDER BY c.createdAt`, [postId],
         
         function(err, result) {
           //console.log(result, "THIS IS IT");
           if(err) {
             callback(err);
           }
           else {
             
             var data = {};

             result.forEach(function(grandParent){
               if(grandParent.commentId === null){
                 var grandParentObj = {
                   id: grandParent.id,
                   text: grandParent.text,
                   replies: []
                 };
                 
                 result.forEach(function(parent) {
                     if(parent.commentId === grandParent.id){
                       var parentObj = {
                         id: parent.id,
                         text: parent.text,
                         replies: []
                       };
                      data[grandParent.id] = grandParentObj;
                       data[grandParent.id].replies.push(parentObj);
                         result.forEach(function(child){
                        if(child.commentId === parent.id){
                          var childObj ={
                            id: child.id,
                            text: child.text,
                            replies: []
                          };
                          data[grandParent.id].replies.forEach(function(insideParent){
                            if(insideParent.id === child.commentId){
                              insideParent.replies.push(childObj)
                            }
                          });
                        }
                      });
                       
                     } 
                     else {
                        data[grandParent.id] = grandParentObj;
                     }
                 });
                 

               }
             });
             callback(null, data);
           }
         }
          
      );
      
    },
    
    /*
    getCommentsForPostRecursive: function(postId, callback) {
      function getComments(postId, parentIds, allComments, commentIdx, callback){
  
  var query;
  
  if(parentIds){
      if(parentIds.length === 0){
    callback(null, allComments);
    return;
  }
    query = `
          SELECT c.text, c.id, c.commentId FROM comments AS c
         WHERE c.postId = ${postId} AND c.commentId IN (${parentIds.join(',')})
         ORDER BY c.createdAt
    `;
  } else {
    query = `
      SELECT c.text, c.id, c.commentId FROM comments AS c
         WHERE c.postId = ${postId} AND c.commentId IS NULL
         ORDER BY c.createdAt
    `;
  }
  
  conn.query(query, function(err, res){
    var parentKeys = [];
    res.forEach(function(comment){
      if(commentIdx[comment.commentId]){
        commentIdx[comment.commentId].replies.push(comment);
      }

      parentKeys.push(comment.id);
      comment.replies = [];
      commentIdx[comment.id] = comment;
      if(comment.commentId === null) {
             allComments.push(comment);
      }
    })
     getComments(postId, parentKeys, allComments, commentIdx, callback);
  })
       
}     
      getComments(postId, null, [], {}, callback);
    },
    */
    
    createOrUpdateVote: function(voteObj, callback) {
      
      //console.log("voteObj", voteObj);
      
      if (voteObj.vote === -1 || voteObj.vote === 0 || voteObj.vote === 1) {
      
        conn.query(`
          INSERT INTO votes (postId, userId, vote, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?) 
          ON DUPLICATE KEY UPDATE vote = ?`,
          [voteObj.postId, voteObj.userId, voteObj.vote, new Date(), new Date(), voteObj.vote],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            //console.log("GOOD VOTE!");
            
            conn.query(
            `SELECT * FROM votes`
            ,function(err, result) {
              if (err) {
                callback(err);
              }
              else {
                //console.log("VOTES", result)
                callback(null, result);
              }
            }
            );
            
          }
          
        });
        
      }
      
      //if the vote is not -1.0, or 1
      else {
        callback(null, 'vote properly');
      }
      
      
    },
    
    
    getFivePosts: function(userId, callback) {
      conn.query(
        `SELECT p.title, p.url, p.userId, u.username, p.createdAt FROM posts AS p
         JOIN users AS u ON u.id = p.userId
         WHERE userId=?
         ORDER BY p.createdAt DESC
         LIMIT 5`
         ,[userId]
      ,function(err, result) {
        if (err) {
          callback(err);
        }
        else {
          callback(null, result);
        }
      });
    },


    createPostUsingExpress: function(urlAndTitle, callback) {
      conn.query(
        `INSERT INTO posts (title, url, userId) VALUES (?, ?, ?)`, [urlAndTitle.title, urlAndTitle.url, 5],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
              conn.query(
                'SELECT title, url, userId FROM posts WHERE id = ?', [result.insertId],
                function(err, result) {
                  if (err) {
                    callback(err);
                  }
                  else {
                    callback(null, result[0]);
                  }
                }
              );
      
          }
    
        });
      },
      
      
    checkLogin: function(username, password, callback) {
      conn.query(`SELECT * FROM users WHERE username = ?`, [username], function(err, result) {
        if (result.length === 0) {
          callback('err'); // in this case the user does not exists
        }
        else {
          var user = result[0];
          var actualHashedPassword = user.password;
          bcrypt.compare(password, actualHashedPassword, function(err, result) {
            if (result === true) { // let's be extra safe here
              callback(null, user);
            }
            else {
              callback('err'); // in this case the password is wrong, but we reply with the same error
            }
          });
        }
      });
    
    },
      

    createSession: function(userId, callback) {
      // this createSessionToken function creates a big random string
      function createSessionToken() {
        return secureRandom.randomArray(100).map(code => code.toString(36)).join('');
      }
      var token = createSessionToken();
      
      //console.log("HELLO TOKEN", token);
      conn.query('INSERT INTO sessions SET userId = ?, token = ?', [userId, token], function(err, result) {
        //console.log("PRINT TOKEN", token);
        //console.log(result);
        if (err) {
          callback(err);
        }
        else {
          
          callback(null, token); // this is the secret session token :)
        }
      })
    },
    
    
    getUserFromSession: function(sessionCookie, callback) {
      //sessionCookie is the long-complicated-string (cookie) that each user is assigned to when logging in.
      //console.log("PRINT SESSION COOKIE", sessionCookie);
      conn.query(`
        SELECT * FROM sessions WHERE token = ?`, [sessionCookie], 
        function(err, userInfo) {
          //userInfo is an array that contains an object with userId and token
          //console.log(userInfo);
          if (err) {
            callback(err);
          }
          else {
            //console.log("RESPONSE", userInfo[0]);
            //return the object inside the array
            callback(null, userInfo[0]);
          }
      });
    },
    
    
    removeCookieFromSession: function(sessionCookie, callback) {
      conn.query(`
        DELETE FROM sessions WHERE token = ?`, [sessionCookie], function(err, response) {
          if (err) {
            callback(err);
          }
          else {
            //console.log("RESPONSE", response);
            callback(null, response);
          }
        }
        
      );
      
    },
    
    getVotesForPost: function(postId, callback) {
      conn.query(`
        SELECT sum(vote) AS voteForPost from votes WHERE postId = ?`, [postId]
        ,function (err, result) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, result[0].voteForPost);
          }
      });
    }

  }
}

