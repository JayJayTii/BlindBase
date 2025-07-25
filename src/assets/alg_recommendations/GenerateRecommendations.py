#This is used for reformatting the json files taken from v2.blddb.net
import json
import requests

for filename in ["cornerManmade","edgeManmade"]:
    print("Fetching data for " + filename)
    url = "https://raw.githubusercontent.com/nbwzx/blddb/refs/heads/v2/public/data/" + filename + ".json"
    response = requests.get(url, params=None)
    
    if response.status_code != 200:
        print("OOPS IT DIDN'T WORK")
        quit()
        
    print("Reformatting json")
    content = response.json()
    reformatted = {}
    for comm in content:
        reformatted[comm]=[]
        for alg in content[comm]:
            reformatted[comm].append([alg[0], alg[2]])

    print("Writing to file")
    strreformatted = json.dumps(reformatted, indent=None)
    with open(filename + "_formatted.json", "w") as outfile:
        outfile.write(strreformatted)

    print("Finished formatting " + filename + "\n")

print("Finished parsing all files!")

