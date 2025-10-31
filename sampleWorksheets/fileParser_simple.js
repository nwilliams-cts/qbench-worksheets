importScripts("https://d30nr38ylt5b32.cloudfront.net/v1.0.0/file_parser.js");
importScripts("https://d731z7k534aiw.cloudfront.net/v2.4.0/qbjs.js");

// Documentation for QBJS: https://qbjs.docs.qbench.net

/**
 * Fetch test worksheet data from QBench
 */
function fetchTestWorksheet(qbService, testId) {
    return new Promise((resolve, reject) => {
        qbService.ajaxCall({
            url: "/tests/worksheets/getdata",
            data: {},
            urlParams: { ids: testId },
            success: (data) => resolve(data),
            error: (error) => reject(error),
            type: "GET"
        });
    });
}

/**
 * Parse CSV file into 2D array
 */
const parseCsvFile = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsBinaryString(file);
        fileReader.onload = (e) => {
            let data = e.target.result;
            var list = data.split("\n");
            var result = list.map(function (item) {
                return item.split(",");
            });
            resolve(result);
        };
        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};

/**
 * Convert value to float with precision
 */
function toFloat(value, defaultValue = 0.0, sigFigs = 5) {
    if (typeof value === 'string') {
        value = value.trim();
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

run(async () => {
    // Initialize QBench services and UI
    const qbConsole = QB.console;
    const qbProgressBar = QB.progressBar;
    const files = QB.files;

    const Service = new QBService();
    const BatchService = new QBBatchService();
    const TestService = new QBTestService();
    const SampleService = new QBSampleService();
    const KVStorageService = new QBKVStorageService();
    
    qbProgressBar.setPercentage(0);
    qbConsole.clear();
    qbConsole.log("Begin process...");

    // Cache for KVStore data to avoid repeated API calls for same assay
    var kvstoreAssayMapping = {};
    
    // Cache for sample QC flags to avoid repeated lookups
    var sampleQcFlagCache = {};

    // Process each uploaded file
    for (let file of files) {
        let batchID = file.name.toLowerCase().replace(".csv", "");

        try {
            // ========================================
            // STEP 1: Fetch Batch
            // ========================================
            qbConsole.log(`Fetching batch: ${batchID}`);
            let batch = await BatchService.get({ 
                id: batchID,
                success: () => {
                    qbConsole.log(`Successfully fetched Batch ${batchID}`);
                    qbProgressBar.setPercentage(15);
                },
                error: () => {
                    throw new Error(`Error fetching batch ${batchID}!`);
                }
            });
            
            // ========================================
            // STEP 2: Fetch Analyte Configuration from KVStore
            // ========================================
            let assay = batch.data.assay;
            var kvstoreData = {};
            
            // Check cache first
            if (assay.id in kvstoreAssayMapping) {
                kvstoreData = kvstoreAssayMapping[assay.id];
                qbConsole.log(`Using cached KVStore data for Assay ${assay.id}`);
            } else {
                qbConsole.log(`Fetching KVStore data for Assay ${assay.id}: ${assay.title}`);
                try {
                    let assayParamID = batch.data.assay.assay_params;
                    let kvstore = await KVStorageService.get({
                        id: assayParamID,
                        success: () => {
                            qbConsole.log(`Successfully fetched KVStore Data`);
                            qbProgressBar.setPercentage(30);
                        },
                        error: () => {
                            throw new Error(`Error fetching KVStore Data for Assay ${assay.id}: ${assay.title}`);
                        }
                    });
                    kvstoreData = kvstore.data.data;
                    kvstoreAssayMapping[assay.id] = kvstoreData; // Cache it
                } catch (e) {
                    qbConsole.log(`Error: ${e}`);
                    continue;
                }
            }
            
            // Extract configuration
            var dataColumnsToAnalytesMap = kvstoreData.data_columns_to_analytes;
            var qcTypes = kvstoreData.qc_types ? kvstoreData.qc_types : [];
            var worksheetAnalytes = kvstoreData.worksheet_analytes;
            
            // ========================================
            // STEP 3: Fetch All Tests for This Batch
            // ========================================
            qbConsole.log(`Fetching tests for batch ${batchID}`);
            let tests = await TestService.getList({ 
                filterParams: {"batch_ids": batchID},
                success: () => {
                    qbConsole.log(`Successfully fetched tests`);
                    qbProgressBar.setPercentage(45);
                },
                error: () => {
                    throw new Error(`Error fetching tests for batch ${batchID}!`);
                }
            });
            
            // Build mapping: sampleId -> [testIds]
            let sampleTestMap = {};
            let testArray = [];
            tests.data.forEach(function(test) {
                testArray.push(test.id);
                if (sampleTestMap[test.sample.id]) {
                    sampleTestMap[test.sample.id].push(test.id);
                } else {
                    sampleTestMap[test.sample.id] = [test.id];
                }
            });
            
            // Fetch remaining pages if necessary
            let totalPages = tests.total_pages;
            for (let i = 1; i < totalPages; i++) {
                let tests = await TestService.getList({ 
                    filterParams: {"batch_ids": batchID, "page_num": (i + 1)},
                    success: () => {
                        qbConsole.log(`Fetched tests page ${i + 1}`);
                    },
                    error: () => {
                        throw new Error(`Error fetching tests page ${i + 1}!`);
                    }
                });
                tests.data.forEach(function(test) {
                    testArray.push(test.id);
                    if (sampleTestMap[test.sample.id]) {
                        sampleTestMap[test.sample.id].push(test.id);
                    } else {
                        sampleTestMap[test.sample.id] = [test.id];
                    }
                });
            }
            
            // ========================================
            // STEP 4: Fetch Sample QC Flags
            // ========================================
            qbConsole.log(`Checking QC flags for ${Object.keys(sampleTestMap).length} samples`);
            let qcSampleIds = new Set();
            
            for (let sampleId in sampleTestMap) {
                // Check cache first
                if (sampleId in sampleQcFlagCache) {
                    if (sampleQcFlagCache[sampleId] === "1") {
                        qcSampleIds.add(parseInt(sampleId));
                    }
                    continue;
                }
                
                // Fetch sample data to check qc_flag
                try {
                    let sample = await SampleService.get({
                        id: sampleId,
                        success: () => {},
                        error: () => {
                            throw new Error(`Error fetching sample ${sampleId}`);
                        }
                    });
                    
                    // Check if sample.data.qc_flag === "1"
                    let isQcSample = sample.data && sample.data.qc_flag === true;
                    sampleQcFlagCache[sampleId] = isQcSample ? "1" : "0";
                    
                    if (isQcSample) {
                        qcSampleIds.add(parseInt(sampleId));
                        qbConsole.log(`Sample ${sampleId} is a QC sample (matrix blank/spike)`);
                    }
                } catch (e) {
                    qbConsole.log(`Warning: Could not fetch sample ${sampleId}: ${e}`);
                    // Assume not a QC sample if we can't fetch it
                    sampleQcFlagCache[sampleId] = "0";
                }
            }
            
            qbProgressBar.setPercentage(60);
            
            // ========================================
            // STEP 5: Parse CSV File
            // ========================================
            qbConsole.log(`Parsing file: ${file.name}`);
            let fileData = await parseCsvFile(file);
            
            // Initialize worksheet data structure
            let worksheetData = {
                'testing_file_order': [],
                'control_data': {}
            };
            let orderedAnalytes = {};
            let qcCounters = {};
            qcTypes.forEach(function(type) { qcCounters[type] = 0; });
            
            let rowIndex = 0;
            for (let row of fileData) {
                // Row 3 contains column headers (analyte names)
                if (rowIndex === 3) {
                    let colIndex = 0;
                    for (let col of row) {
                        if (dataColumnsToAnalytesMap[col.toString().trim()]) {
                            let analyte = dataColumnsToAnalytesMap[col.toString().trim()];
                            orderedAnalytes[colIndex] = analyte;
                        }
                        colIndex += 1;
                    }
                }
                // Skip empty rows
                else if (!row[0] || !row[0].replace("\r", "").trim()) {
                    // skip
                }
                // Process data rows
                else {
                    let fullFileSampleID = row[0].replace("\r", "").trim();
                    let fileSampleID = fullFileSampleID.split('_')[0];
                    let testId = parseInt(fileSampleID.replace('-spk', ''));
                    
                    // Check if this is a valid test ID
                    if (testArray.includes(testId)) {
                        // Get the sample ID for this test
                        let sampleId = null;
                        for (let sid in sampleTestMap) {
                            if (sampleTestMap[sid].includes(testId)) {
                                sampleId = parseInt(sid);
                                break;
                            }
                        }
                        
                        // Check if this sample is a QC sample (matrix blank/spike)
                        let isQcSample = qcSampleIds.has(sampleId);
                        
                        if (isQcSample) {
                            // Determine if this is a matrix spike or matrix blank
                            let isMatrixSpike = fileSampleID.includes('-spk');
                            let qcType = isMatrixSpike ? "matrix_spike" : "matrix_blank";
                            let qcName = `${qcType}_${testId}`;
                            
                            qbConsole.log(`Adding ${qcType} (test ${testId}, sample ${sampleId}) to batch worksheet`);
                            
                            worksheetData['testing_file_order'].push(qcName);
                            worksheetData['control_data'][qcName] = {
                                "qc_type": qcType,
                                "sample_id": sampleId,
                                "test_id": testId
                            };
                            
                            // Add analyte data to control_data
                            let colIndex = 0;
                            for (let col of row) {
                                let analyte = orderedAnalytes[colIndex];
                                if (analyte) {
                                    worksheetData['control_data'][qcName][`${analyte}_raw`] = toFloat(col);
                                }
                                colIndex += 1;
                            }
                        } else {
                            // Regular sample - add to test worksheet
                            worksheetData['testing_file_order'].push(testId);
                            
                            // Add analyte data
                            let colIndex = 0;
                            for (let col of row) {
                                let analyte = orderedAnalytes[colIndex];
                                if (analyte) {
                                    worksheetData[`${analyte}_${testId}_raw`] = toFloat(col);
                                }
                                colIndex += 1;
                            }
                        }
                    }
                    // Check if it's a traditional QC sample (CCV, MB, etc.)
                    else {
                        let foundQCType = qcTypes.find(qcType => 
                            fileSampleID.toLowerCase().includes(qcType.toLowerCase())
                        );
                        
                        if (foundQCType) {
                            qcCounters[foundQCType] += 1;
                            let qcName = `${foundQCType}_${qcCounters[foundQCType]}`;
                            
                            worksheetData['testing_file_order'].push(qcName);
                            worksheetData['control_data'][qcName] = {"qc_type": foundQCType};
                            
                            // Add analyte data
                            let colIndex = 0;
                            for (let col of row) {
                                let analyte = orderedAnalytes[colIndex];
                                if (analyte) {
                                    worksheetData['control_data'][qcName][`${analyte}_raw`] = toFloat(col);
                                }
                                colIndex += 1;
                            }
                        } else {
                            qbConsole.log(`Skipping unrecognized sample: ${fileSampleID}`);
                        }
                    }
                }
                rowIndex += 1;
            }
            
            qbProgressBar.setPercentage(75);
            
            // ========================================
            // STEP 6: Upload Data to Test Worksheets
            // (Only for non-QC samples)
            // ========================================
            qbConsole.log(`Updating test worksheets...`);
            
            for (let sampleId in sampleTestMap) {
                // Skip QC samples for test worksheet updates
                if (qcSampleIds.has(parseInt(sampleId))) {
                    qbConsole.log(`Skipping test worksheet update for QC sample ${sampleId}`);
                    continue;
                }
                
                let targetTestId = sampleTestMap[sampleId][0];
                
                // Check if this test has data
                if (!worksheetData['testing_file_order'].includes(targetTestId)) {
                    continue;
                }
                
                try {
                    // Fetch existing worksheet data
                    let data = await fetchTestWorksheet(Service, targetTestId);
                    let baseData = JSON.parse(data)[targetTestId.toString()]["data"] || {};
                    
                    // Get or initialize instrument results
                    let updateData = {};
                    if (baseData.ws_instrument_results && baseData.ws_instrument_results.value) {
                        updateData = JSON.parse(baseData.ws_instrument_results.value);
                    }
                    
                    // Update with new data
                    worksheetAnalytes.forEach(function(analyte) {
                        if (!analyte.includes('total')) {
                            if (!updateData[analyte]) {
                                updateData[analyte] = {};
                            }
                            
                            sampleTestMap[sampleId].forEach(function(testId) {
                                let dataKey = `${analyte}_${testId}_raw`;
                                if (worksheetData[dataKey] !== undefined) {
                                    updateData[analyte][testId] = worksheetData[dataKey];
                                    delete worksheetData[dataKey];
                                }
                            });
                        }
                    });
                    
                    baseData['ws_instrument_results'] = {"value": JSON.stringify(updateData)};
                    
                    // Update test worksheet
                    await TestService.update({
                        data: {"id": targetTestId, "worksheet_json": baseData},
                        urlParams: {"run_worksheet_calculations": true},
                        success: () => {
                            qbConsole.log(`Test worksheet updated for sample ${sampleId}`);
                        },
                        error: QB.error
                    });
                } catch (e) {
                    qbConsole.log(`Error updating test worksheet for sample ${sampleId}: ${e}`);
                }
            }
            
            qbProgressBar.setPercentage(90);
            
            // ========================================
            // STEP 7: Upload Data to Batch Worksheet
            // (Includes all QC samples, including matrix QC)
            // ========================================
            qbConsole.log(`Updating batch worksheet...`);
            
            worksheetData['testing_file_order'] = JSON.stringify(worksheetData['testing_file_order']);
            worksheetData['control_data'] = JSON.stringify(worksheetData['control_data']);
            
            await BatchService.patchWorksheet({
                batchId: batchID,
                data: worksheetData,
                success: () => {
                    qbConsole.log(`Batch worksheet updated for batch ${batchID}`);
                },
                error: QB.error
            });
			console.log(JSON.stringify(worksheetData))
            qbConsole.log(`Finished processing ${file.name}`);

        } catch (e) {
            qbConsole.log(`Error processing file ${file.name}: ${e}`);
            console.error(e);
            continue;
        }
    }
    
    qbProgressBar.setPercentage(100);
    qbConsole.log("All files processed successfully!");
    QB.success();
});
