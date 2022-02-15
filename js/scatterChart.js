/**
 * Constructor for the Scatter Chart
 */
function ScatterChart(){
    var self = this;
    self.svgID = '#scatter-purchases';
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ScatterChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 20, right: 60, bottom: 20, left: 50};

    self.svgWidth = $(self.svgID).width()- self.margin.left - self.margin.right;
    self.svgHeight = $(self.svgID).height()- self.margin.top - self.margin.bottom;

    self.svg = d3.select(`${self.svgID}`).append("g").attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
};

/**
 *
 */
ScatterChart.prototype.update = function(locationData){
    console.log("update");
};
