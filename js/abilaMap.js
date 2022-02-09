function AbilaMap(id) {
    var self = this;

    self.svg = d3.select(`#${id}`)
    self.svgID = '#' + id;
    

    self.init();

}

AbilaMap.prototype.init = function () {
    var self = this;

    // DRAW SVG
    self.margin = { left: 20, right: 60, top: 20, bottom: 50 }
    self.svgWidth = $(self.svgID).width();
    self.svgHeight = $(self.svgID).height();


    // .center([0, 30])
    // .translate([self.svgWidth / 2 - self.margin.left, self.svgHeight / 2]);;

    var promises = []
    promises.push(d3.json("../data/Geospatial/Abila.json"))
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

        // do some stuff
    });

    // example append
    // var g = self.svg.append("g");
    // // .attr('x', 0)
    // // .attr('y', 0)
    // // .attr('width', 20)
    // // .attr('height', 10);
    // var projection = d3.geoAlbers();
    // var path = d3.geoPath(projection);
    // console.log(path)

    // d3.json("../data/Geospatial/Kronos_Island.json", function (json) {
    //     g.selectAll("path")
    //         .data(json.features).enter().append("path").attr("d", path);
    // })


}
