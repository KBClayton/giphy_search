$(document).ready(function() {

    var button_array=["hamster", "kitten", "parrot", "cat", "monkey", "howler monkey"];
    var saved_buttons=[];
    var config = {
        apiKey: "AIzaSyD6PlneWj2HADezF-789sx-DxDAJ0DfpN0",
        authDomain: "testproject1-be755.firebaseapp.com",
        databaseURL: "https://testproject1-be755.firebaseio.com",
        projectId: "testproject1-be755",
        storageBucket: "testproject1-be755.appspot.com",
        messagingSenderId: "396198600089"
    };
    firebase.initializeApp(config);
    var database=firebase.database();
    var animal="";
    var state="";
    var currentindex=0;
    var oldlength=0;

    var giphypic = {
        button_init: function(){
            console.log("In button_init");
            console.log(button_array);
            for(var i=currentindex; i<button_array.length; i++){
                var buttonname=button_array[i];
                if (buttonname!==""){
                    var r= $('<input type="button" class="bsearch btn-info" value="'+buttonname+'"/>');
                    $("#buttondiv").append(r);
            
                }
            };

        },
        button_maker: function(){

                if ((animal!=="") && (button_array.indexOf(animal)==-1)){
                    var r= $('<input type="button" class="bsearch btn-info" value="'+animal+'"/>');
                    $("#buttondiv").append(r);
                    $("#pic-input").val("");
                    button_array.push(animal);
                }
                else{
                    $("#pic-input").val("");
                }
        },

        button_click: function(){
            
            var queryURL = "https://api.giphy.com/v1/gifs/search?q=" +
            animal + "&api_key=dc6zaTOxFJmzC&limit=10";
            console.log(queryURL);
            $.ajax({
            url: queryURL,
            method: "GET"
            }).then(function(response) { 
                var results=response.data;
                console.log(results);

                for (var i = 0; i < results.length; i++) {
                    var image = $("<img class='clickpic' width='480px'>");
                    image.attr("src", results[i].images["480w_still"].url);
                    image.attr({"still":results[i].images["480w_still"].url});
                    image.attr({"animate":results[i].images.downsized_large.url});
                    image.attr({"data":"still"});
                    console.log(results[i].images["480w_still"].url)        
                    var gifDiv = $("<div class='item' style='float:left;margin:20px;border-style:solid;border-width:5px;border-color:black;background-color:white'>");
                    var rating = results[i].rating;
                    var p = $("<div>").html("<h6>Rating: " + rating+"</h6><h6>Title: "+results[i].title+"</h6>");
                    var bookmark =$("<div id='book' mark='"+results[i].bitly_gif_url+"' title='"+results[i].title+"'>").html("<h6>Bookmark page</h6>");
                    var download=$("<a href='"+results[i].images.original.url+"' target='_blank' download='"+results[i].title+".gif'>").html("<h6>Download</h6>")
                  //var download=$("<a href='"+results[i].images.original.url+"' Content-Disposition: attachment; filename=ProposedFileName.txt;'"+results[i].title+"'>Download</a>")
                   // download.attr({"href":results[i].images.original.url});
                    gifDiv.prepend(image);
                    gifDiv.prepend(bookmark);
                    gifDiv.prepend(download);
                    gifDiv.prepend(p);

                    $("#picdiv").prepend(gifDiv);
                };
            });
        },
        pic_animate: function(here){
            console.log("in pic animate");
            if($(here).attr("data")=="still"){
                console.log("in condition 1");
                $(here).attr({"src":$(here).attr("animate")});
                $(here).attr({"data":"animate"});
            }
            else if($(here).attr("data")=="animate"){
                console.log("in condition 2");
                $(here).attr({"src":$(here).attr("still")});
                $(here).attr({"data":"still"});
            }
            else{
                console.log("don't be here");
            }

        },
        save_local: function(){
            console.log("In save local");
            localStorage.setItem("saved_buttons", JSON.stringify(button_array));

        },
        load_local: function(){
            console.log("In load local");
            if (localStorage.getItem("saved_buttons")!==null){
                saved_buttons=JSON.parse(localStorage.getItem("saved_buttons"));
                    console.log(saved_buttons);
                    for(var i=0; i<saved_buttons.length; i++){
                        if(button_array.indexOf(saved_buttons[i])==-1){
                            button_array.push(saved_buttons[i]);
                        }
                    }
                    console.log(oldlength+" post load array "+button_array.length);
                    if (oldlength<button_array.length){
                        console.log("in if statement");
                        currentindex=oldlength;
                        giphypic.button_init();
                    }
            }
            else{
                console.log("Nothing is local");
            }
        },

        clear_local: function(){
            localStorage.clear();
        },

        save_cloud: function(){
            console.log("In save cloud");
            database.ref("/picinfo").set({
                saved_buttons : JSON.stringify(button_array),
            });
            console.log("save cloud buttonarray "+button_array)
        },

        load_cloud: function(){
            console.log("In load cloud");

            database.ref("/picinfo").on("value", 
                function(snapshot) {
                    saved_buttons=JSON.parse(snapshot.val().saved_buttons)
                    if(saved_buttons!==null){
                        console.log(saved_buttons);
                        for(var i=0; i<saved_buttons.length; i++){
                            if(button_array.indexOf(saved_buttons[i])==-1){
                                button_array.push(saved_buttons[i]);
                            }
                        }
                        console.log(oldlength+" post load array "+button_array.length);
                        if (oldlength<button_array.length){
                            console.log("in if statement")
                            currentindex=oldlength;
                            giphypic.button_init();
                        }
                        
                    }
                }, 
                function(errorObject) {
                    console.log("there is no saved cloud info");
                });
        },

        clear_cloud: function(){
            database.ref("/picinfo").set({
                saved_buttons : [],
            });
        },

        new_buttons: function(){
            console.log("new buttons old lenght"+oldlength+"  New array "+button_array)
        }
    }


    //initial run for buttons
    giphypic.button_init();
    //click handlers calling object

    //calls giphy api to display images
    $("body").on("click", ".bsearch", function(event) {
        animal = $(this).val();
        giphypic.button_click();
    });

    //animates or pauses pictures
    $("body").on("click", ".clickpic", function(event) {
        giphypic.pic_animate(this);
    });

    //makes new buttons
    $("#pic-form").on("submit", function(event) {
        event.preventDefault();
        animal=$("#pic-input").val().trim();
        console.log(button_array.indexOf(animal));
        giphypic.button_maker();
    });


    $("#local_save").on("click", function(event) {
        event.preventDefault();
        giphypic.save_local();
    });
    $("#local_load").on("click", function(event) {
        event.preventDefault();
        oldlength=button_array.length;
        giphypic.load_local();
    });
    $("#local_clear").on("click", function(event) {
        event.preventDefault();
        giphypic.clear_local();
    });



    $("#cloud_save").on("click", function(event) {
        event.preventDefault();
        oldlength=button_array.length;
        giphypic.save_cloud();
    });

    $("#cloud_load").on("click", function(event) {
        event.preventDefault();

       // console.log("pre load array  "+button_array)
        oldlength=button_array.length;
       // console.log(oldlength);

        giphypic.load_cloud();
        
       // console.log(button_array);    
      //  console.log("old lenght "+oldlength+" new lenght "+button_array.length);
     //   setTimeout(giphypic.new_buttons(), 2000)  
   
    });
    $("#cloud_clear").on("click", function(event) {
        event.preventDefault();
        giphypic.clear_cloud();
    });



    $('body').on("click", "#book", function(e) {
        console.log("click on bookmark");
        var bookmarkURL = $(this).attr("mark");
        var bookmarkTitle = $(this).attr("title");
    
        if ('addToHomescreen' in window && addToHomescreen.isCompatible) {
          // Mobile browsers
          addToHomescreen({ autostart: false, startDelay: 0 }).show(true);
        } else if (window.sidebar && window.sidebar.addPanel) {
          // Firefox <=22
          window.sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
        } else if ((window.sidebar && /Firefox/i.test(navigator.userAgent)) || (window.opera && window.print)) {
          // Firefox 23+ and Opera <=14
          $(this).attr({
            href: bookmarkURL,
            title: bookmarkTitle,
            rel: 'sidebar'
          }).off(e);
          return true;
        } else if (window.external && ('AddFavorite' in window.external)) {
          // IE Favorites
          window.external.AddFavorite(bookmarkURL, bookmarkTitle);
        } else {
          // Other browsers (mainly WebKit & Blink - Safari, Chrome, Opera 15+)
          alert('Press ' + (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl') + '+D to bookmark this page.');
        }
        return false;
      });

});