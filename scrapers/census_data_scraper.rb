require 'mechanize'
require 'json'

require_relative 'census_data'

OUTPUT_FILE = "towns-with-census.json"

# get a mechanize client
def get_mechanize_client
  # Create a new mechanize object
  mech = Mechanize.new
  mech
end

# MAIN ENTRY
if __FILE__ == $PROGRAM_NAME
  # a mechanize client
  mech = get_mechanize_client()
  census_data_getter = CensusData.new(mech)

  towns = JSON.parse(IO.read("../../data/towns.json"))
  towns["towns"].each do |name, data|
    census_data_getter.scrape(name)
  end

  File.open("census-data.json","w") do |f|
    f.write(census_data_getter.census_data.to_json)
  end

  census_data_getter.interpolate_linearly()
  towns_with_census = {"towns" => {}}
  towns["towns"].each do |name, data|
    towns_with_census["towns"][name] = data#.merge(census_data_getter.census_data[name])
    towns_with_census["towns"][name]["census"] = census_data_getter.census_data[name]
  end

  #puts towns_with_census

  File.open(OUTPUT_FILE,"w") do |f|
    f.write(towns_with_census.to_json)
  end


end