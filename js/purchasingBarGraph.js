function PurchasingBarGraph(id, data, purchasesByEmployee, purchasesByLocation){
    var self = this;
    
    self.svgID = '#'+id;
    self.data = data;
    self.scatterChart = new ScatterChart();
    self.purchasesByEmployee = purchasesByEmployee;
    self.purchasesByLocation = purchasesByLocation;
    
    self.init();
    
}

PurchasingBarGraph.prototype.init = function(){
    var self = this;

    // DRAW SVG
    self.margin = {left: 20, right: 60, top: 20, bottom: 50}
    self.svgWidth = $(self.svgID).width()- self.margin.left - self.margin.right;
    self.svgHeight = $(self.svgID).height()- self.margin.top - self.margin.bottom;

    self.svg = d3.select(`${self.svgID}`).append("g").attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
}

/**
 *
 */
PurchasingBarGraph.prototype.update = function(){
    var self = this;

    // For now, just administration. Can change value by changing get data
    var data = self.data.get("Administration");
    //var data = self.data.get("Facilities");

    // List of groups- location
    let purchasesByLocation = new Map();
    for(let i = 0; i<data.length; i++){
        let currentPurchase = data[i];
        let location = currentPurchase.location;
        // BY LOCATION
        if(purchasesByLocation.has(location)){
            purchasesByLocation.get(location).push(currentPurchase);
        }
        else{
            purchasesByLocation.set(location, [currentPurchase]);
        }
    }
    console.log(purchasesByLocation);

    // Count and store number of purchases- cc and loyalty separately
    var arr = [];

    purchasesByLocation.forEach(function(value, key) {
        //console.log(key);
        var cc=0;
        var loyalty=0;
        value.forEach(function(d){
            //console.log(d);
            if (d.type=="cc"){
                cc+=1;
            }
            else {
                loyalty+=1;
            }
        });
        arr.push({location:key,loyalty:loyalty,cc:cc});
    });

    console.log(arr);

    //Location groups
    const groups = arr.map(d => d.location);
    //console.log(groups)

    // List of subgroups- type
    var subgroups = ["loyalty","cc"];


    // Add X axis
    var x = d3.scaleBand()
        .domain(groups)
        .range([0, self.svgWidth])
        .paddingInner([0.1]);

    self.svg.append("g")
        .attr("transform", "translate("+self.margin.left+"," + self.svgHeight + ")")
        .attr("class","x-axis axis")
        .call(d3.axisBottom(x).tickSize(0));

    // Add Y axis
    var y = d3.scaleLinear()
        //.domain([0, d3.max(arr, function (d) { return d.loyalty;})])
        .range([ self.svgHeight, 0]);
    self.svg.append("g")
        .attr("class","y-axis axis")
        .attr("transform", "translate("+self.margin.left+",0)")
        .call(d3.axisLeft(y));

    // Setting y domain
    y.domain([0, d3.max(arr, function(d) { return d3.max(subgroups, function(sub) { return d[sub]; }); })]).nice();

    // Another scale for subgroup position
    var xSubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding([0.05]);

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c','#377eb8']);

    // Show the bars
    self.svg.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(arr)
        .join("g")
        .attr("transform", d => `translate(${x(d.location)+self.margin.left}, 0)`)
        .selectAll("rect")
        .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key], location: d.location}; }); })
        .join("rect")
        .attr("x", d => xSubgroup(d.key))
        .attr("y", d => y(d.value))
        .attr("width", xSubgroup.bandwidth())
        .attr("height", d => self.svgHeight - y(d.value))
        .attr("fill", d => color(d.key))
        .on("mouseover",function(d){
            d3.select(this).classed("highlighted", true);
        })
        .on("mouseout",function(d){
            self.svg.selectAll("rect").classed("highlighted", false);
        })
        .on("click", function(d,i){
            // call scatterChart
            self.scatterChart.update(i, self.purchasesByLocation);
        });
}