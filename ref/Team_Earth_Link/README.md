# App Challenge 2017 Runner-up

***Team Earth Link*** *was the first runner-up for the App Challenge 2017*!

Congratulations from everyone at Esri Canada.

---

# **Urth-Routes by EarthLink**
### ECCE App Challenge 2017

---------------------------------------------------
**Team Members:** Jaydeep Mistry, Stephanie Lee, and Carmen Kong

--------------------------------------------------
## Our Goal
Urth-Route is a navigation app focused on sustainable solutions to transportation by promoting the use of alternate transportation modes to stay healthy and reduce your carbon footprint. By informing users of their estimated emissions released for their trip, users can reflect on their contribution to their carbon footprint and climate change.

We encourage the use of alternative transportation modes such as walking, running, and cycling, which release zero emissions. By showing the convenience and accessibility of biking with the inclusion of Community Access Bikeshare stations and bicycle parking locations across the region of Waterloo, communities can be empowered to having active and greener lifestyles.

----------------------------------------------------------
## How to Use Urth-Routes

#### How to Install the App
1. Download the _UrthRoutes.zip_ file and extract its contents.
2. Inside, a folder named 2 holds the entire ArcGIS WebApp along with it’s appropriate files. Move the 2 Folder inside your ArcGIS Web AppBuilder path: arcgis-web-appbuilder-2.3\WebAppBuilderForArcGIS\server\apps\ and rename the old folder.
3. Open the Web App link of your localhost which will be similar to [_https://localhost:3344/webappbuilder/apps/2/_ ].
4. When you open the app, you may be prompted for your ArcGIS.com credentials because the Directions service uses the ArcGIS World Routing service.
5. Once your credentials are verified, the app will be ready to use.

#### Set Your Desired Route
Select the starting point and destination for your trip by clicking directly on the map or entering addresses or place names into the widget side panel on the left. Urth Routes will suggest the shortest route to get to your end point. Users may choose whether they would like the route to be determined by shortest drive time or distance, or shortest walking time or distance, and additional options are also available. Additional waypoints may also be added to the map for longer routes with more desired stop. For more accurate estimations, driving options should be used  when observing emissions values and walking options should be used for walking and running calorie counts.

#### Consider the Impact of Your Trip
Urth-Routes will calculate and display the amount of carbon dioxide emissions that would be emitted from a small car and calories burned from walking, running, and cycling over your specified trip. The emissions and calories burned values will automatically update as a trip is edited.

#### Customize to Your Details
The presented emissions and calorie expenditure can be further customized to fit the user.
For the given carbon dioxide emissions values, the specific fuel efficiency of a user’s car may be entered for an output more accustomed to the user’s needs.

Here are some resources for users to find the **fuel efficiency** of their car’s model.

- _Natural Resources Canada - Fuel Consumption Ratings Search Tool for Conventional Vehicles_ :
<http://oee.nrcan.gc.ca/fcr-rcf/public/index-e.cfm>
- _U.S. Department of Energy - Find A Car_ :
<http://www.fueleconomy.gov/feg/findacar.shtml>

For the calorie expenditure calculations, the user can input their **weight** as well as personal walking, running, and biking **speeds** if they have that information available. This will provide more accurate calculations that is suited to the fitness and characteristics of the user.  

**Metabolic equivalents (METs)** may also be edited to account for the different intensities of the different activities. A table of METs for various activities can be found here: <https://www.hsph.harvard.edu/nutritionsource/mets-activity-table/>

---------------------------------------------------------------
## More About the Application
### Data Used
Urth-Routes uses two open data point feature layers from the City of Waterloo’s open data portal. One layer is the City of Waterloo's Bicycle Parking and another is the Community Access Bikeshare Stations. This data is displayed on a web map and the data points can be clicked on for more information in a pop-up.


[**City of Waterloo Bicycle Parking**](http://opendata-city-of-waterloo.opendata.arcgis.com/datasets/1659e541306543d095fc39ad29aa1efd_0?geometry=-80.684%2C43.447%2C-80.468%2C43.485&orderByFields=CAPACITY+DESC/)

[**Community Access Bikeshare Stations**](http://opendata-city-of-waterloo.opendata.arcgis.com/datasets/a55e4ab566cd4d33a74ff4deb5bfd15f_0?geometry=-80.722%2C43.424%2C-80.289%2C43.499)

### Build of Application

Tools used to create the app:
- ArcGIS Web AppBuilder
- ArcGIS API for Javascript v4.2 - Custom the Directions widget for Emissions & Calories estimates
- Dojo Dijit Tabs Layout

The Urth-Routes App uses a customized version of the Directions widget, where it renders directions, as well as the calories burned and carbon emissions reduced. It creates an ideal route for the user and calculates the summary statistics of calories burned and emissions production for if the route is traveled by car.

All of the code for modifications made to the Directions widget is written in the widget’s HTML and Javascript file under the file path _2\widgets\Directions_ . For the HTML, the data-dojo-attach-point for the directionController will render the Directions widget, but the rest of the HTML code will render the user interface for the tabs, estimate values, and the app parameter customize inputs. As for the Javascript code, the Widget.js file has full documentation of all of the functions required to calculate the emissions & calories, as well as display the estimates and handle changes to the parameters. Every time a new route is calculated, or an app parameter is customized, the user interface for the estimates will update automatically.

The rest of the components of the app, including the user interface, icons, pop-ups and widgets, were put together entirely by using ArcGIS Web AppBuilder and ArcGIS Online. Below is the full list of native features and widgets we used for our web application:
- Basemap: ArcGIS.com custom map with Bicycling parking and Bikeshare points
- Splash screen
- Directions widget (customized version)
- About widget
- Legend widget
- Layers widget
- Print widget
- Share widget
- Near me widget
- Change basemap widget

### Calculations
#### Calories Burned
Total **calories** burned are calculated by multiplying a metabolic equivalent (MET) variable, depending on the type of  physical activity, by the weight of the user in kilograms and the estimated duration of the activity in hours.

>Calories = MET x Weight (kg) x Time (hours)

Source: (Buttussi & Chittaro, 2008)

**Note:** A default weight of 60 kg is used in the widget and can be changed in the _Customize_ tab.

The **time** is estimated by dividing the length of the path that the user chose by the walking, running, or biking speed for an average person.

>Time = Distance/Speed

The **average speeds** of the various activities used as defaults in the calories burned calculations are listed below:
- Walking - 5.0 km/h
- Running - 9.0 km/h
- Biking - 15.5 km/h

Source: (Jetté, Sidney, & Blümchen, 1990)

Users can choose from three different physical activities to reach their destination without producing any greenhouse gas emissions while also getting in some exercise.
The **metabolic equivalents (METs)** for the three most common sustainable modes of transportation are as follows:
- Walking 	MET = 3.20
- Running	MET = 8.80
- Biking	MET = 5.90

Sources: (Ainsworth, et al., 2011; Jetté, Sidney, & Blümchen, 1990)

#### Emissions Savings
**Total emissions savings** are calculated by dividing the **distance** in miles by the **fuel efficiency** of a vehicle which by default is determined using the average fuel efficiency of a small car at 22.4 miles per gallon. This is then multiplied by the amount of **carbon dioxide produced** per gallon of fuel burned (NativeEnergy, n.d.).

>Total Carbon Dioxide Emissions Produced = Driving Distance (Miles) / Fuel Efficiency (Miles per Gallon) x Carbon Dioxide Produced per Gallon Burned (19.56 pounds per gallon)

Sources: (Bin & Dowlatabadi, 2005; Lin, 2010)

The user may enter the specific fuel efficiency of their personal vehicle as well. As a guideline, a larger car would have an average fuel efficiency of 18.0 mpg. Smaller cars are lighter and more fuel efficient than larger, heavier cars which require more energy and fuel to travel the same distance.

**Note:** The following default values are used in the calculations.
- Fuel Efficiency for a Small Car = 22.4 Miles per Gallon (Can be configured in _Customize_ tab)
- Carbon Dioxide Produced = 19.56 pounds per gallon

### Limitations
We hoped to use ArcGIS server to have a custom routing service because we wanted to have custom layers of pedestrian walkways, and bike paths but we could not do so because we felt that there was a lack of instructions on how to set it up from scratch. We also spent a lot of time trying to make our own widget for routing, but we had difficulty working with ArcGIS Web Appbuilder so we opted to customize the existing Directions widget instead. We also attempted to use a single HTML page for our app instead of using the Web Appbuilder, but we had difficulty in getting the routing service to connect to ArcGIS Online.

### Acknowledgements
We want to acknowledge last year’s University of Waterloo team, UWSpin whom had a similar idea of showing emissions for travel routes, by walking, driving, and busing. They had used their own routing service as well. We took some inspiration from their idea in showing vehicle emissions.

We would also like to thank Scott MacFarlane from the University of Waterloo’s MAD Lab and Michael Leahly from Esri Canada for their help and support.

### References
Ainsworth, Barbara E.; Haskell, William L.; Whitt, Melicia C.; Irwin, Melinda L.; Swartz, Ann M.; Strath, Scott J.; O'Brien, William L.; Bassett, David R.; Schmitz, Kathryn H.; Emplaincourt, Patricia O.; Jacobs, David R.; Leon, Arthur S. (2000). "Compendium of Physical Activities: An update of activity codes and MET intensities". _Medicine & Science in Sports & Exercise. 32_ (9 Suppl): S498–504. doi:10.1097/00005768-200009001-00009. PMID 10993420.

Bin, S., & Dowlatabadi, H. (2005). Consumer lifestyle approach to US energy use and the related CO2 emissions. _Energy Policy, 33_(2), 197-208. doi:10.1016/s0301-4215(03)00210-6

Buttussi, F., & Chittaro, L. (2008). MOPET: A context-aware and user-adaptive wearable system for fitness training. _Artificial Intelligence in Medicine, 42_(2), 153-163. doi:10.1016/j.artmed.2007.11.004

Jetté, M., Sidney, K., & Blümchen, G. (1990). Metabolic equivalents (METs) in exercise testing, exercise prescription, and evaluation of functional capacity. _Clinical Cardiology, 13_(8), 555-565. doi:10.1002/clc.4960130809

Lin, T. (2010). Carbon dioxide emissions from transport in Taiwan's national parks. _Tourism Management, 31_(2), 285-290. doi:10.1016/j.tourman.2009.03.009

NativeEnergy. (n.d.). Your Climate Solutions Expert: carbon offsets, renewable energy credits, and carbon tracking services. Retrieved February 21, 2017, from http://www.nativeenergy.com/travel.html
