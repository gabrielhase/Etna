@etna = @etna || {}

@etna.eruptionsChart = do ->

  # ================================
  # Private Module Properties
  # ================================
  airportLocations = {
    "catania": [15.0659, 37.4704]
  }

  craterLocations = {
    "NorthEast": {"lon": 15.0636, "lat": 37.7516},
    "SouthEast": {"lon": 15.0742, "lat": 37.7098},
    "Voragine": {"lon": 15.0677, "lat": 37.7305},
    "Bocca Nuova": {"lon": 15.0197, "lat": 37.7256}
  }

  boundingBox = {"type": "FeatureCollection", "features": [
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
    ]}

  # this "hacks" coffeeScript defaults behavior of _this = this
  # with _this = {} we have a private literal to share state of the Singleton
  _this = {}

  # barchart margins
  margin = {top: 20, right: 40, bottom: 20, left: 50}
  width = 640 - margin.left - margin.right
  height = 100 - margin.top - margin.bottom

  parseDate = d3.time.format("%Y").parse

  x = d3.time.scale().range([0, width])
  y = d3.scale.linear().range([height, 0])

  focusScale = d3.time.scale() # a scale without a range
  lastExtent = undefined

  xAxis = d3.svg.axis().scale(x).orient("bottom")
  yAxis = d3.svg.axis().scale(y).orient('left').ticks(4)

  # ================================
  # Volcano Events : Marker adders
  # ================================
  addExplosions = (craterExplosions, markerLayer) ->
    for craterName of craterExplosions
      tooltipTitle = "Explosion at crater #{craterName}"
      tooltipText = craterExplosions[craterName].join(', ')
      location = craterLocations[craterName]

      markerLayer.add_feature
        geometry:
          coordinates: [location.lon, location.lat]
        properties:
          'marker-color': '#FEB24C'
          'marker-size': 'small'
          'marker-symbol': 'minefield'
          title: "#{tooltipTitle} in #{tooltipText}"


  addAshFalls = (ashFalls, markerLayer) ->
    for townName of ashFalls
      tooltipTitle = "Ash falling on #{townName}"
      tooltipText = ashFalls[townName].join(', ')
      location = etna.towns[townName]?.location
      # TODO: add additional locations not in the towns json
      if location
        markerLayer.add_feature
          geometry:
            coordinates: [location.lon-0.005, location.lat-0.005] # sightly offset for overlaying pins
          properties:
            'marker-color': '#777'
            'marker-size': 'small'
            'marker-symbol': 'star-stroked'
            title: "#{tooltipTitle} in #{tooltipText}"


  addAirportShutdowns = (airportShutdowns, markerLayer) ->
    for airportName of airportShutdowns
      tooltipTitle = "Airport #{airportName} was shut down"
      tooltipText = airportShutdowns[airportName].join(', ')
      location = airportLocations[airportName]
      if location
        markerLayer.add_feature
          geometry:
            coordinates: location
          properties:
            'marker-color': '#387FA8'
            'marker-size': 'small'
            'marker-symbol': 'airport'
            title: "#{tooltipTitle} in #{tooltipText}"


  addDestroyed = (destroyed, markerLayer) ->
    for destroyedTown of destroyed
      tooltipTitle = "#{destroyedTown} was destroyed in "
      tooltipText = destroyed[destroyedTown].join(', ')
      location = etna.towns[destroyedTown]?.location
      if location
        markerLayer.add_feature
          geometry:
            coordinates: [location.lon+0.005, location.lat+0.005] # slightly offset for overlaying pins
          properties:
            'marker-color': '#000'
            'marker-size': 'small'
            'marker-symbol': 'cross'
            title: "#{tooltipTitle} in #{tooltipText}"


  addEarthquakes = (earthquakes, markerLayer) ->
    for earthquake of earthquakes
      tooltipTitle = "An earthquake triggered by an eruption was in #{earthquake} "
      tooltipText = earthquakes[earthquake].join(', ')
      location = etna.towns[earthquake]?.location
      location||= craterLocations[earthquake]
      if location
        markerLayer.add_feature
          geometry:
            coordinates: [location.lon-0.005, location.lat+0.005] # slightly offset for overlaying pins
          properties:
            'marker-color': '#5C461F'
            'marker-size': 'small'
            'marker-symbol': 'e'
            title: "#{tooltipTitle} in #{tooltipText}"


  # ================================
  # Module Singleton
  # ================================
  # init the non-changing data for this singleton
  init: (eruptionData, map, circleLayer, markerLayer, lavaLayer) =>
    @map = map
    @circleLayer = circleLayer
    @lavaLayer = lavaLayer
    @markerLayer = markerLayer
    @markerLayer.factory((f) ->
      elem = mapbox.markers.simplestyle_factory(f)
      return elem
    )
    @interaction = mapbox.markers.interaction(@markerLayer)
    @sanitizedData = []
    @lavaFlows = []
    for eruption of eruptionData
      @sanitizedData.push
        'date': parseDate(eruption)
        'vei': +eruptionData[eruption].vei
        'craters': eruptionData[eruption].craters
        'ash': eruptionData[eruption].ash
        'airportShutdown': eruptionData[eruption].airportShutdown
        'destroyed': eruptionData[eruption].destroyed
        'earthquake': eruptionData[eruption].earthquake
        'lavaflows': eruptionData[eruption].lavaflows

      for lavaStream in eruptionData[eruption].lavaflows
        @lavaFlows.push
          'direction': lavaStream.flow.direction
          'length': lavaStream.flow.length
          'crater': lavaStream.crater
          'date': parseDate(eruption)
          'reachedHere': 1
          'yearsReached': [parseDate(eruption).getFullYear()]


  drawBarchart: (eruptionData) =>
    svg_container = d3.select("#map-legend").append("svg")
      .attr('class', 'barchart')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    svg = svg_container.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    x.domain(d3.extent(@sanitizedData, (d) ->
      d.date
    ))
    y.domain(d3.extent(@sanitizedData, (d) ->
      d.vei
    ))

    svg_container.append('text')
      .attr('class', 'y label')
      .attr('text-anchor', 'end')
      .attr('x', 30)
      .attr('y', height - margin.top - margin.bottom)
      .text('VEI')

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)

    svg.selectAll('rect')
      .data(@sanitizedData)
      .enter()
      .append('rect')
        .attr('x', (d, i) ->
          x(d.date)
        )
        .attr('y', (d) ->
          y(d.vei)
        )
        .attr('height', (d, i) ->
          height - y(d.vei)
        )
        .attr('width', 4)

    @brush = d3.svg.brush()
      .x(x)
      .on('brush', etna.eruptionsChart.eruptionsBrush)
      .on('brushend', etna.eruptionsChart.eruptionsBrushEnd)

    barchartGroup = svg.append("g")
      .attr("class", "x brush")
      .call(@brush)
    bars = barchartGroup.selectAll("rect")
        .attr("y", -6)
        .attr("height", height + 7)
    # redraw the selection if there is a last extent
    barchartGroup.call(@brush.extent(lastExtent)) if lastExtent


  eruptionsBrush: () =>
    # remember last extent for later
    lastExtent = @brush.extent()
    focusScale.domain(@brush.extent())
    dataFiltered = @sanitizedData.filter( (d, i) ->
      true if (d.date >= focusScale.domain()[0]) && (d.date <= focusScale.domain()[1])
    )
    lavaFiltered = @lavaFlows.filter( (d, i) ->
      true if (d.date >= focusScale.domain()[0]) && (d.date <= focusScale.domain()[1])
    )
    @circleLayer.data(boundingBox, dataFiltered)
    @circleLayer.draw();
    @lavaLayer.data(boundingBox, lavaFiltered)
    @lavaLayer.draw()
    @map.refresh();
    # activate tooltips on the body! (wouldn't work inside svg)
    $(".lava-flow").tooltip
      'container': 'body'
      'placement': 'top'


  eruptionsBrushEnd: () =>
    dataFiltered = @sanitizedData.filter( (d, i) ->
      true if (d.date >= focusScale.domain()[0]) && (d.date <= focusScale.domain()[1])
    )

    craterExplosions = {}
    ashFalls = {}
    airportShutdowns = {}
    destroyed = {}
    earthquakes = {}
    for datum in dataFiltered
      for crater in datum.craters
        craterExplosions[crater] ||= []
        craterExplosions[crater].push(datum.date.getFullYear())
      for town in datum.ash
        ashFalls[town] ||= []
        ashFalls[town].push(datum.date.getFullYear())
      if datum.airportShutdown
        for airport in datum.airportShutdown
          airportShutdowns[airport] ||= []
          airportShutdowns[airport].push(datum.date.getFullYear())
      if datum.destroyed
        for destroyedTown in datum.destroyed
          destroyed[destroyedTown] ||= []
          destroyed[destroyedTown].push(datum.date.getFullYear())
      if datum.earthquake
        for earthquakeTown in datum.earthquake
          earthquakes[earthquakeTown] ||= []
          earthquakes[earthquakeTown].push(datum.date.getFullYear())

    @markerLayer.features([]) # reset
    addExplosions(craterExplosions, @markerLayer)
    addAshFalls(ashFalls, @markerLayer)
    addAirportShutdowns(airportShutdowns, @markerLayer)
    addDestroyed(destroyed, @markerLayer)
    addEarthquakes(earthquakes, @markerLayer)

    #draw towns
    etna.townsExplorer.addTownsToMap([focusScale.domain()[0].getFullYear(),
      focusScale.domain()[1].getFullYear()])

    # make sure z-index of markers is good
    $(".simplestyle-marker").parent('div').addClass('markers')