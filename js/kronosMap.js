function KronosMap(id, gps) {
    var self = this;

    self.svg = d3.select(`#${id}`)
    self.svgID = '#' + id;
    self.gpsData = gps;

    self.init();

}

KronosMap.prototype.init = function () {
    var self = this;

    // DRAW SVG
    self.margin = { left: 20, right: 60, top: 20, bottom: 50 }
    self.svgWidth = $(self.svgID).width();
    self.svgHeight = $(self.svgID).height();

    // .center([0, 30])
    // .translate([self.svgWidth / 2 - self.margin.left, self.svgHeight / 2]);;

    var promises = []
    promises.push(d3.json("../data/Geospatial/Kronos_Island.json"))
    // promises.push(d3.json("../data/Geospatial/Abila.json"))
    myDataPromises = Promise.all(promises).then(function (my_data) {


        var topo = my_data[0]
        console.log(topo)
        var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth, self.svgHeight], topo)
        // .fitExtent([0, 0], [self.svgWidth, self.svgHeight], topo);
        var g = self.svg.append("g").attr("width", self.svgWidth)
            .attr("height", self.svgHeight);

        g.selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            .attr("class", "topo")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("stroke", "black" ).attr("fill", "none").attr("stroke-width", 2)

        // do some stuff
    });

}

KronosMap.prototype.changeTime = function(time){
    // should times be an array of the range of Dates...?
    var currGPS = self.gpsData.filter(function(d){
        console.log(d)
        //if the timestamp is bw the max and min, then plot the person's lat and longitude
    });
    
    self.svg.selectAll("circle")

}