
//antispam
function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

//voice
let synth;
let voice;

let attempts = 0;
function loadVoices() {
  attempts++;
  const voices = synth.getVoices();
 //console.log(voices);
 var search = 'rasil';
  if (voices.length) {
    //console.log(voices);
    voice = voices.find(x => x.name.indexOf('rasil') !== -1 || x.name.indexOf('razil') !== -1);
  }
  if (!voice) {
    if (attempts < 10) {
      setTimeout(() => {
        loadVoices();
      }, 250);
    } else {
      //console.error(search + ' voice not found.');
    }
  }
}

if ('speechSynthesis' in window) {
  synth = window.speechSynthesis;
  loadVoices();
}

function speak(text) {
  if (!synth || synth.speaking) {
    return;
  }
  // …,..., ___
  const output = text.replace(/(…|[._]{2,})/, '');
  const utterance = new SpeechSynthesisUtterance(output);
  utterance.addEventListener('error', error => console.error(error));
  utterance.lang = 'pt-BR';
  utterance.pitch = 1;
  utterance.rate = 1.1;
  utterance.voice = voice;
  utterance.volume = 1;
  synth.speak(utterance);
  
}

var cooldownUser=[];

function addCooldown(user){
cooldownuser.push(user);
setTimeout(
		function remove() {
			const index = cooldownUser.indexOf(user);
			
			if (index !== -1) {
				cooldownUser.splice(index, 1);
			}
		}, 13000);
}


//chat reader
var limitText=30;
var filtros = /@|kk|hah|chat|wow|mongo|mogo|mega|[^aeiou]+$|^. |stonks|pog|lol|nigga|omg|oide|hau|[^A-Za-z ?éíãõóçêá]|([^rs])(?=\1+)|(rr)(?=r+)|(ss)(?=s+)/gmi;

//var usersliberados=['Reifel'];
var badgeliberados=['Subscriber'];
//no futuro filtrar por sub e mod

var antispamlastmsg="";
document.addEventListener('DOMNodeInserted', function(e) {
    // loop parent nodes from the target to the delegation node
    for (var target = e.target; target && target != this; target = target.parentNode) {
try{
        if (target.matches('div') && target.className == "chat-line__message") {
            var msg = target.innerText;
            if(msg.length > limitText) return;

			var user = msg.substr(0, msg.indexOf(':'));

            try{
			var badge = target.getElementsByClassName("chat-badge")[0].alt;
            //console.log(badge);
			}catch(e){}
			if(/*usersliberados.indexOf(user) == -1 || */badge.indexOf(badgeliberados[0]) == -1) return;
            
			var coremsg = msg.substr(msg.indexOf(':')+2);
            if(coremsg.length > limitText) return;
            msg = coremsg.substr(0, limitText);
            if(msg.length < 3) return;

            if(msg.match(filtros) || msg.indexOf('!')==0 || (msg.length > 10 && msg.indexOf(' ') == -1) ) return;
            
			if(similarity(msg, antispamlastmsg) < 0.5) {
				//speak(user.replace(/[^a-zA-Z0-9]/g," ")+" disse "+msg);
				speak(msg);
                console.log(msg);
				antispamlastmsg = msg;
			}
            break;
        }
    }catch(e){}
    }
}, false);
