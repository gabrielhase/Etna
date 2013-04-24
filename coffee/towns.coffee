@etna = @etna || {}

@etna.townsExplorer = do ->
  templates = @etna.templates
  townsData = undefined

  init: (townsDataIn, chartComponent) ->
    townsData = townsDataIn
    etna.towns = townsDataIn.towns
    @chartComponent = chartComponent
    @initEvents()


  initEvents: () ->
    @initRegionLinks()


  initRegionLinks: () ->
    $(".region-link").click (event) =>
      event.preventDefault()
      $this = $(event.currentTarget)
      @showTown($this)
      @initBackButton() # init the back button on a detail view


  initBackButton: () ->
    $("#back-to-towns").click (event) =>
      event.preventDefault()
      $("#towns-explorer").html(templates.townsNavigation(townsData))
      @initRegionLinks() # init the region link events again


  showTown: ($townElement) ->
    region = $townElement.data("region")
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
    @chartComponent({el: "#vis", data: data, renderer: "svg"}).update()