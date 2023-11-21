// Scripts for Google Sheets AppScript.
// https://github.com/xcollantes/options-trading-log

function getTransactionRow(sheet) {
  let range = sheet.getRange("3:3")
  return range.getValues()[0]
}

function getStockPrice(date, symbol) {
  response = UrlFetchApp.fetch("https://finance.google.com/finance/quote/" + symbol + ":NASDAQ?output=json")
  console.log(response)
}

/**
 * Format for date to be ouput in Sheet.
 */
function formatDate(inputDate) {
  const date = new Date(inputDate)
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`
}

/**
 * Format for date in yyyy-mm-dd.   
 */
function yyyymmddFormat(inputDate) {
  const date = new Date(inputDate)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function formatPercent(inputAmount) {
  const formatter = new Intl.NumberFormat(
    "en-US", {
        style: "percent", 
        minimumFractionDigits: 2
      })
  return formatter.format(inputAmount)
}

function formatDollar(inputAmount) {
  const formatter = new Intl.NumberFormat(
    "en-US", {
        style: "currency", 
        currency: "USD", 
        minimumFractionDigits: 2
      })
  return formatter.format(inputAmount)
}

/**
 * Create Google News link to remember what was happening in the market during 
 * the trade.
 */
function createGoogleNewsLink(dataRow) {
  const symbol = dataRow[0]
  const startPositionDate = yyyymmddFormat(dataRow[2])
  const endPositionDate = yyyymmddFormat(dataRow[3])
  
  return String(`https://www.google.com/search?q=after%3A${startPositionDate}+before%3A${endPositionDate}+what+happened+to+${symbol}+stock`)
}

/**
 * Generate template for trading journal in Markdown.
 */
function createTemplate(dataRow) {
  const symbol = dataRow[0]
  const type = dataRow[1].includes("Buy") ? "Buy" : "Sell"
  const startPositionDate = formatDate(dataRow[2])
  const endPositionDate = formatDate(dataRow[3])
  const expDate = formatDate(dataRow[4])
  const strikePrice = formatDollar(dataRow[5])
  const daysHeldPosition = dataRow[6]
  const percentDaysHeldPosition = formatPercent(dataRow[8])
  const quantityContracts = dataRow[9]
  const contractStartPrice = formatDollar(dataRow[10])
  const contractEndPrice = formatDollar(dataRow[11])
  const initialInvestmentAmount = formatDollar(dataRow[12])
  const endResultAmount = formatDollar(dataRow[13])
  const gainLossAmount = dataRow[14]
  const gainLossAmountFormatted = formatDollar(gainLossAmount)
  const percentGainLoss = formatPercent(dataRow[15])

  const gainOrLossWord = gainLossAmount >= 0 ? "gain" : "loss"
  const signPositive = gainLossAmount >= 0 ? "+": ""
  const signPositiveOrNegative = gainLossAmount >= 0 ? "+": "-"
  const successOrFail = gainLossAmount >= 0 ? "Success": "Fail"

  return `
  ## ${type} ${symbol} ${expDate} Call ${strikePrice}

  **Result:** ${successOrFail}; sold at ${signPositive}${gainLossAmountFormatted} ${gainOrLossWord} or ${signPositiveOrNegative}${percentGainLoss}
  **Date purchased:** ${startPositionDate}
  **Date sold:** ${endPositionDate}
  **Initial investment:** ${initialInvestmentAmount}
  **Net:** ${endResultAmount}
  **Average contract share price:** ${contractStartPrice}
  **Number of contracts:** ${type == "Buy" ? "+" : "-"}${quantityContracts}
  **Days holding position:** ${daysHeldPosition}; which is ${percentDaysHeldPosition} of days from contract purchased until expiration
  **Underlying asset price change during contract:** 

  **Why this contract:**

  - 

  **Cause of result:**

  - 

  **Lessons learned:**

  - 

  `
}

/** 
 * Set cell values for template.
 */
function outputTemplate(sheet, templateString) {
  sheet.getRange("A10").setValues([[templateString]])
}

/**
 * Set cell for news context link.
 */
function outputNewsLink(sheet, linkValue) {
  sheet.getRange("A12").setFormula(`=HYPERLINK("${linkValue}", "Google News link")`)
}

/** 
 * Call as main function.
 */
function transformTemplate() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("generate journal template")

  const transaction = getTransactionRow(sheet)
  const template = createTemplate(transaction)
  const newsLink = createGoogleNewsLink(transaction)

  outputTemplate(sheet, template)
  outputNewsLink(sheet, newsLink)
}
