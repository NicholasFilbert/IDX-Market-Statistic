// controllers/idxMarketController.js

const FindTag = function (query, Before, After, plus = 0) {
    let BeforeText = Before
    let AfterText = After
    let Text = ' ' + query;
    let This = Text.indexOf(BeforeText);
    if (This == 0) 
        return '';
    This += BeforeText.length;
    RangeText = Text.indexOf(AfterText, This) - This;
    let ResGetQuery = Text.substr(This, RangeText + plus);

    return ResGetQuery;
}

const GetContent = function (date) {
    return new Promise(async (resolve, reject) => {
        try {
            const puppeteer = require('puppeteer');
            const TrueUrl = `https://www.idx.co.id/primary/TradingSummary/GetStockSummary?length=9999&start=0&date=${date}`

            const browser = await puppeteer.launch({headless: 1})
            const page = await browser.newPage()
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Geck' +
                'o) Chrome/98.0.4758.102 Safari/537.36'
            )
            // await page.setViewport({width: 1536, height: 235});

            await page.goto(TrueUrl)
            const asd = await page.content()

            const beverage = asd.includes('</pre>')
                ? FindTag(asd, 'pre-wrap;">', '</pre>')
                : FindTag(asd, '<body>', '</body>', 0);
            await browser.close();
            return resolve(beverage)
            // return beverage
            // console.log(beverage, TrueUrl)
            // return resolve(DataTransform(beverage, TrueUrl));
            //   return resolve(beverage);
        } catch (e) {
            return reject(e);
        }
    })
}

const subtractMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(date.getMonth() - months, 1);
    return result;
}

const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}


const exportToExcel = (data) => {
    const XLSX = require('xlsx');

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create a worksheet with your JSON data
    const ws = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, `data.xlsx`);
    // Generate a blob containing the Excel file
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    
    return wbout
}

const idxMarketController = async (req, res) => {
    const type = req.body.type

    var property = [
        'StockCode',
        'StockName',
        'Volume',
        'Value',
        'Frequency',
        'ForeignSell',
        'ForeignBuy',
        'NonRegularVolume',
        'NonRegularValue',
        'NonRegularFrequency',
        // 'IndexIndividual',
        // 'ListedShares',
        // 'TradebleShares',
        // 'WeightForIndex',
    ]

    const summableProperties = [
        'Volume',
        'Value',
        'Frequency',
        'ForeignSell',
        'ForeignBuy',
        'NonRegularVolume',
        'NonRegularValue',
        'NonRegularFrequency',
      ];

    var data = []

    //get initial data
    if(type === 'stock'){
        property = ['Date', ...property]
        var startDate = new Date(req.body.startDate)
        var endDate = new Date(req.body.endDate)
        endDate = new Date(endDate.getTime() - endDate.getTimezoneOffset())
        const stockCode = req.body.stockCode
        
        while(data.length === 0){
            data = await GetContent(formatDate(endDate))
            data = JSON.parse(data)
            data = data.data
            
            endDate.setDate(endDate.getDate() - 1)
        }
    
        data = data.map(dataObj => {
            const filteredDataObj = Object.fromEntries(
                Object.entries(dataObj).filter(([key, value]) => property.includes(key))
            );
            return filteredDataObj;
            });   

        data = data.filter(d => d.StockCode.toUpperCase() === stockCode.toUpperCase())
    }
    if(type === 'latest'){
        const length = req.body.length
        
        var endDate = new Date()
        var startDate = subtractMonths(endDate, length)
        
        while(data.length === 0){
            data = await GetContent(formatDate(endDate))
            data = JSON.parse(data)
            data = data.data
            
            endDate.setDate(endDate.getDate() - 1)
        }
    
        data = data.map(dataObj => {
            const filteredDataObj = Object.fromEntries(
                Object.entries(dataObj).filter(([key, value]) => property.includes(key))
            );
            return filteredDataObj;
        });
    } else if(type === 'custom'){
        var startDate = new Date(req.body.startDate)
        var endDate = new Date(req.body.endDate)
        endDate = new Date(endDate.getTime() - endDate.getTimezoneOffset())
        
        while(data.length === 0){
            data = await GetContent(formatDate(endDate))
            data = JSON.parse(data)
            data = data.data
            
            endDate.setDate(endDate.getDate() - 1)
        }
    
        data = data.map(dataObj => {
            const filteredDataObj = Object.fromEntries(
                Object.entries(dataObj).filter(([key, value]) => property.includes(key))
            );
            return filteredDataObj;
            });   
    }


    //iterate all data
    if(type === 'stock'){
        const stockCode = req.body.stockCode
        while (startDate <= endDate) {
            var date = formatDate(startDate)
            var marketData = await GetContent(date)
            marketData = JSON.parse(marketData)
            marketData = marketData.data
            marketData = marketData.filter(d => d.StockCode.toUpperCase() === stockCode.toUpperCase())
            marketData = marketData.map(dataObj => {
                const filteredDataObj = Object.fromEntries(
                    Object.entries(dataObj).filter(([key, value]) => property.includes(key))
                );
                return filteredDataObj;
            });

            if(marketData.length !== 0){
                data = [...data, marketData[0]]
            }
    
            startDate.setDate(startDate.getDate() + 1); // Increment the date by one day
        }

        const initialData = data.shift();
        data.push(initialData); // Add the removed element to the end
    } else {
        while (startDate <= endDate) {
            var date = formatDate(startDate)
            var marketData = await GetContent(date)
            marketData = JSON.parse(marketData)
            marketData = marketData.data
    
    
            marketData.forEach(marketObj => {
                const targetObject = data.find(dataObj => dataObj.StockCode === marketObj.StockCode);
                if (targetObject) {
                    summableProperties.forEach(property => {
                        targetObject[property] += marketObj[property]
                    })
                }
            })
    
            startDate.setDate(startDate.getDate() + 1); // Increment the date by one day
        }
    }

    if(data[0] === undefined){
        res.status(400).send('Please check your stock code');
    } else {
        console.log("exporting to Excel")
        const wbout = exportToExcel(data)
        console.log("exported")
        res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx')
    
        res.send(Buffer.from(wbout, 'binary'));
    }


  };
  
  module.exports = idxMarketController;