function PurchsingBarGraph(id){
    var self = this;

    self.svg = d3.select(`#${id}`)
    self.svgID = '#'+id;

    self.init();
    
}

PurchsingBarGraph.prototype.init = function(){ 
    var self = this;

    // DRAW SVG
    self.margin = {left: 20, right: 60, top: 20, bottom: 50}
    self.svgWidth = $(self.svgID).width();
    self.svgHeight = $(self.svgID).height();
    
    // example append
    self.svg.append('rect')
        .attr('x', 20)
        .attr('y', 10)
        .attr('width', 50)
        .attr('height', 40);
}