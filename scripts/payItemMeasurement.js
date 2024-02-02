const Framework = artifacts.require("RatingSystemFramework");
const User = artifacts.require("User");
const Item = artifacts.require("Item")

const fs = require("fs");

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const userAddress = config["ropsten"]["user"];
const itemOwnerAddress = config["ropsten"]["itemOwner"];
const params = config["ropsten"]["parameters"];
const samples = params["samples"]; // How many time repeat the test
const batches = params["batches"]; // The list of the number of function calls to propagate simultaneously

const itemOwnerName = "Bob";
const itemName = "Bobs content";
const itemTokenName = "Bob Item Token";
const itemTokenSymbol = "BTK";
const totalSupply = 1000000;
const itemSkill = "Beer Drinks";

const user2itemOwnerPayment = web3.utils.toWei('0.01', 'ether');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async (callback) => {

    try {
     
        const ratingSystem = await Framework.deployed();
        await ratingSystem.createUser(web3.utils.fromUtf8(itemOwnerName), {from: itemOwnerAddress});
        await ratingSystem.createUser(web3.utils.fromUtf8("Carl"), {from: userAddress});
          
        // retrieve user for Bob
        const itemOwnerUserAddress = await ratingSystem.getMyUserContract({from: itemOwnerAddress});
        const itemOwner = await User.at(itemOwnerUserAddress);

        // retrieve user for Carl
        const userUserAddress = await ratingSystem.getMyUserContract({from: userAddress});
        const user = await User.at(userUserAddress); 

        // create item for Bob
        await itemOwner.createItem(web3.utils.fromUtf8(itemName), web3.utils.fromUtf8(itemSkill), itemTokenName, itemTokenSymbol, totalSupply, {from: itemOwnerAddress});
            
        // Retrieve item's contract instance
        const itemList = await itemOwner.getItems();
        const itemAddress = itemList[0];
        const item = await Item.at(itemAddress);

        console.log("init");
        //await item.commitPermission(userUserAddress, user2itemOwnerPayment, {from: itemOwnerAddress});
        //await user.payItem(itemAddress, user2itemOwnerPayment, {from: userAddress, value: user2itemOwnerPayment})

        for(let s=1; s<=samples; s++) {

            console.log("Sample " + s);

            let output = "payItem";
            let obj = {};

            obj["batch"] = {};

            for(b in batches){

                let batch = batches[b];
                let promises = [];
                let start = (new Date()).getTime();
                let end;
                obj["batch"][batch] = {};
                obj["batch"][batch]["start"] = await web3.eth.getBlockNumber(); 
                obj["batch"][batch]["blocks"] = []; 
                
                console.log("Batch " + batch);

                // Create "batch" calls to payItem()
                for(var k=0; k<batch; k++) {
                    item.commitPermission(userUserAddress, user2itemOwnerPayment, {from: itemOwnerAddress});
                    try {
                        await item.commitPermission(userUserAddress, user2itemOwnerPayment, {from: itemOwnerAddress});
                        await user.payItem(itemAddress, user2itemOwnerPayment, {from: userAddress, value: user2itemOwnerPayment})
                        //promises.push( item.commitPermission(userUserAddress, user2itemOwnerPayment, {from: itemOwnerAddress}) )
                        //promises.push( user.payItem(itemAddress, user2itemOwnerPayment, {from: userAddress, value: user2itemOwnerPayment}) );                        
                    } catch (error) {
                        console.log("Error while sending transactions");
                    }
                }

                let txs = [];
                try {
                    //txs = await Promise.all(promises);
                } catch (error) {
                    console.log("Error while gathering transaction results");
                }

                let data = {};

                if(txs == []) {
                    // TMP
                    console.log("Empty txs");
                    return;
                }
                txs.forEach((tx) => {

                    const blck = tx.receipt.blockNumber;
                    if(data[blck] == undefined) data[blck] = 1;
                    else data[blck]++;
                });
                
                obj["batch"][batch]["blocks"] = data;
                end = (new Date()).getTime();
                obj["batch"][batch]["elapse"] = (end - start) / 1000;
            }

            const json = JSON.stringify(obj, null, 4);
            fs.writeFileSync("scripts/measurements/transactions/payItem/"+output+"_"+"sample"+s+".json", json,'utf8');

            console.log("Finished sample " + s);
        }

        console.log("end");
    }

    catch(e) {
        console.log(e);
    }

    return callback();
}
