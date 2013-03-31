@etna = @etna || {}

# provides a layer of circles corresponding to the area of influence of an eruption
# uses d3 to draw on a mapbox layer.
@etna.d3layer = (map, mapDrawSvg, mapDrawGroup) ->
  etnaLocation = [15.004, 37.734]
  bounds = {}
  firstDraw = true

  # projects a location in geographical data to pixel-space.
  project = (location) ->
    point = map.locationPoint
      lat: location[1]
      lon: location[0]
    [point.x, point.y]

  # calculates the distance in lat points with the hack 111km = 1 lat point
  getDistance = (vei) ->
    (vei * 5) / 111;  # each VEI point corresponds to 5km

  # draws the circles by projecting the center and taking a point with
  # x km distance to the north lat and calculating the radius in px from this.
  draw: () ->
    if firstDraw
      mapDrawSvg
        .attr('width', map.dimensions.x)
        .attr('height', map.dimensions.y)
        .style('margin-left', '0px')
        .style('margin-top', '0px')
      firstDraw = false

    pixelLocation = project(etnaLocation)
    d3.selectAll('circle')
      .attr('cx', pixelLocation[0])
      .attr('cy', pixelLocation[1])
      .attr('r', (d, i) ->
        dist = getDistance(d)
        distPointLat = etnaLocation[1] + dist
        distPoint = project([etnaLocation[0], distPointLat])
        pixelLocation[1] - distPoint[1]
      )

  # binds the bounding box and eruptions data to the svg
  data: (boundingBox, eruptions) ->
    bounds = d3.geo.bounds(boundingBox)
    feature = mapDrawGroup.selectAll('circle')
      .data(eruptions)
    feature.exit().remove()
    feature.enter().append('circle')

  # sets the visible map extension
  extent: () ->
    new MM.Extent( 
      new MM.Location(bounds[0][1], bounds[0][0]),
      new MM.Location(bounds[1][1], bounds[1][0])
    )