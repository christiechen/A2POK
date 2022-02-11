$(function(){
    switchMaps();
})


function switchMaps(){
    $('#mapSwitch').on('click', ()=>{
        $('.map-svg').toggleClass('no-show');
        // if($('#mapTitle').contents().first() == "Kronos Map"){
        //     $('#mapTitle').contents().first().replaceWith("Abila Map");
        // }else{$('#mapTitle').contents().first().replaceWith("Kronos Map");}
    });
}

