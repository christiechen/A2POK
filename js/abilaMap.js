function AbilaMap(id, gps) {
    var self = this;

    self.svg = d3.select(`#${id}`)
    self.svgID = '#' + id;
    self.gpsData = gps;

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


        self.topo = my_data[0]
        var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth, self.svgHeight], self.topo)
        // .fitExtent([0, 0], [self.svgWidth, self.svgHeight], topo);
        var g = self.svg.append("g").attr("width", self.svgWidth)
            .attr("height", self.svgHeight);

        g.selectAll("path")
            .data(self.topo.features)
            .enter()
            .append("path")
            .attr("class", "topo")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("stroke-width", 1.5).attr("fill", "none").attr("stroke", "black")

        // do some stuff
        var playEvent = document.getElementById("playButton");
        playEvent.addEventListener('click', function () {
            var startDate = document.getElementById("startDate").value;
            var endDate = document.getElementById("endDate").value;
            // console.log(startDate)
            if (startDate.valueOf() > endDate.valueOf()) {
                //idk do something here?
            } else {
                var tempStart = new Date(startDate);
                var tempEnd = new Date(endDate);
                self.changeTime([tempStart, tempEnd]);
            }
        })

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
AbilaMap.prototype.changeTime = function (dates) {
    var self = this;
    self.svg.selectAll('circle').remove();
    var startDate = dates[0];
    var endDate = dates[1];
    console.log(dates[1])
    // should times be an array of the range of Dates...?
    var currData = new Map(self.gpsData);
    for (var [key, valArr] of currData.entries()) {
        var tempArr = valArr.filter(d => d.Timestamp.valueOf() > startDate.valueOf() && d.Timestamp.valueOf() < endDate.valueOf());
        if (tempArr.length > 0) {
            currData.set(key, tempArr);
        } else {
            currData.delete(key);
        }
    }
    var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth - 5, self.svgHeight - 5], self.topo)

    for (var [key, valArr] of currData.entries()) {
        self.svg.selectAll("circle").data(valArr).enter()
            .append('circle').attr('r', 4).attr('cx', function (d) { return projection([d.long, d.lat])[0] }).attr('cy', function (d) { return projection([d.long, d.lat])[1] })
            .attr('fill', 'red')

    }
    self.svg.selectAll('circle').exit();
    console.log(currData);


    console.log(self.gpsData)
}
