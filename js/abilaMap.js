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

    var promises = []
    promises.push(d3.json("../data/Geospatial/Abila.json"))
    myDataPromises = Promise.all(promises).then(function (my_data) {


        self.topo = my_data[0]
        var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth, self.svgHeight], self.topo)
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

}
AbilaMap.prototype.changeTime = function (dates) {
    var self = this;
    self.svg.selectAll('circle').remove();
    var startDate = dates[0];
    var endDate = dates[1];
    var gpsArr = [];
    var currData = new Map(self.gpsData);
    for (var [key, valArr] of currData.entries()) {
        valArr.filter(function (d) {
            if (d.Timestamp.valueOf() > startDate.valueOf() && d.Timestamp.valueOf() < endDate.valueOf()) {
                gpsArr.push(d)
                return d;
            }
        });
    }

    var div = d3.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);
    var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth - 5, self.svgHeight - 5], self.topo)

    self.svg.selectAll("circle").data(gpsArr).enter().append('circle')
        .attr('cx', function (d) { return projection([d.long, d.lat])[0] })
        .attr('cy', function (d) { return projection([d.long, d.lat])[1] })
        .attr('r', 4).attr('fill', 'red')
        .attr('stroke', 'black')
        .attr('stroke-width', .5)
        .on("mouseover", function (event, d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.FirstName + " " + d.LastName)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

}
