const botaoClose = $(".button-close");
const botaoOpen = $(".button-open");
const caixaBox = $(".box");
const pipVideo = $('.video');

$(function () {
  botaoOpen.hide();
  botaoClose.bind("click", function () {
	pipVideo.attr('style', 'box-shadow: none; width: 50px;');
    caixaBox.hide();
    if ($(this).attr("class") == "button-close")
    {
      botaoOpen.show();
    }
  });
});

botaoOpen.bind("click", function () {
	var botaoOpen = $(".button-open");
	pipVideo.attr('style', 'box-shadow: 0 2px 10px rgba(0,0,0,0.3); width: 640px;');
    caixaBox.show();        
    if ($(this).attr("class") == "button-open")
    {
      botaoOpen.hide();
    }
  });