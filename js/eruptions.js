
this.etna = this.etna || {};

this.etna.eruptionsChart = (function() {
  var boundingBox, craterLocations, focusScale, height, margin, parseDate, width, x, xAxis, y, yAxis,
    _this = this;
  craterLocations = {
    "NorthEast": [15.0636, 37.7516],
    "SouthEast": [15.0742, 37.7098],
    "Voragine": [15.0677, 37.7305],
    "Bocca Nuova": [15.0197, 37.7256]
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
  width = 960 - margin.left - margin.right;
  height = 100 - margin.top - margin.bottom;
  parseDate = d3.time.format("%Y").parse;
  x = d3.time.scale().range([0, width]);
  y = d3.scale.linear().range([height, 0]);
  focusScale = d3.time.scale();
  xAxis = d3.svg.axis().scale(x).orient("bottom");
  yAxis = d3.svg.axis().scale(y).orient('left').ticks(4);
  return {
    init: function(eruptionData, map, circleLayer, markerLayer) {
      var eruption, _results;
      _this.map = map;
      _this.circleLayer = circleLayer;
      _this.markerLayer = markerLayer;
      _this.markerLayer.factory(function(f) {
        var elem;
        elem = mapbox.markers.simplestyle_factory(f);
        return elem;
      });
      _this.interaction = mapbox.markers.interaction(_this.markerLayer);
      _this.sanitizedData = [];
      _results = [];
      for (eruption in eruptionData) {
        _results.push(_this.sanitizedData.push({
          'date': parseDate(eruption),
          'vei': +eruptionData[eruption].vei,
          'craters': eruptionData[eruption].craters,
          'ash': eruptionData[eruption].ash
        }));
      }
      return _results;
    },
    drawBarchart: function(eruptionData) {
      var svg;
      svg = d3.select("#map-legend").append("svg").attr('class', 'barchart').attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      x.domain(d3.extent(_this.sanitizedData, function(d) {
        return d.date;
      }));
      y.domain(d3.extent(_this.sanitizedData, function(d) {
        return d.vei;
      }));
      svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
      svg.append('g').attr('class', 'y axis').call(yAxis);
      svg.selectAll('rect').data(_this.sanitizedData).enter().append('rect').attr('x', function(d, i) {
        return x(d.date);
      }).attr('y', function(d) {
        return y(d.vei);
      }).attr('height', function(d, i) {
        return height - y(d.vei);
      }).attr('width', 7);
      _this.brush = d3.svg.brush().x(x).on('brush', etna.eruptionsChart.eruptionsBrush).on('brushend', etna.eruptionsChart.eruptionsBrushEnd);
      return svg.append("g").attr("class", "x brush").call(_this.brush).selectAll("rect").attr("y", -6).attr("height", height + 7);
    },
    eruptionsBrush: function() {
      var dataFiltered;
      focusScale.domain(_this.brush.extent());
      dataFiltered = _this.sanitizedData.filter(function(d, i) {
        if ((d.date >= focusScale.domain()[0]) && (d.date <= focusScale.domain()[1])) {
          return true;
        }
      });
      _this.circleLayer.data(boundingBox, dataFiltered);
      _this.circleLayer.draw();
      return _this.map.refresh();
    },
    eruptionsBrushEnd: function() {
      var ashFalls, crater, craterExplosions, craterName, dataFiltered, datum, location, tooltipText, tooltipTitle, town, townName, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      dataFiltered = _this.sanitizedData.filter(function(d, i) {
        if ((d.date >= focusScale.domain()[0]) && (d.date <= focusScale.domain()[1])) {
          return true;
        }
      });
      craterExplosions = {};
      ashFalls = {};
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
      }
      _this.markerLayer.features([]);
      for (craterName in craterExplosions) {
        tooltipTitle = "Explosion at crater " + craterName;
        tooltipText = craterExplosions[craterName].join(', ');
        _this.markerLayer.add_feature({
          geometry: {
            coordinates: craterLocations[craterName]
          },
          properties: {
            'marker-color': '#993341',
            'marker-symbol': 'minefield',
            title: "" + tooltipTitle + " in " + tooltipText
          }
        });
      }
      for (townName in ashFalls) {
        tooltipTitle = "Ash falling on " + townName;
        tooltipText = ashFalls[townName].join(', ');
        location = (_ref2 = etna.towns[townName]) != null ? _ref2.location : void 0;
        if (location) {
          _this.markerLayer.add_feature({
            geometry: {
              coordinates: [location.lon, location.lat]
            },
            properties: {
              'marker-color': '#777',
              'marker-symbol': 'star-stroked',
              title: "" + tooltipTitle + " in " + tooltipText
            }
          });
        }
      }
      return $('.simplestyle-marker').parent().attr('class', 'markers');
    }
  };
})();
