@etna = @etna || {}

@etna.map = do ->
  templates = @etna.templates
  regionZoom = false

  towns: {}
  eruptions: {}

  init: (townsData, eruptionData) ->
    # load data
    etna.towns = townsData.towns
    etna.eruptions = eruptionData

    #Create map
    layer = mapbox.layer().id('gabriel-hase.map-25owz48z')

    # Create map with no handlers
    # The 4th argument is a list of handlers (drag, mousewheel, doubleclick).
    # Here we have it empty, to disable zooming and panning.
    @map = mapbox.map('map', layer, null, [MM.DragHandler(), MM.DoubleClickHandler()])
    @map.ui.zoomer.add()
    @map.setZoomRange(8, 16)
    # etna always in sight
    @map.setPanLimits([{ lat: 36.8, lon: 13.5 }, { lat: 39.5, lon: 16.5 }])

    # callbacks
    @map.addCallback "zoomed", (map, zoomOffset) =>
      if regionZoom == true
        regionZoom = false
      else
        @hideLegend()

    @map.addCallback "panned", (map, zoomOffset) =>
      @hideLegend()

    # position map
    @map.centerzoom({ lat: 37.734, lon: 15.004 }, 10)

    # teaser
    @teaserHtml = $("#map-legend").html() # only the close icon for now

    # init map events and controls
    @initEvents()

    # layer for towns
    @townsLayer = mapbox.markers.layer()
    @map.addLayer(@townsLayer)

    # layer for volcano events
    @markerLayer = mapbox.markers.layer()
    @map.addLayer(@markerLayer)

    # init the layer on which the eruption circles will be drawn
    @initD3Layer()

    # init the layer on which the lava flows will be drawn
    @initLavaLayer()

    # init and draw the barchart
    etna.eruptionsChart.init(etna.eruptions, @map, @circleLayer, @markerLayer, @lavaLayer)
    etna.eruptionsChart.drawBarchart(etna.eruptions)


  initLavaLayer: () ->
    lavaDrawDiv = d3.select(document.body)
      .append('div')
      .attr('class', 'lava-vec')
    lavaDrawSvg = lavaDrawDiv.append('svg')
    lavaDrawGroup = lavaDrawSvg.append('g')
    @lavaLayer = etna.lavaLayer(@map, lavaDrawSvg, lavaDrawGroup)
    @lavaLayer.parent = lavaDrawDiv.node()
    @map.addLayer(@lavaLayer)


  initD3Layer: () ->
    mapDrawDiv = d3.select(document.body)
      .append('div')
      .attr('class', 'd3-vec')
    mapDrawSvg = mapDrawDiv.append('svg')
    mapDrawGroup = mapDrawSvg.append('g')
    @circleLayer = etna.d3layer(@map, mapDrawSvg, mapDrawGroup)
    @circleLayer.parent = mapDrawDiv.node()
    @map.addLayer(@circleLayer)


  initEvents: () ->
    # hide legend and tooltips if users clicks somewhere on the map
    $("#map").click (event) =>
      @hideLegend()

    $("#map-legend").delegate ".close-map-legend", "click", (event) =>
      event.preventDefault()
      @toggleLegend()

    $(".open-map-legend").click (event) =>
      event.preventDefault()
      @toggleLegend()

    $(".home-link").click (event) =>
      event.preventDefault()
      @resetInitialState()

    $("#map-regions").delegate ".toggle-legend", "click", (event) ->
      event.preventDefault()
      if $(".legend").is(':visible')
        $elem = $(event.currentTarget)
        $(".legend").hide()
        $elem.children("i").removeClass("icon-minus-sign")
        $elem.children("i").addClass("icon-plus-sign")
      else
        $elem = $(event.currentTarget)
        $(".legend").show()
        $elem.children("i").removeClass("icon-plus-sign")
        $elem.children("i").addClass("icon-minus-sign")


  getMap: () ->
    @map

  toggleLegend: () ->
    # by default set the about content when toggling to visible
    if !$("#map-legend").is(":visible")
      $("#map-legend").html(@teaserHtml) #empty
      etna.eruptionsChart.drawBarchart(etna.eruptions)

    $("#map-legend").slideToggle()
    $("#map-legend-teaser").slideToggle()


  hideLegend: () ->
    if $("#map-legend").is(":visible")
      $("#map-legend").slideUp()
      $("#map-legend-teaser").slideDown()


  # displayRegionLegend: (region) ->
  #   regionData = etna.towns[region]
  #   newContent = templates.regionTeaser(
  #     title: regionData.name
  #     teaser: regionData.text
  #     imageurl: regionData.imageurl
  #     population: regionData.population
  #   )
  #   @displayLegend(newContent)


  # displayLegend: (html) ->
  #   $legend = $("#map-legend")
  #   if !$legend.is(":visible")
  #     $legend.html(html).slideToggle()
  #     $("#map-legend-teaser").slideToggle()
  #   else
  #     $legend.html(html)


  # same state as when reloading the page
  resetInitialState: () ->
    @map.ease.location({ lat: 37.734, lon: 15.004 }).zoom(10).optimal(0.9, 1.42, () =>
      $("#map-legend").html(@teaserHtml) #empty
      etna.eruptionsChart.drawBarchart(etna.eruptions)
      @toggleLegend()
    )


  showRegion: (region) ->
    location = etna.towns[region].location
    # @toggleLegend() if $("#map-legend").is(":visible")
    #@displayRegionLegend(region)

    # center region
    zoom = 11
    regionZoom = true if zoom != @map.zoom()
    @map.ease.location(location).zoom(zoom).optimal()

