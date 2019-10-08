var request = require("request");
const fs = require('fs');
var last = 0;
var notify = false;
const notifier = require('node-notifier');

module.exports = {

    getMessages : function(){
            
            getLatest(function(result) {
                var latestJSON =  parseInt(result,10);
                console.log("Last = " + last)
                console.log("latestJSON = " + latestJSON)
                var options = { method: 'GET',
                url: 'http://chrishaig.me/api/portfolio/list.php',
                qs: { verify: '' },
                headers: { 'cache-control': 'no-cache',Connection: 'keep-alive','accept-encoding': 'gzip, deflate',Host: 'chrishaig.me','Cache-Control': 'no-cache',Accept: '*/*'} };
              
                request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                
                    //Loops through all of the messages and if the message is already displayed then it will not be displayed again.
                    var json = JSON.parse(body);
                    json.forEach(element => {
                    if(element.id > latestJSON){
                        addMessage(element.name,element.subject,element.priority,element.message)
                        if(last == latestJSON ){
                            if(notify == true){
                                notifier.notify(
                                    {
                                      title: 'Message Alert',
                                      message: 'You have a new message from '+ element.name ,
                                      sound: false,
                                      wait: true 
                                    }, function(err, response) {
                                      
                                    }
                                  );
                            }

                              notify = true;
                        }
                        last = element.id;
                    }
                        
                });
                
                //Updates the json file with the latests message id to prevent adding the same messages again 
                if(Object.keys(json).length != latestJSON){
                    
                    fs.writeFile("./info.json", JSON.stringify({ "messages" : Object.keys(json).length }), function (err) {
                        if (err) return console.log(err);
                        console.log('The file has been saved!');
                      });
                }
              
              });
    
            });

    }
}

function addMessage(name, email, priority, message){

    var color = "";

    if(priority.toLowerCase() == "low"){
        color = "limegreen";
    }else if(priority.toLowerCase() == "medium"){
        color = "orange";
    }else  if(priority.toLowerCase() == "high"){
        color = "red";
    }

    const button = document.createElement('button');
  
    button.className = 'tablinks';
    button.setAttribute('onclick', 'openMessage(event, "' + name +'")');
    button.innerHTML = '<span style="' + color + '">' + name + `<br>` + email + '</span';
  
    document.getElementById('tab').appendChild(button);



    const div = document.createElement('div');
    div.id = name;
    div.className = 'tabcontent';
    div.style = 'display:none';
    div.innerHTML = '<h3>From: <span class="data">' + email + '</span></h3> <h3>Priority: <span  style="color: ' + color + ';">' + priority +  '</span></h3> <h3>Message</h3> <p><span class="data">' + message +'</span></p>';
  
    document.getElementById('messages').appendChild(div);
  }

  function getLatest(callback){
    fs.readFile('./info.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
            return
        }
        console.log("read: " + jsonString)
        var json = JSON.parse(jsonString);
        var nums = json.messages;
        callback(nums);
      
    });
  }

