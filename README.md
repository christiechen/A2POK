# A2POK

==== HOW TO RUN THE PROTOTYPE ====
Kronos Map: 
    The "Switch Maps" button switches the SVG between the Kronos and the Abila Map given. 
    Select a valid time range and press the "Play Visualization" button to see a projection of the GPS coordinate data 
    in that time period. 
    Hover over each point to see the person at that location. More data will be added to this tooltip in the future.

Purchases bar graph:
    We will be adding a rather extensive clickable legend to the bar graph and improving the x-axis (which as of right now is quite unreadable). The red bars is for CC data, and the blue for loyalty data.
    Click a bar to view a scatterplot of location-specific purchases. Hover over each scatterplot point to see details of the purchase.

Purchasing search:
    Select any combination of the filtering inputs. You can also select none. Click "Search Purchases" to see a list of purchases that fit the search criteria.
    
    If your search yields more than 500 results, it is counted as a broad search. Only the first 500 searches will appear, and the full list of results is listed in the console. This is because when using this as a visualization tool, we currently hope to not have to look through more than 500 results manually.
