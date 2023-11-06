import numpy as np
from datascience import *
import json

#create table for each category
global_household_values = Table.read_table('household_values.csv')
global_food_service_values = Table.read_table('food_service_values.csv')
global_retail_values = Table.read_table('retail_values.csv')

# Create a dictionary to hold tables for different categories
categories = {
    "household": {},
    "food_service": {},
    "retail": {}
}

# Define regions for each category
regions = [
    'Australia and New Zealand',
    'Central Asia',
    'Eastern Asia',
    'Eastern Europe',
    'Latin America and the Caribbean',
    'Melanesia',
    'Micronesia',
    'Northern Africa',
    'Northern America',
    'Northern Europe',
    'Polynesia',
    'South-eastern Asia',
    'Southern Asia',
    'Southern Europe',
    'Sub-Saharan Africa',
    'Western Asia',
    'Western Europe'
]

# Populate the tables in the dictionary
for region in regions:
    categories["household"][region] = global_household_values.where('Region', are.equal_to(region)).to_df().to_dict(orient='records')
    categories["food_service"][region] = global_food_service_values.where('Region', are.equal_to(region)).to_df().to_dict(orient='records')
    categories["retail"][region] = global_retail_values.where('Region', are.equal_to(region)).to_df().to_dict(orient='records')

# Access tables using the dictionary
#australia_and_new_zealand_household = categories["household"]['Australia and New Zealand']
#central_asia_food_service = categories["food_service"]['Central Asia']
# ... and so on

# Mass-configurations
household_regions = list(categories["household"].values())
food_service_regions = list(categories["food_service"].values())
retail_regions = list(categories["retail"].values())

# Define the path to the JSON file
json_file_path = "data.json"

# Write the data to the JSON file
with open(json_file_path, 'w') as json_file:
    json.dump(categories, json_file, indent=4)
