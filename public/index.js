const subtractMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(date.getMonth() - months, 1);
  return result;
}

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();

  return `${day} ${months[month]} ${year}`;
}

const latestStatistic = () => {
    var length = document.getElementById("marketLength").value
    
    //validation
    if(length === "" || length < 0){
      document.getElementById("latestExportError").innerHTML = "Value must be greater than or equal to 0"
      return
    } else {
      document.getElementById("latestExportError").innerHTML = ""
    }
  
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";

    var data = {
        type: 'latest',
        length: length
    }

    var endDate = new Date()
    var startDate = subtractMonths(endDate, length)

    fetch('/idxMarket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(response => response.blob())
        .then(blob => {
            // Create an object URL from the Blob
            const objectUrl = URL.createObjectURL(blob);
        
            // Create a link element
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `${formatDate(startDate)} - ${formatDate(endDate)}.xlsx`; // Set the download filename
        
            // Programmatically click the link to trigger the download
            link.click();
        
            // Release the object URL
            URL.revokeObjectURL(objectUrl);
            overlay.style.display = "none";
          })
        .catch(error => {
          console.error('Error:', error);
        });
}

const customDateStatistic = () => {
    var startDate = document.getElementById("customStartDate").value
    var endDate = document.getElementById("customEndDate").value

    
    //validation
    if(startDate === "" || endDate === ""){
      document.getElementById("customExportError").innerHTML = "Start date and end date must be filled"
      return
    }
    
    startDate = new Date(startDate + "T00:00:00.000Z")
    endDate = new Date(endDate + "T00:00:00.000Z")
    var currentDate = new Date()
    
    if(startDate > currentDate || endDate > currentDate){
        document.getElementById("customExportError").innerHTML = "The Date must not be larger than current date"
        return
    } else if(startDate > endDate){
        document.getElementById("customExportError").innerHTML = "End date must be larger than start date"
        return
    } else {
        document.getElementById("customExportError").innerHTML = ""
    }

    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";

    var data = {
        type: 'custom',
        startDate: startDate,
        endDate: endDate
    }

    fetch('/idxMarket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(response => response.blob())
        .then(blob => {
            // Create an object URL from the Blob
            const objectUrl = URL.createObjectURL(blob);
        
            // Create a link element
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `${formatDate(startDate)} - ${formatDate(endDate)}.xlsx`; // Set the download filename
        
            // Programmatically click the link to trigger the download
            link.click();
        
            // Release the object URL
            URL.revokeObjectURL(objectUrl);
            overlay.style.display = "none";
          })
        .catch(error => {
          console.error('Error:', error);
        });

}

const getStockInfo = () => {
    var startDate = document.getElementById("stockStartDate").value
    var endDate = document.getElementById("stockEndDate").value
    var stock = document.getElementById("stockCode").value


    //validation
    if(startDate === "" || endDate === ""){
      document.getElementById("stockExportError").innerHTML = "Start date and end date must be filled"
      return
    }
    
    startDate = new Date(startDate + "T00:00:00.000Z")
    endDate = new Date(endDate + "T00:00:00.000Z")
    var currentDate = new Date()
    
    if(startDate > currentDate || endDate > currentDate){
        document.getElementById("stockExportError").innerHTML = "The Date must not be larger than current date"
        return
    } else if(startDate > endDate){
        document.getElementById("stockExportError").innerHTML = "End date must be larger than start date"
        return
    } else if(stock === ""){
        document.getElementById("stockExportError").innerHTML = "End date must be larger than start date"
        return
    } else {
        document.getElementById("stockExportError").innerHTML = ""
    }

    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";

    var data = {
        type: 'stock',
        startDate: startDate,
        endDate: endDate,
        stockCode: stock
    }

    fetch('/idxMarket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(response => {
          if (!response.ok) {
            // Handle error response
            return response.text().then(text => {
                alert(text); // Display the server's error message
                throw new Error(text);
            });
          }
          
          return response.blob();
        })
        .then(blob => {
            // Create an object URL from the Blob
            const objectUrl = URL.createObjectURL(blob);
        
            // Create a link element
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `${stock.toUpperCase()} - ${formatDate(startDate)} - ${formatDate(endDate)}.xlsx`; // Set the download filename
        
            // Programmatically click the link to trigger the download
            link.click();
        
            // Release the object URL
            URL.revokeObjectURL(objectUrl);
            
          })
        .finally(() => {
          overlay.style.display = "none";
        })
        .catch(error => {
          console.error('Error:', error);
        });
}