
this.etna = this.etna || {};

this.etna.eruptionsChart = (function() {
  var boundingBox, focusScale, height, margin, parseDate, width, x, xAxis, y, yAxis,
    _this = this;
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
    init: function(eruptionData, map, circleLayer) {
      var eruption, _results;
      _this.map = map;
      _this.circleLayer = circleLayer;
      _this.sanitizedData = [];
      _results = [];
      for (eruption in eruptionData) {
        _results.push(_this.sanitizedData.push({
          'date': parseDate(eruption),
          'vei': +eruptionData[eruption]
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
      _this.brush = d3.svg.brush().x(x).on('brush', etna.eruptionsChart.eruptionsBrush);
      return svg.append("g").attr("class", "x brush").call(_this.brush).selectAll("rect").attr("y", -6).attr("height", height + 7);
    },
    eruptionsBrush: function() {
      var dataFiltered, datum, veis, _i, _len;
      focusScale.domain(_this.brush.extent());
      dataFiltered = _this.sanitizedData.filter(function(d, i) {
        if ((d.date >= focusScale.domain()[0]) && (d.date <= focusScale.domain()[1])) {
          return true;
        }
      });
      veis = [];
      for (_i = 0, _len = dataFiltered.length; _i < _len; _i++) {
        datum = dataFiltered[_i];
        veis.push(datum.vei);
      }
      _this.circleLayer.data(boundingBox, veis);
      _this.circleLayer.draw();
      return _this.map.refresh();
    }
  };
})();
