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

// object
var defaults = {
  distance: 0,    // total distance in kilometers
  ntrips: 1,
  time: 0,
};

// object
var retval = {
  co2: 0,
  fuelcost: 0,
  // rounds num to decimlas
  roundVal: function (num, decimals) {
      return (parseFloat(Math.round(num * 100) / 100).toFixed(decimals)).toString() + " ";
  }
};

// backup object
var router = {
  0: {
      directions: {
          summary: {
              totalLength: 0,
              totalTime: 0,
          }
      }
  }
};

// refresh calculaions
function calcAgain(routeResults) {

  router = routeResults;

  defaults.distance = router[0].directions.summary.totalLength;
  defaults.ntrips = document.getElementById("trips").value ;
  defaults.time = router[0].directions.summary.totalTime;

  // update calculaions
  retval.co2 = (((defaults.distance * 251 * 2) / 1000 ) * defaults.ntrips);
  retval.fuelcost = (((defaults.distance / 9.353 ) * 1.198 * 2 ) * defaults.ntrips);
  retval.time = ((defaults.time * 2 ) * defaults.ntrips);

  // outputs
  document.getElementById("co2count").innerHTML = retval.roundVal(retval.co2, 2) + " KG of CO2 / round trip";
  document.getElementById("fuel").innerHTML = retval.roundVal(retval.fuelcost, 2) + " $$ of fuel / round trip ";
  document.getElementById("time").innerHTML = retval.roundVal(retval.time, 2) + " mins / round trip ";
};

// updates state
function updateApp() {
  calcAgain(router);
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
            // create tab

            this.tabContainer = new TabContainer({
                tabs: [{
                    title: "Directions",
                    content: this.tabone
                },],
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

                console.log(evt.result.routeResults)


                calcAgain(routeResults);
                

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