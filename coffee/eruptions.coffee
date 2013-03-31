@etna = @etna || {}

@etna.eruptionsChart = do ->
  
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
  width = 960 - margin.left - margin.right
  height = 100 - margin.top - margin.bottom
  
  parseDate = d3.time.format("%Y").parse

  x = d3.time.scale().range([0, width])
  y = d3.scale.linear().range([height, 0])

  focusScale = d3.time.scale() # a scale without a range

  xAxis = d3.svg.axis().scale(x).orient("bottom")
  yAxis = d3.svg.axis().scale(y).orient('left').ticks(4)

  # init the non-changing data for this singleton
  init: (eruptionData, map, circleLayer) =>
    @map = map
    @circleLayer = circleLayer
    @sanitizedData = []
    for eruption of eruptionData
      @sanitizedData.push
        'date': parseDate(eruption)
        'vei': +eruptionData[eruption]


  drawBarchart: (eruptionData) =>
    svg = d3.select("#map-legend").append("svg")
      .attr('class', 'barchart')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    x.domain(d3.extent(@sanitizedData, (d) -> 
      d.date 
    ))
    y.domain(d3.extent(@sanitizedData, (d) -> 
      d.vei
    ))

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
        .attr('width', 7)

    @brush = d3.svg.brush()
      .x(x)
      .on('brush', etna.eruptionsChart.eruptionsBrush)

    svg.append("g")
      .attr("class", "x brush")
      .call(@brush)
      .selectAll("rect")
        .attr("y", -6)
        .attr("height", height + 7)


  eruptionsBrush: () =>
    focusScale.domain(@brush.extent())
    dataFiltered = @sanitizedData.filter( (d, i) ->
      true if (d.date >= focusScale.domain()[0]) && (d.date <= focusScale.domain()[1])
    )
    veis = []
    for datum in dataFiltered
      veis.push(datum.vei)
    @circleLayer.data(boundingBox, veis);
    @circleLayer.draw();
    @map.refresh();