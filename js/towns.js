
this.etna = this.etna || {};

this.etna.townsExplorer = (function() {
  var templates, townsData;
  templates = this.etna.templates;
  townsData = void 0;
  return {
    init: function(townsDataIn, chartComponent) {
      townsData = townsDataIn;
      etna.towns = townsDataIn.towns;
      this.townsLayer = etna.map.townsLayer;
      this.chartComponent = chartComponent;
      return this.initEvents();
    },
    initEvents: function() {
      this.initRegionLinks();
      this.initTownsLayer();
      return this.addTownsToMap([1900, 2011]);
    },
    initTownsLayer: function() {
      this.townsLayer.factory(function(f) {
        var elem;
        elem = mapbox.markers.simplestyle_factory(f);
        $(elem).addClass("town-marker");
        MM.addEvent(elem, 'click', function(e) {
          etna.townsExplorer.showTown(f.properties.id);
          return etna.townsExplorer.initBackButton();
        });
        MM.addEvent(elem, 'mouseover', function(e) {
          return $(elem).parent('div').css("z-index", "20");
        });
        MM.addEvent(elem, 'mouseout', function(e) {
          return $(elem).parent('div').css("z-index", "10");
        });
        return elem;
      });
      this.interaction = mapbox.markers.interaction(this.townsLayer);
      return this.interaction.formatter(function(feature) {
        var html, populationDiff, populationTrend;
        populationTrend = "";
        populationDiff = feature.properties.endPopulation - feature.properties.startPopulation;
        if (populationDiff > 0) {
          populationTrend = "<span class='badge badge-success'><i class='icon-arrow-up'></i>&nbsp;" + populationDiff + "</span>";
        } else {
          populationTrend = "<span class='badge badge-important'><i class='icon-arrow-down'></i>&nbsp;" + populationDiff + "</span>";
        }
        return html = "<div style=\"z-index: 1000\">\n<h2>" + feature.properties.town + "&nbsp;<small>" + populationTrend + "</small></h2>\n<table class='table table-striped'>\n  <thead>\n    <tr>\n      <th>Value</th>\n      <th>From</th>\n      <th>To</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Year</td>\n      <td><b>" + feature.properties.startYear + "</b></td>\n      <td><b>" + feature.properties.endYear + "</b></td>\n    </tr>\n    <tr>\n      <td>Population</td>\n      <td>" + feature.properties.startPopulation + "</td>\n      <td>" + feature.properties.endPopulation + "</td>\n    </tr>\n  </tbody>\n</table>\n</div>";
      });
    },
    addTownsToMap: function(timeWindow) {
      var location, markerColor, markerSize, town, townName, _ref;
      if (timeWindow == null) {
        timeWindow = [];
      }
      this.townsLayer.features([]);
      if (timeWindow[0] === timeWindow[1]) {
        timeWindow[0] = 1900;
        timeWindow[1] = 2011;
      }
      _ref = etna.towns;
      for (townName in _ref) {
        town = _ref[townName];
        location = town.location;
        markerSize = "small";
        if (town.census[timeWindow[1]] > 25000) {
          markerSize = "medium";
        }
        if (town.census[timeWindow[1]] > 100000) {
          markerSize = "large";
        }
        markerColor = "#339532";
        if (town.census[timeWindow[1]] < town.census[timeWindow[0]]) {
          markerColor = "#BB3E4D";
        }
        this.townsLayer.add_feature({
          geometry: {
            coordinates: [location.lon, location.lat]
          },
          properties: {
            'marker-color': markerColor,
            'marker-symbol': 'town-hall',
            'marker-size': markerSize,
            id: townName,
            town: town.name,
            startYear: timeWindow[0],
            endYear: timeWindow[1],
            startPopulation: town.census[timeWindow[0]],
            endPopulation: town.census[timeWindow[1]]
          }
        });
      }
      $(".town-marker").parent('div').addClass('town-markers');
      return $(".simplestyle-marker").parent('div').addClass('markers');
    },
    initRegionLinks: function() {
      var _this = this;
      return $(".region-link").click(function(event) {
        var $this, region;
        event.preventDefault();
        $this = $(event.currentTarget);
        region = $this.data("region");
        _this.showTown(region);
        return _this.initBackButton();
      });
    },
    initBackButton: function() {
      var _this = this;
      return $("#back-to-towns").click(function(event) {
        event.preventDefault();
        etna.map.resetInitialState();
        $("#towns-explorer").html(templates.townsNavigation(townsData));
        return _this.initRegionLinks();
      });
    },
    showTown: function(region) {
      var regionContent, regionData;
      etna.map.showRegion(region);
      regionData = etna.towns[region];
      regionContent = templates.regionTeaser({
        title: regionData.name,
        teaser: regionData.text,
        imageurl: regionData.imageurl,
        population: regionData.population
      });
      $("#towns-explorer").html(regionContent);
      return this.drawTownsPopulationChart(region);
    },
    drawTownsPopulationChart: function(region) {
      var data, population, regionData, viewInstance, year, _ref;
      regionData = etna.towns[region];
      data = {};
      data["table"] = [];
      _ref = regionData['census'];
      for (year in _ref) {
        population = _ref[year];
        data["table"].push({
          "year": year,
          "population": population
        });
      }
      return viewInstance = this.chartComponent({
        el: "#vis",
        data: data,
        renderer: "svg"
      }).update();
    }
  };
})();
