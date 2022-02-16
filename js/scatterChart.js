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
    self.margin = {top: 20, right: 30, bottom: 20, left: 50};

    self.svgWidth = $(self.svgID).width()- self.margin.left - self.margin.right;
    self.svgHeight = $(self.svgID).height()- self.margin.top - self.margin.bottom;

    // self.svg = d3.select(`${self.svgID}`).append("g").attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
    self.svg = d3.select(`${self.svgID}`);


    // ======== AXES ========
    self.yScale = d3
        .scaleLinear()
        .domain([0, 1]) //temporary yScale; this will be changed in the update.
        .range([self.svgHeight - self.margin.top, self.margin.bottom + 20]);

    self.yAxis = d3
        .axisLeft()
        .scale(self.yScale)
        .tickFormat(d3.format('$'));
        // .tickFormat(d3.format("d"))
        // .ticks(65);

    // ======= SOME FUNCTIONS TAKEN FROM REFERENCE OF PAST PROJECTS FOR A TIME-BASED X AXIS =======
    //time
    self.xScale = d3
        .scaleLinear()
        .domain([0, 1]) //temporary xScale; this will be changed in the update
        .range([self.margin.left + 30, self.svgWidth]);

        // AXES
    self.xAxis = d3
        .axisBottom()
        .scale(self.xScale)
        .tickFormat((d) => {
            return 'Jan '+ d;
        });

    self.xAxisGroup = self.svg.append("g").attr("class", "x-axis axis");
    self.yAxisGroup = self.svg.append("g").attr("class", "y-axis axis");  

    self.svg
        .select(".x-axis")
        .append("text")
        .text("TIMESTAMP")
        .attr("x", self.svgWidth - self.margin.right)
        .attr("y", 40)
        .attr("class", "axis-label");

    self.svg
        .select(".y-axis")
        .append("text")
        .text("PRICE")
        .attr("x", -40)
        .attr("y", -50)
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)");

    self.div = d3.select("body").append("div")
        .attr("class", "tooltip-donut scatter")
        .style("opacity", 0);
};

/**
 *
 */
ScatterChart.prototype.update = function(locationData, purchasesByLocation){
    var self = this;
    console.log("update");
    console.log(locationData);

    $('#loc').text(locationData.location);

    let currPurchases = purchasesByLocation.get(locationData.location);


    //UPDATE AXES SCALES

    //find max data at this location
    let maxPrice = d3.max(currPurchases, (d) => d.price);
    let maxDate = d3.max(currPurchases, (d) => d.timestamp);
    let minDate = d3.min(currPurchases, (d) => d.timestamp);

    let maxDateMonth = maxDate.getMonth();
    let maxDateDay = maxDate.getDate();
    
    let minDateMonth = minDate.getMonth();
    let minDateDay = minDate.getDate();
    
    

    //update axis scale
    self.yScale.domain([0, maxPrice]);
    self.yAxis.scale(self.yScale);

    self.xScale.domain([minDateDay, maxDateDay]); //we know that the data will always be in january. 
    self.xAxis.scale(self.xScale);
    
    
    // AXES
    self.xAxisGroup = self.svg
        .select(".x-axis")
        .attr(`transform`, `translate(0 , ${self.svgHeight - self.margin.bottom})`)
        .call(self.xAxis);

    self.yAxisGroup = self.svg
        .select(".y-axis")
        .call(self.yAxis)
        .attr(`transform`, `translate(${self.margin.left}, -5)`)
        .append("text");
    
    
    //plot points

    //initial load
    self.svg.selectAll('circle')
        .remove(); //clear old ones
    


    self.svg.selectAll('circle')
        .data(currPurchases)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", (d) => self.xScale(d.timestamp.getDate()))
        .attr("cy", (d) => self.yScale(d.price))
        .attr("fill", (d) => d.type === 'loyalty' ? 'blue' : 'red')
        .attr("class", 'purchasesScatter')
        .on('mouseover', (e, d)=>{
            self.div.transition()
                .duration(200)
                .style("opacity", .9);
            self.div.html(`${d.FirstName} ${d.LastName}:  <br/>
                            $${d.price} <br/>
                            on ${d.timestamp.getMonth()+1}/${d.timestamp.getDate()} <br/>
                            ${d.type === 'cc' ? 'Credit Card Purchase' : 'Loyalty Card Purchase'}
                            `)
                .style("left", (e.pageX + 5) + "px")
                .style("top", (e.pageY - 28) + "px");      
        })
        .on("mouseout", function (d) {
            self.div.transition()
                .duration(500)
                .style("opacity", 0);
        });
        
   
    
}
