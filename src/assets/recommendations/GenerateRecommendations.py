import json
import requests
import concurrent.futures
import re
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
    

print("Now fetching images")




def CleanRecommendation(unclean):
    out = ""
    capitalise = False
    while(len(unclean) > 0):
        if(unclean[0] != "<"):
            out += unclean[0].upper() if(capitalise) else unclean[0].lower()
            unclean = unclean[1:]
            continue
        #Now there's a tag
        capitalise = not (unclean[1] == "/")
        unclean = unclean[unclean.index(">")+1:]
        
    return out

def ParseResult(result):
    matches = re.findall(r"""<td class='wlWord'[^>]*>(.*?)</td>""", result, re.DOTALL)
    matches = [match[0:match.index("<img")] for match in matches]
    matches = [CleanRecommendation(match) for match in matches]

    return matches

#https://stackoverflow.com/questions/62007674/multi-thread-requests-python3
def request_get(key):
    url="https://bestsiteever.ru/colpi/api/lpiquery.php?lp="+key+"&includeSmForm=1"
    print(key + "\n")
    result = str(requests.get(url).content)
    parsed= ParseResult(result)
    return {"key":key, "result":parsed}

allKeys = []
for letter1 in "ABCDEFGHIJKLMNOPQRSTUVWX":
    for letter2 in "ABCDEFGHIJKLMNOPQRSTUVWX":
        allKeys.append(letter1+letter2)
with concurrent.futures.ThreadPoolExecutor() as executor: # optimally defined number of threads
    res = [executor.submit(request_get, key) for key in allKeys]
    concurrent.futures.wait(res)

jsonResult = {}
for keyResult in res:
    jsonResult[keyResult.result()["key"]] = keyResult.result()["result"]

with open('imageRecommendations.json', 'w') as f:
    json.dump(jsonResult, f)








