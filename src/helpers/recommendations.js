//This should be the only file which works with chichu

export function getRecommendations(sheetType, key) {
	if (sheetType == 0) //No sheet type, no recommendations
		return [];
	if(sheetType == 1) //Corners
		return getCornerRecommendations(key);
	if (sheetType == 2) //Edges
		return ["edgealg1", "edgealg2"];
	if (sheetType == 3) //Images
		return ["image1", "image2"];
}

function getCornerRecommendations(key) {

	return [key, key, key, key];
}