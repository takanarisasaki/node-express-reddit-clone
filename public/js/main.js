/*global $*/

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
            
            if(msg === 'error') {
                $('.username_taken').remove();
                $('#signup input:eq(0)').before('<div class="username_taken"> Username already taken! </div>');
            } 
            else {
                //redirect to this page
                window.location = '/login/account-created-success';
            }
        })
        
        //console.log('form Info', formInfo);
    });



        //attach event listenr submit on all forms
        //prevet form from submitting
        //reference the current form THIS
        //create enpty object for stuuf
        //do stuff to buold object with stuff inside
        //send obj to backend
        //get back data
        //change score to new score
        
        
    $('.postVote').on('submit', function(e) {
        e.preventDefault();
        
        var currentForm = $(this);
        var formInfo = {};
        
        var serialized = currentForm.serializeArray();
        
        serialized.forEach(function(inputField) {
            
            formInfo[inputField.name] = inputField.value;
        });
        console.log('forminfo', formInfo);
        
        $.post('/votePost', formInfo, function (data) {
            
            $(`#post_score_${formInfo.postId}`).text(`Vote Score: ${data.score}`);
        });
        
    });
        



    //console.log('upvote', $upvote);
    //console.log('downvote', $downvote);
    
});