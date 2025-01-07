
const progresso = $('.progress');
const numero = $('.number');
const barraDoing = $('.statusProgress');
const tamanhoBarra = $(".clickable").width();
var x=0;

function atualizarBarra(porcento){
    porcento=porcento/100;
    x += (porcento*tamanhoBarra);
    if(x>tamanhoBarra) x=tamanhoBarra;
    progresso.width(x);
    numero.html(((x*100)/tamanhoBarra).toFixed(2)+"%");
}

function atualizarBarraDoing(statusText){
    barraDoing.html(statusText);	
}