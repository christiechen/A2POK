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
            
            // ========== EMPLOYEE RECORDS
            d3.csv("data/EmployeeRecords.csv")
            .then(function (data){
            
                let employeeData = data;

                //sort employees into map of name --> [employment type, employment title]
                let employeeIndividual = new Map();
                //sort employees into map of employment type --> [employees]
                let employeeEmploymentType = new Map();
                //sort employees into map of employment title --> [employees]
                let employeeEmploymentTitle = new Map();

                for(let i = 0; i<employeeData.length; i++){
                    let currentEmp = employeeData[i];
                    let name = currentEmp.FirstName + " " + currentEmp.LastName;
                    let empType = currentEmp.CurrentEmploymentType;
                    let empTitle= currentEmp.CurrentEmploymentTitle;

                    employeeIndividual.set(name, [empType, empTitle]);
                    
                    if(employeeEmploymentType.has(empType)){
                        employeeEmploymentType.get(empType).push(currentEmp);
                    }
                    else{
                        employeeEmploymentType.set(empType, [currentEmp]);
                    }

                    if(employeeEmploymentTitle.has(empTitle)){
                        employeeEmploymentTitle.get(empTitle).push(currentEmp);
                    }
                    else{
                        employeeEmploymentTitle.set(empTitle, [currentEmp]);
                    }
                }
                // console.log(employeeIndividual);
                // console.log(employeeEmploymentType);
                // console.log(employeeEmploymentTitle);







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
    
                //for convenience, we can also add the name of the person to the car they were driving and their employment types
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
                    currentEntry.employmentType = employeeIndividual.get(currentEntry.FirstName + " " + currentEntry.LastName)[0];
                    currentEntry.employmentTitle = employeeIndividual.get(currentEntry.FirstName + " " + currentEntry.LastName)[1];
    
    
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
                        //also, add in employment type and title

                        for(let i = 0; i<loyalty.length; i++){
                            let currentPurchase = loyalty[i];
                            currentPurchase.CarID = assignmentMap.get(currentPurchase.FirstName + ' ' + currentPurchase.LastName);
                            currentPurchase.type = 'loyalty';
                            currentPurchase.employmentType = employeeIndividual.get(currentPurchase.FirstName + ' ' + currentPurchase.LastName)[0];
                            currentPurchase.employmentTitle = employeeIndividual.get(currentPurchase.FirstName + ' ' + currentPurchase.LastName)[1];

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
                            currentPurchase.employmentType = employeeIndividual.get(currentPurchase.FirstName + ' ' + currentPurchase.LastName)[0];
                            currentPurchase.employmentTitle = employeeIndividual.get(currentPurchase.FirstName + ' ' + currentPurchase.LastName)[1];
    
                            //fix datatypes
                            currentPurchase.price = +currentPurchase.price;
                            let time = currentPurchase.timestamp.split(" ");
                            let date = time[0].split("/");
                            time = time[1];
                            time = time.split(":");
                            
                            currentPurchase.timestamp = new Date(+date[2], +date[0]-1, +date[1], +time[0], +time[1]);
    
                            purchases.push(currentPurchase);
                            
                        }
    
    
                        // SORTING PURCHASES INTO MAPS
    
                        // BY EMPLOYEE
                        let purchasesByEmployee = new Map();
                        let purchasesByEmploymentType = new Map();
                        let purchasesByEmploymentTitle = new Map();
                        let purchasesByLocation = new Map();
                        for(let i = 0; i<purchases.length; i++){
                            let currentPurchase = purchases[i];
                            let name = currentPurchase.FirstName + " " + currentPurchase.LastName;
                            let empType = currentPurchase.employmentType;
                            let empTitle = currentPurchase.employmentTitle;
                            let location = currentPurchase.location;
                            // BY EMPLOYEE
                            if(purchasesByEmployee.has(name)){
                                purchasesByEmployee.get(name).push(currentPurchase);
                            }
                            else{
                                purchasesByEmployee.set(name, [currentPurchase]);
                            }

                            // BY EMPLOYMENT TYPE
                            if(purchasesByEmploymentType.has(empType)){
                                purchasesByEmploymentType.get(empType).push(currentPurchase);
                            }
                            else{
                                purchasesByEmploymentType.set(empType, [currentPurchase]);
                            }

                            // BY EMPLOYMENT TITLE
                            if(purchasesByEmploymentTitle.has(empTitle)){
                                purchasesByEmploymentTitle.get(empTitle).push(currentPurchase);
                            }
                            else{
                                purchasesByEmploymentTitle.set(empTitle, [currentPurchase]);
                            }

                            // BY LOCATION
                            if(purchasesByLocation.has(location)){
                                purchasesByLocation.get(location).push(currentPurchase);
                            }
                            else{
                                purchasesByLocation.set(location, [currentPurchase]);
                            }
                        }
    
                        // console.log(purchases);
    
    
                        //sort all maps

                        // console.log(purchasesByEmploymentType.get('Security'));
                        // let sec = purchasesByEmploymentType.get('Security');
                        // sec.sort((a,b) => a.location - b.location);
                        // console.log(sec);

                        for (let [key, value] of purchasesByEmployee){
                            console.log(value);
                            value.sort((a,b) => a.location.localeCompare(b.location));
                        }
                        for (let [key, value] of purchasesByEmploymentType){
                            value.sort((a,b) => a.location.localeCompare(b.location));
                        }
                        for (let [key, value] of purchasesByEmploymentTitle){
                            value.sort((a,b) => a.location.localeCompare(b.location));
                        }
    
                        // =========== START CREATING SVGS ===========
    
    
                        // =========== OVERVIEW OF CURRENT AVAILABLE STRUCTURES ===========
                        //assignmentMap                 a map of [carID --> name] AND of [name --> carID] of each employee
                        //gpsMapSplitCars               a map of [carID --> array of GPS entries] of all GPS positions for each car
                        //gpsMapIntervals               a map of [carID --> array of GPS entries] of 5 minute time intervals for each car
                        //gpsMapStationary              a map of [carID --> array of GPS entries] of time intervals where cars are in stationary positions
                        //purchases                     a map of [carID --> array of GPS entries] of time intervals where cars are in stationary positions
                        //employeeIndividual            a map of [employee full name --> [employment type, employment title]] 
                        //employeeEmploymentType        a map of [employment type --> array of employee (full objects)]
                        //employeeEmploymentTitle       a map of [employment title --> array of employee (full objects)]
                        //purchases                     an array of all purchases
                        //purchasesByEmployee           a map of [employee full name --> array of purchases]
                        //purchasesByEmploymentType     a map of [employment type --> array of purchases]
                        //purchasesByEmploymentTitle    a map of [employment title --> array of purchases]
                        //purchasesByLocation           a map of [location --> array of purchases]
                        
                        
                        // SAMPLE LOGS -- NOT ALL AVAILABLE STRUCTURES ARE LOGGED
    
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
                        console.log("------");
                        console.log("purchases by employee:");
                        console.log(purchasesByEmployee);
                        console.log("------");
                        console.log("purchases by employment type:");
                        console.log(purchasesByEmploymentType);
                        console.log("------");
                        console.log("purchases by location:");
                        console.log(purchasesByLocation);
    
                        // let k = new KronosMap('kronos-map', gpsMapStationary);
                        let a = new AbilaMap('abila-map', gpsMapStationary);
                        let p = new PurchasingBarGraph('bar-graph-purchases',purchasesByEmploymentType, purchasesByEmployee, purchasesByLocation);
                        // Initially set to administration
                        // p.update("Administration");
                        let pSearch = new PurchasingSearch(purchases);
                        
                    });
    
    
    
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




