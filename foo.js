const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});


readline.question(`Enter player,action:`, (data) => {


            [number,action] = data.split(",");
            if (action.toLowerCase() === "check"){
              console.log("aa");
               /* (number === '1' ? ws1 : ws2).send(
                    JSON.stringify({actionType: "check"})
                )*/
            }
        })
