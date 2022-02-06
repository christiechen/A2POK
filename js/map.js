
var svg = d3.select("body").append("svg"); //

var g = svg.append("g"); //

// d3.json("../data/Geospatial/Abila.json", function (e, topology) {
//     g.selectAll("path")
//         .data(topojson.object(topology, topology.objects.countries)
//             .geometries)
//         .enter()
//         .append("path")
//         .attr("d", path)
// })