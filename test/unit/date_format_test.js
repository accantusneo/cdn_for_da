module('detectDateFormat test');

var dDF = TimeSeries.dateFormatFunctions.dateFormatRegex();

test('Testing regex for YYYY MM DD', function() {
    deepEqual("2014 07 05".match(dDF[0].regex), ["2014 07 05", "2014", "07", "05"], "YYYY MM DD regex passed");
    deepEqual("014 07 05".match(dDF[0].regex), null, "YYYY MM DD regex passed");
    deepEqual("2014 Jan 05".match(dDF[0].regex), ["2014 Jan 05", "2014", "Jan", "05"], "YYYY MM DD regex passed");
    deepEqual("2014-07-05".match(dDF[0].regex), ["2014-07-05", "2014", "07", "05"], "YYYY MM DD regex passed");
    deepEqual("2014/07/05".match(dDF[0].regex), ["2014/07/05", "2014", "07", "05"], "YYYY MM DD regex passed");
    deepEqual("2014,07,05".match(dDF[0].regex), ["2014,07,05", "2014", "07", "05"], "YYYY MM DD regex passed");
    deepEqual("2014.07.05".match(dDF[0].regex), ["2014.07.05", "2014", "07", "05"], "YYYY MM DD regex passed");
    deepEqual("2014-07-05 00:00:00".match(dDF[0].regex), null, "YYYY MM DD regex passed");
    deepEqual("2014 07 05 00:00:00".match(dDF[0].regex), null, "YYYY MM DD regex passed");
    deepEqual("20140705".match(dDF[0].regex), null, "YYYY MM DD regex passed");
});

test('Testing regex for YYYY MM DD hh:mm:ss', function() {
    deepEqual("2014 07 05 00:00:00".match(dDF[1].regex), ["2014 07 05 00:00:00", "2014", "07", "05", "00", "00", "00"], "YYYY MM DD hh:mm:ss regex passed");
    deepEqual("014 07 05 00:00:00".match(dDF[1].regex), null, "YYYY MM DD hh:mm:ss regex passed");
    deepEqual("2014-07-05 00:00:00".match(dDF[1].regex), ["2014-07-05 00:00:00", "2014", "07", "05", "00", "00", "00"], "YYYY MM DD hh:mm:ss regex passed");
    deepEqual("2014/07/05 00:00:00".match(dDF[1].regex), ["2014/07/05 00:00:00", "2014", "07", "05", "00", "00", "00"], "YYYY MM DD hh:mm:ss regex passed");
    deepEqual("2014,07,05 00:00:00".match(dDF[1].regex), ["2014,07,05 00:00:00", "2014", "07", "05", "00", "00", "00"], "YYYY MM DD hh:mm:ss regex passed");
    deepEqual("2014.07.05 00:00:00".match(dDF[1].regex), ["2014.07.05 00:00:00", "2014", "07", "05", "00", "00", "00"], "YYYY MM DD hh:mm:ss regex passed");
    deepEqual("2014 jan 05 00:00:00".match(dDF[1].regex), ["2014 jan 05 00:00:00", "2014", "jan", "05", "00", "00", "00"], "YYYY MM DD hh:mm:ss regex passed");
    deepEqual("2014 07 05 00:00".match(dDF[1].regex), null, "YYYY MM DD hh:mm:ss regex passed");
    deepEqual("2014-07-05 00:00".match(dDF[1].regex), null, "YYYY MM DD hh:mm:ss regex passed");
    deepEqual("20140705 00:00:00".match(dDF[1].regex), null, "YYYY MM DD hh:mm:ss regex passed");
});

test('Testing regex for YYYY MM DD hh:mm', function() {
    deepEqual("2014 07 05 00:00".match(dDF[2].regex), ["2014 07 05 00:00", "2014", "07", "05", "00", "00"], "YYYY MM DD hh:mm regex passed");
    deepEqual("014 07 05 00:00".match(dDF[2].regex), null, "YYYY MM DD hh:mm regex passed");
    deepEqual("2014/07/05 00:00".match(dDF[2].regex), ["2014/07/05 00:00", "2014", "07", "05", "00", "00"], "YYYY MM DD hh:mm regex passed");
    deepEqual("2014-07-05 00:00".match(dDF[2].regex), ["2014-07-05 00:00", "2014", "07", "05", "00", "00"], "YYYY MM DD hh:mm regex passed");
    deepEqual("2014,07,05 00:00".match(dDF[2].regex), ["2014,07,05 00:00", "2014", "07", "05", "00", "00"], "YYYY MM DD hh:mm regex passed");
    deepEqual("2014.07.05 00:00".match(dDF[2].regex), ["2014.07.05 00:00", "2014", "07", "05", "00", "00"], "YYYY MM DD hh:mm regex passed");
    deepEqual("2014 jan 05 00:00".match(dDF[2].regex), ["2014 jan 05 00:00", "2014", "jan", "05", "00", "00"], "YYYY MM DD hh:mm regex passed");
    deepEqual("2014 07 05 00".match(dDF[2].regex), null, "YYYY MM DD hh:mm regex passed");
    deepEqual("2014-07-05 00:00:00".match(dDF[2].regex), null, "YYYY MM DD hh:mm regex passed");
    deepEqual("20140705 00:00".match(dDF[2].regex), null, "YYYY MM DD hh:mm regex passed");
});

test('Testing regex for YYYY MM DD hh', function() {
    deepEqual("2014 07 05 00".match(dDF[3].regex), ["2014 07 05 00", "2014", "07", "05", "00"], "YYYY MM DD hh regex passed");
    deepEqual("014 07 05 00".match(dDF[3].regex), null, "YYYY MM DD hh regex passed");
    deepEqual("2014/07/05 00".match(dDF[3].regex), ["2014/07/05 00", "2014", "07", "05", "00"], "YYYY MM DD hh regex passed");
    deepEqual("2014-07-05 00".match(dDF[3].regex), ["2014-07-05 00", "2014", "07", "05", "00"], "YYYY MM DD hh regex passed");
    deepEqual("2014,07,05 00".match(dDF[3].regex), ["2014,07,05 00", "2014", "07", "05", "00"], "YYYY MM DD hh regex passed");
    deepEqual("2014.07.05 00".match(dDF[3].regex), ["2014.07.05 00", "2014", "07", "05", "00"], "YYYY MM DD hh regex passed");
    deepEqual("2014 jan 05 00".match(dDF[3].regex), ["2014 jan 05 00", "2014", "jan", "05", "00"], "YYYY MM DD hh regex passed");
    deepEqual("2014 07 05 00:".match(dDF[3].regex), null, "YYYY MM DD hh regex passed");
    deepEqual("2014-07-05 00:00:00".match(dDF[3].regex), null, "YYYY MM DD hh regex passed");
    deepEqual("20140705 00:00".match(dDF[3].regex), null, "YYYY MM DD hh regex passed");
});

test('Testing regex for MM DD YYYY or DD MM YYYY',function() {
    deepEqual("01 24 2014".match(dDF[4].regex), ["01 24 2014", "01", "24", "2014"], "MM DD YYYY or DD MM YYYY regex passed");
    deepEqual("01/24/2014".match(dDF[4].regex), ["01/24/2014", "01", "24", "2014"], "MM DD YYYY or DD MM YYYY regex passed");
    deepEqual("01-24-2014".match(dDF[4].regex), ["01-24-2014", "01", "24", "2014"], "MM DD YYYY or DD MM YYYY regex passed");
    deepEqual("01,24,2014".match(dDF[4].regex), ["01,24,2014", "01", "24", "2014"], "MM DD YYYY or DD MM YYYY regex passed");
    deepEqual("01.24.2014".match(dDF[4].regex), ["01.24.2014", "01", "24", "2014"], "MM DD YYYY or DD MM YYYY regex passed");
    deepEqual("2014 07 05 00:".match(dDF[4].regex), null, "MM DD YYYY or DD MM YYYY regex passed");
    deepEqual("2014-07-05 00:00:00".match(dDF[4].regex), null, "MM DD YYYY or DD MM YYYY regex passed");
    deepEqual("20140705 00:00".match(dDF[4].regex), null, "MM DD YYYY or DD MM YYYY regex passed");
});

test('Testing regex for MM DD YYYY or DD MM YYYY hh:mm:ss',function() {
    deepEqual("01 24 2014 00:00:00".match(dDF[5].regex), ["01 24 2014 00:00:00", "01", "24", "2014", "00", "00", "00"], "MM DD YYYY or DD MM YYYY hh:mm:ss regex passed");
    deepEqual("01/24/2014 00:00:00".match(dDF[5].regex), ["01/24/2014 00:00:00", "01", "24", "2014", "00", "00", "00"], "MM DD YYYY or DD MM YYYY hh:mm:ss regex passed");
    deepEqual("01-24-2014 00:00:00".match(dDF[5].regex), ["01-24-2014 00:00:00", "01", "24", "2014", "00", "00", "00"], "MM DD YYYY or DD MM YYYY hh:mm:ss regex passed");
    deepEqual("01,24,2014 00:00:00".match(dDF[5].regex), ["01,24,2014 00:00:00", "01", "24", "2014", "00", "00", "00"], "MM DD YYYY or DD MM YYYY hh:mm:ss regex passed");
    deepEqual("01.24.2014 00:00:00".match(dDF[5].regex), ["01.24.2014 00:00:00", "01", "24", "2014", "00", "00", "00"], "MM DD YYYY or DD MM YYYY hh:mm:ss regex passed");
    deepEqual("2014 07 05 00:".match(dDF[5].regex), null, "MM DD YYYY or DD MM YYYY hh:mm:ss regex passed");
    deepEqual("2014-07-05 00:00:00".match(dDF[5].regex), null, "MM DD YYYY or DD MM YYYY hh:mm:ss regex passed");
    deepEqual("20140705 00:00".match(dDF[5].regex), null, "MM DD YYYY or DD MM YYYY hh:mm:ss regex passed");
    deepEqual("Jan 24 2014".match(dDF[5].regex), null, "MM DD YYYY or DD MM YYYY hh:mm:ss regex passed");
});

test('Testing regex for MM DD YYYY or DD MM YYYY hh:mm',function() {
    deepEqual("01 24 2014 00:00".match(dDF[6].regex), ["01 24 2014 00:00", "01", "24", "2014", "00", "00"], "MM DD YYYY or DD MM YYYY hh:mm regex passed");
    deepEqual("01/24/2014 00:00".match(dDF[6].regex), ["01/24/2014 00:00", "01", "24", "2014", "00", "00"], "MM DD YYYY or DD MM YYYY hh:mm regex passed");
    deepEqual("21-12-2014 00:00".match(dDF[6].regex), ["21-12-2014 00:00", "21", "12", "2014", "00", "00"], "MM DD YYYY or DD MM YYYY hh:mm regex passed");
    deepEqual("01,24,2014 00:00".match(dDF[6].regex), ["01,24,2014 00:00", "01", "24", "2014", "00", "00"], "MM DD YYYY or DD MM YYYY hh:mm regex passed");
    deepEqual("01.24.2014 00:00".match(dDF[6].regex), ["01.24.2014 00:00", "01", "24", "2014", "00", "00"], "MM DD YYYY or DD MM YYYY hh:mm regex passed");
    deepEqual("2014 07 05 00:".match(dDF[6].regex), null, "MM DD YYYY or DD MM YYYY hh:mm regex passed");
    deepEqual("2014-07-05 00:00:00".match(dDF[6].regex), null, "MM DD YYYY or DD MM YYYY hh:mm regex passed");
    deepEqual("20140705 00:00".match(dDF[6].regex), null, "MM DD YYYY or DD MM YYYY hh:mm regex passed");
    deepEqual("Jan 24 2014".match(dDF[6].regex), null, "MM DD YYYY or DD MM YYYY hh:mm regex passed");
});

test('Testing regex for MM DD YYYY or DD MM YYYY hh',function() {
    deepEqual("01 24 2014 00".match(dDF[7].regex), ["01 24 2014 00", "01", "24", "2014", "00"], "MM DD YYYY or DD MM YYYY hh regex passed");
    deepEqual("01-24-2014 00".match(dDF[7].regex), ["01-24-2014 00", "01", "24", "2014", "00"], "MM DD YYYY or DD MM YYYY hh regex passed");
    deepEqual("21/12/2014 00".match(dDF[7].regex), ["21/12/2014 00", "21", "12", "2014", "00"], "MM DD YYYY or DD MM YYYY hh regex passed");
    deepEqual("01,24,2014 00".match(dDF[7].regex), ["01,24,2014 00", "01", "24", "2014", "00"], "MM DD YYYY or DD MM YYYY hh regex passed");
    deepEqual("1.2.2014 00".match(dDF[7].regex), ["1.2.2014 00", "1", "2", "2014", "00"], "MM DD YYYY or DD MM YYYY hh regex passed");
    deepEqual("2014 07 05 00:".match(dDF[7].regex), null, "MM DD YYYY or DD MM YYYY hh regex passed");
    deepEqual("2014-07-05 00:00:00".match(dDF[7].regex), null, "MM DD YYYY or DD MM YYYY hh regex passed");
    deepEqual("20140705 00:00".match(dDF[7].regex), null, "MM DD YYYY or DD MM YYYY hh regex passed");
    deepEqual("Jan 24 2014".match(dDF[7].regex), null, "MM DD YYYY or DD MM YYYY hh regex passed");
});

test('Testing regex for MMM DD YYYY and MMMM DD YYYY',function() {
    deepEqual("Jan 24 2014".match(dDF[8].regex), ["Jan 24 2014", "Jan", "24", "2014"], "MMM DD YYYY and MMMM DD YYYY regex passed");
    deepEqual("january 24 2014".match(dDF[8].regex), ["january 24 2014", "january", "24", "2014"], "MMM DD YYYY and MMMM DD YYYY regex passed");
    deepEqual("january/24/2014".match(dDF[8].regex), ["january/24/2014", "january", "24", "2014"], "MMM DD YYYY and MMMM DD YYYY regex passed");
    deepEqual("january-24-2014".match(dDF[8].regex), ["january-24-2014", "january", "24", "2014"], "MMM DD YYYY and MMMM DD YYYY regex passed");
    deepEqual("jan.24.2014".match(dDF[8].regex), ["jan.24.2014", "jan", "24", "2014"], "MMM DD YYYY and MMMM DD YYYY regex passed");
    deepEqual("january 24,2014".match(dDF[8].regex), ["january 24,2014", "january", "24", "2014"], "MMM DD YYYY and MMMM DD YYYY regex passed");
    deepEqual("2014 07 05".match(dDF[8].regex), null, "MMM DD YYYY and MMMM DD YYYY regex passed");
    deepEqual("07-05-2014".match(dDF[8].regex), null, "MMM DD YYYY and MMMM DD YYYY regex passed");
    deepEqual("20140705".match(dDF[8].regex), null, "MMM DD YYYY and MMMM DD YYYY regex passed");
});

test('Testing regex for MMM DD YYYY and MMMM DD YYYY hh:mm:ss',function() {
    deepEqual("Jan 24 2014 12:13:14".match(dDF[9].regex), ["Jan 24 2014 12:13:14", "Jan", "24", "2014", "12", "13", "14"], "MMM DD YYYY and MMMM DD YYYY hh:mm:ss regex passed");
    deepEqual("january 24 2014 12:13:14".match(dDF[9].regex), ["january 24 2014 12:13:14", "january", "24", "2014", "12", "13", "14"], "MMM DD YYYY and MMMM DD YYYY hh:mm:ss regex passed");
    deepEqual("january/24/2014 12:13:14".match(dDF[9].regex), ["january/24/2014 12:13:14", "january", "24", "2014", "12", "13", "14"], "MMM DD YYYY and MMMM DD YYYY hh:mm:ss regex passed");
    deepEqual("january-24-2014 12:13:14".match(dDF[9].regex), ["january-24-2014 12:13:14", "january", "24", "2014", "12", "13", "14"], "MMM DD YYYY and MMMM DD YYYY hh:mm:ss regex passed");
    deepEqual("jan.24.2014 12:13:14".match(dDF[9].regex), ["jan.24.2014 12:13:14", "jan", "24", "2014", "12", "13", "14"], "MMM DD YYYY and MMMM DD YYYY hh:mm:ss regex passed");
    deepEqual("january 24,2014 12:13:14".match(dDF[9].regex), ["january 24,2014 12:13:14", "january", "24", "2014", "12", "13", "14"], "MMM DD YYYY and MMMM DD YYYY hh:mm:ss regex passed");
    deepEqual("2014 07 05 12:13:14".match(dDF[9].regex), null, "MMM DD YYYY and MMMM DD YYYY hh:mm:ss regex passed");
    deepEqual("07-05-2014 12:13:14".match(dDF[9].regex), null, "MMM DD YYYY and MMMM DD YYYY hh:mm:ss regex passed");
    deepEqual("20140705 12:13:14".match(dDF[9].regex), null, "MMM DD YYYY and MMMM DD YYYY hh:mm:ss regex passed");
});

test('Testing regex for MMM DD YYYY and MMMM DD YYYY hh:mm',function() {
    deepEqual("Jan 24 2014 12:13".match(dDF[10].regex), ["Jan 24 2014 12:13", "Jan", "24", "2014", "12", "13"], "MMM DD YYYY and MMMM DD YYYY hh:mm regex passed");
    deepEqual("january 24 2014 12:13".match(dDF[10].regex), ["january 24 2014 12:13", "january", "24", "2014", "12", "13"], "MMM DD YYYY and MMMM DD YYYY hh:mm regex passed");
    deepEqual("january/24/2014 12:13".match(dDF[10].regex), ["january/24/2014 12:13", "january", "24", "2014", "12", "13"], "MMM DD YYYY and MMMM DD YYYY hh:mm regex passed");
    deepEqual("january-24-2014 12:13".match(dDF[10].regex), ["january-24-2014 12:13", "january", "24", "2014", "12", "13"], "MMM DD YYYY and MMMM DD YYYY hh:mm regex passed");
    deepEqual("jan.24.2014 12:13".match(dDF[10].regex), ["jan.24.2014 12:13", "jan", "24", "2014", "12", "13"], "MMM DD YYYY and MMMM DD YYYY hh:mm regex passed");
    deepEqual("january 24,2014 12:13".match(dDF[10].regex), ["january 24,2014 12:13", "january", "24", "2014", "12", "13"], "MMM DD YYYY and MMMM DD YYYY hh:mm regex passed");
    deepEqual("2014 07 05 12:13".match(dDF[10].regex), null, "MMM DD YYYY and MMMM DD YYYY hh:mm regex passed");
    deepEqual("07-05-2014".match(dDF[10].regex), null, "MMM DD YYYY and MMMM DD YYYY hh:mm regex passed");
    deepEqual("20140705".match(dDF[10].regex), null, "MMM DD YYYY and MMMM DD YYYY hh:mm regex passed");
});

test('Testing regex for MMM DD YYYY and MMMM DD YYYY hh',function() {
    deepEqual("Jan 24 2014 12".match(dDF[11].regex), ["Jan 24 2014 12", "Jan", "24", "2014", "12"], "MMM DD YYYY and MMMM DD YYYY hh regex passed");
    deepEqual("january 24 2014 12".match(dDF[11].regex), ["january 24 2014 12", "january", "24", "2014", "12"], "MMM DD YYYY and MMMM DD YYYY hh regex passed");
    deepEqual("january/24/2014 12".match(dDF[11].regex), ["january/24/2014 12", "january", "24", "2014", "12"], "MMM DD YYYY and MMMM DD YYYY hh regex passed");
    deepEqual("january-24-2014 12".match(dDF[11].regex), ["january-24-2014 12", "january", "24", "2014", "12"], "MMM DD YYYY and MMMM DD YYYY hh regex passed");
    deepEqual("jan.24.2014 12".match(dDF[11].regex), ["jan.24.2014 12", "jan", "24", "2014", "12"], "MMM DD YYYY and MMMM DD YYYY hh regex passed");
    deepEqual("january 24,2014 12".match(dDF[11].regex), ["january 24,2014 12", "january", "24", "2014", "12"], "MMM DD YYYY and MMMM DD YYYY hh regex passed");
    deepEqual("2014 07 05 12".match(dDF[11].regex), null, "MMM DD YYYY and MMMM DD YYYY hh regex passed");
    deepEqual("07-05-2014 12".match(dDF[11].regex), null, "MMM DD YYYY and MMMM DD YYYY hh regex passed");
    deepEqual("20140705".match(dDF[11].regex), null, "MMM DD YYYY and MMMM DD YYYY hh regex passed");
});

test('Testing regex for DD MMM YYYY and DD MMM YYYY',function() {
    deepEqual("24 Jan 2014".match(dDF[12].regex), ["24 Jan 2014", "24", "Jan", "2014"], "DD MMM YYYY and DD MMMM YYYY regex passed");
    deepEqual("24 january 2014".match(dDF[12].regex), ["24 january 2014", "24", "january", "2014"], "DD MMM YYYY and DD MMMM YYYY regex passed");
    deepEqual("24/january/2014".match(dDF[12].regex), ["24/january/2014", "24", "january", "2014"], "DD MMM YYYY and DD MMMM YYYY regex passed");
    deepEqual("24-january-2014".match(dDF[12].regex), ["24-january-2014", "24", "january", "2014"], "DD MMM YYYY and DD MMMM YYYY regex passed");
    deepEqual("24.jan.2014".match(dDF[12].regex), ["24.jan.2014", "24", "jan", "2014"], "DD MMM YYYY and DD MMMM YYYY regex passed");
    deepEqual("24 january,2014".match(dDF[12].regex), ["24 january,2014", "24", "january", "2014"], "DD MMM YYYY and DD MMMM YYYY regex passed");
    deepEqual("2014 07 05".match(dDF[12].regex), null, "DD MMM YYYY and DD MMMM YYYY regex passed");
    deepEqual("07-05-2014".match(dDF[12].regex), null, "DD MMM YYYY and DD MMMM YYYY regex passed");
    deepEqual("20140705".match(dDF[12].regex), null, "DD MMM YYYY and DD MMMM YYYY regex passed");
});

test('Testing regex for DD MMM YYYY and DD MMM YYYY hh:mm:ss',function() {
    deepEqual("24 Jan 2014 12:13:14".match(dDF[13].regex), ["24 Jan 2014 12:13:14", "24", "Jan", "2014", "12", "13", "14"], "DD MMM YYYY and DD MMMM YYYY hh:mm:ss regex passed");
    deepEqual("24 january 2014 12:13:14".match(dDF[13].regex), ["24 january 2014 12:13:14", "24", "january", "2014",  "12", "13", "14"], "DD MMM YYYY and DD MMMM YYYY hh:mm:ss regex passed");
    deepEqual("24/january/2014 12:13:14".match(dDF[13].regex), ["24/january/2014 12:13:14", "24", "january", "2014",  "12", "13", "14"], "DD MMM YYYY and DD MMMM YYYY hh:mm:ss regex passed");
    deepEqual("24-january-2014 12:13:14".match(dDF[13].regex), ["24-january-2014 12:13:14", "24", "january", "2014",  "12", "13", "14"], "DD MMM YYYY and DD MMMM YYYY hh:mm:ss regex passed");
    deepEqual("24.jan.2014 12:13:14".match(dDF[13].regex), ["24.jan.2014 12:13:14", "24", "jan", "2014",  "12", "13", "14"], "DD MMM YYYY and DD MMMM YYYY hh:mm:ss regex passed");
    deepEqual("24 january,2014 12:13:14".match(dDF[13].regex), ["24 january,2014 12:13:14", "24", "january", "2014",  "12", "13", "14"], "DD MMM YYYY and DD MMMM YYYY hh:mm:ss regex passed");
    deepEqual("2014 07 05".match(dDF[13].regex), null, "DD MMM YYYY and DD MMMM YYYY hh:mm:ss regex passed");
    deepEqual("07-05-2014 12:13:14".match(dDF[13].regex), null, "DD MMM YYYY and DD MMMM YYYY hh:mm:ss regex passed");
    deepEqual("20140705".match(dDF[13].regex), null, "DD MMM YYYY and DD MMMM YYYY hh:mm:ss regex passed");
});

test('Testing regex for DD MMM YYYY and DD MMM YYYY hh:mm',function() {
    deepEqual("24 Jan 2014 12:13".match(dDF[14].regex), ["24 Jan 2014 12:13", "24", "Jan", "2014", "12", "13"], "DD MMM YYYY and DD MMMM YYYY hh:mm regex passed");
    deepEqual("24 january 2014 12:13".match(dDF[14].regex), ["24 january 2014 12:13", "24", "january", "2014", "12", "13"], "DD MMM YYYY and DD MMMM YYYY hh:mm regex passed");
    deepEqual("24/january/2014 12:13".match(dDF[14].regex), ["24/january/2014 12:13", "24", "january", "2014", "12", "13"], "DD MMM YYYY and DD MMMM YYYY hh:mm regex passed");
    deepEqual("24-january-2014 12:13".match(dDF[14].regex), ["24-january-2014 12:13", "24", "january", "2014", "12", "13"], "DD MMM YYYY and DD MMMM YYYY hh:mm regex passed");
    deepEqual("24.jan.2014 12:13".match(dDF[14].regex), ["24.jan.2014 12:13", "24", "jan", "2014", "12", "13"], "DD MMM YYYY and DD MMMM YYYY hh:mm regex passed");
    deepEqual("24 january,2014 12:13".match(dDF[14].regex), ["24 january,2014 12:13", "24", "january", "2014", "12", "13"], "DD MMM YYYY and DD MMMM YYYY hh:mm regex passed");
    deepEqual("2014 07 05 12:13".match(dDF[14].regex), null, "DD MMM YYYY and DD MMMM YYYY hh:mm regex passed");
    deepEqual("07-05-2014 12:13".match(dDF[14].regex), null, "DD MMM YYYY and DD MMMM YYYY hh:mm regex passed");
    deepEqual("20140705 12:13".match(dDF[14].regex), null, "DD MMM YYYY and DD MMMM YYYY hh:mm regex passed");
});

test('Testing regex for DD MMM YYYY and DD MMM YYYY hh',function() {
    deepEqual("24 Jan 2014 12".match(dDF[15].regex), ["24 Jan 2014 12", "24", "Jan", "2014", "12"], "DD MMM YYYY and DD MMMM YYYY hh regex passed");
    deepEqual("24 january 2014 12".match(dDF[15].regex), ["24 january 2014 12", "24", "january", "2014", "12"], "DD MMM YYYY and DD MMMM YYYY hh regex passed");
    deepEqual("24/january/2014 12".match(dDF[15].regex), ["24/january/2014 12", "24", "january", "2014", "12"], "DD MMM YYYY and DD MMMM YYYY hh regex passed");
    deepEqual("24-january-2014 12".match(dDF[15].regex), ["24-january-2014 12", "24", "january", "2014", "12"], "DD MMM YYYY and DD MMMM YYYY hh regex passed");
    deepEqual("24.jan.2014 12".match(dDF[15].regex), ["24.jan.2014 12", "24", "jan", "2014", "12"], "DD MMM YYYY and DD MMMM YYYY hh regex passed");
    deepEqual("24 january,2014 12".match(dDF[15].regex), ["24 january,2014 12", "24", "january", "2014", "12"], "DD MMM YYYY and DD MMMM YYYY hh regex passed");
    deepEqual("2014 07 05 12".match(dDF[15].regex), null, "DD MMM YYYY and DD MMMM YYYY hh regex passed");
    deepEqual("07-05-2014 12".match(dDF[15].regex), null, "DD MMM YYYY and DD MMMM YYYY hh regex passed");
    deepEqual("20140705 12".match(dDF[15].regex), null, "DD MMM YYYY and DD MMMM YYYY hh regex passed");
});

test('Testing regex for YYYY MM',function() {
    deepEqual("2014 04".match(dDF[16].regex), ["2014 04", "2014", "04"], "YYYY MM regex passed");
    deepEqual("2014-04".match(dDF[16].regex), ["2014-04", "2014", "04"], "YYYY MM regex passed");
    deepEqual("2014/04".match(dDF[16].regex), ["2014/04", "2014", "04"], "YYYY MM regex passed");
    deepEqual("2014.04".match(dDF[16].regex), ["2014.04", "2014", "04"], "YYYY MM regex passed");
    deepEqual("2014,04".match(dDF[16].regex), ["2014,04", "2014", "04"], "YYYY MM regex passed");
    deepEqual("2014 jan".match(dDF[16].regex), ["2014 jan", "2014", "jan"], "YYYY MM regex passed");
    deepEqual("2014-january".match(dDF[16].regex), ["2014-january", "2014", "january"], "YYYY MM regex passed");
    deepEqual("2014 07 05".match(dDF[16].regex), null, "YYYY MM regex passed");
    deepEqual("2014 ja".match(dDF[16].regex), null, "YYYY MM regex passed");
    deepEqual("20140705".match(dDF[16].regex), null, "YYYY MM regex passed");
});

test('Testing regex for YYYY',function() {
    deepEqual("2014".match(dDF[17].regex), ["2014", "2014"], "YYYY regex passed");
    deepEqual("20144".match(dDF[17].regex), null, "YYYY regex passed");
    deepEqual("204".match(dDF[17].regex), null, "YYYY regex passed");
    deepEqual("jan".match(dDF[17].regex), null, "YYYY regex passed");
});

test('Testing regex for hh:mm:ss',function() {
    deepEqual("10:10:10".match(dDF[18].regex), ["10:10:10", "10", "10", "10"], "hh:mm:ss regex passed");
    deepEqual("10:10".match(dDF[18].regex), null, "hh:mm:ss regex passed");
    deepEqual("10".match(dDF[18].regex), null, "hh:mm:ss regex passed");
    deepEqual("101:134:124".match(dDF[18].regex), null, "hh:mm:ss regex passed");
    deepEqual("no:no:no".match(dDF[18].regex), null, "hh:mm:ss regex passed");
});

test('Testing regex for hh:mm',function() {
    deepEqual("10:10:10".match(dDF[19].regex), null, "hh:mm regex passed");
    deepEqual("10:10".match(dDF[19].regex), ["10:10", "10", "10"], "hh:mm regex passed");
    deepEqual("10".match(dDF[19].regex), null, "hh:mm regex passed");
    deepEqual("101:124".match(dDF[19].regex), null, "hh:mm regex passed");
    deepEqual("no:no".match(dDF[19].regex), null, "hh:mm regex passed");
});

test('Testing regex for hh',function() {
    deepEqual("10:10:10".match(dDF[20].regex), null, "hh regex passed");
    deepEqual("10:10".match(dDF[20].regex), null, "hh regex passed");
    deepEqual("10".match(dDF[20].regex), ["10", "10"], "hh regex passed");
    deepEqual("101".match(dDF[20].regex), null, "hh regex passed");
    deepEqual("no".match(dDF[20].regex), null, "hh regex passed");
});

test('Testing regex for YYYY-MM-DDThh:mm:ss',function() {
    deepEqual("2014-12-24T10:10:10".match(dDF[21].regex), ["2014-12-24T10:10:10", "2014", "12", "24", "10", "10", "10"], "YYYY-MM-DDThh:mm:ss regex passed");
    deepEqual("2014-jan-24T10:10:10".match(dDF[21].regex), null, "YYYY-MM-DDThh:mm:ss regex passed");
});

test('Testing regex for YYYY-MM-DDThh:mm',function() {
    deepEqual("2014-12-24T10:10".match(dDF[22].regex), ["2014-12-24T10:10", "2014", "12", "24", "10", "10"], "YYYY-MM-DDThh:mm regex passed");
    deepEqual("2014-jan-24T10:10".match(dDF[22].regex), null, "YYYY-MM-DDThh:mm regex passed");
});

test('Testing regex for YYYY-MM-DDThh',function() {
    deepEqual("2014-12-24T10".match(dDF[23].regex), ["2014-12-24T10", "2014", "12", "24", "10"], "YYYY-MM-DDThh regex passed");
    deepEqual("2014-jan-24T10".match(dDF[23].regex), null, "YYYY-MM-DDThh regex passed");
});

test('Testing regex for Day, DD MMM YYYY',function() {
    deepEqual("Fri, 24 Jan 2014".match(dDF[24].regex), ["Fri, 24 Jan 2014", "Fri", "24", "Jan", "2014"], "Day, DD MMM YYYY regex passed");
    deepEqual("Fri, 24 january 2014".match(dDF[24].regex), ["Fri, 24 january 2014", "Fri", "24", "january", "2014"], "Day, DD MMM YYYY regex passed");
    deepEqual("Fri, 24 01 2014".match(dDF[24].regex), null, "Day, DD MMM YYYY regex passed");
});

test('Testing regex for Day, DD MMM YYYY hh:mm:ss',function() {
    deepEqual("Fri, 24 Jan 2014 10:10:10".match(dDF[25].regex), ["Fri, 24 Jan 2014 10:10:10", "Fri", "24", "Jan", "2014", "10", "10", "10"], "Day, DD MMM YYYY hh:mm:ss regex passed");
    deepEqual("Fri, 24 january 2014 10:10:10".match(dDF[25].regex), ["Fri, 24 january 2014 10:10:10", "Fri", "24", "january", "2014", "10", "10", "10"], "Day, DD MMM YYYY hh:mm:ss regex passed");
    deepEqual("Fri, 24 01 2014 10:10:10".match(dDF[25].regex), null, "Day, DD MMM YYYY regex passed");
    deepEqual("24 jan 2014 10:10:10".match(dDF[25].regex), null, "Day, DD MMM YYYY regex passed");
});

test('Testing regex for Day, DD MMM YYYY hh:mm',function() {
    deepEqual("Fri, 24 Jan 2014 10:10".match(dDF[26].regex), ["Fri, 24 Jan 2014 10:10", "Fri", "24", "Jan", "2014", "10", "10"], "Day, DD MMM YYYY hh:mm regex passed");
    deepEqual("Fri, 24 january 2014 10:10".match(dDF[26].regex), ["Fri, 24 january 2014 10:10", "Fri", "24", "january", "2014", "10", "10"], "Day, DD MMM YYYY hh:mm regex passed");
    deepEqual("Fri, 24 01 2014 10:10".match(dDF[26].regex), null, "Day, DD MMM YYYY hh:mm regex passed");
    deepEqual("24 jan 2014 10:10:10".match(dDF[26].regex), null, "Day, DD MMM YYYY regex passed");
});

test('Testing regex for Day, DD MMM YYYY hh',function() {
    deepEqual("Fri, 24 Jan 2014 10".match(dDF[27].regex), ["Fri, 24 Jan 2014 10", "Fri", "24", "Jan", "2014", "10"], "Day, DD MMM YYYY hh regex passed");
    deepEqual("Fri, 24 january 2014 10".match(dDF[27].regex), ["Fri, 24 january 2014 10", "Fri", "24", "january", "2014", "10"], "Day, DD MMM YYYY hh regex passed");
    deepEqual("Fri, 24 01 2014 10".match(dDF[27].regex), null, "Day, DD MMM YYYY hh regex passed");
    deepEqual("24 jan 2014 10:10:10".match(dDF[27].regex), null, "Day, DD MMM YYYY regex passed");
});

test('Testing regex for Day, MMM DD YYYY',function() {
    deepEqual("Fri, Jan 24 2014".match(dDF[28].regex), ["Fri, Jan 24 2014", "Fri", "Jan", "24", "2014"], "Day, MMM DD YYYY regex passed");
    deepEqual("Fri, january 24 2014".match(dDF[28].regex), ["Fri, january 24 2014", "Fri", "january", "24", "2014"], "Day, MMM DD YYYY regex passed");
    deepEqual("Fri, 24 01 2014".match(dDF[28].regex), null, "Day, MMM DD YYYY regex passed");
});

test('Testing regex for Day, MMM DD YYYY hh:mm:ss',function() {
    deepEqual("Fri, Jan 24 2014 10:10:10".match(dDF[29].regex), ["Fri, Jan 24 2014 10:10:10", "Fri", "Jan", "24", "2014", "10", "10", "10"], "Day, MMM DD YYYY hh:mm:ss regex passed");
    deepEqual("Fri, january 24 2014 10:10:10".match(dDF[29].regex), ["Fri, january 24 2014 10:10:10", "Fri", "january", "24", "2014", "10", "10", "10"], "Day, MMM DD YYYY hh:mm:ss regex passed");
    deepEqual("Fri, 24 01 2014 10:10:10".match(dDF[29].regex), null, "Day, MMM DD YYYY regex passed");
    deepEqual("24 jan 2014 10:10:10".match(dDF[29].regex), null, "Day, MMM DD YYYY regex passed");
});

test('Testing regex for Day, MMM DD YYYY hh:mm',function() {
    deepEqual("Fri, Jan 24 2014 10:10".match(dDF[30].regex), ["Fri, Jan 24 2014 10:10", "Fri", "Jan", "24", "2014", "10", "10"], "Day, MMM DD YYYY hh:mm regex passed");
    deepEqual("Fri, january 24 2014 10:10".match(dDF[30].regex), ["Fri, january 24 2014 10:10", "Fri", "january", "24", "2014", "10", "10"], "Day, MMM DD YYYY hh:mm regex passed");
    deepEqual("Fri, 24 01 2014 10:10".match(dDF[30].regex), null, "Day, MMM DD YYYY hh:mm regex passed");
    deepEqual("24 jan 2014 10:10:10".match(dDF[30].regex), null, "Day, MMM DD YYYY regex passed");
});

test('Testing regex for Day, MMM DD YYYY hh',function() {
    deepEqual("Fri, Jan 24 2014 10".match(dDF[31].regex), ["Fri, Jan 24 2014 10", "Fri", "Jan", "24", "2014", "10"], "Day, MMM DD YYYY hh regex passed");
    deepEqual("Fri, january 24 2014 10".match(dDF[31].regex), ["Fri, january 24 2014 10", "Fri", "january", "24", "2014", "10"], "Day, MMM DD YYYY hh regex passed");
    deepEqual("Fri, 24 01 2014 10".match(dDF[31].regex), null, "Day, MMM DD YYYY hh regex passed");
    deepEqual("24 jan 2014 10:10:10".match(dDF[31].regex), null, "Day, MMM DD YYYY regex passed");
});

test('detectDateFormat on passing data returns the date format in the data',function() {
    deepEqual(TimeSeries.dateFormatFunctions.detectDateFormat("detectDateFormat",[{date:"04 Aug 2014"}],"date").format, "DD MMM YYYY", "detectDateFormat returned date format DD MMM YYYY.");
    deepEqual(TimeSeries.dateFormatFunctions.detectDateFormat("detectDateFormat",[{date:"2014 Aug"}],"date").format, "Invalid format", "detectDateFormat returned date format Invalid format.");
    deepEqual(TimeSeries.dateFormatFunctions.detectDateFormat("detectDateFormat",[{date:"2014"}],"date").format, "YYYY", "detectDateFormat returned date Format YYYY.");
    deepEqual(TimeSeries.dateFormatFunctions.detectDateFormat("detectDateFormat",[{date:"20141233445"}],"date").format, "TimeStamp", "detectDateFormat returned date Format TimeStamp.");
    deepEqual(TimeSeries.dateFormatFunctions.detectDateFormat("detectDateFormat",[{date:"random"}],"date").format, "Invalid format", "detectDateFormat returned 'Invalid format'");
});

module('date formatter test');

test('Formatted date', function() {
    var date = new Date(1441105051034);
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%a', date), "Tue", "with directive '%a' - abbreviated weekday name");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%A', date), "Tuesday", "with directive '%A' - full weekday name");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%b', date), "Sep", "with directive '%b' - abbreviated month name");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%B', date), "September", "with directive '%B' - full month name");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%c', date), "Tue Sep  1 16:27:31 2015", "with directive '%c' - date and time, as '%a %b %e %H:%M:%S %Y'");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%d', date), "01", "with directive '%d' - zero-padded day of the month as a decimal number [01,31]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%e', date), " 1", "with directive '%e' - space-padded day of the month as a decimal number [ 1,31]; equivalent to %_d");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%H', date), "16", "with directive '%H' - hour (24-hour clock) as a decimal number [00,23]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%I', date), "04", "with directive '%I' - hour (12-hour clock) as a decimal number [01,12]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%j', date), "244", "with directive '%j' - day of the year as a decimal number [001,366]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%m', date), "09", "with directive '%m' - month as a decimal number [01,12]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%M', date), "27", "with directive '%M' - minute as a decimal number [00,59]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%L', date), "034", "with directive '%L' - milliseconds as a decimal number [000, 999]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%p', date), "PM", "with directive '%p' - either AM or PM");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%S', date), "31", "with directive '%S' - second as a decimal number [00,61]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%U', date), "35", "with directive '%U' - week number of the year (Sunday as the first day of the week) as a decimal number [00,53]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%w', date), "2", "with directive '%w' - weekday as a decimal number [0(Sunday),6]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%W', date), "35", "with directive '%W' - week number of the year (Monday as the first day of the week) as a decimal number [00,53]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%x', date), "09/01/2015", "with directive '%x' - date, as '%m/%d/%Y'");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%X', date), "16:27:31", "with directive '%X' - date, as '%H:%M:%S'");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%y', date), "15", "with directive '%y' - year without century as a decimal number [00,99]");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%Y', date), "2015", "with directive '%Y' - year with century as a decimal number");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('%Z', date), "+0530", "with directive '%Z' - time zone offset, such as '-0700'");
    equal(TimeSeries.dateFormatFunctions.dateFormatter('multi', date), ".034", "with directive 'multi' - i.e. if the specified date is not a round second, the milliseconds format ('.%L') is used; otherwise, if the specified date is not a round minute, the seconds format (':%S') is used, and so on");
});
