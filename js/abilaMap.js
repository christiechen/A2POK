function AbilaMap(id, gps) {
    var self = this;

    self.svg = d3.select(`#${id}`)
    self.svgID = '#' + id;
    self.gpsData = gps;
    self.svgWidth = $(self.svgID).width();
    self.svgHeight = $(self.svgID).height();
    self.init();
}

AbilaMap.prototype.init = function () {




    // crude legend 
    let empTypes = new Set();
    for (let [key, value] of self.gpsData) {
        let gpsVal = value[0];
        empTypes.add(gpsVal.employmentType);
    }
    for (let type of empTypes) {
        $("#legend-map").append(`<li>${type}</li>`);
    }
    //add click events
    $("#legend-map li").click(function (e, i) {
        $("#legend-map li").removeClass("selected");
        if (self.employmentTypeFilter === $(this).text()) {
            //unselecting
            self.employmentTypeFilter = "";
            $(this).removeClass("selected");
        }
        else {
            self.employmentTypeFilter = $(this).text();
            $(this).addClass("selected");
        }
    })


    var promises = []
    promises.push(d3.json("../data/Geospatial/Abila.json"))
    myDataPromises = Promise.all(promises).then(function (my_data) {
        AbilaMap.prototype.init = function () {
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



    AbilaMap.prototype.wrangleData = function (dates) {

        console.log(startDate, endDate)
        var startDate = dates[0].valueOf();
        var endDate = dates[1].valueOf();
        var gpsArr = [];
        var pointsArr = [];
        var timesArr = [];

        var currData = new Map(self.gpsData);

        for (var [key, valArr] of currData.entries()) {
            var temp = valArr.filter(function (d) {
                if (d.Timestamp.valueOf() > startDate.valueOf() && d.Timestamp.valueOf() < endDate.valueOf()) {
                    return d;
                    valArr = valArr.filter(function (d) {
                        let ret = false;
                        if (self.employmentTypeFilter !== "" &&
                            d.employmentType === self.employmentTypeFilter) {
                            //filtered type wanted   
                            if (d.Timestamp.valueOf() > startDate && d.Timestamp.valueOf() < endDate) {
                                //and in bounds
                                gpsArr.push(d)
                                return d;
                            }
                            else return false;
                        }
                        else if (self.employmentTypeFilter === "") {
                            //no filtering for employment type needed, only bounds mater
                            if (d.Timestamp.valueOf() > startDate && d.Timestamp.valueOf() < endDate) {
                                //and in bounds
                                gpsArr.push(d)
                                return d;
                            }
                            else return false;
                        }

                        return ret;
                    });
                    if (temp.length > 0) {
                        currData.set(key, temp);
                    } else { currData.delete(key) }

                }

                console.log(gpsArr)

                for (var i = startDate.valueOf(); i < endDate.valueOf(); i = i + 1800000) {
                    var temp = [...currData.entries()].filter((d) => { (d.Timestamp.valueOf() >= i) && (d.Timestamp.valueOf() <= (i + 1800000)) });
                    var plottedPoints = new Map(temp);
                    for (var [key, valArr] of plottedPoints.entries()) {
                        var indVals = []
                        var lat, long = 0.0;
                        valArr.forEach(function (d, i) {
                            if (i == 0) {
                                indVals.push(d);
                                lat = d.lat;
                                long = d.long;
                            } else {
                                lat = (lat + d.lat) / 2;
                                long = (long + d.long) / 2;
                            }
                        })
                        valArr[valArr.length - 1].lat = lat;
                        valArr[valArr.length - 1].long = long;
                        pointsArr.push(valArr[valArr.length - 1]);
                    }
                    var currDate = new Date(i);
                    timesArr.push(currDate);
                }

                var j = 0;
                return gpsArr, pointsArr, timesArr;
            }






AbilaMap.prototype.playAll = function (gpsArr, times) {
                    var self = this;

                    self.svg.selectAll("circle").remove();
                    var i = 0;

                    var div = d3.select("body").append("div")
                        .attr("class", "tooltip-donut")
                        .style("opacity", 0);
                    var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth - 5, self.svgHeight - 5], self.topo)

                    var iterator = startDate.valueOf();
                    var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth - 5, self.svgHeight - 5], self.topo);

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
                                var currGps = gpsArr[i];
                                var currDate = times[i];

                                document.getElementById("dateTimer").innerHTML = currDate.toLocaleString('en-US', { timezone: 'CST' });

                                let people = new Set();
                                //CHANGE GPS ARR HERE
                                var dots = self.svg.selectAll("circle").data(currGps).enter().append('circle')
                                    .attr('cx', function (d) { return projection([d.long, d.lat])[0] })
                                    .attr('cy', function (d) { return projection([d.long, d.lat])[1] })
                                    .attr('r', 7).attr('fill', 'red')
                                    .attr('stroke', 'black')
                                    .attr('stroke-width', .5)
                                    .attr('class', (d) => {
                                        people.add(`${d.FirstName} ${d.LastName}`);
                                        return `map ${d.FirstName}-${d.LastName}`
                                    })
                                    .on("mouseover", function (event, d) {
                                        div.transition()
                                            .duration(200)
                                            .style("opacity", .9);
                                        div.html(`${d.FirstName}  ${d.LastName} <br/> 
            ${d.Timestamp.getMonth() + 1}/${d.Timestamp.getDate()} 
            at ${d.Timestamp.getHours() < 10 ? '0' + d.Timestamp.getHours() : d.Timestamp.getHours()}:${d.Timestamp.getMinutes() < 10 ? '0' + d.Timestamp.getMinutes() : d.Timestamp.getMinutes()}
            <br/> ${d.employmentType}`)
                                            .style("left", (event.pageX) + "px")
                                            .style("top", (event.pageY - 28) + "px");
                                    })
                                    .on("mouseout", function (d) {
                                        div.transition()
                                            .duration(500)
                                            .style("opacity", 0);
                                    });



                                if (self.employmentTypeFilter !== "") {
                                    //add people to legend if a filter is selected

                                    //add clicks
                                    $('#legend-people').empty();

                                    for (let person of people) {
                                        let name = person.split(" ");
                                        $('#legend-people').append(`<li class=${name[0]}-${name[1]}>${person}</li>`);
                                    }
                                    console.log(pointsArr)

                                    //add colors
                                    let colors = ["#00a60e", "#e659ff", "#2ea1ff", "#ff892e", "#ff2e2e",
                                        "#772eff", "#d6c800", "#0d11ff", "#448c00", "#005445", "#780024", "#783e00",
                                        "#4c0078"];

                                    var coeff = 1000 * 60 * 5;
                                    let i = 0;
                                    for (let person of people) {
                                        //for ever person, assign a color
                                        let name = person.split(" ");
                                        let els = Array.from(document.getElementsByClassName(`${name[0]}-${name[1]}`));

                                        els.forEach((el) => {
                                            $(el).css('color', colors[i]);
                                            $(el).css('fill', colors[i]);
                                        })
                                        i++;
                                    }
                                }

                                var currDate = new Date(iterator)
                                console.log(currDate)
                                document.getElementById("dateTimer").innerHTML = currDate.toLocaleString('en-US', { timezone: 'CST' });

                                document.getElementById("pauseButton").addEventListener("click", function () {
                                    clearInterval(interval);
                                });

                                dots.exit().remove();
                                i++;


                            }, 2000);

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
                }
AbilaMap.prototype.plotAll = function (gpsArr) {
                    var self = this;
                    self.svg.selectAll("circle").remove();

                    var div = d3.select("body").append("div")
                        .attr("class", "tooltip-donut")
                        .style("opacity", 0);
                    var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth - 5, self.svgHeight - 5], self.topo)

                    let people = new Set();
                    //CHANGE GPS ARR HERE
                    self.svg.selectAll("circle").data(gpsArr).enter().append('circle')
                        .attr('cx', function (d) { return projection([d.long, d.lat])[0] })
                        .attr('cy', function (d) { return projection([d.long, d.lat])[1] })
                        .attr('r', 7).attr('fill', 'red')
                        .attr('stroke', 'black')
                        .attr('stroke-width', .5)
                        .attr('class', (d) => {
                            people.add(`${d.FirstName} ${d.LastName}`);
                            return `map ${d.FirstName}-${d.LastName}`
                        })
                        .on("mouseover", function (event, d) {
                            div.transition()
                                .duration(200)
                                .style("opacity", .9);
                            div.html(`${d.FirstName}  ${d.LastName} <br/> 
            ${d.Timestamp.getMonth() + 1}/${d.Timestamp.getDate()} 
            at ${d.Timestamp.getHours() < 10 ? '0' + d.Timestamp.getHours() : d.Timestamp.getHours()}:${d.Timestamp.getMinutes() < 10 ? '0' + d.Timestamp.getMinutes() : d.Timestamp.getMinutes()}
            <br/> ${d.employmentType}`)
                                .style("left", (event.pageX) + "px")
                                .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function (d) {
                            div.transition()
                                .duration(500)
                                .style("opacity", 0);
                        });

                    iterator = iterator + 1800000;

                    document.getElementById("pauseButton").addEventListener("click", function () {
                        clearInterval(interval);
                    });

                    dots.exit().remove();
                    if (self.employmentTypeFilter !== "") {
                        //add people to legend if a filter is selected

                        //add clicks
                        $('#legend-people').empty();

                        for (let person of people) {
                            let name = person.split(" ");
                            $('#legend-people').append(`<li class=${name[0]}-${name[1]}>${person}</li>`);
                        }

                    }, 2000);
            //add colors
            let colors = ["#00a60e", "#e659ff", "#2ea1ff", "#ff892e", "#ff2e2e",
                "#772eff", "#d6c800", "#0d11ff", "#448c00", "#005445", "#780024", "#783e00",
                "#4c0078"];

            let i = 0;
            for (let person of people) {
                //for ever person, assign a color
                let name = person.split(" ");
                let els = Array.from(document.getElementsByClassName(`${name[0]}-${name[1]}`));

                els.forEach((el) => {
                    $(el).css('color', colors[i]);
                    $(el).css('fill', colors[i]);
                })
                i++;
            }
        }

    }


    // console.log(gpsArr)

    // function AbilaMap(id, gps) {
    //     var self = this;

    //     self.svg = d3.select(`#${id}`)
    //     self.svgID = '#' + id;
    //     self.gpsData = gps;

    //     self.init();

    // }

    // AbilaMap.prototype.init = function () {
    //     var self = this;

    //     // DRAW SVG
    //     self.margin = { left: 20, right: 60, top: 20, bottom: 50 }
    //     self.svgWidth = $(self.svgID).width();
    //     self.svgHeight = $(self.svgID).height();

    //     var promises = []
    //     promises.push(d3.json("../data/Geospatial/Abila.json"))
    //     myDataPromises = Promise.all(promises).then(function (my_data) {


    //         self.topo = my_data[0]
    //         var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth, self.svgHeight], self.topo)
    //         var g = self.svg.append("g").attr("width", self.svgWidth)
    //             .attr("height", self.svgHeight);

    //         g.selectAll("path")
    //             .data(self.topo.features)
    //             .enter()
    //             .append("path")
    //             .attr("class", "topo")
    //             // draw each country
    //             .attr("d", d3.geoPath()
    //                 .projection(projection)
    //             )
    //             .attr("stroke-width", 1.5).attr("fill", "none").attr("stroke", "black")

    //         // do some stuff
    //         var playEvent = document.getElementById("playButton");
    //         playEvent.addEventListener('click', function () {
    //             var startDate = document.getElementById("startDate").value;
    //             var endDate = document.getElementById("endDate").value;
    //             // console.log(startDate)
    //             if (startDate.valueOf() > endDate.valueOf()) {
    //                 //idk do something here?
    //             } else {
    //                 var tempStart = new Date(startDate);
    //                 var tempEnd = new Date(endDate);
    //                 self.changeTime([tempStart, tempEnd]);
    //             }
    //         })

    //     });

    // }
    // AbilaMap.prototype.changeTime = function (dates) {
    //     var self = this;
    //     self.svg.selectAll('circle').remove();
    //     var startDate = dates[0];
    //     var endDate = dates[1];
    //     // var gpsArr = [];
    //     var currData = new Map(self.gpsData);
    //     for (var [key, valArr] of currData.entries()) {
    //         var temp = valArr.filter(function (d) {
    //             if (d.Timestamp.valueOf() > startDate.valueOf() && d.Timestamp.valueOf() < endDate.valueOf()) {
    //                 return d;
    //             }
    //         });
    //         if (temp.length > 0) {
    //             currData.set(key, temp);
    //         } else { currData.delete(key) }
    //     }

    //     var j = 0;

    //     var div = d3.select("body").append("div")
    //         .attr("class", "tooltip-donut")
    //         .style("opacity", 0);
    //     var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth - 5, self.svgHeight - 5], self.topo)

    //     var iterator = startDate.valueOf();

    //     var interval = setInterval(function () {
    //         if (iterator < endDate.valueOf()) {
    //             self.svg.selectAll('circle').remove();
    //             var pointsArr = [];

    //             var plottedPoints = new Map(currData);
    //             console.log(plottedPoints)

    //             for (var [key, valArr] of plottedPoints.entries()) {
    //                 var currVals = valArr.filter(function (d) {
    //                     if (d.Timestamp.valueOf() >= iterator && d.Timestamp.valueOf() <= (iterator + 1800000)) {
    //                         return d;
    //                     }
    //                 });
    //                 if (currVals.length > 0) {
    //                     plottedPoints.set(key, currVals);
    //                 } else { plottedPoints.delete(key) }
    //             }
    //             console.log(plottedPoints)

    //             for (var [key, valArr] of plottedPoints.entries()) {
    //                 var lat, long = 0.0;
    //                 valArr.forEach(function (d, i) {
    //                     if (i == 0) {
    //                         pointsArr.push(d);
    //                         lat = d.lat;
    //                         long = d.long;
    //                     } else {
    //                         lat = (lat + d.lat) / 2;
    //                         long = (long + d.long) / 2;
    //                     }
    //                 })
    //                 pointsArr[pointsArr.length - 1].lat = lat;
    //                 pointsArr[pointsArr.length - 1].long = long;

    //             }
    //             console.log(pointsArr)


    //             var currDate = new Date(iterator)
    //             console.log(currDate)
    //             document.getElementById("dateTimer").innerHTML = currDate.toLocaleString('en-US', {timezone: 'CST'});





    //             var dots = self.svg.selectAll("circle").data(pointsArr).enter().append('circle')
    //                 .attr('cx', function (d) { return projection([d.long, d.lat])[0] })
    //                 .attr('cy', function (d) { return projection([d.long, d.lat])[1] })
    //                 .attr('r', 4).attr('fill', 'red')
    //                 .attr('stroke', 'black')
    //                 .attr('stroke-width', .5)
    //                 .on("mouseover", function (event, d) {
    //                     div.transition()
    //                         .duration(200)
    //                         .style("opacity", .9);
    //                     div.html(d.FirstName + " " + d.LastName)
    //                         .style("left", (event.pageX) + "px")
    //                         .style("top", (event.pageY - 28) + "px");
    //                 })
    //                 .on("mouseout", function (d) {
    //                     div.transition()
    //                         .duration(500)
    //                         .style("opacity", 0);
    //                 });


}

//             iterator = iterator + 1800000;

//             document.getElementById("pauseButton").addEventListener("click", function(){
//                 clearInterval(interval);
//             });

//             dots.exit().remove();

//         }

//     }, 2000);



//     // console.log(gpsArr)



// }