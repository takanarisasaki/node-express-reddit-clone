// The comment just below makes the jQuery $ global
/* global $ */

$(document).ready(function(){
    //console.log('Document loaded!');
    
    //assigning signup form onside $signup variable, so we have a form inside signup variable
    var $signup = $('#signup');
    //console.log('SIGNUP', $signup)
    //e (event) is an object containing bunch of keys and values
    //when submit on signup form, go though the function(e)
    $signup.on('submit', function(e){
        //preventDefault() method cancels the event if it is cancelable, meaning that the default action that belongs to the event will not occur.
        //preventDefault() prevents the form from submitting in this case
        e.preventDefault();
        //console.log("eee", e);
        var formInfo = {};
        //'this' is the signup form. $signup and $(this) contains exactly the same information.
        //.serializeArray() method creates a JavaScript array of objects, ready to be encoded as a JSON string. It operates on a jQuery collection of forms and/or form controls. 
        var serializedArray = $(this).serializeArray();
        //console.log('$(this)', $(this));
        //console.log('$(signup)', $signup);
        //console.log(serializedArray);
        serializedArray.forEach(function(inputField){
            //console.log(inputField);
            formInfo[inputField.name] = inputField.value;
        });
        //console.log(formInfo);
        
        $.post('/signup', formInfo, function(msg){
            //console.log(msg);
            
            if(msg === 'username already taken') {
                $('.username_taken').remove();
                $('#signup input:eq(0)').before('<div class="username_taken"> Username already taken! </div>');
            } 
            else if (msg === 'Enter username and password') {
                $('.username_taken').remove();
                $('#signup input:eq(0)').before('<div class="username_taken"> Enter username and password </div>');                
            }
            else {
                //redirect to this page
                window.location = '/login/account-created-success';
            }
        })
        
        //console.log('form Info', formInfo);
    });
    
    $('#login_button').on('submit', function(e) {
        
        e.preventDefault();
        //console.log("comming in here");
        
        var form = $(this);
        var serializedForm = form.serializeArray()
        var formInfo = {};
        
        serializedForm.forEach(function(inputField) {
            //console.log("inputField", inputField)
            formInfo[inputField.name] = inputField.value;
        });
        
        console.log('FORM INFO', formInfo);
        
        $.post('/login', formInfo, function(msg) {
            console.log('MESSAGE', msg);
            if (msg === "Username or Password Incorrect") {
                
                $('.incorrect_input').remove();
                $('#login input:eq(0)').before('<div class="incorrect_input> Username or Password Incorrect </div>');
            }
            else {
                window.location = '/'
            }
        });
    });



    $('#suggest_title').on('submit', function(e) {
        e.preventDefault();
        //console.log('It was clicked!!!');
        
        //getting what was typed in URL box
        // var postForm = $('#create_post');
        //console.log("POST FORM", postForm);
        // var serializedForm = postForm.serializeArray();
        //console.log("SERIALIZED", serializedForm);
        
        var url = $('input[name="url"]').val();
        // console.log('URL2?', url);

        $.post('/suggestTitle', {url: url}, function(data) {
            if (data === 'Enter a valid HTTP URL') {
                $('.fill_in').remove();
                $('#create_post input:eq(1)').after('<div class="fill_in"> Enter a valid HTTP URL </div>');                
            }
            else {
                $('input[name="title"]').val(data);
            }
        });
        
    });


        //attach event listener submit on all forms
        //prevent form from submitting
        //reference the current form THIS
        //create empty object to put stuffs inside
        //do stuff to build object with stuff inside
        //send obj to backend
        //get back data
        //change score to new score
        
    $('.postVote').on('submit', function(e) {
        //console.log(e);
        e.preventDefault();
        
        var currentForm = $(this);
        var formInfo = {};
        
        //console.log(currentForm);
        var serialized = currentForm.serializeArray();
        //console.log(serialized);
        
        serialized.forEach(function(inputField) {
            
            formInfo[inputField.name] = inputField.value;
        });
        //console.log('forminfo', formInfo);
        
        $.post('/votePost', formInfo, function (data) {
            
            $(`#post_score_${formInfo.postId}`).text(`Vote Score: ${data.score}`);
        });
        
    });
        
    
    
    
    $('#create_post').on('submit', function(e) {
        
        e.preventDefault();
        
        var currentForm = $(this);
        var serializedForm = currentForm.serializeArray();
        var formInfo = {};
        
        //This is the same as sequalizedForm.forEach(function(inputField) { ... });
        // $.each(sequalizedForm, function(inputField) {
        //     console.log(inputField['name']);
        //     formInfo[inputField.name] = inputField.value;
        // });
        
        //console.log(formInfo)
        
        serializedForm.forEach(function(inputField) {
            formInfo[inputField.name] = inputField.value;
        });
        
        $.post('/createPost', formInfo, function(msg) {
            console.log(msg);
            if (msg === 'You have to fill in the title and the url') {
                
                $('.fill_in').remove();
                $('#create_post input:eq(1)').after('<div class="fill_in"> Fill in the title and URL </div>');
            }
            
            else {
                window.location = '/createPost/created-successfully';
            }
            
        });
        
        
        
        
    });
    
});