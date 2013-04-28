@etna = @etna || {}

@etna.lavaLayer = (map, mapDrawSvg, mapDrawGroup) ->

  etnaLocation = [15.004, 37.734]
  # TODO: these should be shared with the eruptions layer
  craterLocations = {
    "NorthEast": [15.0636, 37.7516],
    "SouthEast": [15.0742, 37.7098],
    "Voragine":  [15.0677, 37.7305],
    "Bocca Nuova": [15.0197, 37.7256]
  }

  firstDraw = true


  # projects a location in geographical data to pixel-space.
  project = (location) ->
    point = map.locationPoint
      lat: location[1]
      lon: location[0]
    [point.x, point.y]


  # calculates the distance in lat points with the hack 111km = 1 lat point
  getLatDistance = (distance) ->
    distance / 111;


  getLonDistance = (distance, latitude) ->
    distance / (111 * Math.cos(latitude))


  getPath = (length, craterLocation, craterLocationMapped, angle, horizDir, vertDir) ->
    distLon = getLonDistance(length * Math.sin(angle), craterLocation[1])
    distLat = getLatDistance(length * Math.cos(angle))
    distPointLon = craterLocation[0] + (horizDir * distLon)
    distPointLat = craterLocation[1] + (vertDir * distLat)

    distPoint = project([distPointLon, distPointLat])
    path = "M #{craterLocationMapped[0]} #{craterLocationMapped[1]} L #{distPoint[0]} #{distPoint[1]}"


  draw: () ->
    if firstDraw
      mapDrawSvg
        .attr('width', map.dimensions.x)
        .attr('height', map.dimensions.y)
        .style('margin-left', '0px')
        .style('margin-top', '0px')
      firstDraw = false

    pixelLocation = project(etnaLocation)

    mapDrawGroup.selectAll('path')
      .attr('d', (d, i) ->
        # TODO how is this possible?
        if d == 0
          return "M 0 0 L 0 0"
        craterLocation = craterLocations[d.crater]
        if !craterLocation # TODO: should not be possible
          return "M 0 0 L 0 0"
        craterLocationMapped = project(craterLocation)

        # ANGLES:
        #   South, North: 0
        #     -> steered over vert direction
        #   East, West: PI / 2
        #     -> steered over horiz direction

        switch d.direction
          when "South"
            getPath(d.length, craterLocation, craterLocationMapped, 0, 1, -1)
          when "North"
            getPath(d.length, craterLocation, craterLocationMapped, 0, -1, 1)
          when "East"
            getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 2, 1, 1)
          when "West"
            getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 2, -1, 1)
          when "SouthEast"
            getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 4, 1, -1)
          when "SouthWest"
            getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 4, -1, -1)
          when "NorthWest"
            getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 4, -1, 1)
          when "NorthEast"
            getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 4, 1, 1)
          when "NNorthWest"
            getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 8, -1, 1)
          when "WNorthWest"
            getPath(d.length, craterLocation, craterLocationMapped, 3 * (Math.PI / 8), -1, 1)
          when "NNorthEast"
            getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 8, 1, 1)
          when "WSouthWest"
            getPath(d.length, craterLocation, craterLocationMapped, 3 * (Math.PI / 8), -1, -1)
          when "SSouthEast"
            getPath(d.length, craterLocation, craterLocationMapped, Math.PI / 8, 1, -1)
          when "ESouthEast"
            getPath(d.length, craterLocation, craterLocationMapped, 3*(Math.PI / 8), 1, -1)
          else
            "M 0 0 L 0 0"

      )
      .attr("stroke", "red")
      .attr("stroke-width", 10)
      .attr("fill", "red")
      .selectAll('title')
        .text((d, i) ->
          "lavaflow in #{d.date.getFullYear()}"
        )


  data: (boundingBox, flows) ->
    bounds = d3.geo.bounds(boundingBox)
    lava = mapDrawGroup.selectAll('path')
      .data(flows)
    lava.exit().remove().remove()
    lava.enter().append('path').append('title')


  # sets the visible map extension
  extent: () ->
    new MM.Extent(
      new MM.Location(bounds[0][1], bounds[0][0]),
      new MM.Location(bounds[1][1], bounds[1][0])
    )
