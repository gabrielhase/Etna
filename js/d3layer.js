
this.etna = this.etna || {};

this.etna.d3layer = function(map, mapDrawSvg, mapDrawGroup) {
  var bounds, etnaLocation, firstDraw, getDistance, project;
  etnaLocation = [15.004, 37.734];
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
    return (vei * 5) / 111;
  };
  return {
    draw: function() {
      var pixelLocation;
      if (firstDraw) {
        mapDrawSvg.attr('width', map.dimensions.x).attr('height', map.dimensions.y).style('margin-left', '0px').style('margin-top', '0px');
        firstDraw = false;
      }
      pixelLocation = project(etnaLocation);
      return d3.selectAll('circle').attr('cx', pixelLocation[0]).attr('cy', pixelLocation[1]).attr('r', function(d, i) {
        var dist, distPoint, distPointLat;
        dist = getDistance(d);
        distPointLat = etnaLocation[1] + dist;
        distPoint = project([etnaLocation[0], distPointLat]);
        return pixelLocation[1] - distPoint[1];
      });
    },
    data: function(boundingBox, eruptions) {
      var feature;
      bounds = d3.geo.bounds(boundingBox);
      feature = mapDrawGroup.selectAll('circle').data(eruptions);
      feature.exit().remove();
      return feature.enter().append('circle');
    },
    extent: function() {
      return new MM.Extent(new MM.Location(bounds[0][1], bounds[0][0]), new MM.Location(bounds[1][1], bounds[1][0]));
    }
  };
};
