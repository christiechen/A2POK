$(function(){
    switchMaps();
})


function switchMaps(){
    $('#mapSwitch').on('click', ()=>{
        $('.map-svg').toggleClass('no-show');
    });
}