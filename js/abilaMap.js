function AbilaMap(id, gps) {
    var self = this;

    self.svg = d3.select(`#${id}`)
    self.svgID = '#' + id;
    self.gpsData = gps;
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
    let empTypes = new Set();
    for (let [key, value] of self.gpsData){
        let gpsVal = value[0];
        empTypes.add(gpsVal.employmentType);
    }
    for (let type of empTypes){
        $("#legend-map").append(`<li>${type}</li>`);
    }
    //add click events
    $("#legend-map li").click(function(e, i){
        $("#legend-map li").removeClass("selected");
        if(self.employmentTypeFilter === $(this).text()){
            //unselecting
            self.employmentTypeFilter = "";
            $(this).removeClass("selected");
        }
        else{
            self.employmentTypeFilter = $(this).text();
            $(this).addClass("selected");
        }
    })


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
        valArr = valArr.filter(function (d) {
            let ret = false;
            if(self.employmentTypeFilter !== "" && 
                d.employmentType === self.employmentTypeFilter){
                //filtered type wanted   
                if (d.Timestamp.valueOf() > startDate.valueOf() && d.Timestamp.valueOf() < endDate.valueOf()) {
                    //and in bounds
                    gpsArr.push(d)
                    ret = true;
                }            
            }
            else if (self.employmentTypeFilter === ""){
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

    var div = d3.select("body").append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);
    var projection = d3.geoMercator().translate([self.svgWidth / 2, self.svgHeight / 2]).fitSize([self.svgWidth - 5, self.svgHeight - 5], self.topo)

    let people = new Set();
    self.svg.selectAll("circle").data(gpsArr).enter().append('circle')
        .attr('cx', function (d) { return projection([d.long, d.lat])[0] })
        .attr('cy', function (d) { return projection([d.long, d.lat])[1] })
        .attr('r', 7).attr('fill', 'red')
        .attr('stroke', 'black')
        .attr('stroke-width', .5)
        .attr('class', (d) => { 
            people.add(`${d.FirstName} ${d.LastName}`);
            return `map ${d.FirstName}-${d.LastName}`})
        .on("mouseover", function (event, d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(`${d.FirstName}  ${d.LastName} <br/> 
            ${d.Timestamp.getMonth()+1}/${d.Timestamp.getDate()} 
            at ${d.Timestamp.getHours() < 10 ? '0'+d.Timestamp.getHours() : d.Timestamp.getHours()}:${d.Timestamp.getMinutes() < 10 ? '0' + d.Timestamp.getMinutes() : d.Timestamp.getMinutes()}
            <br/> ${d.employmentType}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    

    
    if(self.employmentTypeFilter !== ""){
        //add people to legend if a filter is selected

        //add clicks
        $('#legend-people').empty();

        for (let person of people){
            let name = person.split(" ");
            $('#legend-people').append(`<li class=${name[0]}-${name[1]}>${person}</li>`);
        }
    
        //add colors
        let colors = ["#00a60e", "#e659ff", "#2ea1ff", "#ff892e", "#ff2e2e", 
        "#772eff", "#d6c800", "#0d11ff", "#448c00", "#005445", "#780024", "#783e00",
        "#4c0078"];
        
        let i = 0;
        for (let person of people){
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
