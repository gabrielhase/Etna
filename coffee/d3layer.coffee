@etna = @etna || {}

# provides a layer of circles corresponding to the area of influence of an eruption
# uses d3 to draw on a mapbox layer.
@etna.d3layer = (map, mapDrawSvg, mapDrawGroup, lavaDrawGroup) ->
  etnaLocation = [15.004, 37.734]
  # official plume area for different VEI values (from Wikipedia)
  plumes = {
    0: 0.1,
    1: 1,
    2: 5,
    3: 15,
    4: 25,
    5: 35
  }
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
    plumes[vei] / 111;  # each VEI point corresponds to the official plume area

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
    # mapDrawGroup.selectAll('rect')
    #   .attr('x', pixelLocation[0])
    #   .attr('y', pixelLocation[1])
    #   .attr('width', 5)
    #   .attr('height', (d, i) ->
    #     h = 0
    #     if d.lavaflows
    #       for direction, length of d.lavaflows
    #         #h = 1
    #         switch direction
    #           when "South" then h = length

    #     h
    #     #dist = d.lava / 111
    #   )

    # lineFunction = d3.svg.line
    #   .x( (d) ->
    #     d.x
    #   )
    #   .y( (d) ->
    #     d.y
    #   )
    #   .interpolate("linear")

    d3.selectAll('circle')
      .attr('cx', pixelLocation[0])
      .attr('cy', pixelLocation[1])
      .attr('r', (d, i) ->
        dist = getDistance(d.vei)
        distPointLat = etnaLocation[1] + dist
        distPoint = project([etnaLocation[0], distPointLat])
        pixelLocation[1] - distPoint[1]
      )

    d3.selectAll('path')
      .attr('d', (d, i) ->
        #lineFunction(d)
        path = "M 0 0 L 0 0"
        if d.lavaflows && d.lavaflows
          for direction, length of d.lavaflows
            switch direction
              when "South"
                dist = length / 111
                distPointLat = etnaLocation[1] - dist
                distPoint = project([etnaLocation[0], distPointLat])
                path = "M #{pixelLocation[0]} #{pixelLocation[1]} L #{distPoint[0]} #{distPoint[1]}"
              when "North"
                dist = length / 111
                distPointLat = etnaLocation[1] + dist
                distPoint = project([etnaLocation[0], distPointLat])
                path = "M #{pixelLocation[0]} #{pixelLocation[1]} L #{distPoint[0]} #{distPoint[1]}"
              when "East"
                dist = length / (111 * Math.cos(pixelLocation[1]))
                distPointLon = etnaLocation[0] + dist
                distPoint = project([distPointLon, etnaLocation[1]])
                path = "M #{pixelLocation[0]} #{pixelLocation[1]} L #{distPoint[0]} #{distPoint[1]}"
              when "West"
                dist = length / (111 * Math.cos(pixelLocation[1]))
                distPointLon = etnaLocation[0] - dist
                distPoint = project([distPointLon, etnaLocation[1]])
                path = "M #{pixelLocation[0]} #{pixelLocation[1]} L #{distPoint[0]} #{distPoint[1]}"
              else
                path = "M 0 0 L 0 0"

        path
      )
      .attr("stroke", "red")
      .attr("stroke-width", 10)
      .attr("fill", "red")
      .selectAll('title')
        .text((d, i) ->
          text = "lavaflow in #{d.date.getFullYear()}"
          # if d.lavaflows && d.lavaflows
          #   for direction, length of d.lavaflows
          #     text = "#{text} #{length} in direction #{direction}"
          text
        )

      # .attr('x1', pixelLocation[0])
      # .attr('x2', pixelLocation[0] + 1)
      # .attr('y1', pixelLocation[1])
      # .attr('y2', (d, i) ->
      #   if d.lavaflows
      #     console.log d
      #   pixelLocation[1] + 1
      # )


  # binds the bounding box and eruptions data to the svg
  data: (boundingBox, eruptions) ->
    bounds = d3.geo.bounds(boundingBox)
    feature = mapDrawGroup.selectAll('circle')
      .data(eruptions)
    feature.exit().remove()
    feature.enter().append('circle')
    lava = lavaDrawGroup.selectAll('path')
      .data(eruptions)
    lava.exit().remove()
    lava.enter().append('path').append('title')

  # sets the visible map extension
  extent: () ->
    new MM.Extent(
      new MM.Location(bounds[0][1], bounds[0][0]),
      new MM.Location(bounds[1][1], bounds[1][0])
    )