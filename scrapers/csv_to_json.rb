require 'csv'
require 'json'

idx = 0
json = {}
header = []
CSV.foreach("etna-history.csv") do |row|
  if idx == 0
    header = row
  else
    # the simplest possible information => year:VEI
    json[row[0]] = row[6]
  end
  idx += 1
end

File.open("etna-history.json","w") do |f|
  f.write(json.to_json)
end
