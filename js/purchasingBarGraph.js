let dummy = [
    {
        FirstName: "RandomFirst1",
        LastName: "RandomSecond1",
        location: "RandomLocation1",
        price: 3.29,
        type: "loyalty"
    },
    {
        FirstName: "RandomFirst2",
        LastName: "RandomSecond2",
        location: "RandomLocation2",
        price: 4.13,
        type: "loyalty"
    },
    {
        FirstName: "RandomFirst3",
        LastName: "RandomSecond3",
        location: "RandomLocation3",
        price: 1.53,
        type: "loyalty"
    },
    {
        FirstName: "RandomFirst4",
        LastName: "RandomSecond4",
        location: "RandomLocation2",
        price: 1.25,
        type: "cc"
    },
    {
        FirstName: "RandomFirst5",
        LastName: "RandomSecond5",
        location: "RandomLocation1",
        price: 50.12,
        type: "cc"
    }
]

function PurchasingBarGraph(id){
    var self = this;

    self.svg = d3.select(`#${id}`)
    self.svgID = '#'+id;

    self.init();
    
}

PurchasingBarGraph.prototype.init = function(){
    var self = this;

    // DRAW SVG
    self.margin = {left: 20, right: 60, top: 20, bottom: 50}
    self.svgWidth = $(self.svgID).width();
    self.svgHeight = $(self.svgID).height();
    
    // example append
    self.svg.append('rect')
        .attr('x', 20)
        .attr('y', 10)
        .attr('width', 100)
        .attr('height', 40);
}

/**
 *
 */
PurchasingBarGraph.prototype.update = function(){
    var self = this
}