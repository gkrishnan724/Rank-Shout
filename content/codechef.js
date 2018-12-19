//Observes changes in ranklist for codechef and sends details to background

//Refresh Ranklist every minute.



String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

let currentUrl = new URL(window.location.href);

if (currentUrl.searchParams.get('itemsPerPage')!= 100){
    currentUrl.searchParams.set('itemsPerPage','100');
    currentUrl.href = currentUrl.href.replaceAll("+","%20");
    window.location.href = currentUrl.href;
}

setTimeout(sendRankList,3000);
setTimeout(function(){
    window.location.reload();   
},60000);



function sendRankList(){
    let table = Array.from(document.getElementsByClassName('dataTable')[0].childNodes[2].childNodes); //Get all the tr of ranklist
    let ranklist = [];
    let me;
    for(var i=0;i<table.length;i++){
        if(table[i].tagName == 'TR'){
            if(!table[i].children[1]){
                setTimeout(sendRankList,3000);
                return;
            }
            let username = table[i].children[1].children[1].firstChild.children[1].innerText; //Get the username from the tr
            ranklist.push(username);
            if(table[i].className == 'me'){
                me  = username;    
            }
            
        }
    }

    chrome.runtime.sendMessage({ranklist:ranklist,timestamp:Date.now(),url:window.location.href,host:'Codechef',me:me},function(response){
        console.log(response);
    });
}