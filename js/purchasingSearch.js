function PurchasingSearch(allPurchases){
    var self = this;

    self.purchases = allPurchases;

    self.init();
    
}
//SEARCH FILES HERE: 
PurchasingSearch.prototype.init = function(){
    var self = this;

    //on click
    $('#searchPurch').on('click', ()=>{
        console.log('hi');
        console.log(self.purchases.length);

        let searches = [...self.purchases];

        let start = document.getElementById('startDatePurch').value;
        let startDate = new Date(start);
        
        let end = document.getElementById('endDatePurch').value;
        let endDate = new Date(end);

        let fName = $('#fNamePurch').val();
        let lName = $('#lNamePurch').val();
        let location = $('#locationPurch').val();

        //filter each one separately so that not all fields have to be fileld out
        if(start !== ""){
            searches = searches.filter((el)=> startDate < el.timestamp);
        }
        else{
            console.log('no start date')
        }
        if(end !== ""){
            searches = searches.filter((el)=> endDate > el.timestamp);
        }
        else{
            console.log('no end date')
        }
        if(fName !== ""){
            searches = searches.filter((el)=> fName.toLowerCase() === el.FirstName.toLowerCase());

        }
        else{
            console.log('no first name')
        }
        if(lName !== ""){
            searches = searches.filter((el)=> lName.toLowerCase() ===  el.LastName.toLowerCase());

        }
        else{
            console.log('no last name')
        }
        if(location !== ""){
            searches = searches.filter((el)=> el.location.toLowerCase().indexOf(location.toLowerCase()) !== -1);
        }
        else{
            console.log('no location')
        }
        
        console.log("========= SEARCH RESULTS ==========");
        console.log(searches);
        
        self.draw(searches);
  
    });
}

PurchasingSearch.prototype.draw = function(searches){
    $('#numSearches').text(`${searches.length} results`);
    

    if( searches.length > 500){
        searches.length = 500;
        alert("Too many results returned; first 500 are shown on page. Please check the console for a full list of your results.")
    }
    
    let ul = $("#purchasing-search");

    ul.empty(); //empty search field

    ul.append(`
    <li id='purchases-header'> 
        <span class='date'> Date </span> 
        <span class='time'> Time </span> 
        <span class='type'> Type </span> 
        <span class='price'> Price </span> 
        <span class='location'> Location </span> 
        <span class='name'> Name </span> 
        
    </li>`);

    //sort results
    searches.sort((a,b) => a.timestamp - b.timestamp);
    

    searches.forEach((el)=>{
        console.log('hi');
        ul.append(`
            <li> 
                <span class='date'> ${el.timestamp.getMonth()+1}/${el.timestamp.getDate()}/${el.timestamp.getFullYear()}</span> 
                <span class='time'> ${el.timestamp.getHours() < 10 ? '0' + el.timestamp.getHours(): el.timestamp.getHours()}:${el.timestamp.getMinutes() < 10 ? '0' + el.timestamp.getMinutes(): el.timestamp.getMinutes()}</span> 
                <span class='type'> ${el.type === 'cc'? "Credit Card" : "Loyalty"}</span> 
                <span class='price'> ${el.price}</span> 
                <span class='location'> ${el.location}</span> 
                <span class='name'> ${el.FirstName} ${el.LastName}</span> 
                
            </li>`);


    });
}
