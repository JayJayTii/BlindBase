import cornerData from '../assets/recommendations/cornerManmade_formatted.json'
import edgeData from '../assets/recommendations/edgeManmade_formatted.json'
import imageData from '../assets/recommendations/imageRecommendations.json'
import { useSettingsStore } from '../stores/SettingsStore'
import { adjacentCornerStickers, adjacentEdgeStickers } from '@/helpers/stickers.js'

export function getRecommendations(pieceType, key) {
    switch (pieceType) {
        case 0:
            //No sheet type, no recommendations
            return []
        case 1:
            //Corners
            return getCornerRecommendations(key, useSettingsStore().settings.sheets_notationtype)
        case 2:
            //Edges
            return getEdgeRecommendations(key, useSettingsStore().settings.sheets_notationtype)
        case 3:
            //Images
            return getImageRecommendations(key)
    }
}

export function GetRandomRecommendation(pieceType, key) {
    if (key.length !== 2)
        return ""

    let recommendations = []
    if (pieceType === 1) {
        recommendations = getCornerRecommendations(key, 0)
    }
    if (pieceType === 2) {
        recommendations = getEdgeRecommendations(key, 0)
    }
    const index = Math.floor(Math.random() * recommendations.length)
    if (recommendations[index] == undefined) {
        console.log(recommendations)
        console.log(index)
    }
    return recommendations[index]
}

function getEquivalentCornerComms(key) {
    //Each corner comm can have many equivalents, which are spread throughout the cornerData
    const cycled = [key, key[2] + key[0] + key[1], key[1] + key[2] + key[0]]
    let output = []
    for (let cycle of cycled) {
        for (var j = 0; j < 3; j++) {
            //How many times we rotate each sticker around its corner
            let rotation = ''
            for (var i = 0; i < 3; i++) {
                //Index cycle
                let letter = cycle[i]
                rotation += adjacentCornerStickers[letter][j]
            }
            output.push(rotation)
        }
    }
    return output
}
function getEquivalentEdgeComms(key) {
    //Each edge comm can have many equivalents, which are spread throughout the edgeData
    const cycled = [key, key[2] + key[0] + key[1], key[1] + key[2] + key[0]]
    let output = []
    for (let cycle of cycled) {
        //For each cycle of the base key
        for (var j = 0; j < 2; j++) {
            //For each inversion of that cycle around the edge piece
            let rotation = ''
            for (var i = 0; i < 3; i++) {
                //For each letter of that inversion
                let letter = cycle[i]
                rotation += adjacentEdgeStickers[letter][j]
            }
            output.push(rotation)
        }
    }
    return output
}

export function getCornerRecommendations(baseKey, notationType) {
    //buffer is always included in the comm
    baseKey = 'C' + baseKey
    const equivalentKeys = getEquivalentCornerComms(baseKey)
    let allComms = []
    for (var key of equivalentKeys) {
        if (!cornerData[key]) continue

        //Each of these equivalent keys could have multiple algs
        for (var alg of cornerData[key]) {
            if (alg[notationType] == "Not found.")
                continue
            allComms.push(alg[notationType])
        }
    }
    return allComms
}
export function getEdgeRecommendations(baseKey, notationType) {
    //buffer is always included in the comm
    baseKey = 'C' + baseKey
    const equivalentKeys = getEquivalentEdgeComms(baseKey)
    let allComms = []
    for (var key of equivalentKeys) {
        if (!edgeData[key]) continue

        //Each of these equivalent keys could have multiple algs
        for (var alg of edgeData[key]) {
            if (alg[notationType] == "Not found.")
                continue
            allComms.push(alg[notationType])
        }
    }
    return allComms
}

function getImageRecommendations(baseKey) {
    let result = imageData[baseKey]
    if (!(baseKey.includes('X') && useSettingsStore().settings.sheets_extraximages == true)) return result

    //Get every combination of X/ʧ options
    if (baseKey[0] == 'X') {
        result = result.concat(imageData['ʧ' + baseKey[1]])
    }
    if (baseKey[1] == 'X') {
        result = result.concat(imageData[baseKey[0] + 'ʧ'])
    }
    if (baseKey == 'XX') {
        result = result.concat(imageData['ʧʧ'])
    }

    return result
}