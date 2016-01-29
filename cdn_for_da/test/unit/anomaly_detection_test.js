module('Anomaly detection test');

d3.csv("../examples/data/anomaly_detect_test_data.csv",function(data) {
    var anomalous_data = TimeSeries.anomalyDetection.nelson_rules(data, "y1", "x");
    // console.log(anomalous_data);
    test("Testing anomaly detection by nelson rules",function(){
        equal(typeof anomalous_data[0], "object", "return array of objects");
        deepEqual(anomalous_data[0], {key:"1262284200000",value:263.18}, "nelson rule #1 passed");
        deepEqual(anomalous_data[anomalous_data.length-1], {key:"5582197800000",value:-163.05}, "nelson rule #1 passed");
        deepEqual(anomalous_data[anomalous_data.length-2], {key:"5582111400000",value:192.79}, "nelson rule #5 passed");
        deepEqual(anomalous_data[2], {key: "5580556200000",value:20.36}, "nelson rule #3 passed");
    });
});
