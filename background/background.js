//Used for sending notifications
let history = {}; //Object to store history for every ranklists.
let hostToIcon = { // Map to maintain icon url for each platform.
    "Codechef":"chef.png",
    "Codeforces":"forces.png"
}
console.log(hostToIcon["Codechef"]);
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    // chrome.notifications.create({type:'basic',title:'ranklist updated!',iconUrl:"../chef.png",message:"New ranklist fetched",type:'basic'});
    sendResponse({message:'recieved!!'});
    handleChanges(request);
});

function handleChanges(request){

    let hostNotificationCounts = { //List to keep type of notifications for each platform.
        "Codechef":{"rise":0,"cross":0,"add":0,"delete":0,"change":false},
        "Codeforces":{"rise":0,"cross":0,"add":0,"delete":0,"change":false}
    }

    var changes = [];
    var me = request.me;
    let mode = request.mode?request.mode:"ALL";
    if(history[request.url]){
        //History exists for the url.
        let oldlist = history[request.url].ranklist;
        let newlist = request.ranklist;
        let oldobject = {}
        let newobject = {}
        oldlist.forEach(function(user,index){
            oldobject[user] = index;
        });
        newlist.forEach(function(user,index){
            newobject[user] = index;
        });
        newlist.forEach(function(user,index){
            if(oldobject[user] != undefined){
                if(oldobject[user] > newobject[user] && mode == 'ALL'){
                    changes.push({user:user,prev:oldobject[user],new:newobject[user],mode:"rise",host:request.host});
                }
                if(me && newobject[user] < newobject[me] && oldobject[me] < oldobject[user]){
                    changes.push({user:user,prev:oldobject[user],new:newobject[user],me:newobject[me],mode:"cross",host:request.host});
                }
            }
            else{
                if(mode == 'ALL'){
                    changes.push({user:user,new:newobject[user],mode:"add",host:request.host});
                }
            }
        });
        if(mode == 'ALL'){
            oldlist.forEach(function(user){
                if(newobject[user] == undefined){
                    changes.push({user:user,mode:"delete",host:request.host});
                }
            });
        }
        history[request.url] = {ranklist:request.ranklist,timestamp:request.timestamp};

    }
    else{
        history[request.url] = {ranklist:request.ranklist,timestamp:request.timestamp};
    };
    
    if(changes.length > 0){
        
        changes.forEach(function(item,index){
            let options = {type:'basic'};
            if(item.mode == "rise"){
                
                let amount = item.prev - item.new;
                options.title = item.host + " - Someone ranked up!"
                options.message = item.user + ' ranked up ' + amount + ' ranks to take up the ' + parseInt(item.new + 1) + ' position!'; 
            }
            else if(item.mode == "cross"){
                let amount = item.prev - item.new;
                let crossamt = item.me - item.new;
                options.title = item.host + " - Someone Crossed you!"
                options.message = item.user + ' ranked up ' + amount + ' ranks and crossed you by ' + crossamt + ' ranks to take up the ' + toString(item.new + 1) + ' position!';
            }
            else if(item.mode == "add"){
                options.title = item.host + " - New user in ranklist!"
                options.message = item.user + ' just joined the ranklist and took the ' + parseInt(item.new + 1) + ' position!';
            }
            else if(item.mode == "delete"){
                options.title = item.host + " - User left the ranklist!"
                options.message = item.user + ' just left the ranklist page';
            }
            //Increment no of notifications for the particular type and particular platform
            hostNotificationCounts[item.host][item.mode] += 1;
            //Indicating that there is a change in the ranklist
            hostNotificationCounts[item.host]["change"] = true; 
            //Set Icon for notification
            options.iconUrl = hostToIcon[item.host];
            

            //Seperate notification for each change if total notifications <= 5
            if(changes.length <= 5){
                setTimeout(function(){
                    //1 Second pause for each notification.
                    chrome.notifications.create(options,function(){
                        console.log('Notification sent!');
                    });
                },index*1000);
            }
            
        });

        //If more than 5 notifications at a time then print summary for each platform instead.
        if(changes.length > 5){
            let index = 0
            for(let item in hostNotificationCounts){
                let options;
                //If there are changes in the host
                let host = hostNotificationCounts[item];
                if(host["change"]){
                    if(mode == "ALL"){
                        let message = [];
                        //Find out the changes
                        for(var key in host){
                            if(host[key] > 0){
                                if(key == "add"){
                                    message.push("New users: "+host["add"])
                                }
                                else if(key == "delete"){
                                    message.push("users gone: "+host["delete"])
                                }
                                else if(key == "cross"){
                                    message.push("people crossed you: "+host["cross"])
                                }
                                else if(key == "rise"){
                                    message.push("users who climbed ranks: "+host["rise"]);
                                }
                            }
                        }
                        options = {
                            "title": item + "- Change Summary",
                            "message": message.toString(),
                            "type":"basic"
                        }
                    }
                    else{
                        //Only me
                        options = {
                            "title": item + "- Change Summary",
                            "message":" people crossed you: "+host["cross"],
                            "type":"basic"
                        }
                    }
                    options.iconUrl = hostToIcon[item];
                    setTimeout(function(){
                        chrome.notifications.create(options,function(){
                            console.log("Notification sent!");
                        })
                    },index*1000);

                    index += 1;
                }
            }
        }
    }
}



//Print History every 30s.
setInterval(function(){
    console.log(history);
},30000);