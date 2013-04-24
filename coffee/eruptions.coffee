@etna = @etna || {}

@etna.eruptionsChart = do ->

  craterLocations = {
    "NorthEast": [15.0636, 37.7516],
    "SouthEast": [15.0742, 37.7098],
    "Voragine": [15.0677, 37.7305],
    "Bocca Nuova": [15.0197, 37.7256]
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

  # init the non-changing data for this singleton
  init: (eruptionData, map, circleLayer, markerLayer) =>
    @map = map
    @circleLayer = circleLayer
    @markerLayer = markerLayer
    @markerLayer.factory((f) ->
      elem = mapbox.markers.simplestyle_factory(f)
      return elem
    )
    @interaction = mapbox.markers.interaction(@markerLayer)
    @sanitizedData = []
    for eruption of eruptionData
      @sanitizedData.push
        'date': parseDate(eruption)
        'vei': +eruptionData[eruption].vei
        'craters': eruptionData[eruption].craters
        'ash': eruptionData[eruption].ash


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
    # veis = []
    # for datum in dataFiltered
    #   veis.push(datum.vei)
    @circleLayer.data(boundingBox, dataFiltered);
    @circleLayer.draw();
    @map.refresh();

  eruptionsBrushEnd: () =>
    dataFiltered = @sanitizedData.filter( (d, i) ->
      true if (d.date >= focusScale.domain()[0]) && (d.date <= focusScale.domain()[1])
    )

    craterExplosions = {}
    ashFalls = {}
    for datum in dataFiltered
      for crater in datum.craters
        craterExplosions[crater] ||= []
        craterExplosions[crater].push(datum.date.getFullYear())
      for town in datum.ash
        ashFalls[town] ||= []
        ashFalls[town].push(datum.date.getFullYear())

    @markerLayer.features([])
    for craterName of craterExplosions
      tooltipTitle = "Explosion at crater #{craterName}"
      tooltipText = craterExplosions[craterName].join(', ')

      @markerLayer.add_feature
        geometry:
          coordinates: craterLocations[craterName]
        properties:
          'marker-color': '#993341'
          'marker-symbol': 'minefield'
          title: "#{tooltipTitle} in #{tooltipText}"

    for townName of ashFalls
      tooltipTitle = "Ash falling on #{townName}"
      tooltipText = ashFalls[townName].join(', ')
      location = etna.towns[townName]?.location
      # TODO: add additional locations
      if location
        @markerLayer.add_feature
          geometry:
            coordinates: [location.lon, location.lat]
          properties:
            'marker-color': '#777'
            'marker-symbol': 'star-stroked'
            title: "#{tooltipTitle} in #{tooltipText}"

    # make sure z-index of markers is good
    $('.simplestyle-marker').parent().attr('class', 'markers')