import { adjacentCornerStickers, adjacentEdgeStickers } from '@/helpers/stickers.js'

//All possible pairs
export const allEdgePairs = ["AB", "AD", "AE", "AF", "AG", "AH", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "BA", "BD", "BE", "BF", "BG", "BH", "BJ", "BK", "BL", "BN", "BO", "BP", "BQ", "BR", "BS", "BT", "BU", "BV", "BW", "BX", "DA", "DB", "DF", "DG", "DH", "DJ", "DK", "DL", "DM", "DN", "DO", "DP", "DQ", "DR", "DS", "DT", "DU", "DV", "DW", "DX", "EA", "EB", "EF", "EG", "EH", "EJ", "EK", "EL", "EM", "EN", "EO", "EP", "EQ", "ER", "ES", "ET", "EU", "EV", "EW", "EX", "FA", "FB", "FD", "FE", "FG", "FH", "FJ", "FK", "FM", "FN", "FO", "FP", "FQ", "FR", "FS", "FT", "FU", "FV", "FW", "FX", "GA", "GB", "GD", "GE", "GF", "GH", "GJ", "GK", "GL", "GM", "GN", "GO", "GP", "GQ", "GR", "GS", "GT", "GU", "GV", "GW", "HA", "HB", "HD", "HE", "HF", "HG", "HJ", "HK", "HL", "HM", "HN", "HO", "HP", "HQ", "HS", "HT", "HU", "HV", "HW", "HX", "JA", "JB", "JD", "JE", "JF", "JG", "JH", "JK", "JL", "JM", "JN", "JO", "JQ", "JR", "JS", "JT", "JU", "JV", "JW", "JX", "KA", "KB", "KD", "KE", "KF", "KG", "KH", "KJ", "KL", "KM", "KN", "KO", "KP", "KQ", "KR", "KS", "KT", "KV", "KW", "KX", "LA", "LB", "LD", "LE", "LG", "LH", "LJ", "LK", "LM", "LN", "LO", "LP", "LQ", "LR", "LS", "LT", "LU", "LV", "LW", "LX", "MA", "MD", "ME", "MF", "MG", "MH", "MJ", "MK", "ML", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "NA", "NB", "ND", "NE", "NF", "NG", "NH", "NJ", "NK", "NL", "NM", "NO", "NP", "NQ", "NR", "NS", "NU", "NV", "NW", "NX", "OA", "OB", "OD", "OE", "OF", "OG", "OH", "OJ", "OK", "OL", "OM", "ON", "OP", "OQ", "OR", "OS", "OT", "OU", "OW", "OX", "PA", "PB", "PD", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PO", "PQ", "PR", "PS", "PT", "PU", "PV", "PW", "PX", "QB", "QD", "QE", "QF", "QG", "QH", "QJ", "QK", "QL", "QM", "QN", "QO", "QP", "QR", "QS", "QT", "QU", "QV", "QW", "QX", "RA", "RB", "RD", "RE", "RF", "RG", "RJ", "RK", "RL", "RM", "RN", "RO", "RP", "RQ", "RS", "RT", "RU", "RV", "RW", "RX", "SA", "SB", "SD", "SE", "SF", "SG", "SH", "SJ", "SK", "SL", "SM", "SN", "SO", "SP", "SQ", "SR", "ST", "SU", "SV", "SX", "TA", "TB", "TD", "TE", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TO", "TP", "TQ", "TR", "TS", "TU", "TV", "TW", "TX", "UA", "UB", "UD", "UE", "UF", "UG", "UH", "UJ", "UL", "UM", "UN", "UO", "UP", "UQ", "UR", "US", "UT", "UV", "UW", "UX", "VA", "VB", "VD", "VE", "VF", "VG", "VH", "VJ", "VK", "VL", "VM", "VN", "VP", "VQ", "VR", "VS", "VT", "VU", "VW", "VX", "WA", "WB", "WD", "WE", "WF", "WG", "WH", "WJ", "WK", "WL", "WM", "WN", "WO", "WP", "WQ", "WR", "WT", "WU", "WV", "WX", "XA", "XB", "XD", "XE", "XF", "XH", "XJ", "XK", "XL", "XM", "XN", "XO", "XP", "XQ", "XR", "XS", "XT", "XU", "XV", "XW"]
export const allCornerPairs = ["AB", "AD", "AF", "AG", "AH", "AI", "AK", "AL", "AN", "AO", "AP", "AQ", "AS", "AT", "AU", "AV", "AW", "AX", "BA", "BD", "BE", "BF", "BG", "BH", "BI", "BK", "BL", "BO", "BP", "BR", "BS", "BT", "BU", "BV", "BW", "BX", "DA", "DB", "DE", "DG", "DH", "DK", "DL", "DN", "DO", "DP", "DQ", "DR", "DS", "DT", "DU", "DV", "DW", "DX", "EB", "ED", "EF", "EG", "EH", "EI", "EK", "EL", "EN", "EO", "EP", "EQ", "ES", "ET", "EU", "EV", "EW", "EX", "FA", "FB", "FE", "FG", "FH", "FK", "FL", "FN", "FO", "FP", "FQ", "FR", "FS", "FT", "FU", "FV", "FW", "FX", "GA", "GB", "GD", "GE", "GF", "GH", "GI", "GK", "GN", "GO", "GP", "GQ", "GR", "GS", "GT", "GV", "GW", "GX", "HA", "HB", "HD", "HE", "HF", "HG", "HI", "HK", "HL", "HN", "HO", "HP", "HQ", "HR", "HT", "HU", "HV", "HW", "IA", "IB", "IE", "IG", "IH", "IK", "IL", "IN", "IO", "IP", "IQ", "IR", "IS", "IT", "IU", "IV", "IW", "IX", "KA", "KB", "KD", "KE", "KF", "KG", "KH", "KI", "KL", "KN", "KO", "KQ", "KR", "KS", "KT", "KU", "KW", "KX", "LA", "LB", "LD", "LE", "LF", "LH", "LI", "LK", "LN", "LO", "LP", "LQ", "LR", "LS", "LT", "LV", "LW", "LX", "NA", "ND", "NE", "NF", "NG", "NH", "NI", "NK", "NL", "NO", "NP", "NR", "NS", "NT", "NU", "NV", "NW", "NX", "OA", "OB", "OD", "OE", "OF", "OG", "OH", "OI", "OK", "OL", "ON", "OP", "OQ", "OR", "OS", "OU", "OV", "OX", "PA", "PB", "PD", "PE", "PF", "PG", "PH", "PI", "PL", "PN", "PO", "PQ", "PR", "PS", "PT", "PU", "PW", "PX", "QA", "QD", "QE", "QF", "QG", "QH", "QI", "QK", "QL", "QO", "QP", "QR", "QS", "QT", "QU", "QV", "QW", "QX", "RB", "RD", "RF", "RG", "RH", "RI", "RK", "RL", "RN", "RO", "RP", "RQ", "RS", "RT", "RU", "RV", "RW", "RX", "SA", "SB", "SD", "SE", "SF", "SG", "SI", "SK", "SL", "SN", "SO", "SP", "SQ", "SR", "ST", "SU", "SV", "SW", "TA", "TB", "TD", "TE", "TF", "TG", "TH", "TI", "TK", "TL", "TN", "TP", "TQ", "TR", "TS", "TU", "TV", "TX", "UA", "UB", "UD", "UE", "UF", "UH", "UI", "UK", "UN", "UO", "UP", "UQ", "UR", "US", "UT", "UV", "UW", "UX", "VA", "VB", "VD", "VE", "VF", "VG", "VH", "VI", "VL", "VN", "VO", "VQ", "VR", "VS", "VT", "VU", "VW", "VX", "WA", "WB", "WD", "WE", "WF", "WG", "WH", "WI", "WK", "WL", "WN", "WP", "WQ", "WR", "WS", "WU", "WV", "WX", "XA", "XB", "XD", "XE", "XF", "XG", "XI", "XK", "XL", "XN", "XO", "XP", "XQ", "XR", "XT", "XU", "XV", "XW"]


//Outputs of generating possible pairs have been baked into them
function generateCornerPairs() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
    let pairs = []
    for (var i = 0; i < letters.length; i++) {
        for (var j = 0; j < letters.length; j++) {
            //Skip if contains buffer sticker
            if (adjacentCornerStickers[letters[2]].includes(letters[i])
                || adjacentCornerStickers[letters[2]].includes(letters[j]))
                continue

            //Skip if second letter is on first letter's cubie
            if (adjacentCornerStickers[letters[i]].includes(letters[j]))
                continue

            pairs.push(letters[i] + letters[j])
        }
    }
    let pairStr = ""
    pairStr += ("[")
    for (let pair of pairs) {
        pairStr += (`  "${pair}",`)
    }
    pairStr += ("]")
    console.log(pairStr)
    return
}
function generateEdgePairs() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
    let pairs = []
    for (var i = 0; i < letters.length; i++) {
        for (var j = 0; j < letters.length; j++) {
            //Skip if contains buffer sticker
            if (adjacentEdgeStickers[letters[2]].includes(letters[i])
                || adjacentEdgeStickers[letters[2]].includes(letters[j]))
                continue

            //Skip if second letter is on first letter's cubie
            if (adjacentEdgeStickers[letters[i]].includes(letters[j]))
                continue

            pairs.push(letters[i] + letters[j])
        }
    }
    let pairStr = ""
    pairStr += ("[")
    for (let pair of pairs) {
        pairStr += (`  "${pair}",`)
    }
    pairStr += ("]")
    console.log(pairStr)
    return
}
