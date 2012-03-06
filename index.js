var https = require("https");
    url = require("url");
    fs = require("fs");

var messages = ["testing"];
    clients = [];

var options = {
  key: fs.readFileSync('./cert/privatekey.pem'),
  cert: fs.readFileSync('./cert/certificate.pem')
};
    
https.createServer(options, function (req, res)
  {
  
   console.log("Headers:");
   for (h in req.headers) {
     console.log(h+": " + req.headers[h]);
   }
   
   console.log("\nConnection:");
   for (c in req.trailers) {
     console.log(c+": " + req.trailers[c]);
   }
// parse URL
   var url_parts = url.parse(req.url);
   console.log(url_parts);
   
   if(url_parts.pathname == '/chat/') {
      // file serving
      fs.readFile('./index.html', function(err, data) {
         res.end(data);
      });
   } else if(url_parts.pathname.substr(0, 5) == '/poll') {
     // polling code here
       var count = url_parts.pathname.replace(/[^0-9]*/, '');
       console.log(count);
       if(messages.length > count) {
         res.end(JSON.stringify( {
         count: messages.length,
         append: messages.slice(count).join("\n")+"\n"
         }));
       } else {
    clients.push(res);
    }
  } else if(url_parts.pathname.substr(0, 5) == '/msg/') {
  // message receiving
      
      
        var msg = [];
        
        req.addListener('data', function(chunk) {
          console.log('Data chunk: ' + chunk);
          msg = JSON.parse(chunk);
          msg = unescape(msg.user + ': ' + msg.text);         
          console.log('Message: ' + msg);
          messages.push(msg);
          
        });
        
        req.addListener('end', function() {
          console.log('Data ended');
        });
        
        while(clients.length > 0) {
          var client = clients.pop();
          client.end(JSON.stringify( {
            count: messages.length,
            append: msg
           }));
         }
         res.end();
       
   }
  
  }).listen(443);
  
console.log('Server running.');
