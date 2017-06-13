var mediumStatsCSVPath = 'data/medium-stats-overview-2017-05-25.csv';
var statsJSONPath = 'data/stats-2017-06-13.json';

var upArrow = '↑';
var downArrow = '↓';

function isInteger(number) {
    return number % 1 === 0;
}

function setupSurveyChart() {

    var data = {
        series: [27, 63]
    };

    var sum = function(a, b) { return a + b };

    var options = {
        width: 250,
        height: 250,
        fullWidth: false,
        labelInterpolationFnc: function(value) {
            return value + '%';
        }
    };

    new Chartist.Pie('#survey-chart', data, options);
}

function parseMediumCSV() {
    Papa.parse(mediumStatsCSVPath, {
        download: true,
        complete: function(data) {
            console.log('Medium data', data);
            setupMediumChart(data);
        }
    });
}

function setupMediumChart(mediumData) {

    // Date, Minutes Read, Views, Visitors

    var labels = [];
    var totalTimeReadMins = [];
    var views = [];
    var dailyUniqueVisitors = [];

    var rows = mediumData.data.slice(1, mediumData.data.length - 1);

    var labelCount = 0;

    rows.forEach(function(row) {
        if (row[2] !== 'null') {
            labels.push( row[0] );
            totalTimeReadMins.push( row[1] );
            views.push( row[2] );
            dailyUniqueVisitors.push( row[3] );
        }
    });

    var data = {
        labels: labels,
        series: [
            totalTimeReadMins,
            views,
            dailyUniqueVisitors
        ]
    };

    var options = {
        labelOffset: 50,
        height: 240,
        axisX: {
            showGrid: false,
            labelInterpolationFnc: function(value) {
                // Display one label every 2 weeks
                if (labelCount++ % 14 === 0) {
                    return moment(value).format('D/M/Y');
                }
            }
        },
        axisY: {
            onlyInteger: true
        },
        seriesBarDistance: 5,
        showPoint: false,
        lineSmooth: false
    };

    new Chartist.Line('#medium-chart', data, options);
}

function parseStatsJSON() {

    fetch(statsJSONPath)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            return updateStats(data);
        })
        .catch(function(error) {
            console.error('Error parsing stats JSON', error);
        });

}

function updateStats(data) {

    if (data.updated) {
        document.getElementById('last-updated').innerHTML = moment(data.updated).format('DD MMMM YYYY');
    }

    updateStatWithChange('medium', 'followers', data.medium.audience);
    updateStatWithChange('twitter', 'followers', data.twitter.audience);
    updateStatWithChange('facebook', 'followers', data.facebook.audience);
    updateStatWithChange('instagram', 'followers', data.instagram.audience);

    updateStatWithChange('twitter', 'impressions', data.twitter.engagement);
    updateStatWithChange('twitter', 'mentions', data.twitter.engagement);
    updateStatWithChange('facebook', 'likes', data.facebook.engagement);
    updateStatWithChange('medium', 'views', data.medium.engagement);

    console.log('Updated stats from JSON data', data);

}

function updateStatWithChange(platformName, dataId, data) {

    document.getElementById(`${platformName}-${dataId}`).innerHTML = data[dataId].count;

    // We presume change value is a percentage if number is non-integer (that's the format we should follow)
    document.getElementById(`${platformName}-${dataId}-change`).innerHTML = data[dataId].change + 
        (isInteger(data[dataId].change) ? '' : '%');
    
    var changeLabelEl = document.getElementById(`${platformName}-${dataId}-change-label`);
    if (changeLabelEl && data[dataId]['change-label']) {
        changeLabelEl.innerHTML = data.followers['change-label'];
    } 

    var arrowEl = document.getElementById(`${platformName}-${dataId}-change-arrow`); 

    if (data[dataId].change > -1) {
        arrowEl.innerHTML = upArrow;
        arrowEl.classList.add('up');
    } else {
        arrowEl.innerHTML = downArrow;
        arrowEl.classList.add('down');
    }

}


setupSurveyChart();
parseMediumCSV();
parseStatsJSON();
