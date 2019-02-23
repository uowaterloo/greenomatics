Greenomatics
Team Members : Sheryl Chau, Raghav Sethi, Rohit Verma, Hunar Malik
Mission Statement
Our vision for sustainable urban development is the reduction of single-household grocery trips
through a grocery delivery service in Calgary. With our app, users will be able to see how a
delivery service that accommodates multiple homes can further environmental sustainability
through decreasing the emissions of single-household grocery trips.
Characteristics
Our web application calculates the carbon dioxide (CO2) emissions, fuel cost and time spent for
each round trip to the grocery store. The user specifies their starting point and a grocery store of
their choice. The icons can be used as reference points for grocery stores in the region. In
addition, the number of trips can be modified through a drop-down menu. By showing the
amount of CO2 emitted, cost of fuel and time spent for each grocery trip, we hope this will
encourage clients to use our future delivery service.
Goal
Our goal is to show the amount of CO2 that is emitted and the cost of fuel for each
single-household grocery trip in Calgary. The application will calculate the round trip emissions
and fuel cost from a user-defined starting point to their preferred grocery store. We hope that
these numbers will encourage users to sign up for our future delivery service to reduce their
CO2 emissions. In the future, we hope that our service will change the way people shop for
groceries and reduce the need for large parking lots that could be converted to green space.
Using our App
1. Go to website: https://uowaterloo.github.io/greenomatics/index.html
2. Click on the Log-in button on the top right banner to login to the Greenomatics Website
with your credentials.
PS. Since it’s just a dummy, you can log in with any fake credentials.
3. Once you log in, you’ll be able to see the dashboard. In the box labelled App Overview,
the web application will show up. Click the button “Expand” to open the web application
in a new window.
4. Input your start location and end locations. The grocery store icons can be used for
reference. Users can add additional stops using the “Add Stop” button.
5. The number of trips can also be chosen in the drop-down menu labelled “Trips”.
6. The directions dashboard will show the carbon emissions, fuel cost and time saved per
user-defined number of trips.
Calculations
CO2 Emissions
The CO2 emissions are calculated based on the distance (in kilometres) of the user-defined trip
multiplied by the amount of CO2 emitted per kilometre. The result was multiplied by 2 for
round-trip(s) and multiplied by the user-defined number of trips. According to the United States
Environmental Protection Agency [EPA] (2018), 404 grams of CO2 is emitted by the average
car per mile. This was converted into metric units in Equation 1 and the final calculation for the
CO2 emissions per round-trip is shown in Equation 2.
1 mile
404 grams of CO2 = 1 km
251 grams of CO2 (1)
O2 Emissions C = Distance * 251g * 2 * Trips (2)
Fuel Cost
The fuel costs are calculated based on the distance (in kilometres) of the user-defined trip
divided by the average fuel efficiency of a car multiplied by the annual average cost of gas. Like
the CO2 emissions, the result was multiplied by 2 to show results for round-trip(s) and again
multiplied by the user-defined number of trips. EPA’s (2018) average fuel efficiency of 22 miles
per gallon was converted to metric units (see Equation 3). The average cost of regular gas in
Calgary was $1.198 / L in 2018 (Statistics Canada, n.d.). The final equation for fuel cost is
shown in Equation 4.
1 gallon
22 miles = 1 litre
9.353 km (3)
Fuel Cost = Distance / 9.353 * $1.198 * 2 * Trips (4)
Limitations
A considerable amount of time was spent attempting to make a widget that incorporates basic
grocery items for users to select and order. Due to time limitations, we were unable to
incorporate this into our application or webpage. Additionally, the webpage is only a mock-up
website that provides a template for the service we are hoping to achieve. However, we wanted
to create this webpage as a template for how our future service would function.
Acknowledgements
We want to acknowledge the EarthLink 2017 ECCE App Challenge team, as we drew
inspiration from their idea of calculating CO2 emissions for each grocery trip. Ultimately, their
idea allowed us to create our emissions widget to hopefully encourage users to opt for an
environmentally sustainable grocery delivery service based on the emissions, fuel costs and
time spent on single-household grocery trips.
References
Statistics Canada. No date. 18-10-0001-01 Monthly average retail prices for gasoline
and fuel oil, by geography (table). CANSIM (database). Retrieved from
https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000101
United States Environmental Protection Agency. (2018, May 10). Greenhouse Gas
Emissions from a Typical Passenger Vehicle. Retrieved from
https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger
-vehicle
87 Fonda Way SE