
this.etna = this.etna || {};

this.etna.eruptionsChart = (function() {
  var addAirportShutdowns, addAshFalls, addDestroyed, addEarthquakes, addExplosions, airportLocations, boundingBox, craterLocations, focusScale, height, lastExtent, margin, parseDate, width, x, xAxis, y, yAxis,
    _this = this;
  airportLocations = {
    "catania": [15.0659, 37.4704]
  };
  craterLocations = {
    "NorthEast": {
      "lon": 15.0636,
      "lat": 37.7516
    },
    "SouthEast": {
      "lon": 15.0742,
      "lat": 37.7098
    },
    "Voragine": {
      "lon": 15.0677,
      "lat": 37.7305
    },
    "Bocca Nuova": {
      "lon": 15.0197,
      "lat": 37.7256
    }
  };
  boundingBox = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "id": "34",
        "properties": {
          "name": "BoundingBox"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[[13.5, 37.2], [16.5, 38.2], [16.5, 38.2]]]
        }
      }
    ]
  };
  _this = {};
  margin = {
    top: 20,
    right: 40,
    bottom: 20,
    left: 50
  };
  width = 640 - margin.left - margin.right;
  height = 100 - margin.top - margin.bottom;
  parseDate = d3.time.format("%Y").parse;
  x = d3.time.scale().range([0, width]);
  y = d3.scale.linear().range([height, 0]);
  focusScale = d3.time.scale();
  lastExtent = void 0;
  xAxis = d3.svg.axis().scale(x).orient("bottom");
  yAxis = d3.svg.axis().scale(y).orient('left').ticks(4);
  addExplosions = function(craterExplosions, markerLayer) {
    var craterName, location, tooltipText, tooltipTitle, _results;
    _results = [];
    for (craterName in craterExplosions) {
      tooltipTitle = "Explosion at crater " + craterName;
      tooltipText = craterExplosions[craterName].join(', ');
      location = craterLocations[craterName];
      _results.push(markerLayer.add_feature({
        geometry: {
          coordinates: [location.lon, location.lat]
        },
        properties: {
          'marker-color': '#FEB24C',
          'marker-size': 'small',
          'marker-symbol': 'minefield',
          title: "" + tooltipTitle + " in " + tooltipText
        }
      }));
    }
    return _results;
  };
  addAshFalls = function(ashFalls, markerLayer) {
    var location, tooltipText, tooltipTitle, townName, _ref, _results;
    _results = [];
    for (townName in ashFalls) {
      tooltipTitle = "Ash falling on " + townName;
      tooltipText = ashFalls[townName].join(', ');
      location = (_ref = etna.towns[townName]) != null ? _ref.location : void 0;
      if (location) {
        _results.push(markerLayer.add_feature({
          geometry: {
            coordinates: [location.lon - 0.005, location.lat - 0.005]
          },
          properties: {
            'marker-color': '#777',
            'marker-size': 'small',
            'marker-symbol': 'star-stroked',
            title: "" + tooltipTitle + " in " + tooltipText
          }
        }));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  addAirportShutdowns = function(airportShutdowns, markerLayer) {
    var airportName, location, tooltipText, tooltipTitle, _results;
    _results = [];
    for (airportName in airportShutdowns) {
      tooltipTitle = "Airport " + airportName + " was shut down";
      tooltipText = airportShutdowns[airportName].join(', ');
      location = airportLocations[airportName];
      if (location) {
        _results.push(markerLayer.add_feature({
          geometry: {
            coordinates: location
          },
          properties: {
            'marker-color': '#387FA8',
            'marker-size': 'small',
            'marker-symbol': 'airport',
            title: "" + tooltipTitle + " in " + tooltipText
          }
        }));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  addDestroyed = function(destroyed, markerLayer) {
    var destroyedTown, location, tooltipText, tooltipTitle, _ref, _results;
    _results = [];
    for (destroyedTown in destroyed) {
      tooltipTitle = "" + destroyedTown + " was destroyed in ";
      tooltipText = destroyed[destroyedTown].join(', ');
      location = (_ref = etna.towns[destroyedTown]) != null ? _ref.location : void 0;
      if (location) {
        _results.push(markerLayer.add_feature({
          geometry: {
            coordinates: [location.lon + 0.005, location.lat + 0.005]
          },
          properties: {
            'marker-color': '#000',
            'marker-size': 'small',
            'marker-symbol': 'cross',
            title: "" + tooltipTitle + " in " + tooltipText
          }
        }));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  addEarthquakes = function(earthquakes, markerLayer) {
    var earthquake, location, tooltipText, tooltipTitle, _ref, _results;
    _results = [];
    for (earthquake in earthquakes) {
      tooltipTitle = "An earthquake triggered by an eruption was in " + earthquake + " ";
      tooltipText = earthquakes[earthquake].join(', ');
      location = (_ref = etna.towns[earthquake]) != null ? _ref.location : void 0;
      location || (location = craterLocations[earthquake]);
      if (location) {
        _results.push(markerLayer.add_feature({
          geometry: {
            coordinates: [location.lon - 0.005, location.lat + 0.005]
          },
          properties: {
            'marker-color': '#5C461F',
            'marker-size': 'small',
            'marker-symbol': 'e',
            title: "" + tooltipTitle + " in " + tooltipText
          }
        }));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  return {
    init: function(eruptionData, map, circleLayer, markerLayer, lavaLayer) {
      var eruption, lavaStream, _results;
      _this.map = map;
      _this.circleLayer = circleLayer;
      _this.lavaLayer = lavaLayer;
      _this.markerLayer = markerLayer;
      _this.markerLayer.factory(function(f) {
        var elem;
        elem = mapbox.markers.simplestyle_factory(f);
        return elem;
      });
      _this.interaction = mapbox.markers.interaction(_this.markerLayer);
      _this.sanitizedData = [];
      _this.lavaFlows = [];
      _results = [];
      for (eruption in eruptionData) {
        _this.sanitizedData.push({
          'date': parseDate(eruption),
          'vei': +eruptionData[eruption].vei,
          'craters': eruptionData[eruption].craters,
          'ash': eruptionData[eruption].ash,
          'airportShutdown': eruptionData[eruption].airportShutdown,
          'destroyed': eruptionData[eruption].destroyed,
          'earthquake': eruptionData[eruption].earthquake,
          'lavaflows': eruptionData[eruption].lavaflows
        });
        _results.push((function() {
          var _i, _len, _ref, _results1;
          _ref = eruptionData[eruption].lavaflows;
          _results1 = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            lavaStream = _ref[_i];
            _results1.push(this.lavaFlows.push({
              'direction': lavaStream.flow.direction,
              'length': lavaStream.flow.length,
              'crater': lavaStream.crater,
              'date': parseDate(eruption),
              'reachedHere': 1,
              'yearsReached': [parseDate(eruption).getFullYear()]
            }));
          }
          return _results1;
        }).call(_this));
      }
      return _results;
    },
    drawBarchart: function(eruptionData) {
      var barchartGroup, bars, svg, svg_container;
      svg_container = d3.select("#map-legend").append("svg").attr('class', 'barchart').attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
      svg = svg_container.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      x.domain(d3.extent(_this.sanitizedData, function(d) {
        return d.date;
      }));
      y.domain(d3.extent(_this.sanitizedData, function(d) {
        return d.vei;
      }));
      svg_container.append('text').attr('class', 'y label').attr('text-anchor', 'end').attr('x', 30).attr('y', height - margin.top - margin.bottom).text('VEI');
      svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
      svg.append('g').attr('class', 'y axis').call(yAxis);
      svg.selectAll('rect').data(_this.sanitizedData).enter().append('rect').attr('x', function(d, i) {
        return x(d.date);
      }).attr('y', function(d) {
        return y(d.vei);
      }).attr('height', function(d, i) {
        return height - y(d.vei);
      }).attr('width', 4);
      _this.brush = d3.svg.brush().x(x).on('brush', etna.eruptionsChart.eruptionsBrush).on('brushend', etna.eruptionsChart.eruptionsBrushEnd);
      barchartGroup = svg.append("g").attr("class", "x brush").call(_this.brush);
      bars = barchartGroup.selectAll("rect").attr("y", -6).attr("height", height + 7);
      if (lastExtent) {
        return barchartGroup.call(_this.brush.extent(lastExtent));
      }
    },
    getBrush: function() {
      return _this.brush.extent();
    },
    eruptionsBrush: function() {
      var dataFiltered, lavaFiltered;
      lastExtent = _this.brush.extent();
      focusScale.domain(_this.brush.extent());
      dataFiltered = _this.sanitizedData.filter(function(d, i) {
        if ((d.date >= focusScale.domain()[0]) && (d.date <= focusScale.domain()[1])) {
          return true;
        }
      });
      lavaFiltered = _this.lavaFlows.filter(function(d, i) {
        if ((d.date >= focusScale.domain()[0]) && (d.date <= focusScale.domain()[1])) {
          return true;
        }
      });
      _this.circleLayer.data(boundingBox, dataFiltered);
      _this.circleLayer.draw();
      _this.lavaLayer.data(boundingBox, lavaFiltered);
      _this.lavaLayer.draw();
      _this.map.refresh();
      return $(".lava-flow").tooltip({
        'container': 'body',
        'placement': 'top'
      });
    },
    eruptionsBrushEnd: function() {
      var airport, airportShutdowns, ashFalls, crater, craterExplosions, dataFiltered, datum, destroyed, destroyedTown, earthquakeTown, earthquakes, town, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4;
      dataFiltered = _this.sanitizedData.filter(function(d, i) {
        if ((d.date >= focusScale.domain()[0]) && (d.date <= focusScale.domain()[1])) {
          return true;
        }
      });
      craterExplosions = {};
      ashFalls = {};
      airportShutdowns = {};
      destroyed = {};
      earthquakes = {};
      for (_i = 0, _len = dataFiltered.length; _i < _len; _i++) {
        datum = dataFiltered[_i];
        _ref = datum.craters;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          crater = _ref[_j];
          craterExplosions[crater] || (craterExplosions[crater] = []);
          craterExplosions[crater].push(datum.date.getFullYear());
        }
        _ref1 = datum.ash;
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          town = _ref1[_k];
          ashFalls[town] || (ashFalls[town] = []);
          ashFalls[town].push(datum.date.getFullYear());
        }
        if (datum.airportShutdown) {
          _ref2 = datum.airportShutdown;
          for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
            airport = _ref2[_l];
            airportShutdowns[airport] || (airportShutdowns[airport] = []);
            airportShutdowns[airport].push(datum.date.getFullYear());
          }
        }
        if (datum.destroyed) {
          _ref3 = datum.destroyed;
          for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
            destroyedTown = _ref3[_m];
            destroyed[destroyedTown] || (destroyed[destroyedTown] = []);
            destroyed[destroyedTown].push(datum.date.getFullYear());
          }
        }
        if (datum.earthquake) {
          _ref4 = datum.earthquake;
          for (_n = 0, _len5 = _ref4.length; _n < _len5; _n++) {
            earthquakeTown = _ref4[_n];
            earthquakes[earthquakeTown] || (earthquakes[earthquakeTown] = []);
            earthquakes[earthquakeTown].push(datum.date.getFullYear());
          }
        }
      }
      _this.markerLayer.features([]);
      addExplosions(craterExplosions, _this.markerLayer);
      addAshFalls(ashFalls, _this.markerLayer);
      addAirportShutdowns(airportShutdowns, _this.markerLayer);
      addDestroyed(destroyed, _this.markerLayer);
      addEarthquakes(earthquakes, _this.markerLayer);
      etna.townsExplorer.addTownsToMap([focusScale.domain()[0].getFullYear(), focusScale.domain()[1].getFullYear()]);
      return $(".simplestyle-marker").parent('div').addClass('markers');
    }
  };
})();
