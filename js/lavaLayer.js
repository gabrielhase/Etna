
this.etna = this.etna || {};

this.etna.lavaLayer = function(map, mapDrawSvg, mapDrawGroup) {
  var craterLocations, etnaLocation, firstDraw, getLatDistance, getLonDistance, getPath, project;
  etnaLocation = [15.004, 37.734];
  craterLocations = {
    "NorthEast": [15.0636, 37.7516],
    "SouthEast": [15.0742, 37.7098],
    "Voragine": [15.0677, 37.7305],
    "Bocca Nuova": [15.0197, 37.7256]
  };
  firstDraw = true;
  project = function(location) {
    var point;
    point = map.locationPoint({
      lat: location[1],
      lon: location[0]
    });
    return [point.x, point.y];
  };
  getLatDistance = function(distance) {
    return distance / 111;
  };
  getLonDistance = function(distance, latitude) {
    return distance / (111 * Math.cos(latitude));
  };
  getPath = function(length, craterLocation, craterLocationMapped, angle, horizDir, vertDir) {
    var distLat, distLon, distPoint, distPointLat, distPointLon, path;
    distLon = getLonDistance(length * Math.sin(angle), craterLocation[1]);
    distLat = getLatDistance(length * Math.cos(angle));
    distPointLon = craterLocation[0] + (horizDir * distLon);
    distPointLat = craterLocation[1] + (vertDir * distLat);
    distPoint = project([distPointLon, distPointLat]);
    return path = "M " + craterLocationMapped[0] + " " + craterLocationMapped[1] + " L " + distPoint[0] + " " + distPoint[1];
  };
  return {
    draw: function() {
      var pixelLocation;
      if (firstDraw) {
        mapDrawSvg.attr('width', map.dimensions.x).attr('height', map.dimensions.y).style('margin-left', '0px').style('margin-top', '0px');
        firstDraw = false;
      }
      pixelLocation = project(etnaLocation);
      return mapDrawGroup.selectAll('path').attr('d', function(d, i) {
        var craterLocation, craterLocationMapped;
        if (d === 0) {
          return "M 0 0 L 0 0";
        }
        craterLocation = craterLocations[d.crater];
        if (!craterLocation) {
          return "M 0 0 L 0 0";
        }
        craterLocationMapped = project(craterLocation);
        switch (d.direction) {
          case "South":
            return getPath(d.length, craterLocation, craterLocationMapped, 0, 1, -1);
          case "North":
            return getPath(d.length, craterLocation, craterLocationMapped, 0, -1, 1);
          case "East":
            return getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 2, 1, 1);
          case "West":
            return getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 2, -1, 1);
          case "SouthEast":
            return getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 4, 1, -1);
          case "SouthWest":
            return getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 4, -1, -1);
          case "NorthWest":
            return getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 4, -1, 1);
          case "NorthEast":
            return getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 4, 1, 1);
          case "NNorthWest":
            return getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 8, -1, 1);
          case "WNorthWest":
            return getPath(d.length, craterLocation, craterLocationMapped, 3 * (Math.PI / 8), -1, 1);
          case "NNorthEast":
            return getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 8, 1, 1);
          case "WSouthWest":
            return getPath(d.length, craterLocation, craterLocationMapped, 3 * (Math.PI / 8), -1, -1);
          case "SSouthEast":
            return getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 8, 1, -1);
          case "ESouthEast":
            return getPath(d.length, craterLocation, craterLocationMapped, 3 * (Math.PI / 8), 1, -1);
          default:
            return "M 0 0 L 0 0";
        }
      }).attr("stroke", "red").attr("stroke-width", 10).attr("fill", "red").selectAll('title').text(function(d, i) {
        return "lavaflow in " + (d.date.getFullYear());
      });
    },
    data: function(boundingBox, flows) {
      var bounds, lava;
      bounds = d3.geo.bounds(boundingBox);
      lava = mapDrawGroup.selectAll('path').data(flows);
      lava.exit().remove().remove();
      return lava.enter().append('path').append('title');
    },
    extent: function() {
      return new MM.Extent(new MM.Location(bounds[0][1], bounds[0][0]), new MM.Location(bounds[1][1], bounds[1][0]));
    }
  };
};
