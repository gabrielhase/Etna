
this.etna = this.etna || {};

this.etna.d3layer = function(map, mapDrawSvg, mapDrawGroup, lavaDrawGroup) {
  var bounds, etnaLocation, firstDraw, getDistance, plumes, project;
  etnaLocation = [15.004, 37.734];
  plumes = {
    0: 0.1,
    1: 1,
    2: 5,
    3: 15,
    4: 25,
    5: 35
  };
  bounds = {};
  firstDraw = true;
  project = function(location) {
    var point;
    point = map.locationPoint({
      lat: location[1],
      lon: location[0]
    });
    return [point.x, point.y];
  };
  getDistance = function(vei) {
    return plumes[vei] / 111;
  };
  return {
    draw: function() {
      var pixelLocation;
      if (firstDraw) {
        mapDrawSvg.attr('width', map.dimensions.x).attr('height', map.dimensions.y).style('margin-left', '0px').style('margin-top', '0px');
        firstDraw = false;
      }
      pixelLocation = project(etnaLocation);
      d3.selectAll('circle').attr('cx', pixelLocation[0]).attr('cy', pixelLocation[1]).attr('r', function(d, i) {
        var dist, distPoint, distPointLat;
        dist = getDistance(d.vei);
        distPointLat = etnaLocation[1] + dist;
        distPoint = project([etnaLocation[0], distPointLat]);
        return pixelLocation[1] - distPoint[1];
      });
      return d3.selectAll('path').attr('d', function(d, i) {
        var direction, dist, distPoint, distPointLat, distPointLon, length, path, _ref;
        path = "M 0 0 L 0 0";
        if (d.lavaflows && d.lavaflows) {
          _ref = d.lavaflows;
          for (direction in _ref) {
            length = _ref[direction];
            switch (direction) {
              case "South":
                dist = length / 111;
                distPointLat = etnaLocation[1] - dist;
                distPoint = project([etnaLocation[0], distPointLat]);
                path = "M " + pixelLocation[0] + " " + pixelLocation[1] + " L " + distPoint[0] + " " + distPoint[1];
                break;
              case "North":
                dist = length / 111;
                distPointLat = etnaLocation[1] + dist;
                distPoint = project([etnaLocation[0], distPointLat]);
                path = "M " + pixelLocation[0] + " " + pixelLocation[1] + " L " + distPoint[0] + " " + distPoint[1];
                break;
              case "East":
                dist = length / (111 * Math.cos(pixelLocation[1]));
                distPointLon = etnaLocation[0] + dist;
                distPoint = project([distPointLon, etnaLocation[1]]);
                path = "M " + pixelLocation[0] + " " + pixelLocation[1] + " L " + distPoint[0] + " " + distPoint[1];
                break;
              case "West":
                dist = length / (111 * Math.cos(pixelLocation[1]));
                distPointLon = etnaLocation[0] - dist;
                distPoint = project([distPointLon, etnaLocation[1]]);
                path = "M " + pixelLocation[0] + " " + pixelLocation[1] + " L " + distPoint[0] + " " + distPoint[1];
                break;
              default:
                path = "M 0 0 L 0 0";
            }
          }
        }
        return path;
      }).attr("stroke", "red").attr("stroke-width", 10).attr("fill", "red").selectAll('title').text(function(d, i) {
        var text;
        text = "lavaflow in " + (d.date.getFullYear());
        return text;
      });
    },
    data: function(boundingBox, eruptions) {
      var feature, lava;
      bounds = d3.geo.bounds(boundingBox);
      feature = mapDrawGroup.selectAll('circle').data(eruptions);
      feature.exit().remove();
      feature.enter().append('circle');
      lava = lavaDrawGroup.selectAll('path').data(eruptions);
      lava.exit().remove();
      return lava.enter().append('path').append('title');
    },
    extent: function() {
      return new MM.Extent(new MM.Location(bounds[0][1], bounds[0][0]), new MM.Location(bounds[1][1], bounds[1][0]));
    }
  };
};
