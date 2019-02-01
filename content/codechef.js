//Observes changes in ranklist for codechef and sends details to background

let status; //Status for rank-shout enable/disable;
let mode = localStorage.getItem('shoutMode');
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

setTimeout(init,3000);


function init(){
    let currentUrl = new URL(window.location.href);
    
    //Set Items per page to 100
    if (currentUrl.searchParams.get('itemsPerPage')!= 100){
        currentUrl.searchParams.set('itemsPerPage','100');
        currentUrl.href = currentUrl.href.replaceAll("+","%20");
        window.location.href = currentUrl.href;
    }

    //Check if rank-shout option is enabled and if contest is still running
    status = !(document.getElementById('ember354').children[1].innerText == 'Contest Ended'); 
    let parent = document.getElementById('breadcrumb');
    let toggleButton = document.createElement('a'); 
    toggleButton.classList.add("button");
    toggleButton.classList.add("grey");
    if(status){
        toggleButton.innerHTML = '<i class="fa fa-bell"></i>&nbsp;Rank-Shout enabled'
        toggleButton.onclick = function(event){
            status = !status;
            if(status){
                window.location.reload(); 
            }
            else{
                event.srcElement.innerHTML = '<i class="fa fa-bell-slash"></i>&nbsp;Rank-Shout disabled';
                document.getElementsByClassName('topBox')[1].style.display = 'none';
            }
    
        }

        let me = checkMe();
        let formParent = document.getElementsByClassName('topBox')[0];
        let element = document.createElement('div');
        element.classList.add('topBox');
        formParent.insertAdjacentElement("afterend",element);
        if(me){
            element.innerHTML = '<div class="topBox-item"><div class="inputBox"><i class="fa fa-bell"></i>&nbsp;<b>Mode:</b></div></div><div class="topBox-item"><div class="selectBox"><select class="ember-view ember-select select" id="shoutOption"><option value="ALL">Everyone</option><option value="ME">Only Me</option></select></div></div>';
            if(mode){
                document.getElementById('shoutOption').value = mode;
            }
            document.getElementById('shoutOption').onchange = function(event){
                mode = event.target.value;
                localStorage.setItem('shoutMode',mode);
            }
        }
        else{
            element.innerHTML = '<div class="topBox-item"><div class="inputBox"><i class="fa fa-bell"></i>&nbsp;<b>Mode:</b></div></div><div class="topBox-item"><div class="selectBox"><select class="ember-view ember-select select disabled" id="shoutOption" disabled><option value="ALL">Everyone</option><option value="ME">Only Me</option></select></div></div>';
            mode = 'ALL';
            localStorage.setItem('shoutMode','ALL');
        }
       
        //3s Delay
        setTimeout(sendRankList,3000);
    }
    else{
        toggleButton.innerHTML = '<i class="fa fa-bell-slash"></i>&nbsp;Rank-Shout disabled';
        toggleButton.onclick = function(event){
            alert('Rank-Shout: Contest already ended.');
        }
    }
    
    toggleButton.style.cssFloat='right';
    parent.appendChild(toggleButton);
    
}


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
    chrome.runtime.sendMessage({ranklist:ranklist,timestamp:Date.now(),url:window.location.href,host:'Codechef',me:me,mode:mode},function(response){
        console.log(response);
    });
    //Refresh Ranklist every minute.
    setTimeout(function(){
        if(status){
            window.location.reload();
        }   
    },60000);
}

function checkMe(){
    let table = Array.from(document.getElementsByClassName('dataTable')[0].childNodes[2].childNodes); //Get all the tr of ranklist
    let me;
    for(var i=0;i<table.length;i++){
        if(table[i].tagName == 'TR'){
            let username = table[i].children[1].children[1].firstChild.children[1].innerText; //Get the username from the tr
            if(table[i].className == 'me'){
                me  = username;    
                break;
            }
            
        }
    }

    return me;
}

