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
    // var gpsArr = [];
    var currData = new Map(self.gpsData);
    for (var [key, valArr] of currData.entries()) {
        var temp = valArr.filter(function (d) {
            if (d.Timestamp.valueOf() > startDate.valueOf() && d.Timestamp.valueOf() < endDate.valueOf()) {
                return d;
            }
        });
        if (temp.length > 0) {
            currData.set(key, temp);
        } else { currData.delete(key) }
    }

    var j = 0;

    var div = d3.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);
    var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth - 5, self.svgHeight - 5], self.topo)

    var iterator = startDate.valueOf();

    var interval = setInterval(function () {
        if (iterator < endDate.valueOf()) {
            self.svg.selectAll('circle').remove();
            var pointsArr = [];

            var plottedPoints = new Map(currData);
            console.log(plottedPoints)

            for (var [key, valArr] of plottedPoints.entries()) {
                var currVals = valArr.filter(function (d) {
                    if (d.Timestamp.valueOf() >= iterator && d.Timestamp.valueOf() <= (iterator + 1800000)) {
                        return d;
                    }
                });
                if (currVals.length > 0) {
                    plottedPoints.set(key, currVals);
                } else { plottedPoints.delete(key) }
            }
            console.log(plottedPoints)

            for (var [key, valArr] of plottedPoints.entries()) {
                var lat, long = 0.0;
                valArr.forEach(function (d, i) {
                    if (i == 0) {
                        pointsArr.push(d);
                        lat = d.lat;
                        long = d.long;
                    } else {
                        lat = (lat + d.lat) / 2;
                        long = (long + d.long) / 2;
                    }
                })
                pointsArr[pointsArr.length - 1].lat = lat;
                pointsArr[pointsArr.length - 1].long = long;

            }
            console.log(pointsArr)


            var coeff = 1000 * 60 * 5;


            var currDate = new Date(iterator)
            console.log(currDate)
            document.getElementById("dateTimer").innerHTML = currDate.toLocaleString('en-US', {timezone: 'CST'});





            var dots = self.svg.selectAll("circle").data(pointsArr).enter().append('circle')
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



            iterator = iterator + 1800000;

            document.getElementById("pauseButton").addEventListener("click", function(){
                clearInterval(interval);
            });

            dots.exit().remove();

        }

    }, 2000);



    // console.log(gpsArr)



}
