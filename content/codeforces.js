//Observes changes in ranklist for Codeforces and sends details to background

let status; // Check to see if rank-shout is enabled or disabled.
let mode = localStorage.getItem('shoutMode');
init();


function init(){
    status = !(document.getElementsByClassName('contest-status').length > 0 && document.getElementsByClassName('contest-status')[0].innerText.indexOf('Final standings') != -1); 
    let initialParent = document.getElementsByClassName('second-level-menu')[0];
    let menu = document.createElement('div');
    menu.innerHTML = '<ul style="display:inline-block;"><li id="shoutBox"></li></ul>'
    menu.style.paddingTop='10px';
    let toggleBox = document.createElement('input');
    let toggleLabel = document.createElement('label');
    toggleBox.type='checkbox';
    toggleBox.id='shout';
    toggleBox.name='shout';
    toggleLabel.setAttribute("for","shout");
    toggleLabel.style.cssText = ';';
    toggleLabel.innerHTML='Enable Rank-Shout';
    initialParent.insertAdjacentElement("afterend",menu);
    let parent = document.getElementById('shoutBox');
    parent.appendChild(toggleBox);
    parent.appendChild(toggleLabel);
    if(status){
        
        toggleBox.checked = true;
        toggleBox.onchange = function(event){
            status = event.srcElement.checked;
            if(status){
                window.location.reload(); 
            }
            else{
                document.getElementById('options').style.display = 'none';
            }
            
        }
        let me = checkMe();
        let shoutOptions = document.createElement('li');
        shoutOptions.id='options';
        if(me){
            shoutOptions.innerHTML = '<label>Shout Mode:&nbsp;</label><select id="shoutOption"><option value="ALL">Everyone</option><option value="ME">Only me</option></select>';
            parent.insertAdjacentElement("afterend",shoutOptions);
            
            document.getElementById('shoutOption').onchange = function(event){
            
                mode = event.target.value;
                localStorage.setItem('shoutMode',mode);
            }
        }
        else{
            shoutOptions.innerHTML = '<label>Shout Mode:&nbsp;</label><select id="shoutOption" disabled><option value="ALL">Everyone</option><option value="ME">Only me</option></select>';
            mode = 'ALL';
            localStorage.setItem('shoutMode',mode);
            parent.insertAdjacentElement("afterend",shoutOptions);
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
    chrome.runtime.sendMessage({ranklist:ranklist,timestamp:Date.now(),url:window.location.href,host:'Codeforces',me:me,mode:mode},function(response){
        console.log(response);
    });
    console.log('set timeout sent');
    //Reload Ranklist every minute
    setTimeout(function(){
        if(status){
            window.location.reload();
        }   
    },60000);
}

function checkMe(){
    let me;
    
    let table = Array.from(document.getElementsByClassName('standings')[0].firstElementChild.children);
    for(var i=1;i<table.length-1;i++){
        if(table[i].tagName == 'TR'){
            
            //Get the username from the tr
            if(table[i].children[1].children[0].tagName == 'IMG'){
                var username = table[i].children[1].children[1].innerText;
            }
            else{
                var username = table[i].children[1].children[0].innerText;
            }
             
            
            
            if(table[i].className == 'highlighted-row'){
                me  = username;
                break;    
            }
            
        }
        
    }
    return me;
}

