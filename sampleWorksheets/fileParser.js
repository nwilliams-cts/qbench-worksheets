importScripts("https://d30nr38ylt5b32.cloudfront.net/v1.0.0/file_parser.js");
importScripts("https://d731z7k534aiw.cloudfront.net/v2.4.0/qbjs.js");

run(async () => {
    const qbConsole = QB.console; // Object to write to the console
    const qbProgressBar = QB.progressBar; // Object to control the progress bar
    const files = QB.files; // Array of files selected to upload

    const BatchService = new QBBatchService();
    const TestService = new QBTestService();
    const SampleService = new QBSampleService();
    const KVStorageService = new QBKVStorageService();
    qbProgressBar.setPercentage(0);
    qbConsole.clear();
    qbConsole.log("Begin process...");

    // var worksheetData = {'testing_file_order': [], 'control_data': {}};
    var kvstoreAssayMapping = {};

    for (let file of files) {
        let worksheetData = {'testing_file_order': [], 'control_data': {}};
        let batchID = file.name.toLowerCase().replace(".txt", "");

        try {
            // Fetch Batch
            let batch = await BatchService.get({ 
                id: batchID,
                success: () => {
                    qbConsole.log(`Successfully fetched Batch ${batchID}`);
                    qbProgressBar.setPercentage(25);
                },
                error: () => {
                    throw new Error(`Error fetching batch ${batchID}!`);
                }
            });
            
            // Fetch Worksheet Analytes from KVStore
            let assay = batch.data.assay;
            var kvstoreData = {};
            if (assay.id in kvstoreAssayMapping) {
                kvstoreData = kvstoreAssayMapping[assay.id];
            } else {
                try {
                    let assayParamID = "2b220be3-5c3f-4fe0-9b41-f41cd8b751ad" //batch.data.assay.assay_params;
                    let kvstore = await KVStorageService.get({
                        id: assayParamID,
                        success: () => {
                            qbConsole.log(`Successfully fetched KVStore Data for Assay ${assay.id}: ${assay.title}`);
                            qbProgressBar.setPercentage(50);
                        },
                        error: () => {
                            throw new Error(`Error fetching KVStore Data for Assay ${assay.id}: ${assay.title}}`);
                        }
                    });
                    kvstoreData = kvstore.data.data;
                } catch (e) {
                    qbConsole.log(`Error: ${e}`);
                    continue;
                }
            }
            var analytes = kvstoreData.data_file_analytes;
            var dataColumnsToAnalytesMap = kvstoreData.data_columns_to_analytes;
            var qcTypes = kvstoreData.qc_types ? kvstoreData.qc_types : [];
            
            let orderedAnalytes = {};
            
            let tests = await TestService.getList({ 
                filterParams: {"batch_ids": batchID},
                success: () => {
                    qbConsole.log(`Successfully fetched Batch ${batchID}`);
                    qbProgressBar.setPercentage(25);
                },
                error: () => {
                    throw new Error(`Error fetching batch ${batchID}!`);
                }
            });
            let initTests = tests.data;
            let sampleTestMap = {};
            let testArray = [];
            initTests.forEach(function(test) {
                testArray.push(test.id);
                if (sampleTestMap[test.sample.id]) {
                    sampleTestMap[test.sample.id].push(test.id)
                }
                else {
                    sampleTestMap[test.sample.id] = [test.id]
                }
            });
            initTests.forEach(function(test) {testArray.push(test.id)})
            
            totalPages = tests.total_pages;
            for (let i=1;i<totalPages; i++) {
                let tests = await TestService.getList({ 
                    filterParams: {"batch_ids": batchID, "page_num": (i+1)},
                    success: () => {
                        qbConsole.log(`Successfully fetched Batch ${batchID}`);
                        qbProgressBar.setPercentage(25);
                    },
                    error: () => {
                        throw new Error(`Error fetching batch ${batchID}!`);
                    }
                });
                tests.data.forEach(function(test) {
                    testArray.push(test.id);
                    if (sampleTestMap[test.sample.id]) {
                    	sampleTestMap[test.sample.id].push(test.id)
                    }
                    else {
                        sampleTestMap[test.sample.id] = [test.id]
                    }
                })
            }            
            
            
            let fileData = await parseCsvFile(file);
            
            let fileSampleID = "";
            let processSample = false;
            let isSample = false;
            // let qcCounters = {};
            // qcTypes.forEach(function(type) {qcCounters[type] = 0})
            let i = 0;
            
            dataColumnsToAnalytesMap = {
                "CBDVA": "cbdva",
                "CBDV": "cbdv",
                "CBDA": "cbda",
                "CBD": "cbd",
                "CBGA": "cbga",
                "CBG": "cbg",
                "CBN": "cbn",
                "THCV": "thcv",
                "THCA": "thca",
                "THCVA": "thcva",
                "D9 THCV": "d9_thcv",
                "D9-THC": "d9_thc",
                "D8-THC": "d8_thc",
                "D10THC9S": "d10thc9s",
                "D10THC9R": "d10thc9r",
                "CBC": "cbc",
                "CBCA": "cbca"
            }
            
            for (let row of fileData) {
                let currentTestID = null;
                if (i === 0) {
                    let j = 0;
                    for (let col of row) {
                        if (dataColumnsToAnalytesMap[col.toString().trim()]) {
                            let analyte = dataColumnsToAnalytesMap[col.toString().trim()];
                            orderedAnalytes[j] = analyte;
                        }
                        j += 1;
                    }
                } else if (!row[0].replace("\r", "")) {
                    // skip if no value in first column
                } else {
                	fileSampleID = row[1].split('_')[0];
                    let foundQCType = null;
                    if (testArray.includes(parseInt(fileSampleID))) {
                        isSample = true;
                        worksheetData['testing_file_order'].push(parseInt(fileSampleID));
                    } else {
                        // isSample = false;
                        // foundQCType = qcTypes.find(qcType => fileSampleID.toLowerCase().includes(qcType));
                        // if (foundQCType != null) {
                        //     qcCounters[foundQCType] += 1;
                        //     let qcName = `${foundQCType}_${qcCounters[foundQCType]}`
                        //     worksheetData['testing_file_order'].push(qcName);
                        //     worksheetData['control_data'][qcName] = {"qc_type": foundQCType}
                        // }
                    }
                    
                    let k = 0;
                    for (let col of row) {
                        let analyte = orderedAnalytes[k];
                        if (isSample && analyte) {
                            let testID = worksheetData['testing_file_order'][worksheetData['testing_file_order'].length-1]
                            worksheetData[`${analyte}_${testId}_instrument_findings`] = toFloat(row[k]);
                        } else if (analyte && foundQCType != null) {
                            // let qcID = worksheetData['testing_file_order'][worksheetData['testing_file_order'].length-1]
                            // worksheetData['control_data'][qcID][`${analyte}_raw`] = toFloat(row[k]);
                        }
                        k += 1;
                    }
                }
                i += 1;
            }

            // worksheetData['testing_file_order'] = JSON.stringify(worksheetData['testing_file_order']);
            // worksheetData['control_data'] = JSON.stringify(worksheetData['control_data']);
            
            // analytes = kvstoreData.worksheet_analytes;

            analytes = Object.keys(dataColumnsToAnalytesMap).map(function(key) {
                return dataColumnsToAnalytesMap[key];
            });
            
            qbConsole.log(testArray);
            testArray.forEach(async (testId) => {
                analytes.forEach((analyte) => {
                    if (!analyte.includes('total')) {
                    	updateData[`${analyte}_instrument_findings`] = worksheetData[`${analyte}_${testId}_instrument_findings`];
                    	delete worksheetData[`${analyte}_${testId}_instrument_findings`];
                	}
                });
                
                await TestService.update({
                    data: {"id": testId, "worksheet_json": JSON.stringify(updateData)},             
                    success: () => {
                    	qbConsole.log(`Sample ID: ${sampleId} worksheet has been updated!`)
                	},
                    error: QB.error
                });
            });

        } catch (e) {
            console.log(`Error: ${e}`);
            continue;
        }
    }
    qbProgressBar.setPercentage(100);
    QB.success();
});

const parseCsvFile = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsBinaryString(file);

        fileReader.onload = (e) => {
            let data = e.target.result;

            var list = data.split("\n");
            var result = list.map(function (item) {
                return item.split("\t");
            });

            resolve(result);
        };

        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};

function toFloat(value, defaultValue = 0.0, sigFigs = 5) {
  if (typeof value === 'string') {
    value = value.trim();
    // Check if the trimmed value is not numeric
    if (isNaN(value) || value === "" || !isFinite(value)) {
      return defaultValue;
    }
  }
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return defaultValue;
  }
  return parseFloat(parsed.toPrecision(sigFigs));
}