//main visualization set up
function Main(){
    var self = this;

    self.init();
    
}

Main.prototype.init = function(){

    //data wrangling
    var self = this;
    d3.csv("data/gps.csv")
    .then(function(data) {
        let gps = data;

        // ============ CAR ASSIGNMENTS MAP 
        d3.csv("data/car-assignments.csv")
        .then(function(data) {
            let assignments = data;
        
            //create map of car id --> employee for convenience
            let assignmentMap = new Map();
            for(let i = 0; i<assignments.length; i++){
                assignments[i].CarID = +assignments[i].CarID;
                if(assignments[i].CarID === 0){
                    continue;
                }
                assignmentMap.set(assignments[i].CarID, [assignments[i].FirstName, assignments[i].LastName]);
                assignmentMap.set(assignments[i].FirstName + " " + assignments[i].LastName, assignments[i].CarID);
            }
            // console.log(assignmentMap);

             //============== GPS DATA ================
            //gps data is taken every second. 
            //first, we have to separate the gps data into each car
            let gpsMapSplitCars = new Map(); //gps data separated into each car

            //for convenience, we can also add the name of the person to the car they were driving
            for(let i = 0; i<gps.length; i++){
                gps[i].id = +gps[i].id;
                gps[i].lat = +gps[i].lat;
                gps[i].long = +gps[i].long;
                
                let currentEntry = gps[i];
                
                //========= ADD NAME TO DATA =========

                //if the gps data does not have a matching person assignment, then it doesn't tell us anything about the employees
                if(assignmentMap.get(currentEntry.id) === undefined){
                    continue;    
                }
                
                currentEntry.FirstName = assignmentMap.get(currentEntry.id)[0];
                currentEntry.LastName = assignmentMap.get(currentEntry.id)[1];


                // ======== SPLIT DATE AND TIME INTO JS OBJECTS ====== 
                let date = currentEntry.Timestamp.split(' ')[0];
                date = date.split('/');
            
                let time = currentEntry.Timestamp.split(' ')[1];
                time = time.split(':');

                currentEntry.Timestamp = new Date(+date[2], +date[0]-1, +date[1], +time[0], +time[1], +time[2]);

                //====== FILTER INTO MAP ========
                //already exists
                if(gpsMapSplitCars.has(currentEntry.id)){
                    gpsMapSplitCars.get(currentEntry.id).push(currentEntry);
                }
                else{
                    gpsMapSplitCars.set(currentEntry.id, [currentEntry]);
                }

            }
            // console.log(gpsMapSplitCars);
            

            // ========= GPS INTERVALS ==========
            let gpsMapIntervals = new Map();
            //first round of filtering --> every 5 minutes at most

            
            let interval = 1000 * 60 * 20; // 1000 ms/s * 60s/min * 10 min

            for (let [id, entries] of gpsMapSplitCars.entries()) {
                let temp = [];
                let fiveMinutesAgo = entries[0];
                temp.push(entries[0]);
                for(let i = 1; i< entries.length; i++){
                    let elapsed = entries[i].Timestamp.getTime() - fiveMinutesAgo.Timestamp.getTime(); // elapsed time in milliseconds
                    if(elapsed >= interval){
                        temp.push(entries[i]);
                    }
                }
                gpsMapIntervals.set(id, temp);

            }
            // console.log(gpsMapIntervals);


            //we need to decide how far counts as "stationary"
            // ========= GPS STATIONARY DARA ==========
            
            //filter for only stationary data; the car must have stayed in the same place for more than 30 mins
            let gpsMapStationary = new Map();
            let interval2 = 1000 * 60 * 5 // 1000 ms/s * 60s/min * 10 min

            for (let [id, entries] of gpsMapSplitCars.entries()) {
                let i = 0;
                let temp = [];
                while(i <entries.length){
                    let currentEntry = entries[i];
                    //find the "end" of when this car is at this location.
                    let j = i+1;
                    let checkEntry = entries[j];
                    // console.log(j);
                    //while we are in bounds and in the same location, move forward
                    while(j<entries.length && self.gpsEquality(currentEntry, checkEntry)){
                        j++;
                        checkEntry = entries[j];
                    }

                    //at this point, entries[j] is not the same as the checkEntry anymore.
                    j--; //go back to the "last" entry, where the car was in the same location
                    checkEntry = entries[j];
                    
                    let elapsed = checkEntry.Timestamp.getTime() - currentEntry.Timestamp.getTime(); // elapsed time in milliseconds
                    //check if the last entry that was the same as the currentEntry is more than interval2 time away
                    if(elapsed >= interval2){
                        temp.push(currentEntry);
                        temp.push(checkEntry);

                        j++; //move to the next entry at a different location
                        i = j; //start at the nextEntry
                    }
                    else{
                        i++; //else, if the time was not enough, check starting a the next entry.
                    }
                }
                gpsMapStationary.set(id, temp);
                temp = [];
            }
            // console.log(gpsMapStationary);

            d3.csv("data/loyalty_data.csv")
            .then(function(data){
                let loyalty = data;

                d3.csv("data/cc_data.csv")
                .then(function(data){
                    let cc = data;

                    let purchases = [];
                    //=========== CREATE COMBINED CSV FOR PURCHASES ==========
                    for(let i = 0; i<loyalty.length; i++){
                        let currentPurchase = loyalty[i];
                        currentPurchase.CarID = assignmentMap.get(currentPurchase.FirstName + ' ' + currentPurchase.LastName);
                        currentPurchase.type = 'loyalty';

                        //fix datatypes
                        currentPurchase.price = +currentPurchase.price;
                        let time = currentPurchase.timestamp.split("/")
                        currentPurchase.timestamp = new Date(+time[2], +time[0]-1, +time[1]);

                        purchases.push(currentPurchase);
                    }
                    for(let i = 0; i<cc.length; i++){
                        let currentPurchase = cc[i];
                        currentPurchase.CarID = assignmentMap.get(currentPurchase.FirstName + ' ' + currentPurchase.LastName);
                        currentPurchase.type = 'cc';

                        //fix datatypes
                        currentPurchase.price = +currentPurchase.price;
                        let time = currentPurchase.timestamp.split("/")
                        currentPurchase.timestamp = new Date(+time[2], +time[0]-1, +time[1]);
                        purchases.push(currentPurchase);
                    }

                    // console.log(purchases);



                    // =========== START CREATING SVGS ===========


                    // =========== OVERVIEW OF CURRENT AVAILABLE STRUCTURES ===========
                    //assignmentMap         a map of [carID --> name] AND of [name --> carID] of each employee
                    //gpsMapSplitCars      a map of [carID --> array of GPS entries] of all GPS positions for each car
                    //gpsMapIntervals      a map of [carID --> array of GPS entries] of 5 minute time intervals for each car
                    //gpsMapStationary      a map of [carID --> array of GPS entries] of time intervals where cars are in stationary positions
                    //purchases             a map of [carID --> array of GPS entries] of time intervals where cars are in stationary positions


                    console.log("------");
                    console.log("assignmentMap:");
                    console.log(assignmentMap);
                    console.log("------");
                    console.log("gpsMapSplitCars:");
                    console.log(gpsMapSplitCars);
                    console.log("------");
                    console.log("gpsMapIntervals:");
                    console.log(gpsMapIntervals);
                    console.log("------");
                    console.log("gpsMapStationary:");
                    console.log(gpsMapStationary);
                    console.log("------");
                    console.log("purchases:");
                    console.log(purchases);

                    let k = new KronosMap('kronos-map', gpsMapStationary);
                    let a = new AbilaMap('abila-map', gpsMapStationary);
                    let p = new PurchsingBarGraph('bar-graph-purchases');

                });



            });



        });
        
       
    });


}

Main.prototype.gpsEquality = function(currentEntry, checkEntry){
    return Math.abs(checkEntry.lat - currentEntry.lat) < 0.005
    && Math.abs(checkEntry.long - currentEntry.long) < 0.005;

}


let m = new Main();




