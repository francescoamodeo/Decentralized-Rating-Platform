const Framework = artifacts.require("RatingSystemFramework");
const User = artifacts.require("User");
const Item = artifacts.require("Item")

const fs = require("fs");

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const network = config["test"]["network"];
const userAddress = config["test"]["user"];
const itemOwnerAddress = config["test"]["itemOwner"];
const params = config["test"]["parameters"];
const samples = params["samples"]; // How many time repeat the test
const batches = params["batches"]; // The list of the number of function calls to propagate simultaneously

const itemOwnerName = "Bob";
const itemName = "Bobs content";
const itemTokenName = "Bob Item Token";
const itemTokenSymbol = "BTK";
const totalSupply = 1000000;
const itemSkill = "Beer Drinks";

const user2itemOwnerPayment = web3.utils.toWei('0.00000001', 'ether');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async (callback) => {

    try {
        const ratingSystem = await Framework.deployed();
        /*try {
            const tx = await ratingSystem.createUser(web3.utils.fromUtf8(itemOwnerName), {from: itemOwnerAddress});
            console.log(tx);
        } catch (error) {
            console.log(error);
        }*/
        //await ratingSystem.createUser(web3.utils.fromUtf8("Carl"), {from: userAddress});
          
        // retrieve user for Bob
        const itemOwnerUserAddress = await ratingSystem.getMyUserContract({from: itemOwnerAddress});
        const itemOwner = await User.at(itemOwnerUserAddress);

        // retrieve user for Carl
        const userUserAddress = await ratingSystem.getMyUserContract({from: userAddress});
        //const user = await User.at(userUserAddress); 

        // create item for Bob
        //await itemOwner.createItem(web3.utils.fromUtf8(itemName), web3.utils.fromUtf8(itemSkill), itemTokenName, itemTokenSymbol, totalSupply, {from: itemOwnerAddress});
        //await itemOwner.createItem(web3.utils.fromUtf8(itemName), web3.utils.fromUtf8(itemSkill), itemTokenName, itemTokenSymbol, totalSupply, {from: itemOwnerAddress});
        //await itemOwner.createItem(web3.utils.fromUtf8(itemName), web3.utils.fromUtf8(itemSkill), itemTokenName, itemTokenSymbol, totalSupply, {from: itemOwnerAddress});
        // Retrieve item's contract instance
        //const itemList = await itemOwner.getItems();
        //const itemAddress = itemList[0];
        //const item = await Item.at(itemAddress);

        console.log("init");
        //await item.commitPermission(userUserAddress, user2itemOwnerPayment, {from: itemOwnerAddress});
        //await user.payItem(itemAddress, user2itemOwnerPayment, {from: userAddress, value: user2itemOwnerPayment})
        //return callback();
        const itemList = await itemOwner.getItems();
        for(let s=samples; s<=samples; s++) {

            console.log("Sample " + s);

            let output = "commitPermission";
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
                    try {
                        //await item.commitPermission(userUserAddress, user2itemOwnerPayment, {from: itemOwnerAddress});
                        //await user.payItem(itemAddress, user2itemOwnerPayment, {from: userAddress, value: user2itemOwnerPayment})
                        //promises.push( item.commitPermission(userUserAddress, user2itemOwnerPayment, {from: itemOwnerAddress}) )
                        //promises.push( user.payItem(itemAddress, user2itemOwnerPayment, {from: userAddress, value: user2itemOwnerPayment}) ); 
                        const itemAddress = itemList[k];
                        const item = await Item.at(itemAddress);  
                        promises.push( item.commitPermission(userUserAddress, user2itemOwnerPayment, {from: itemOwnerAddress}) )                 
                    } catch (error) {
                        console.log(error);
                        console.log("Error while sending transactions");
                    }
                }

                let txs = [];
                try {
                    txs = await Promise.all(promises);
                } catch (error) {
                    console.log(error);
                    console.log("Error while gathering transaction results");
                }
                console.log("Finished batch " + batch);

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
                //if (batch > 1) await sleep(10000)

                const json = JSON.stringify(obj, null, 4);
                fs.writeFileSync("scripts/measurements/testnet/"+network+"/transactions/commitPermission/sample"+samples+"/"+output+"_"+"batch"+batch+network+".json", json,'utf8');
            }

            //const json = JSON.stringify(obj, null, 4);
            //fs.writeFileSync("scripts/measurements/"+network+"/transactions/commitPermission/"+output+"_"+"sample"+s+".json", json,'utf8');

            console.log("Finished sample " + s);
        }

        console.log("end");
    }

    catch(e) {
        console.log(e);
    }

    return callback();
}
