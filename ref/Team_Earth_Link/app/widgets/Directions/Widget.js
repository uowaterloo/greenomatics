///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// Made by: Team Earth Link
// From: University of Waterloo
// Last Modified: 26 February, 2017
//
// Description: In this section is the custom Javascript code we wrote for
// calculating and displaying the emissions & calorie estimates. All of the
// estimates are based off of the distance calcualted in the route that
// from the Direction Wieget's native code.
// 
// Services: We are using the Esri's own ArcGIS World routing service so the app
// can theoretically show emisisons and calories estimates wherever the 
// service can generate routes for.
// 
// Code licensing: We follow the GNU General Public Licence v3.0 
// https://www.gnu.org/licenses/gpl-3.0.en.html


// appParam is an object
// It is initialized here with default values of the app. This object's properties
// will be used in further calculations, as well as be updated if the user
// choses to do so
var appParam = {
    distance: 0,    // total distance in kilometers
    weight: 60,     // user's weight in kilograms
    mileage: 22.4,  // Fuel economy as miles per gallon
    met_walk: 3.2,  // Metabolic rate for walking
    met_run: 8.8,   // Metabolic rate for running
    met_bike: 5.9,  // Metabolic rate for biking
    speed_walk: 5,  // Average Speed for waking
    speed_run: 9,   // Average Speed for running
    speed_bike: 15.5// Average Speed for biking
};

// calc variable is an object
// It is initialized here with default values of all zeroes because when the widgit is
// initialized, there would be no route, so no estimates to display
var calc = {
    emission: 0,
    walk: 0,
    run: 0,
    cycle: 0,
    // roundStr is a custom function that takes in two numbers. The first is the number
    // you want to round, and the second is the decimal places you want to round up to.
    // The function returns a rounded number, that is in a String format.
    roundStr: function (num, decimals) {
        return (parseFloat(Math.round(num * 100) / 100).toFixed(decimals)).toString() + " ";
    }
};

// router is an object
// It is initialized here and it is to protect the functionality of the code. Since the
// estimates are calcualted off of the total distance of the route, if the user were to
// change the parameters of the app before a route is calcualted, the route object would
// be null and crash the code, so this router object is a backup object with a route
// of zero total length.
var router = {
    0: {
        directions: {
            summary: {
                totalLength: 0
            }
        }
    }
};

// reEstimate is a function that takes in a RouteResult object, and updates
// the estimates in the code, as well as the user interface on the widgit.
function reEstimate(routeResults) {

    // regardless of where ever the reEstimate function is called,
    // the route variable is updated and will always point to it when
    // recalculating estimates from the customize tab
    router = routeResults;

    //console.log(routeResults); //uncheck this if you want to debug the routeResults variable

    // The section below updates the appParam object with the values
    // from the customize tab of the app.
    appParam.distance = router[0].directions.summary.totalLength;

    appParam.weight = document.getElementById("customWeight").value;
    appParam.mileage = document.getElementById("customMileage").value;

    appParam.met_walk = document.getElementById("customMETWalk").value;
    appParam.met_run = document.getElementById("customMETRun").value;
    appParam.met_bike = document.getElementById("customMETBike").value;

    appParam.speed_walk = document.getElementById("customSpeedWalk").value;
    appParam.speed_run = document.getElementById("customSpeedRun").value;
    appParam.speed_bike = document.getElementById("customSpeedBike").value;

    // the section below updates calc object which holds all the estiamtes
    calc.emission = appParam.distance / appParam.mileage * 19.56 * 0.62;
    calc.walk = (appParam.distance / appParam.speed_walk) * appParam.met_walk * appParam.weight;
    calc.run = (appParam.distance / appParam.speed_run) * appParam.met_run * appParam.weight;
    calc.cycle = (appParam.distance / appParam.speed_bike) * appParam.met_bike * appParam.weight;

    // the section below will update the user interface for the new estiamtes
    document.getElementById("totalEmissions").innerHTML = calc.roundStr(calc.emission, 2) + " Pounds of CO2";
    document.getElementById("walkCal").innerHTML = calc.roundStr(calc.walk, 0) + " Calories";
    document.getElementById("runCal").innerHTML = calc.roundStr(calc.run, 0) + " Calories";
    document.getElementById("cycleCal").innerHTML = calc.roundStr(calc.cycle, 0) + " Calories";
};

// updateApp is a function that only calls the reEstimate function with the router variable
// This function is used in the HTML of the page. Everytime there is a change in the
// input boxes in the customize tab, this function is called to update the interface
function updateApp() {
    reEstimate(router);
};

// resetAppParams is a function that is called when the Reset button in the customize
// tab of the user interface is clicked. All this function does is reset the input boxes
// to their default values, and call the reEstimate function to update the estimates.
function resetAppParams() {
    document.getElementById("customWeight").value = 60;
    document.getElementById("customMileage").value = 22.4;
    document.getElementById("customMETWalk").value = 3.2;
    document.getElementById("customMETRun").value = 8.8;
    document.getElementById("customMETBike").value = 5.9;
    document.getElementById("customSpeedWalk").value = 5;
    document.getElementById("customSpeedRun").value = 9;
    document.getElementById("customSpeedBike").value = 15.5;

    reEstimate(router);
};

///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'jimu/BaseWidget',
    'esri/dijit/Directions',
    'esri/tasks/locator',
    'esri/tasks/RouteParameters',
    'esri/request',
    'esri/graphicsUtils',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'dojo/on',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/_base/array',
    'dojo/_base/config',
    'dojo/Deferred',
    'dojo/promise/all',
    'jimu/portalUtils',
    "jimu/dijit/TabContainer" // The dijit's TabContainer library was added in have tabs in the user interface.
],
  function (declare, BaseWidget, Directions, Locator, RouteParameters, esriRequest, graphicsUtils,
    ArcGISDynamicMapServiceLayer, on, lang, html, array, dojoConfig, Deferred, all, portalUtils, TabContainer) {

      return declare([BaseWidget], {
          name: 'Directions',
          baseClass: 'jimu-widget-directions',
          _dijitDirections: null,
          _routeTaskUrl: "//route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World",
          _locatorUrl: "//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
          _active: false,//save last active state
          _dijitDef: null,
          _trafficLayer: null,
          _isInitPresetStopsFlag: false,

          onOpen: function () {
              this.widgetManager.activateWidget(this);
          },

          onClose: function () {
              this._hide();
          },

          onNormalize: function () {
              this._show();
          },

          onMinimize: function () {
              this._hide();
          },

          onMaximize: function () {
              this._show();
          },

          onDeActive: function () {
              this._deactivateDirections();
              this._enableWebMapPopup();
          },

          setStartStop: function (stop) {
              this.getDirectionsDijit().then(lang.hitch(this, function (directionsDijit) {
                  directionsDijit.reset().then(lang.hitch(this, function () {
                      directionsDijit.addStop(stop);
                  }), lang.hitch(this, function (err) {
                      console.error(err);
                  }));
              }), lang.hitch(this, function (err) {
                  console.error(err);
              }));
          },

          addStop: function (stop) {
              this.getDirectionsDijit().then(lang.hitch(this, function (directionsDijit) {
                  directionsDijit.addStop(stop);
              }), lang.hitch(this, function (err) {
                  console.error(err);
              }));
          },

          getDirectionsDijit: function () {
              if (!this._dijitDef) {
                  this._dijitDef = new Deferred();
              }
              if (this._dijitDef.isFulfilled()) {
                  this._dijitDef = new Deferred();
              }
              if (this._dijitDirections) {
                  this._dijitDef.resolve(this._dijitDirections);
              }
              return this._dijitDef;
          },

          _handlePopup: function () {
              if (this.map.activeDirectionsWidget && this.map.activeDirectionsWidget.mapClickActive) {
                  this._disableWebMapPopup();
              } else {
                  this._enableWebMapPopup();
              }
          },

          _disableWebMapPopup: function () {
              if (this.map) {
                  this.map.setInfoWindowOnClick(false);
              }
          },

          _enableWebMapPopup: function () {
              if (this.map) {
                  this.map.setInfoWindowOnClick(true);
              }
          },

          destroy: function () {
              if (this.map.activeDirectionsWidget === this._dijitDirections) {
                  this.map.activeDirectionsWidget = null;
              }
              if (this._trafficLayer) {
                  this.map.removeLayer(this._trafficLayer);
                  this._trafficLayer = null;
              }
              this._handlePopup();
              this.inherited(arguments);
          },

          startup: function () {
              ///////////////////////////////////////////////////////////////////////////
              // Below is the code for creating a TabContainer using dojo & dijit
              // This section is necessary for rendering the tabs as shown in the userinterface

              this.tabContainer = new TabContainer({
                  tabs: [{
                      title: "Directions",
                      content: this.tab1
                  }, {
                      title: "Customize",
                      content: this.tab2
                  }],
                  selected: this.nls.conditions
              }, this.tabWidget);
              this.tabContainer.startup();
              ///////////////////////////////////////////////////////////////////////////

              this.inherited(arguments);
              this.portal = portalUtils.getPortal(this.appConfig.portalUrl);

              this._preProcessConfig().then(lang.hitch(this, function () {
                  var routeParams = new RouteParameters();
                  var routeOptions = this.config.routeOptions;

                  console.log(routeParams);
                  console.log(routeOptions);

                  if (routeOptions) {
                      if (routeOptions.directionsLanguage) {
                          routeParams.directionsLanguage = routeOptions.directionsLanguage;
                      }
                      else {
                          routeParams.directionsLanguage = dojoConfig.locale || "en_us";
                      }
                      routeParams.directionsLengthUnits = routeOptions.directionsLengthUnits;
                      routeParams.directionsOutputType = routeOptions.directionsOutputType;
                      if (routeOptions.impedanceAttribute) {
                          routeParams.impedanceAttribute = routeOptions.impedanceAttribute;
                      }
                  }

                  var options = {
                      map: this.map,
                      searchOptions: this.config.searchOptions,
                      routeParams: routeParams,
                      routeTaskUrl: this.config.routeTaskUrl,
                      dragging: true,
                      showClearButton: true,
                      mapClickActive: true,
                      showMilesKilometersOption: false,
                      mapClickActive: true
                  };

                  if (this.config.trafficLayerUrl) {
                      this._trafficLayer = new ArcGISDynamicMapServiceLayer(this.config.trafficLayerUrl);
                      options.trafficLayer = this._trafficLayer;
                      options.traffic = true;
                  } else {
                      options.traffic = false;
                      options.showTrafficOption = false;
                  }

                  this.setDoNotFetchTravelModes(options).then(lang.hitch(this, function () {
                      html.empty(this.directionController);
                      var directionContainer = html.create('div', {}, this.directionController);
                      //Only init Directions dijit when we can access the route task url.
                      esriRequest({
                          url: options.routeTaskUrl,
                          content: {
                              f: 'json'
                          },
                          handleAs: 'json',
                          callbackParamName: 'callback'
                      }).then(lang.hitch(this, function () {
                          this._dijitDirections = new Directions(options, directionContainer);
                          //html.place(this._dijitDirections.domNode, this.directionController);
                          this._dijitDirections.startup();

                          this.own(on(this._dijitDirections, 'load', lang.hitch(this, this._onDirectionsActivate)));

                          this.own(on(this._dijitDirections,
                            'directions-finish',
                            lang.hitch(this, this._onDirectionsFinish)));

                          this.own(on(this._dijitDirections,
                            'map-click-active',
                            lang.hitch(this, this._handlePopup)));

                          this._activateDirections();
                          this._storeLastActiveState();

                          if (this._dijitDef && !this._dijitDef.isFulfilled()) {
                              this._dijitDef.resolve(this._dijitDirections);
                          }
                      }), lang.hitch(this, function (err) {
                          console.log("Can't access " + options.routeTaskUrl, err);
                      }));
                  }), lang.hitch(this, function (err) {
                      console.error(err);
                  }));
              }));
          },

          onAppConfigChanged: function (appConfig) {
              this.appConfig = appConfig;
          },

          _onDirectionsFinish: function (evt) {
              if (evt && evt.result) {
                  var routeResults = evt.result.routeResults;
                  
                  ///////////////////////////////////////////////////////////////////////////
                  // The _onDirectionsFinish is the function used to render the route AFTER
                  // it is calculated. This moment is used to call the reEstimate function
                  // while passing the routeResults object of the calcualted RouteTask
                  // to update the estimates and display them accordingly

                  reEstimate(routeResults);
                  ///////////////////////////////////////////////////////////////////////////

                  if (lang.isArrayLike(routeResults) && routeResults.length > 0) {
                      var routes = [];
                      array.forEach(routeResults, function (routeResult) {
                          if (routeResult.route) {
                              routes.push(routeResult.route);
                          }
                      });
                      if (routes.length > 0) {
                          var ext = null;
                          try {
                              ext = graphicsUtils.graphicsExtent(routes);
                              if (ext) {
                                  ext = ext.expand(1.3);
                              }
                          } catch (e) {
                              console.log(e);
                          }
                          if (ext) {
                              this.map.setExtent(ext);
                          }
                      }
                  }
              }
          },

          _preProcessConfig: function () {
              if (!this.config.geocoderOptions) {
                  this.config.geocoderOptions = {};
              }
              if (!(this.config.geocoderOptions.geocoders &&
               this.config.geocoderOptions.geocoders.length > 0)) {
                  this.config.geocoderOptions.geocoders = [{
                      url: '',
                      placeholder: ''
                  }];
              }

              var placeholder = this.config.geocoderOptions.geocoders[0].placeholder;

              if (!placeholder) {
                  if (!this.config.routeTaskUrl) {
                      //user doesn't open the setting page, we use the default placeholder
                      placeholder = this.nls.searchPlaceholder;
                  }
              }

              this.config.searchOptions = {
                  enableSuggestions: this.config.geocoderOptions.autoComplete,
                  maxSuggestions: this.config.geocoderOptions.maxLocations,
                  minCharacters: this.config.geocoderOptions.minCharacters,
                  suggestionDelay: this.config.geocoderOptions.searchDelay,
                  sources: [{
                      locator: null,
                      name: '',
                      singleLineFieldName: '',
                      outFields: ["*"],
                      placeholder: placeholder
                  }]
              };

              var def = new Deferred();
              all([this._getRouteTaskUrl(), this._getLocatorUrl()]).then(
                lang.hitch(this, function (results) {
                    this.config.routeTaskUrl = results[0];

                    this.config.routeTaskUrl = this._replaceRouteTaskUrlWithAppProxy(this.config.routeTaskUrl);

                    var locatorUrl = results[1];
                    esriRequest({
                        url: locatorUrl,
                        hanleAs: 'json',
                        content: {
                            f: 'json'
                        },
                        callbackParamName: 'callback'
                    }).then(lang.hitch(this, function (geocodeMeta) {
                        this.config.searchOptions.sources[0].locator = new Locator(locatorUrl);
                        this.config.searchOptions.sources[0].name = geocodeMeta.serviceDescription || '';
                        this.config.searchOptions.sources[0].singleLineFieldName =
                         geocodeMeta.singleLineAddressField && geocodeMeta.singleLineAddressField.name || '';
                        def.resolve();
                    }), lang.hitch(this, function (err) {
                        console.error(err);
                        def.reject();
                    }));
                }), lang.hitch(this, function (err) {
                    console.error(err);
                    def.reject();
                }));
              return def;
          },

          _replaceRouteTaskUrlWithAppProxy: function (routeTaskUrl) {
              // Use proxies to replace the routeTaskUrl
              var ret = routeTaskUrl;
              if (!window.isBuilder && !this.appConfig.mode &&
                  this.appConfig.appProxies && this.appConfig.appProxies.length > 0) {
                  array.some(this.appConfig.appProxies, function (proxyItem) {
                      if (routeTaskUrl === proxyItem.sourceUrl) {
                          ret = proxyItem.proxyUrl;
                          return true;
                      }
                  });
              }
              return ret;
          },

          _getRouteTaskUrl: function () {
              var def = new Deferred();
              if (this.config.routeTaskUrl) {
                  def.resolve(this.config.routeTaskUrl);
              }
              else {
                  this.portal.loadSelfInfo().then(lang.hitch(this, function (response) {
                      if (response && response.helperServices && response.helperServices.route) {
                          def.resolve(response.helperServices.route.url);
                      }
                      else {
                          def.resolve(this._routeTaskUrl);
                      }
                  }), lang.hitch(this, function (err) {
                      console.error(err);
                      def.resolve(this._routeTaskUrl);
                  }));
              }
              return def;
          },

          _getLocatorUrl: function () {
              var def = new Deferred();
              var geocodeArgs = this.config.geocoderOptions &&
               this.config.geocoderOptions.geocoders &&
                this.config.geocoderOptions.geocoders[0];
              var url = geocodeArgs && geocodeArgs.url;
              if (url) {
                  def.resolve(url);
              }
              else {
                  this.portal.loadSelfInfo().then(lang.hitch(this, function (response) {
                      if (response && response.helperServices &&
                       response.helperServices.geocode &&
                        response.helperServices.geocode.length > 0) {
                          var geocode = response.helperServices.geocode[0];
                          def.resolve(geocode.url);
                      }
                      else {
                          def.resolve(this._locatorUrl);
                      }
                  }), lang.hitch(this, function (err) {
                      console.error(err);
                      def.resolve(this._locatorUrl);
                  }));
              }
              return def;
          },

          setDoNotFetchTravelModes: function (options) {
              var def = new Deferred();
              if (this.config.travelModesUrl) {
                  options.travelModesServiceUrl = this.config.travelModesUrl;
                  options.doNotFetchTravelModesFromOwningSystem = false;
                  def.resolve();
              } else {
                  this._getTravelModesUrlVersion().then(lang.hitch(this, function (version) {
                      if (version && version >= 10.4) {
                          options.doNotFetchTravelModesFromOwningSystem = false;
                      } else {
                          options.doNotFetchTravelModesFromOwningSystem = true;
                      }
                      def.resolve();
                  }), lang.hitch(this, function (err) {
                      def.reject(err);
                  }));
              }
              return def;
          },
          _getTravelModesUrlVersion: function () {
              var def = new Deferred();
              esriRequest({
                  url: this.config.routeTaskUrl,
                  content: {
                      f: 'json'
                  },
                  handleAs: 'json',
                  callbackParamName: 'callback'
              }).then(lang.hitch(this, function (results) {
                  def.resolve(results.currentVersion);
              }), lang.hitch(this, function (err) {
                  console.log("Can't access " + this.config.routeTaskUrl, err);
                  def.reject(err);
              }));

              return def;
          },

          _hide: function () {
              if (this._dijitDirections) {
                  this._storeLastActiveState();
                  this._deactivateDirections();
              }
          },

          _show: function () {
              if (this._dijitDirections) {
                  this._resetByLastActiveState();
              }
          },

          _storeLastActiveState: function () {
              if (this._dijitDirections) {
                  this._active = this._dijitDirections.mapClickActive;
              }
          },

          _resetByLastActiveState: function () {
              if (this._dijitDirections) {
                  if (this._active) {
                      this._activateDirections();
                  }
                  else {
                      this._deactivateDirections();
                  }
                  this._storeLastActiveState();
              }
          },

          _activateDirections: function () {
              if (this._dijitDirections) {
                  if (typeof this._dijitDirections.activate === 'function') {
                      this._dijitDirections.activate();//Deprecated at v3.13
                  }
                  if (typeof this._dijitDirections.mapClickActive !== "undefined") {
                      this._dijitDirections.set("mapClickActive", true);
                  }
                  this._disableWebMapPopup();
              }
          },

          _deactivateDirections: function () {
              if (this._dijitDirections) {
                  if (typeof this._dijitDirections.deactivate === 'function') {
                      this._dijitDirections.deactivate();//Deprecated at v3.13
                  }
                  if (typeof this._dijitDirections.mapClickActive !== "undefined") {
                      this._dijitDirections.set("mapClickActive", false);
                  }
                  this._enableWebMapPopup();
              }
          },
          _onDirectionsActivate: function () {
              if (this.config.defaultLocations &&
                this.config.defaultLocations.length && this.config.defaultLocations.length > 0 &&
                false === this._isInitPresetStopsFlag) {

                  this._isInitPresetStopsFlag = true;
                  this._dijitDirections.addStops(this.config.defaultLocations);
              }
          },

          isHasFrom: function () {
              var hasFrom = false;
              if (this._dijitDirections) {
                  var stops = this._dijitDirections.stops;
                  if (stops && stops.length >= 0) {
                      var from = stops[0];
                      if (("undefined" !== typeof from.name && "" !== from.name) ||
                        ("undefined" !== typeof from.feature) ||
                        ("undefined" !== typeof from.extent)) {
                          hasFrom = true;
                      }
                  }
              }
              return hasFrom;
          },
          // isHasTo: function () {
          //   var hasTo = false;
          //   if (this._dijitDirections) {
          //     var stops = this._dijitDirections.stops;
          //     if (stops && stops.length === 1) {
          //       var to = stops[1];
          //       if (("undefined" !== typeof to.name && "" !== to.name) ||
          //         ("undefined" !== typeof to.feature) ||
          //         ("undefined" !== typeof to.extent)) {
          //         hasTo = true;
          //       }
          //     } else if (stops && stops.length > 1) {
          //       hasTo = true;
          //     }
          //   }
          //   return hasTo;
          // },
          // actionTo: function (geometry) {
          //   this.getDirectionsDijit().then(lang.hitch(this, function (directionsDijit) {
          //     //var stops = this._dijitDirections.stops;
          //     if (false === this.isHasFrom()) {
          //       directionsDijit.addStops(["", geometry]);
          //     } else {
          //       directionsDijit.addStop(geometry);
          //     }
          //   }), lang.hitch(this, function (err) {
          //     console.error(err);
          //   }));
          // },
          // actionFrom: function (geometry) {
          //   this.setStartStop(geometry);
          // }
          actionTo: function (geometry) {
              this.getDirectionsDijit().then(lang.hitch(this, function (directionsDijit) {
                  var stops = this._getReplaceStops(directionsDijit, geometry, "last");
                  directionsDijit.reset().then(lang.hitch(this, function () {
                      directionsDijit.addStops(stops);
                  }), lang.hitch(this, function (err) {
                      console.error(err);
                  }));
              }), lang.hitch(this, function (err) {
                  console.error(err);
              }));
          },
          actionFrom: function (geometry) {
              this.getDirectionsDijit().then(lang.hitch(this, function (directionsDijit) {
                  var stops = this._getReplaceStops(directionsDijit, geometry, "first");
                  directionsDijit.reset().then(lang.hitch(this, function () {
                      directionsDijit.addStops(stops);
                  }), lang.hitch(this, function (err) {
                      console.error(err);
                  }));
              }), lang.hitch(this, function (err) {
                  console.error(err);
              }));
          },
          _getReplaceStops: function (dijitDirections, geometry, place) {
              var stops = [];
              if (dijitDirections && dijitDirections.stops) {
                  stops = dijitDirections.stops;
                  if (place === "first") {
                      //replace first stop ,as "From"
                      stops[0] = geometry;
                  } else if (place === "last") {
                      //replace last stop ,as "To"
                      var len = stops.length;
                      if (false === this.isHasFrom()) {
                          //if without start stop, leave a blank
                          stops = ["", geometry];
                      } else {
                          stops[len - 1] = geometry;
                      }
                  }
              }
              return stops;
          }
      });
  });