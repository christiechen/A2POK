function KronosMap(id){
    var self = this;

    self.svg = d3.select(`#${id}`)
    self.svgID = '#'+id;

    self.init();
    
}

KronosMap.prototype.init = function(){ 
    var self = this;

    // DRAW SVG
    self.margin = {left: 20, right: 60, top: 20, bottom: 50}
    self.svgWidth = $(self.svgID).width();
    self.svgHeight = $(self.svgID).height();
    
    // example append
    self.svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', 10);
}