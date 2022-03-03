function AbilaMap(id, gps) {
    var self = this;

    self.svg = d3.select(`#${id}`)
    self.svgID = '#' + id;
    self.gpsData = gps;
    self.svgWidth = $(self.svgID).width();
    self.svgHeight = $(self.svgID).height();
    self.employmentTypeFilter = "";
    self.init();
}

AbilaMap.prototype.init = function () {
    var self = this;

    // DRAW SVG
    self.margin = { left: 20, right: 60, top: 20, bottom: 50 }
    self.svgWidth = $(self.svgID).width();
    self.svgHeight = $(self.svgID).height();



    // crude legend 
    self.empTypes = new Set();
    for (let [key, value] of self.gpsData) {
        let gpsVal = value[0];
        self.empTypes.add(gpsVal.employmentType);
    }
    for (let type of self.empTypes) {
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
    promises.push(d3.json("data/Geospatial/Abila.json"))
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

    });



    var playEvent = document.getElementById("playButton");
    var plotEvent = document.getElementById("allButton");


    playEvent.addEventListener('click', function () {

        var startDate = document.getElementById("startDate").value;
        var endDate = document.getElementById("endDate").value;
        if (startDate.valueOf() > endDate.valueOf()) {
            //idk do something here?
        } else {
            var startInput = startDate.valueOf();
            var endInput = endDate.valueOf();
            var gps = self.wrangleData([startInput, endInput]);
            self.playAll(gps[1], [startInput, endInput]);
        }
    })
    plotEvent.addEventListener('click', function () {

        var startDate = document.getElementById("startDate").value;
        var endDate = document.getElementById("endDate").value;
        if (startDate.valueOf() > endDate.valueOf()) {
            //idk do something here?
        } else {
            var startInput = startDate.valueOf();
            var endInput = endDate.valueOf();
            var gps = self.wrangleData([startInput, endInput]);


            self.plotAll(gps[0], [startInput, endInput]);
        }
    })

}




AbilaMap.prototype.wrangleData = function (dates) {
    var self = this;

    var startDate = new Date(dates[0]);
    var endDate = new Date(dates[1]);
    var gpsArr = [];

    var currData = new Map(self.gpsData);

    for (var [key, valArr] of currData.entries()) {
        valArr = valArr.filter(function (d) {
            let ret = false;
            // ===== ADDED FILTERING FOR EMPLOYMENT TYPE ==== 
            if (self.employmentTypeFilter !== "" &&
                d.employmentType === self.employmentTypeFilter) {
                //filtered type wanted   
                if (d.Timestamp.valueOf() > startDate.valueOf() && d.Timestamp.valueOf() < endDate.valueOf()) {
                    //and in bounds
                    gpsArr.push(d)
                    ret = true;
                }
            }
            else if (self.employmentTypeFilter === "") {
                //no filtering for employment type needed, only bounds mater
                if (d.Timestamp.valueOf() > startDate.valueOf() && d.Timestamp.valueOf() < endDate.valueOf()) {
                    //and in bounds
                    gpsArr.push(d)
                    ret = true;
                }
            }
            return ret;
        });

    }

    return [gpsArr, currData];
}


AbilaMap.prototype.playAll = function (gpsMap, dates) {
    var self = this;


    var temp = new Date(dates[0]);
    var endVal = new Date(dates[1]);
    var iterator = temp.valueOf();


    var interval = setInterval(function () {
        if (iterator < endVal.valueOf()) {
            self.svg.selectAll('circle').remove();
            var pointsArr = [];

            var pointMap = new Map(gpsMap);

            for (var [key, valArr] of pointMap.entries()) {
                valArr = valArr.filter(function (d) {
                    let ret = false;
                    if (d.Timestamp.valueOf() >= iterator && d.Timestamp.valueOf() <= iterator + 1800000) {
                        ret = true;
                    }
                    return ret;
                })
                pointMap.set(key, valArr);
            }

            for (var [k, valArr] of pointMap.entries()) {
                var lat, long, time = 0.0;

                valArr.forEach(function (d, i) {
                    if (i == 0) {
                        pointsArr.push(d);
                        lat = d.lat;
                        long = d.long;
                        time = d.Timestamp.valueOf();
                        pointsArr[pointsArr.length - 1].lat = lat;
                        pointsArr[pointsArr.length - 1].long = long;
                        var currentDate = new Date(time);
                        pointsArr[pointsArr.length - 1].Timestamp = currentDate;
                    } else {
                        lat = (lat + d.lat) / 2;
                        long = (long + d.long) / 2;
                        time = (time + d.Timestamp.valueOf()) / 2;
                        pointsArr[pointsArr.length - 1].lat = lat;
                        pointsArr[pointsArr.length - 1].long = long;
                        var currentDate = new Date(time);
                        pointsArr[pointsArr.length - 1].Timestamp = currentDate;
                    }
                })
            }


            var coeff = 1000 * 60 * 5;
            var currDate = new Date(iterator)


            document.getElementById("dateTimer").innerHTML = currDate.toLocaleString('en-US', { timezone: 'CST' });

            self.svg.selectAll("circle").remove();

            var div = d3.select("body").append("div")
                .attr("class", "tooltip-donut")
                .style("opacity", 0);
            var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth - 5, self.svgHeight - 5], self.topo)

            let people = new Set();
            //CHANGE GPS ARR HERE
            var dots = self.svg.selectAll("circle").data(pointsArr).enter().append('circle')
                .attr('cx', function (d) { return projection([d.long, d.lat])[0] })
                .attr('cy', function (d) { return projection([d.long, d.lat])[1] })
                .attr('r', 7).attr('fill', 'red')
                .attr('stroke', 'black')
                .attr('stroke-width', .5)
                .attr('class', (d) => {
                    people.add(`${d.FirstName} ${d.LastName}`);
                    return `map ${d.FirstName}-${d.LastName} ${d.employmentType}`
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


            //add people legend
            $('#legend-people').empty();
            if(self.employmentTypeFilter===""){
                for(let type of self.empTypes){
                    $('#legend-people').append(`<li class='${type}'> ${type}</li>`)
                }
                let colors = ["#00a60e", "#e659ff", "#2ea1ff", "#ff892e", "#ff2e2e",
                "#772eff", "#d6c800", "#0d11ff", "#448c00", "#005445", "#780024", "#783e00",
                "#4c0078"];
        
                let i = 0;
                for (let type of self.empTypes) {
                    //for every type, assign a color
                    let els = Array.from(document.getElementsByClassName(`${type}`));
        
                    els.forEach((el) => {
                        $(el).css('color', colors[i]);
                        $(el).css('fill', colors[i]);
                    })
                    i++;
                }
                
            }
            else{
                for(let person of people){
                    let name = person.split(" ");
                    $('#legend-people').append(`<li class='${name[0]-name[1]}'>${name[0]} ${name[1]}</li>`)
                }
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


            document.getElementById("pauseButton").addEventListener("click", function () {
                clearInterval(interval);
            });

            dots.exit().remove();
            iterator += 1800000;
            console.log(iterator)
        }


    }, 2000);

}

AbilaMap.prototype.plotAll = function (gpsArr, dates) {

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
            return `map ${d.FirstName}-${d.LastName} ${d.employmentType}`
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


    //add people legend
    $('#legend-people').empty();

    if(self.employmentTypeFilter===""){
        for(let type of self.empTypes){
            $('#legend-people').append(`<li class='${type}'> ${type}</li>`)
        }
        let colors = ["#00a60e", "#e659ff", "#2ea1ff", "#ff892e", "#ff2e2e",
        "#772eff", "#d6c800", "#0d11ff", "#448c00", "#005445", "#780024", "#783e00",
        "#4c0078"];

        let i = 0;
        for (let type of self.empTypes) {
            //for every type, assign a color
            let els = Array.from(document.getElementsByClassName(`${type}`));

            els.forEach((el) => {
                $(el).css('color', colors[i]);
                $(el).css('fill', colors[i]);
            })
            i++;
        }
        // return;
    }
    else{
        for(let person of people){
            let name = person.split(" ");
            $('#legend-people').append(`<li class='${name[0]}-${name[1]}'>${name[0]} ${name[1]}</li>`)
        }
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


