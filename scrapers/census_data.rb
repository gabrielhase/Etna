CENSUS_DATA_START_PAGE = "http://www.tuttitalia.it/sicilia/provincia-di-catania/statistiche/censimenti-popolazione/"

TAORMINA_PAGE = "http://www.tuttitalia.it/sicilia/92-taormina/statistiche/censimenti-popolazione/"
MESSINA_PAGE = "http://www.tuttitalia.it/sicilia/38-messina/statistiche/censimenti-popolazione/"
SIRACUSA_PAGE = "http://www.tuttitalia.it/sicilia/78-siracusa/statistiche/censimenti-popolazione/"

NAME_MAPPINGS = {
  "Zafferana" => "Zafferana Etnea"
}

SPECIAL_TOWNS = {
  "Taormina" => TAORMINA_PAGE,
  "Messina" => MESSINA_PAGE,
  "Siracusa" => SIRACUSA_PAGE
}

class CensusData

  attr_accessor :census_data

  def initialize(client)
    @client = client
    @census_data = {}
  end


  def map_name(name)
    if NAME_MAPPINGS.keys.index(name)
      NAME_MAPPINGS[name]
    else
      name
    end
  end


  def special_page(name)
    if SPECIAL_TOWNS.keys.index(name)
      page = SPECIAL_TOWNS[name]
      @client.get(page)
    else
      nil
    end
  end


  def scrape(town_name)
    overview_page = @client.get(CENSUS_DATA_START_PAGE)

    name = map_name("#{town_name[0].upcase}#{town_name[1..-1]}")
    if town_page = special_page(name)
      # town outside area
    else
      town_link = overview_page.link_with(:text => name)
      town_page = town_link.click
    end

    if town_page
      rows = town_page.search("tr")[2..-1].each do |row|
        date = row.search("td.zs")[1]
        population = row.search("td.oz").first
        if date && population
          population_without_dot = population.content.sub(".", "")
          @census_data[town_name] ||= {}
          @census_data[town_name][date.content] = population_without_dot.to_i
        else
          puts "ERROR: could not parse #{row}"
        end
      end

    else
      puts "NOT FOUND: #{town_name}"
    end
  end


  # linearly interpolate the data points to get data for all
  # years.
  def interpolate_linearly
    interpolated_data = {}
    @census_data.each do |name, data|
      interpolated_data[name] ||= {}
      last_year = nil
      last_value = nil
      data.each do |year, value|
        year = year.to_i
        if last_year && last_value
          time_diff = year - last_year
          value_diff = value - last_value
          step = value_diff / time_diff
          n = 1
          (last_year+1..year-1).each do |interpolated_year|
            interpolated_data[name][interpolated_year] = value + n*step
            n += 1
          end
        end

        last_year = year
        last_value = value
        interpolated_data[name][year] = value
      end
    end

    # overwrite
    @census_data = interpolated_data
  end


end