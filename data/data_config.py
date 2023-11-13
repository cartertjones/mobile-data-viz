import numpy as np
from datascience import *
import json

#create table for each category
global_household_values = Table.read_table('household_values.csv')
global_food_service_values = Table.read_table('food_service_values.csv')
global_retail_values = Table.read_table('retail_values.csv')

global_values = global_household_values.drop("Confidence in estimate", "M49 code")
global_values = global_values.with_column("Food service estimate (kg/capita/year)", global_food_service_values.column("Food service estimate (kg/capita/year)"))
global_values = global_values.with_column("Food service estimate (tonnes/year)", global_food_service_values.column("Food service estimate (tonnes/year)"))
global_values = global_values.with_column("Retail estimate (kg/capita/year)", global_retail_values.column("Retail estimate (kg/capita/year)"))
global_values = global_values.with_column("Retail service estimate (tonnes/year)", global_retail_values.column("Retail estimate (tonnes/year)"))

df = global_values.to_df().to_dict(orient="records")

json_file_path = "data.json"

with open(json_file_path, 'w') as json_file:
    json.dump(df, json_file, indent=4)