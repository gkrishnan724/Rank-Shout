//Observes changes in ranklist for Codeforces and sends details to background

let status; // Check to see if rank-shout is enabled or disabled.

init();


function init(){
    let status = !(document.getElementsByClassName('contest-status').length > 0 && document.getElementsByClassName('contest-status')[0].innerText.indexOf('Final standings') != -1); 
    let parent = document.getElementsByClassName('toggle-show-unofficial')[0];
    let toggleBox = document.createElement('input');
    let toggleLabel = document.createElement('label');
    toggleBox.type='checkbox';
    toggleBox.id='shout';
    toggleBox.name='shout';
    toggleLabel.setAttribute("for","shout");
    toggleLabel.style.cssText = 'position: relative; bottom: 0.4em;';
    toggleLabel.innerHTML='Enable Rank-Shout';
    
    if(status){
        
        toggleBox.checked = true;
        toggleBox.onchange = function(event){
            status = event.srcElement.checked;
            if(status){
                window.location.reload(); 
            }
            
        }
        //Delay of 3s
        setTimeout(sendRankList,3000);
    }
    else{
        
        toggleBox.checked = false;
        toggleBox.disabled = true;
        toggleLabel.innerHTML='<strike>Enable Rank-Shout</strike>';
    }
    
    
    parent.appendChild(toggleBox);
    parent.appendChild(toggleLabel);
}

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
    //Reload Ranklist every minute
    setTimeout(function(){
        if(status){
            window.location.reload();
        }   
    },60000);
}

