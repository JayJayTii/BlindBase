import { ElMessageBox } from 'element-plus'
import { useSheetStore } from '@/stores/SheetStore.js'
import { useSettingsStore } from '@/stores/SettingsStore.js'
import { cornerBuffers, edgeBuffers, cornerScheme, edgeScheme, cornerSpeffz, edgeSpeffz } from '@/helpers/letter_scheme.js'

export function downloadSheet(sheet) {
	const flipped = useSettingsStore().settings.sheets_pairorder === 1

	//Convert sheet object into csv format
	let csvString = "," + sheet.xHeadings.split('').join(',') + ",\n"
	for (var i = 0; i < sheet.yHeadings.length; i++) {
		csvString += sheet.yHeadings[i] + ","
		for (var j = 0; j < sheet.xHeadings.length; j++) {
			let cellVal = sheet.grid[flipped ? i : j][flipped ? j : i]
			if (cellVal.includes(','))
				cellVal = '\"' + cellVal + '\"'
			csvString += cellVal + ","
		}
		csvString += "\n"
	}
	const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString)

	//Perform web dev stupidity to download it
	const link = document.createElement("a")
	link.setAttribute("href", encodedUri)
	link.setAttribute("download", sheet.name + ".csv")
	document.body.appendChild(link)
	link.click();
	document.body.removeChild(link)
}


//The number of filled cells in a sheet means the number of cells that aren't empty
//This is used to count the number of possible flashcards that can be made from a sheet
//Since an empty flashcard is not allowed
export function getFilledCells(sheet) {
	let filledCells = 0
	for (var i = 0; i < customSheet.value.yHeadings.length; i++) {
		for (var j = 0; j < customSheet.value.xHeadings.length; j++) {
			if (customSheet.value.grid[i][j] !== "")
				filledCells++
		}
	}
	return filledCells
}

function splitCSVline(str) {
	//Split at a comma, but ignore if inside double quotes
	//For example the line
	// A, "B, C", D
	//Should not split B and C
	let result = []
	let temp = ""
	let inQuotes = false
	for (var i = 0; i < str.length; i++) {
		if (str[i] === '\"')
			inQuotes = !inQuotes
		else if (str[i] === ',' && !inQuotes) {
			result.push(temp.replace('\"', ''))
			temp = ""
		}
		else
			temp += str[i]
	}
	if(temp.length != 0)
		result.push(temp.replace('\"', '').replace('\r',''))
	return result
}

function readCSV(content) {
	let csvGrid = content.split('\n').filter(line => line.length > 0) //Filter random 0-length end lines
	for (var i = 0; i < csvGrid.length; i++) {
		csvGrid[i] = splitCSVline(csvGrid[i])
	}
	return csvGrid
}

// Boolean for if the contents of a cell in an uploaded sheet is a heading
// This includes: 'A', 'B (DBL)', 'G', 'LF', 'J (this is a comment)'
function getHeading(cell, sheetType) {
	if (cell == "")
		return ""
	
	// Detect UFR notation

	for (const buffer of cornerBuffers) {
		if (cell.includes(buffer)) {
			//console.log(cell + " includes corner buffer: " + buffer)
			return buffer
		}
	}
	for (const buffer of edgeBuffers) {
		if (cell.includes(buffer)) {
			//console.log(cell + " includes edge buffer: " + buffer)
			return buffer
		}
	}
	
	// Otherwise detect a letter on its own

	cell = " " + cell + " " // Padding so we can just detect spaces around a letter, not the start/end of the string
	const result = cell.match(/\s([A-Z])\s/) || []
	if (result.length == 2) { // Contains the full match and the captured group. E.g. 'A' or 'B (DBL)'
		//console.log(cell + " includes letter: " + result[1])
		let target = result[1] // Resolve letter scheme into UFR notation

		if (sheetType == 2) { // Edges
			return edgeBuffers[edgeScheme.indexOf(target)]
		}
		else if (sheetType == 1) { // Corners
			return cornerBuffers[cornerScheme.indexOf(target)]
		}
		// None and Images stay as letters
		return target
	}

	return ""
}
function isHeading(cell) {
	return getHeading(cell, 0) != "" // Sheet type parameter doesnt matter since we don't care about how letters are converted
}

// Gets just the sheet grid from the full contents of the file
function getSheetGrid(grid, gridAnchor, gridWidth, gridHeight) {
	const newGrid = []
	for (var row = 0; row < gridHeight; row++) {
		const newRow = []
		for (var column = 0; column < gridWidth; column++) {
			newRow.push(grid[gridAnchor.row + 1 + row][gridAnchor.column + 1 + column])
		}
		newGrid.push(newRow)
	}
	return newGrid
}

function getColumnHeadings(grid, gridAnchor, gridWidth, sheetType) {
	const columnHeadings = []
	for (var column = 0; column < gridWidth; column++) {
		const newHeading = grid[gridAnchor.row][gridAnchor.column + 1 + column]
		columnHeadings.push(getHeading(newHeading, sheetType))
	}
	return columnHeadings
}
function getRowHeadings(grid, gridAnchor, gridHeight, sheetType) {
	const rowHeadings = []
	for (var row = 0; row < gridHeight; row++) {
		const newHeading = grid[gridAnchor.row + 1 + row][gridAnchor.column]
		rowHeadings.push(getHeading(newHeading, sheetType))
	}
	return rowHeadings
}

//This is the sheet uploading feature, which takes in a selected file and creates an alg-sheet from it.
//Just converts file contents to algsheet grid! Everything must be handled elsewhere
//Returns tuple, first is a boolean for success, second is either an error message or the sheet's grid
export function CreateSheetFromFile(content, flipped, type) {
	let grid = readCSV(content)

	// Get the coordinates of the grid anchor
	let gridAnchor = { column: -1, row: -1 } // The (typically empty) corner of row and column headings
	// Grid needs to be at least 2 tall and 2 wide to detect it
	for (let row = 0; row < grid.length - 2; row++) {
		for (let column = 0; column < grid[0].length - 2; column++) {
			if (isHeading(grid[row][column + 1]) && isHeading(grid[row][column + 2]) && isHeading(grid[row + 1][column]) && isHeading(grid[row + 2][column])) {
				gridAnchor = { column: column, row: row }
				break
			}
		}
		if (gridAnchor.column != -1 && gridAnchor.row != -1)
			break
	}
	
	if (gridAnchor.column == -1 || gridAnchor.row == -1)
		return [false, "Could not find the table in this sheet. Please make sure there are headings on both axes which contain the targets that are used by the table."]


	// Get width and height of the sheet grid
	let gridWidth = 2
	let currentColumn = gridAnchor.column + 3
	while (currentColumn < grid[0].length && isHeading(grid[gridAnchor.row][currentColumn])) {
		gridWidth++
		currentColumn++
	}

	let gridHeight = 2
	let currentRow = gridAnchor.row + 3
	while (currentRow < grid.length && isHeading(grid[currentRow][gridAnchor.column])) {
		gridHeight++
		currentRow++
	}

	let extractedGrid = getSheetGrid(grid, gridAnchor, gridWidth, gridHeight)
	let colHeadings = getColumnHeadings(grid, gridAnchor, gridWidth, type)
	let rowHeadings = getRowHeadings(grid, gridAnchor, gridHeight, type)

	let sheetGrid = Array.from({ length: 24 }, () => Array.from({ length: 24 }, () => ""))
	const buffers = (type == 2) ? edgeBuffers : cornerBuffers
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWX"
	for (var col = 0; col < colHeadings.length; col++) {
		for (var row = 0; row < rowHeadings.length; row++) {
			const colIndex = ((colHeadings[col].length == 1) ? letters : buffers).indexOf(colHeadings[col])
			const rowIndex = ((rowHeadings[row].length == 1) ? letters : buffers).indexOf(rowHeadings[row])
			sheetGrid[!flipped ? colIndex : rowIndex][!flipped ? rowIndex : colIndex] = extractedGrid[col][row]
		}
	}

	return [true, sheetGrid]
}

//Checks if every cell in the given sheet is empty.
export function isEmpty(sheet) {
	var empty = true
	for (var x = 0; x < 24; x++) {
		for (var y = 0; y < 24; y++) {
			if (sheet.grid[y][x] !== '') {
				empty = false
				break
			}
		}
		if (!empty) break
	}
	return empty
}

//X and Y headings are the headings of the columns and rows respectively, returned as an array.
export function getXHeadings(sheet) {
	return sheet ? sheet.xHeadings.split('') : 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('')
}
export function getYHeadings(sheet) {
	return sheet ? sheet.yHeadings.split('') : 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('')
}