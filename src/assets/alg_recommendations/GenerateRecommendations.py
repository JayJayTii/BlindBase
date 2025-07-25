#This is used for reformatting the json files taken from v2.blddb.net
import json
import requests
cornerChichuToSpeffz = {"D": "A","G": "B","J": "C","A": "D","E": "E","C": "F","M": "G","Q": "H","B": "I","L": "J","Y": "K","N": "L","K": "M","I": "N","S": "O","Z": "P","H": "Q","F": "R","P": "S","T": "T","W": "U","X": "V","R": "W","O": "X"}
edgeChichuToSpeffz = {"E": "A","G": "B","A": "C","C": "D","D": "E","T": "F","L": "G","X": "H","B": "I","Q": "J","J": "K","S": "L","H": "M","Z": "N","P": "O","R": "P","F": "Q","W": "R","N": "S","Y": "T","I": "U","O": "V","M": "W","K": "X"}
def convertByChar(strData, dictionary):
    out = ""
    for i in range(len(strData)):
        out += dictionary[strData[i]]
    return out

filenames = ["cornerManmade","edgeManmade"]
dicts = [cornerChichuToSpeffz, edgeChichuToSpeffz]

for i in range(len(filenames)):
    filename = filenames[i]
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
        convertedComm = convertByChar(comm, dicts[i])
        reformatted[convertedComm]=[]
        for alg in content[comm]:
            reformatted[convertedComm].append([alg[0][0], alg[2][0]])

    print("Writing to file")
    strreformatted = json.dumps(reformatted, indent=None)
    with open(filename + "_formatted.json", "w") as outfile:
        outfile.write(strreformatted)

    print("Finished formatting " + filename + "\n")

print("Finished parsing all files!")













