// Scripts for Google Sheets AppScript.
// https://github.com/xcollantes/options-trading-log

/**
 * Press button to create snapshot of current gain and loss.  
 */
function createSnapshot() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetName("overall metrics")
  const countNewRows = 1
  const positionNewRow = 13

  sheet.insertRows(positionNewRow, countNewRows)
  
  date = new Date()
  date = date.toDateString()

  current_unrealized = sheet.getRange("B2").getValue()
  realized_net = sheet.getRange("B3").getValue()
  return_pct = sheet.getRange("B4").getValue()
  total_realized_gain = sheet.getRange("B8").getValue()
  total_realized_loss = sheet.getRange("B9").getValue()

  sheet.getRange("A" + positionNewRow + ":" + "D" +  positionNewRow).setValues([[
    date, 
    current_unrealized, 
    realized_net, 
    return_pct, 
    total_realized_gain, 
    total_realized_loss]])
}
