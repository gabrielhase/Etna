@etna = @etna || {}

@etna.townsExplorer = do ->
  templates = @etna.templates
  townsData = undefined


  init: (townsDataIn, chartComponent) ->
    townsData = townsDataIn
    etna.towns = townsDataIn.towns
    @townsLayer = etna.map.townsLayer
    @chartComponent = chartComponent
    @initEvents()


  initEvents: () ->
    @initRegionLinks()
    @initTownsLayer()
    @addTownsToMap([1900, 2011])


  initTownsLayer: () ->
    @townsLayer.factory( (f) ->
      elem = mapbox.markers.simplestyle_factory(f)
      $(elem).addClass("town-marker") # strangely I have to use jquery here, with mapbox API it doesn't work
      MM.addEvent elem, 'click', (e) ->
        etna.townsExplorer.showTown(f.properties.id)
        etna.townsExplorer.initBackButton()

      MM.addEvent elem, 'mouseover', (e) ->
        $(elem).parent('div').css("z-index", "20")

      MM.addEvent elem, 'mouseout', (e) ->
        $(elem).parent('div').css("z-index", "10")

      elem
    )
    @interaction = mapbox.markers.interaction(@townsLayer)
    @interaction.formatter( (feature) ->
      populationTrend = ""
      populationDiff = feature.properties.endPopulation - feature.properties.startPopulation
      if populationDiff > 0
        populationTrend = "<span class='badge badge-success'><i class='icon-arrow-up'></i>&nbsp;#{populationDiff}</span>"
      else
        populationTrend = "<span class='badge badge-important'><i class='icon-arrow-down'></i>&nbsp;#{populationDiff}</span>"
      html = """
      <div style="z-index: 1000">
      <h2>#{feature.properties.town}&nbsp;<small>#{populationTrend}</small></h2>
      <table class='table table-striped'>
        <thead>
          <tr>
            <th>Value</th>
            <th>From</th>
            <th>To</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Year</td>
            <td><b>#{feature.properties.startYear}</b></td>
            <td><b>#{feature.properties.endYear}</b></td>
          </tr>
          <tr>
            <td>Population</td>
            <td>#{feature.properties.startPopulation}</td>
            <td>#{feature.properties.endPopulation}</td>
          </tr>
        </tbody>
      </table>
      </div>
      """
    )


  addTownsToMap: (timeWindow = []) ->
    @townsLayer.features([]) # reset
    # by default show the whole time window (not single yeary)
    if timeWindow[0] == timeWindow[1]
      timeWindow[0] = 1900
      timeWindow[1] = 2011
    for townName, town of etna.towns
      location = town.location
      markerSize = "small"
      if town.census[timeWindow[1]] > 25000
        markerSize = "medium"
      if town.census[timeWindow[1]] > 100000
        markerSize = "large"

      markerColor = "#339532"
      if town.census[timeWindow[1]] < town.census[timeWindow[0]]
        markerColor = "#BB3E4D"


      @townsLayer.add_feature
        geometry:
          coordinates: [location.lon, location.lat]
        properties:
          'marker-color': markerColor
          'marker-symbol': 'town-hall'
          'marker-size': markerSize
          id: townName
          town: town.name
          startYear: timeWindow[0]
          endYear: timeWindow[1]
          startPopulation: town.census[timeWindow[0]]
          endPopulation: town.census[timeWindow[1]]

    # make sure z-index of markers is good
    $(".town-marker").parent('div').addClass('town-markers')
    $(".simplestyle-marker").parent('div').addClass('markers')


  initRegionLinks: () ->
    $(".region-link").click (event) =>
      event.preventDefault()
      $this = $(event.currentTarget)
      region = $this.data("region")
      @showTown(region)
      @initBackButton() # init the back button on a detail view


  initBackButton: () ->
    $("#back-to-towns").click (event) =>
      event.preventDefault()
      etna.map.resetInitialState()
      $("#towns-explorer").html(templates.townsNavigation(townsData))
      @initRegionLinks() # init the region link events again


  showTown: (region) ->
    etna.map.showRegion(region)
    # change content of
    regionData = etna.towns[region]
    regionContent = templates.regionTeaser
      title: regionData.name
      teaser: regionData.text
      imageurl: regionData.imageurl
      population: regionData.population
    $("#towns-explorer").html(regionContent)
    @drawTownsPopulationChart(region)


  drawTownsPopulationChart: (region) ->
    regionData = etna.towns[region]
    data = {}
    data["table"] = []
    for year, population of regionData['census']
      data["table"].push
        "year": year
        "population": population
    viewInstance = @chartComponent({el: "#vis", data: data, renderer: "svg"}).update()
    # highlight brush selected region
    # => not possible in this way since Vega:
    #     1. chooses its own extent (somewhere arount 1815 to 2025 -> not like the data)
    #     2. the axes scale is not everywhere the same -> between 1900 and 1950 the extent is larger than between 1850 and 1900
    # brushLimits = etna.eruptionsChart.getBrush()
    # start = brushLimits[0].getFullYear()
    # end = brushLimits[1].getFullYear()
    # if start == end # don't do anything for single year
    #   console.log "years are equal"
    #   return
    # else
    #   start = brushLimits[0].getFullYear()
    #   end = brushLimits[1].getFullYear()
    #   $container = $("#vis .vega svg")
    #   height = $container.height() - 5 - 20
    #   pixelPerYear = (2025-1815) / $container.width()
    #   left = (start - 1815) * pixelPerYear + viewInstance._padding.left
    #   el = $("""
    #     <div style="position:absolute; left: #{left}px; top: 0; border: 1px solid #000; height: #{height}px">
    #       bla
    #     </div>
    #   """)
    #   console.log $("#vis .vega")
    #   $("#vis .vega").append(el)
    #   console.log "start #{start}, end #{end}"



