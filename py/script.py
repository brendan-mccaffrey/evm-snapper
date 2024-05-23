import csv
import json


"""
Helpers
"""


# convert `address, count` format to a list of addresses repeated count times
def listFromCsv(csv_file, result_list):
    with open(csv_file, mode="r") as file:
        csv_reader = csv.reader(file)
        for row in csv_reader:
            string_value = row[0]
            repeat_count = int(row[1])
            result_list.extend([string_value] * repeat_count)
            print(f"Added {string_value} to the list {repeat_count} times")
    return result_list


# Write list to CSV file
def listToCsv(result_list, output_file_csv):
    with open(output_file_csv, mode="w", newline="") as file:
        csv_writer = csv.writer(file)
        for item in result_list:
            csv_writer.writerow([item])


"""
Utility functions
"""


# Aggregate CSV files
def aggregateCsvs():
    dirpath = "../data/"
    ins = [
        dirpath + "eth.csv",
        dirpath + "arb.csv",
        # # add more as needed
        # dirpath + "opt.csv",
        # dirpath + "poly.csv",
        # dirpath + "bsc.csv",
    ]

    output_file_csv = dirpath + "agg.csv"
    result_list = []

    for input_file in ins:
        print("Reading", input_file)
        result_list = listFromCsv(input_file, result_list)

    listToCsv(result_list, output_file_csv)


# convert `address, count` format csv to a json list of addresses repeated count times
def csv2json():
    input_file = "../data/example.csv"
    output_file_json = "../data/example.json"

    result_list = listFromCsv(input_file, [])

    # Write the list to a JSON file
    with open(output_file_json, mode="w") as file:
        json.dump(result_list, file, indent=2)
    print(f"JSON data has been written to {output_file_json}")


# convert `address, count` format json to a json list of addresses repeated count times
def json2json():
    input_file = "../data/example.json"
    output_file = "../data/example.json"

    result_list = []
    result_list_unique = []

    with open(input_file, mode="r") as file:
        data = json.load(file)
        for k, v in data.items():
            result_list.extend([k] * v)
            result_list_unique.append(k)
            print("Added", k, "to the list", v, "times")

    # Write the list to a JSON file
    with open(output_file, mode="w") as file:
        json.dump(result_list, file, indent=2)

    print(f"Data has been written to {output_file}")


def json2jcsv():
    input_file = "../data/example.json"
    output_file_csv = "../data/example.csv"

    result_list = []

    with open(input_file, mode="r") as file:
        data = json.load(file)
        # data = data["example_key"]
        for k, v in data.items():
            result_list.extend([k] * v)
            print(f"Added {k} to the list {v} times")

    listToCsv(result_list, output_file_csv)
    print(f"CSV data has been written to {output_file_csv}")


"""
Example calls
"""

# aggCsvs()
# json2jcsv()
