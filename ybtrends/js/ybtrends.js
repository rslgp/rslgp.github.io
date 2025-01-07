	const queryURL='https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=50&key=AIzaSyCJNSpfg5WN5fACDfL6gdUibtc7rCtvJuI&fields=items(id%2Csnippet(title%2CchannelId%2CpublishedAt%2CcategoryId)%2Cstatistics(dislikeCount%2ClikeCount%2CviewCount))';														
	//detect error http://jshint.com/
	
	const iframe = document.getElementById('videoPip');
	
	const nomePaisLineInicio = '<br><br><br>--------------------------------------- <b style="font-size: 16px; font-family: Helvetica Neue,Helvetica,Arial,sans-serif; ">';
	const nomePaisLineFim = '</b> ------------------------------------------------<br><br>';
	
	const worldwideLine = '--------------------------------------- <b style="font-size: 16px; font-family: Helvetica Neue,Helvetica,Arial,sans-serif; "> Worldwide'+nomePaisLineFim;
	
	const outputResultado = document.getElementById("resultado");
	
	var videos=[];
	
	var indice;
	
	var backupID=[];
	var backupMostViewID=[];
	//var backupTitle="";
	
	var resultadoTextHTML="";
	

	var frequenciaPais = {};
	function addFrequencyCountry(key){
		if(frequenciaPais[key]){
			frequenciaPais[key]+=1;
		}else{
			frequenciaPais[key]=1;
		}
	}


	var dictVideoToPais = {};
	function addRepeatCountry(key, pais){
		if(dictVideoToPais[key]){
			dictVideoToPais[key]+=", "+pais;
		}else{
			dictVideoToPais[key]=pais;
		}
	}
	
	//const paisAtual="Worldwide";
	
	

	//v0 all
	//const codigoPais=['AE', 'AR', 'AT', 'AU', 'AZ', 'BA', 'BR', 'BE', 'BG', 'BH', 'BY', 'CA', 'CH', 'CL', 'CO', 'CZ', 'DE', 'DK', 'DZ', 'EE', 'EG', 'ES', 'FI', 'FR', 'GB', 'GE', 'GH', 'GR', 'HK', 'HR', 'HU', 'ID', 'IE', 'IL', 'IN', 'IQ', 'IS', 'IT', 'JO', 'JP', 'KE', 'KR', 'KW', 'KZ', 'LB', 'LK', 'LT', 'LU', 'LV', 'LY', 'MA', 'ME', 'MK', 'MX', 'MY', 'NG', 'NL', 'NO', 'NP', 'NZ', 'OM', 'PE', 'PH', 'PK', 'PL', 'PR', 'PT', 'QA', 'RO', 'RS', 'RU', 'SA', 'SE', 'SG', 'SI', 'SK', 'SN', 'TH', 'TN', 'TR', 'TW', 'TZ', 'UA', 'UG', 'US', 'VN', 'YE', 'ZA', 'ZW'];
	
	//v1
	//const codigoPais=['AE', 'AR', 'AT', 'AU', 'AZ', 'BA', 'BR', 'BG', 'BH', 'BY', 'CA', 'CH', 'CL', 'CO', 'CZ', 'DE', 'DK', 'DZ', 'EE', 'EG', 'ES', 'FI', 'FR', 'GE', 'GH', 'GR', 'HK', 'HR', 'HU', 'IE', 'IL', 'IN', 'IQ', 'IS', 'IT', 'JO', 'JP', 'KE', 'KR', 'KW', 'KZ', 'LB', 'LK', 'LT', 'LU', 'LV', 'LY', 'MA', 'ME', 'MK', 'MY', 'NG', 'NL', 'NO', 'NP', 'NZ', 'OM', 'PE', 'PH', 'PK', 'PL', 'PR', 'PT', 'QA', 'RO', 'RS', 'RU', 'SE', 'SG', 'SI', 'SK', 'SN', 'TH', 'TN', 'TR', 'TW', 'TZ', 'UG', 'US', 'VN', 'YE', 'ZA', 'ZW'];
	
	//v3 67
	//const codigoPais=['AE', 'AR', 'AT', 'AU', 'AZ', 'BR', 'BE', 'BG', 'BH', 'BY', 'CA', 'CH', 'CL', 'CO', 'DE', 'DK', 'DZ', 'EG', 'ES', 'FI', 'FR', 'GB', 'GR', 'HK', 'HR', 'HU', 'ID', 'IE', 'IL', 'IN', 'IQ', 'IS', 'IT', 'JO', 'JP', 'KR', 'KW', 'KZ', 'LK', 'LT', 'LU', 'LV', 'MA', 'ME', 'MX', 'MY', 'NG', 'NL', 'NO', 'NZ', 'OM', 'PE', 'PH', 'PL', 'PR', 'PT', 'RU', 'SE', 'SI', 'TH', 'TN', 'TW', 'TZ', 'UA', 'UG', 'VN', 'YE'];
	
	//v4 53
	//const codigoPais=['AR', 'AT', 'AU', 'AZ', 'BR', 'BE', 'BG', 'BH', 'BY', 'CA', 'CH', 'CL', 'CO', 'DE', 'DZ', 'EG', 'FI', 'FR', 'GB', 'GE', 'HK', 'ID', 'IE', 'IL', 'IQ', 'IS', 'IT', 'JP', 'KE', 'KR', 'KW', 'LB', 'LK', 'MA', 'NO', 'NP', 'NZ', 'PE', 'PH', 'PL', 'PR', 'PT', 'RU', 'SA', 'SE', 'TW', 'UA', 'UG', 'VN', 'YE'];	
	
	//v5 44 -> min 6 videos russia + france - usa
	const codigoPais=['AE', 'AR', 'AT', 'AU', 'BA', 'BR', 'BE', 'BH', 'BY', 'CA', 'CL', 'CO', 'DK', 'DZ', 'EG', 'ES', 'FR', 'GB', 'ID', 'IQ', 'IT', 'JO', 'JP', 'KZ', 'LU', 'LY', 'MX', 'PE', 'PH', 'PK', 'PL', 'PR', 'PT', 'RU', 'SN', 'TH', 'TR', 'TZ', 'UA', 'VN', 'YE', 'ZA', 'ZW'];
	
	const tamanhoCodigoPais = codigoPais.length;
	//const codigoPais=['AE', 'BR'];
	
	var coletados=0;
	
	function nFormatter(num, digits) {
	  var si = [
		{ value: 1E18, symbol: "E" },
		{ value: 1E15, symbol: "P" },
		{ value: 1E12, symbol: "T" },
		{ value: 1E9,  symbol: "G" },
		{ value: 1E6,  symbol: "M" },
		{ value: 1E3,  symbol: "k" }
	  ], i;
	  for (i = 0; i < si.length; i++) {
		if (num >= si[i].value) {
		  return (num / si[i].value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[i].symbol;
		}
	  }
	  return num.toString();
	}
	
//cookie
function setCookieData() {
	var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
	currentDate.setHours(0);
	currentDate.setMinutes(0);
	currentDate.setSeconds(0);
	var hoje = currentDate.getDate()-1;
    var expires = "expires="+currentDate;
    document.cookie = "diaAcessou="+hoje+"; "+expires;
}


function setCookie(cname,cvalue) {
	var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
	currentDate.setHours(0);
	currentDate.setMinutes(0);
	currentDate.setSeconds(0);
    var expires = "expires="+currentDate;
    document.cookie = cname+"="+cvalue+"; "+expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
	
	//thumb http://img.youtube.com/vi/<insert-youtube-video-id-here>/0.jpg

	function onlyUnique(value, index, self) { 
		return self.indexOf(value) === index;
	}
	
	function changeVideo(idYoutube){//&vq=large 480 &vq=medium 360
	
		var caixaBox = $(".box");
		var pipVideo = $('.video');
		var botaoOpen = $(".button-open");
		botaoOpen.hide();
		pipVideo.attr('style', 'box-shadow: 0 2px 10px rgba(0,0,0,0.3)');
		caixaBox.show();        
		if ($(this).attr("class") == "button-open")
		{
		  botaoOpen.hide();
		}
		
		iframe.src='https://www.youtube.com/embed/'+idYoutube+'?autoplay=1&rel=0&vq=large&modestbranding=1&iv_load_policy=3';//&autohide=1
		iframe.play();
		//alert("!"+idYoutube+"!");
	}

    
	
function getBackup() {

	//var idBruto = getCookie('backupID');
	var idBruto = getCookie('bkViewID');
	//var TitleBruto =getCookie('backupTitle');

	var idMaior = idBruto.split('|');
	var idArray;
	//var TitleArray = TitleBruto.split('|');
	var dadosBackup="";
	
	var j=0;
	var tamMax=idMaior.length;
	for(var i in idMaior){
		if(j<tamMax-2){			
			idArray = idMaior[j].split('+');
			thumbURL = 'https://i.ytimg.com/vi/'+idArray[1]+'/default.jpg';
			dadosBackup += '<img style="cursor:pointer" onClick="changeVideo('+"'"+idArray[1]+"'"+')" src="'+thumbURL+'" width="136px" height="80px"> <a style="cursor:pointer" onClick="changeVideo('+"'"+idArray[1]+"'"+')" >( '+nFormatter(idArray[0])+' ) no-space </a><br><br>';
			j+=2;
		}
	}
	
	outputResultado.innerHTML = "<br>daily search has already been made, here the today top trends in order:<br><br>"+dadosBackup;
}

function stringToBytes ( str ) {
  var ch, st, re = [];
  for (var i = 0; i < str.length; i++ ) {
    ch = str.charCodeAt(i);  // get char 
    st = [];                 // set up "stack"
    do {
      st.push( ch & 0xFF );  // push byte to stack
      ch = ch >> 8;          // shift value down by 1 byte
    }  
    while ( ch );
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat( st.reverse() );
  }
  // return an array of bytes
  return re;
}

//const maxChunk = 332;
const maxChunk = 180;


function getMaxChunck(array){
		array = array.filter( onlyUnique );
		var tamanho = array.length;
		if(tamanho>maxChunk) array = array.slice(0,maxChunk);
		else array = array.slice(0,tamanho);
		
		
		return array;
	
}

function getTextoPadraoVideo(id,thumbURL,title,views,approvalRating){//,channelId
	return '<p class="itemVideo"><img style="cursor:pointer" onClick="changeVideo('+"'"+id+"'"+')" src="'+thumbURL+'" width="136px" height="80px"> <a dir="ltr" id="'+id+'" style="cursor:pointer;" onClick="changeVideo('+"'"+id+"'"+')" >'+title+'</a> <button class="translate button" title="translate title" onClick="doGet('+"'"+title+"','"+id+"'"+')"></button> '+approvalRating+'% likes ( '+views+' views )<button class="save button" onClick="saveVideo('+"'"+id+"'"+')"></button></p>';//+" - channel:"+channelId
}

var trendsDataInOrder;
function saveInOrderTrends(){
	
	trendsDataInOrder = trendsDataInOrder.filter( onlyUnique );
	//trendsDataInOrder = getMaxChunck(trendsDataInOrder);
	//var array = trendsDataInOrder.join('|');
	//array = array.split('|');
	var array = trendsDataInOrder;
	array.sort(function(a, b){return b.split('+')[0]-a.split('+')[0];});
	
	var topTrends="";	
	var idArray;
	for(var i in array){	
		idArray = array[i].split('+');
		thumbURL = 'https://i.ytimg.com/vi/'+idArray[1]+'/default.jpg';
		topTrends += getTextoPadraoVideo(idArray[1],thumbURL,idArray[2],nFormatter(idArray[0]),idArray[3]);//,idArray[4]
	}
	trendsDataInOrder= array;
	localStorage.setItem("todayTrendsInOrder", topTrends);
	//setCookie('bkViewID',backupMostViewID);
	//setCookie('backupTitle',backupTitle);
	//setCookieData();
}

function getOnlyInOrderTrends(){
	outputResultado.innerHTML = localStorage.getItem("todayTrendsInOrder");
}
function getLocalData(){
	outputResultado.innerHTML = localStorage.getItem("todayTrends");
}
	function saveCookies(){
		
		//var idArray = backupID.split('|');
		
		//backupID = getMaxChunck(backupID);		
		
		backupMostViewID = getMaxChunck(backupMostViewID);
		backupMostViewID.sort(function(a, b){return b.split('+')[0]-a.split('+')[0]});
		backupMostViewID = backupMostViewID.join('|');
		
		//setCookie('backupID',backupID);
		setCookie('bkViewID',backupMostViewID);
		alert(stringToBytes(backupMostViewID).length);
		//setCookie('backupTitle',backupTitle);
		setCookieData(); 
	}
	function pad(num, size) {
		var s = "000000000" + num;
		return s.substr(s.length-size);
	}
const minViews = 500000;	
var viewCookie;

const dataA = new Date().toJSON();
const a = dataA.substring(dataA.indexOf("-"));
const dia1 = a.substring(a.lastIndexOf("-")+1,a.indexOf("T")), mes1 = a.substring(a.indexOf("-")+1,a.lastIndexOf("-"));
const date1 = new Date(mes1+"/"+dia1+"/2016");
const timeToday = date1.getTime();

function days_between( b ) {//hoje, video
var dia2,mes2,date2,timeDiff,diffDays;
	b=b.substring(b.indexOf("-"));
	
	var inicio=b.lastIndexOf("-")+1, fim=b.indexOf("T");
	dia2=b.substring(inicio,fim);
	mes2=b.substring(b.indexOf("-")+1,inicio-1);
		
	date2 = new Date(mes2+"/"+dia2+"/2016");
	timeDiff = Math.abs(date2.getTime() - timeToday);
	diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	return diffDays;
}

	function padraoColetarDados(queryResult, indiceLocal, nomePais){
		
		videos[indiceLocal++] = nomePaisLineInicio + nomePais + nomePaisLineFim;
		
		var musica = "";
		var title,channelId,publishedAt,videoCategoryId,dias,titleTranslate,thumbURL,id,views,dados,ratingsTotal=0,approvalRating=0,dislike=0, episodioJaponeis="t"+String.fromCharCode(7853)+"p", episodioTurco="b"+String.fromCharCode(246)+"l"+String.fromCharCode(252)+"m", minusculo;
		for(var resultAtual in queryResult){
			id=queryResult[resultAtual].id;
			title = queryResult[resultAtual].snippet.title;
			channelId = queryResult[resultAtual].snippet.channelId;
			publishedAt = queryResult[resultAtual].snippet.publishedAt;
			videoCategoryId = queryResult[resultAtual].snippet.categoryId;
			thumbURL = 'https://i.ytimg.com/vi/'+id+'/default.jpg';
			try{
				views = queryResult[resultAtual].statistics.viewCount;
				likes = parseInt(queryResult[resultAtual].statistics.likeCount);
				dislike = parseInt(queryResult[resultAtual].statistics.dislikeCount);
				ratingsTotal = (likes*1 + dislike*1);
				approvalRating = Math.round((likes*100)/ratingsTotal);
			}catch(e){
				views=minViews+1;
				approvalRating=71;
			   //console.log("esse video http://youtu.be/"+id+" nao possui statistics");
			}
			
			title = replaceAll(title,"|",'-');//filtro title
			minusculo=title.toLowerCase();
			dias=days_between(publishedAt);
			
			if(  /*dias < 7 &&*/ views >= minViews && approvalRating >= 70 && ( ( minusculo ).match(/(?:minecraft|roblox|toy|peppa|clash|fifa |copa|football|ighlights|Krappi|goal|onaldo|episode|الحلقه|phần|لحلقة|ficial|music|clip|teaser|trailer|movie|song)/) == null ) && ( minusculo.indexOf(episodioJaponeis)==-1 ) && ( minusculo.indexOf(episodioTurco)==-1 ) && ( ( channelId ).match(/(?:UC-SV8-bUJfXjrRMnp7F8Wzw|UCtinbF-Q-fVthA0qrFQTgXQ|UCD1Em4q90ZUK2R5HKesszJg|UC-lHJZR3Gqxm24_Vd_AJ5Yw)/) == null ) ){ //banir roman caley clashclans pewdiepie
			//if(  /*dias < 7 &&*/ views >= minViews && approvalRating >= 70 && ( ( minusculo ).match(/(?:minecraft|roblox|toy|peppa|clash|fifa |copa|football|ighlights|Krappi|goal|onaldo|episode|الحلقه|phần|لحلقة|teaser|trailer|movie|song)/) == null ) && ( minusculo.indexOf(episodioJaponeis)==-1 ) && ( minusculo.indexOf(episodioTurco)==-1 ) && ( ( channelId ).match(/(?:UC-SV8-bUJfXjrRMnp7F8Wzw|UCtinbF-Q-fVthA0qrFQTgXQ|UCD1Em4q90ZUK2R5HKesszJg|UC-lHJZR3Gqxm24_Vd_AJ5Yw)/) == null ) ){ //banir roman caley clashclans pewdiepie
				titleTranslate=replaceAll(title,'#','');
				titleTranslate=replaceAll(titleTranslate,'"','');
				titleTranslate=replaceAll(titleTranslate,':','');
				titleTranslate=replaceAll(titleTranslate,"'",'');
				titleTranslate=replaceAll(titleTranslate,'\/','');
				titleTranslate=replaceAll(titleTranslate,'\\','');
				
				
				//dados = '<img style="cursor:pointer" onClick="changeVideo('+"'"+id+"'"+')" src="'+thumbURL+'" width="136px" height="80px"> <a id="'+id+'" style="cursor:pointer;" onClick="changeVideo('+"'"+id+"'"+')" >'+title+'</a> <button class="translate button" title="translate title" onClick="doGet('+"'"+replaceAll(title,'#','')+"','"+id+"'"+')"></button> ( '+nFormatter(views)+' views )<br><br>';
				addRepeatCountry(id,nomePais);
				addFrequencyCountry(nomePais);
				
				if(videoCategoryId==10) {
					if(approvalRating<95) continue;
					musica=".mp3| ";
					
				}
				else musica = "";
				titleTranslate=musica+titleTranslate;
				dados = getTextoPadraoVideo(id,thumbURL,titleTranslate,nFormatter(views),approvalRating);	//,channelId
				backupID[indiceLocal]=id+"|";
				//viewCookie=views/100000;
				viewCookie=views+"";
				viewCookie=pad(viewCookie, 10);
				
				viewCookie = replaceAll(viewCookie,'.','');
				//backupMostViewID[indiceLocal]=viewCookie+"+"+id+"|"; //usado no cookie
				backupMostViewID[indiceLocal]=viewCookie+"+"+id+"+"+titleTranslate+"+"+approvalRating+"+"+channelId;//usado no local
				videos[indiceLocal++] = dados;
			
				//backupTitle+=title+"|";
			}
			//outputResultado.innerHTML += dados;
		}
		
		if(indice == indiceLocal-1){
			indiceLocal--;
		}		
		
		indice = indiceLocal;
		
		//progress bar
		atualizarBarra( 99/codigoPais.length );		
		atualizarBarraDoing("loading the videos countries... "+(coletados+1)+"/ "+codigoPais.length);
		//console.log(nomePais);
	}
	
	function removerElemento(id){
				var elemento = document.getElementById(id);
				if(elemento!=null)elemento.parentNode.removeChild(elemento); 
		
	}
	
	function getVideoId(videosElement){
		return videosElement.substring(videosElement.indexOf("('")+2,videosElement.indexOf("')"));		
	}
	function exibirResultados(){
		
			videos[0]='';
			
			atualizarBarraDoing("complete");
			
			//atualizarBarraDoing("removing duplicate videos between the "+videos.length+" videos...");
			videos = videos.filter( onlyUnique );		
						
			for(var videoAtual in videos)
				resultadoTextHTML += videos[videoAtual];
			 
			outputResultado.innerHTML = worldwideLine + resultadoTextHTML;
			
			
			setTimeout(function(){ 
				removerElemento('progressTable');
			
			}, 3000);
						
			removerElemento('loadingStuck');
			
			salvarTudo();
			
	}
	
	function salvarTudo(){
		
			localStorage.setItem("diaAcessou", new Date(new Date().getTime()).getDate());
			trendsDataInOrder = backupMostViewID;
			saveInOrderTrends();
			// Store
			localStorage.setItem("todayTrends", resultadoTextHTML);	
			localStorage.setItem("dict", JSON.stringify(dictVideoToPais));
	}
	
	function coletarDadosPais(response, nomePais){
		
		var queryResult = response.items;
		
		var indiceLocal=indice;
		if(++coletados==tamanhoCodigoPais)exibirResultados();
		padraoColetarDados(queryResult, indiceLocal, nomePais);
		//console.log("carregou: "+nomePais);		
		//coletados++;
		//faltou3= (coletados==tamanhoCodigoPais-3);
		//if(coletados==tamanhoCodigoPais  /*|| faltou3*/ ){
		//	exibirResultados();		
					
			
			//saveCookies();
						
			//setCookieData();	
			//salvar dia de acesso
			
			
			
		//}
	//alert(indice);
	}
	
/* 	function doTimeout(indicePaisAtual,codigoPais){	
	console.log(indicePaisAtual);
		atualizarBarraDoing("loading the videos countries...");
			setTimeout(
				function() {
					//paisAtual = codigoPais[indicePaisAtual];
					$.get(queryURL+'&callback=coletarDadosPais'+codigoPais[indicePaisAtual]+'&regionCode='+codigoPais[indicePaisAtual]);
					}, 
				10);
	} */
	
	var indiceLoop = 0, delayLoopMS=30;
	function delayedFor(){
		setTimeout(
			function() {
				atualizarBarraDoing("loading the videos countries...");
				//paisAtual = codigoPais[indicePaisAtual];
				$.get(queryURL+'&callback=coletarDadosPais'+codigoPais[indiceLoop]+'&regionCode='+codigoPais[indiceLoop]);
				indiceLoop++;
				if(indiceLoop<tamanhoCodigoPais) delayedFor();
			}
		,delayLoopMS);
	}
	
	
	function generate(response){//alert(0);
	
		indice=0;
		
		var indiceLocal = indice;
		
		var queryResult = response.items;
		
		//worldwide
		padraoColetarDados(queryResult, indiceLocal, "Worldwide");
		//for(var indicePaisAtual in codigoPais)
		//	doTimeout(indicePaisAtual,codigoPais);
	
		delayedFor();
		
		/*
		videos = videos.filter( onlyUnique );			
		
		for(var videoAtual in videos)
			outputResultado.innerHTML += videos[videoAtual];
			
		saveCookies(); 
		*/
	}
	
	function search(){
		//for(var codigo in codigoPais)
		var hoje = new Date(new Date().getTime());
		if(localStorage.getItem('diaAcessou')!=hoje.getDate()){
			$.get(queryURL+'&callback=generate');
		}
		else{	
			//getBackup();
		// Retrieve		
			removerElemento('loadingStuck');	
			removerElemento('progressTable');
			outputResultado.innerHTML = worldwideLine + localStorage.getItem("todayTrends");
			dictVideoToPais = JSON.parse(localStorage.getItem("dict"));//str to array associativo
		}
	
	}

/*google translate*/		 
/* Written by Amit Agarwal */
/* web: ctrlq.org          */
  
  const targetLang = 'en'; 
  var sourceLang = 'auto'; 
  var sourceText;
  var respondeu =0;
  var traducao;
  var result;
function doAjax(link){
	$.ajax({
		url: link,
		type: 'GET',
		async: false,
		success: function(res) {
			//var text = res.responseText;
			// then you can manipulate your text as you wish
			//alert(text);

			//return text;
		},
		complete: function(res){
			//alert("completei");
			//alert(res.responseText);			
			  result = JSON.parse( replaceAll( replaceAll(res.responseText,",,,",","), ",,","," ) );
			  //var result = jQuery.parseJSON(respostaTexto);
			  
			  translatedText = result[0][0][0];
			  
			  traducao = translatedText;
			  respondeu=1;
			  //alert(translatedText);
		},
		timeout: 3000
	});
}
 	
function doGet(e,id) {
if(e.length>0){
	respondeu=0;
 
  sourceText = e;
  
  /* Option 1 */
  
  //var translatedText = LanguageApp.translate(sourceText, sourceLang, targetLang);
  var url;
  /* Option 2 */  
  /*
  if(isJapanese(sourceText)!=null){
	url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" 
            + 'ja' + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
  }else{ 
*/  
	url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" 
            + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
  //}
  
  
  doAjax(url);
  
  while(respondeu==0){
  
  }
  document.getElementById(id).innerHTML= traducao;
  }
}

var listaLinks='';
function saveVideo(videoId){
	listaLinks+="id:"+videoId+" countries:"+dictVideoToPais[videoId]+" \\ ";
}
function resetSaved(){
	listaLinks="";	
	mostrarLinksSalvos();
}
function permanentSave(){
	var old = localStorage.getItem("save");
	if(old!=null){
	localStorage.setItem("save",listaLinks+"\\"+old);		
	}else{
	localStorage.setItem("save",listaLinks);
		
	}
}
function resetPermanentSave(){
	localStorage.removeItem("save");
}
function loadPermanentSave(){
	listaLinks=localStorage.getItem("save");
	mostrarLinksSalvos();
}
function mostrarLinksSalvos(){
	var tamanhoLista = listaLinks.length;
	outputResultado.innerHTML= '<input onClick="setSelectionRange(0, 9999);document.execCommand('+"'copy'"+');" style="width:100%" value="'+listaLinks+'" />';
	outputResultado.innerHTML+= '<button onClick="resetSaved()">reset saved</button>';
	outputResultado.innerHTML+= '<button onClick="permanentSave()">permanent save</button>';
	outputResultado.innerHTML+= '<button onClick="loadPermanentSave()">load permanent save</button>';
	outputResultado.innerHTML+= '<button onClick="resetPermanentSave()">reset permanent save</button>';
	outputResultado.selectionStart = 0;
	outputResultado.selectionEnd = tamanhoLista;
}

function getSortedKeys(obj) {
    var tuples = [];

	for (var key in obj) tuples.push([key, obj[key]]);

	tuples.sort(function(a, b) {
	    a = a[1];
	    b = b[1];

	    return a < b ? -1 : (a > b ? 1 : 0);
	});

	return tuples;
}

var sorteouStats=0;
function mostrarStatistic(){
	var conteudoFrequencia="";
	if(sorteouStats==0){
		frequenciaPais = getSortedKeys(frequenciaPais);
		sorteouStats=1;
	}

	for(var i=frequenciaPais.length - 1; i>=0; i--){
		conteudoFrequencia+=frequenciaPais[i][0]+": "+frequenciaPais[i][1]+"<br><br>";
	}
	outputResultado.innerHTML= conteudoFrequencia;
}

var hideMusic=false;
function toggleMusic(){
	hideMusic = !hideMusic;
	for(var i of document.getElementsByTagName("a")){if(i.text.indexOf(".mp3|")!=-1){i.parentElement.hidden=hideMusic;}}
}

function pageScroll() {
  window.scrollBy(0, 1.9995); // horizontal and vertical scroll increments
  scrolldelay = setTimeout('pageScroll()', 39); // scrolls every 100 milliseconds
}

function pageScrollStop() {  
    clearTimeout(scrolldelay);
}


//especificar pais resposta
function coletarDadosPaisAE(response){ coletarDadosPais(response, "United Arab Emirates"); }
function coletarDadosPaisAR(response){ coletarDadosPais(response, "Argentina"); }
function coletarDadosPaisAT(response){ coletarDadosPais(response, "Austria"); }
function coletarDadosPaisAU(response){ coletarDadosPais(response, "Australia"); }
function coletarDadosPaisAZ(response){ coletarDadosPais(response, "Azerbaijan"); }
function coletarDadosPaisBA(response){ coletarDadosPais(response, "Bosnia And Herzegovina"); }
function coletarDadosPaisBR(response){ coletarDadosPais(response, "Brazil"); }
function coletarDadosPaisBE(response){ coletarDadosPais(response, "Belgium"); }
function coletarDadosPaisBG(response){ coletarDadosPais(response, "Bulgaria"); }
function coletarDadosPaisBH(response){ coletarDadosPais(response, "Bahrain"); }
function coletarDadosPaisBY(response){ coletarDadosPais(response, "Belarus"); }
function coletarDadosPaisCA(response){ coletarDadosPais(response, "Canada"); }
function coletarDadosPaisCH(response){ coletarDadosPais(response, "Switzerland"); }
function coletarDadosPaisCL(response){ coletarDadosPais(response, "Chile"); }
function coletarDadosPaisCO(response){ coletarDadosPais(response, "Colombia"); }
function coletarDadosPaisCZ(response){ coletarDadosPais(response, "Czech Republic"); }
function coletarDadosPaisDE(response){ coletarDadosPais(response, "Germany"); }
function coletarDadosPaisDK(response){ coletarDadosPais(response, "Denmark"); }
function coletarDadosPaisDZ(response){ coletarDadosPais(response, "Algeria"); }
function coletarDadosPaisEE(response){ coletarDadosPais(response, "Estonia"); }
function coletarDadosPaisEG(response){ coletarDadosPais(response, "Egypt"); }
function coletarDadosPaisES(response){ coletarDadosPais(response, "Spain"); }
function coletarDadosPaisFI(response){ coletarDadosPais(response, "Finland"); }
function coletarDadosPaisFR(response){ coletarDadosPais(response, "France"); }
function coletarDadosPaisGB(response){ coletarDadosPais(response, "United Kingdom"); }
function coletarDadosPaisGE(response){ coletarDadosPais(response, "Georgia"); }
function coletarDadosPaisGH(response){ coletarDadosPais(response, "Ghana"); }
function coletarDadosPaisGR(response){ coletarDadosPais(response, "Greece"); }
function coletarDadosPaisHK(response){ coletarDadosPais(response, "Hong Kong"); }
function coletarDadosPaisHR(response){ coletarDadosPais(response, "Croatia"); }
function coletarDadosPaisHU(response){ coletarDadosPais(response, "Hungary"); }
function coletarDadosPaisID(response){ coletarDadosPais(response, "Indonesia"); }
function coletarDadosPaisIE(response){ coletarDadosPais(response, "Ireland"); }
function coletarDadosPaisIL(response){ coletarDadosPais(response, "Israel"); }
function coletarDadosPaisIN(response){ coletarDadosPais(response, "India"); }
function coletarDadosPaisIQ(response){ coletarDadosPais(response, "Iraq"); }
function coletarDadosPaisIS(response){ coletarDadosPais(response, "Iceland"); }
function coletarDadosPaisIT(response){ coletarDadosPais(response, "Italy"); }
function coletarDadosPaisJO(response){ coletarDadosPais(response, "Jordan"); }
function coletarDadosPaisJP(response){ coletarDadosPais(response, "Japan"); }
function coletarDadosPaisKE(response){ coletarDadosPais(response, "Kenya"); }
function coletarDadosPaisKR(response){ coletarDadosPais(response, "Korea"); }
function coletarDadosPaisKW(response){ coletarDadosPais(response, "Kuwait"); }
function coletarDadosPaisKZ(response){ coletarDadosPais(response, "Kazakhstan"); }
function coletarDadosPaisLB(response){ coletarDadosPais(response, "Lebanon"); }
function coletarDadosPaisLK(response){ coletarDadosPais(response, "Sri Lanka"); }
function coletarDadosPaisLT(response){ coletarDadosPais(response, "Lithuania"); }
function coletarDadosPaisLU(response){ coletarDadosPais(response, "Luxembourg"); }
function coletarDadosPaisLV(response){ coletarDadosPais(response, "Latvia"); }
function coletarDadosPaisLY(response){ coletarDadosPais(response, "Libyan Arab Jamahiriya"); }
function coletarDadosPaisMA(response){ coletarDadosPais(response, "Morocco"); }
function coletarDadosPaisME(response){ coletarDadosPais(response, "Montenegro"); }
function coletarDadosPaisMK(response){ coletarDadosPais(response, "Macedonia"); }
function coletarDadosPaisMX(response){ coletarDadosPais(response, "Mexico"); }
function coletarDadosPaisMY(response){ coletarDadosPais(response, "Malaysia"); }
function coletarDadosPaisNG(response){ coletarDadosPais(response, "Nigeria"); }
function coletarDadosPaisNL(response){ coletarDadosPais(response, "Netherlands"); }
function coletarDadosPaisNO(response){ coletarDadosPais(response, "Norway"); }
function coletarDadosPaisNP(response){ coletarDadosPais(response, "Nepal"); }
function coletarDadosPaisNZ(response){ coletarDadosPais(response, "New Zealand"); }
function coletarDadosPaisOM(response){ coletarDadosPais(response, "Oman"); }
function coletarDadosPaisPE(response){ coletarDadosPais(response, "Peru"); }
function coletarDadosPaisPH(response){ coletarDadosPais(response, "Philippines"); }
function coletarDadosPaisPK(response){ coletarDadosPais(response, "Pakistan"); }
function coletarDadosPaisPL(response){ coletarDadosPais(response, "Poland"); }
function coletarDadosPaisPR(response){ coletarDadosPais(response, "Puerto Rico"); }
function coletarDadosPaisPT(response){ coletarDadosPais(response, "Portugal"); }
function coletarDadosPaisQA(response){ coletarDadosPais(response, "Qatar"); }
function coletarDadosPaisRO(response){ coletarDadosPais(response, "Romania"); }
function coletarDadosPaisRS(response){ coletarDadosPais(response, "Serbia"); }
function coletarDadosPaisRU(response){ coletarDadosPais(response, "Russian Federation"); }
function coletarDadosPaisSA(response){ coletarDadosPais(response, "Saudi Arabia"); }
function coletarDadosPaisSE(response){ coletarDadosPais(response, "Sweden"); }
function coletarDadosPaisSG(response){ coletarDadosPais(response, "Singapore"); }
function coletarDadosPaisSI(response){ coletarDadosPais(response, "Slovenia"); }
function coletarDadosPaisSK(response){ coletarDadosPais(response, "Slovakia"); }
function coletarDadosPaisSN(response){ coletarDadosPais(response, "Senegal"); }
function coletarDadosPaisTH(response){ coletarDadosPais(response, "Thailand"); }
function coletarDadosPaisTN(response){ coletarDadosPais(response, "Tunisia"); }
function coletarDadosPaisTR(response){ coletarDadosPais(response, "Turkey"); }
function coletarDadosPaisTW(response){ coletarDadosPais(response, "Taiwan"); }
function coletarDadosPaisTZ(response){ coletarDadosPais(response, "Tanzania"); }
function coletarDadosPaisUA(response){ coletarDadosPais(response, "Ukraine"); }
function coletarDadosPaisUG(response){ coletarDadosPais(response, "Uganda"); }
function coletarDadosPaisUS(response){ coletarDadosPais(response, "United States"); }
function coletarDadosPaisVN(response){ coletarDadosPais(response, "Viet Nam"); }
function coletarDadosPaisYE(response){ coletarDadosPais(response, "Yemen"); }
function coletarDadosPaisZA(response){ coletarDadosPais(response, "South Africa"); }
function coletarDadosPaisZW(response){ coletarDadosPais(response, "Zimbabwe"); }