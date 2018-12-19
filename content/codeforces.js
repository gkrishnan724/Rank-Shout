
setTimeout(sendRankList,3000);

//Reload page every minute

setTimeout(function(){ 
    window.location.reload();   
},60000);

function sendRankList(){
    let me;
    let ranklist = [];
    let table = Array.from(document.getElementsByClassName('standings')[0].firstElementChild.children);
    for(var i=1;i<table.length-1;i++){
        if(table[i].tagName == 'TR'){
            if(!table[i].children[1]){
                setTimeout(sendRankList,3000);
                return;
            }
            //Get the username from the tr
            if(table[i].children[1].children[0].tagName == 'IMG'){
                var username = table[i].children[1].children[1].innerText;
            }
            else{
                var username = table[i].children[1].children[0].innerText;
            }
             
            ranklist.push(username);
            
            if(table[i].className == 'highlighted-row'){
                me  = username;    
            }
            
        }
    }
    chrome.runtime.sendMessage({ranklist:ranklist,timestamp:Date.now(),url:window.location.href,host:'Codeforces',me:me},function(response){
        console.log(response);
    });
}