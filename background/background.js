//Used for sending notifications
let history = {};

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    //chrome.notifications.create({type:'basic',title:'ranklist updated!',iconUrl:chrome.extension.getURL('chef.png'),message:"New ranklist fetched"});
    sendResponse({message:'recieved!!'});
    handleChanges(request);
});

function handleChanges(request){
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
            if(oldobject[user]){
                if(oldobject[user] > newobject[user] && mode == 'ALL'){
                    changes.push({user:user,prev:oldobject[user],new:newobject[user],mode:"rise",host:request.host});
                }
                if(mode == "SINGLE" && me && newobject[user] < newobject[me] && oldobject[me] < oldobject[user]){
                    changes.push({user:user,prev:oldobject[user],new:newobject[user],me:newobject[me],mode:"cross",host:request.host});
                }
            }
            else{
                changes.push({user:user,new:newobject[user],mode:"add",host:request.host});
            }
        });
        oldlist.forEach(function(user){
            if(!newobject[user]){
                changes.push({user:user,mode:"delete",host:request.host});
            }
        });
        history[request.url] = {ranklist:request.ranklist,timestamp:request.timestamp};

    }
    else{
        history[request.url] = {ranklist:request.ranklist,timestamp:request.timestamp};
    };
    
    if(changes.length > 0){
        changes.forEach(function(item){
            let options = {type:'basic'};
            if(item.mode == "rise"){
                let amount = item.prev - item.new;
                options.title = item.host + " - Someone ranked up!"
                options.message = item.user + ' ranked up ' + amount + ' ranks to take up the ' + toString(item.new + 1) + ' position!'; 
            }
            else if(item.mode == "cross"){
                let amount = item.prev - item.new;
                let crossamt = item.me - item.new;
                options.title = item.host + " - Someone Crossed you!"
                options.message = item.user + ' ranked up ' + amount + ' ranks and crossed you by ' + crossamt + ' ranks to take up the ' + toString(item.new + 1) + ' position!';
            }
            else if(item.mode == "add"){
                options.title = item.host + " - New user in ranklist!"
                options.message = item.user + ' just joined the ranklist and took the ' + toString(item.new + 1) + ' position!';
            }
            else if(item.mode == "delete"){
                options.title = item.host + " - User left the ranklist!"
                options.message = item.user + ' just left the ranklist page';
            }

            if(changes.host == 'codechef'){
                options.iconUrl = 'chef.png';
            }
            else if(changes.host == 'codeforces'){
                options.iconUrl = 'forces.png';
            }
            else if(changes.host == 'hackerank'){
                options.iconUrl = 'hackerank.png';
            }
            chrome.notifications.create(options,function(){
                console.log('Notification sent!');
            });
        });

        
    }
}

setInterval(function(){
    console.log(history);
},30000);