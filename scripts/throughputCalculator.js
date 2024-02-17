const Excel = require('exceljs');

(() => {
    const fileName = 'throughputs.xlsx';

    const wb = new Excel.Workbook();
    const ws = wb.addWorksheet('My Sheet');

    const blockGasLimit = 30000000
    const gasUsedByTransaction = 383989
    const gasUsedByBatch = 1800000
    const transactionsCanFit = 427

    const congestionCases = [0.10727458200000001,0.5054979381000001,0.9758281240000002]
    let throughputsEth = []
    let throughputsArb = []
    let gasFree = 0
    let batchesCanFit = 0;

    let throughputEth = 0;
    let throughputArb = 0;
    for (i = 0; i < congestionCases.length; i++) {
        gasFree = blockGasLimit - (blockGasLimit * congestionCases[i])
        throughputEth = (gasFree/gasUsedByTransaction)/12
        console.log("Throughputs Ethereum [" +congestionCases[i] + "]:" + throughputEth);

        if (gasFree >= (gasUsedByBatch*9)) throughputArb = 320.25
        else {
            batchesCanFit = Math.floor(gasFree/gasUsedByBatch)
            throughputArb = (batchesCanFit * transactionsCanFit)/12
        }
        console.log("Throughputs Arbitrum [" +congestionCases[i] + "]:" + throughputArb);
    }

    for (i = 0; i <= 100; i++) {
        gasFree = blockGasLimit - (blockGasLimit * (i/100));

        throughputsEth[i] = (gasFree/gasUsedByTransaction)/12;
        console.log("Throughputs Ethereum [" + i + "% BGO]:" + throughputsEth[i]);

        if (gasFree >= (gasUsedByBatch*9)) throughputsArb[i] = 320.25
        else {
            batchesCanFit = Math.floor(gasFree/gasUsedByBatch)
            throughputsArb[i] = (batchesCanFit * transactionsCanFit)/12
        }
        console.log("Throughputs Arbitrum [" + i + "% BGO]:" + throughputsArb[i]);
    } 

    ws.addRow(throughputsEth);
    ws.addRow(throughputsArb);

    wb.xlsx
    .writeFile(fileName)
    .then(() => {
    console.log('file created');
    })
    .catch(err => {
    console.log(err.message);
    });

})();