$(function(){
    switchMaps();
})


function switchMaps(){
    $('#mapSwitch').on('click', ()=>{
        $('.map-svg').toggleClass('no-show');
        // if($('#mapTitle').innerHTML == "Kronos Map"){
        //     $('#mapTitle').innerHTML = "Abila Map";
        // }else{$('#mapTitle').innerHTML = "Kronos Map";}
    });
}

