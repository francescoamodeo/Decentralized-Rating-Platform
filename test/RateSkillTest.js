const RatingSystem = artifacts.require("RatingSystemFramework");
const Storage = artifacts.require("AssetStorage");
const User = artifacts.require("User");
const Item = artifacts.require("Item");
const FunctionRegistry = artifacts.require("FunctionRegistry");
const DatabaseSkills = artifacts.require("DatabaseSkills");
const UserSkills = artifacts.require("UserSkills");
const TokenContract = artifacts.require("ERC20");


contract("RatingSystemFramework RateSkillTest: correctness test", accounts => {
    console.log("");
    const alice = accounts[0]; // System creator
    const bob = accounts[1];   // User of the System
    const carl = accounts[2];  // Rater EOA user
    const dave = accounts[4];  // Error Test user

    const bobName = "Bob";
    const bobItemName = "Bobs content";
    const bobItemSkill = "Vegetarian";
    const bobItemTokenName = "Bob Item Token";
    const bobItemTokenSymbol = "BTK";
    const bobItemTokenValue = 100;

    const carlName = "Carl";
    
    const newSkill = "Skill5";
    const carl2bobPayment = web3.utils.toWei('0.5', 'ether');
    
    const score = 5;


    /////////////////
    // Deployment ownership test
    /////////////////


    it("Should test RatingSystemFramework and FunctionRegistry ownership", async() => {

        const ratingSystem = await RatingSystem.deployed();
        const functionRegistryAddress = await ratingSystem.functionRegistry();
        const functionRegistry = await FunctionRegistry.at(functionRegistryAddress);
        const dbSkillsAddress = await ratingSystem.dbSkills();
        const dbSkills = await DatabaseSkills.at(dbSkillsAddress);

        assert.equal(await ratingSystem.owner(), alice, "The owner of RatingSystemFramework should be " + alice);
        assert.equal(await functionRegistry.owner(), alice, "The owner of the FunctionRegistry should be " + alice);
        assert.equal(await dbSkills.owner(), alice, "The owner of the FunctionRegistry should be " + alice);
    });


    /////////////////
    // Tests update skill
    /////////////////


    it("Should test update user skill", async() => {
        const ratingSystem = await RatingSystem.deployed();
        console.log(bob);
        // create Bob user
        await ratingSystem.createUser(web3.utils.fromUtf8(bobName), {from: bob});
        const bobUserAddress = await ratingSystem.getMyUserContract({from: bob});
        const bobObject = await User.at(bobUserAddress);

        // craete Bob item
        await bobObject.createItem(web3.utils.fromUtf8(bobItemName), web3.utils.fromUtf8(bobItemSkill), bobItemTokenName, bobItemTokenSymbol, bobItemTokenValue, {from: bob});
    
        // Retrieve bob item's contract instance
        const itemList = await bobObject.getItems();
        const bobItemAddress = itemList[0];
        const bobItemObject = await Item.at(bobItemAddress);

        // create Carl user
        await ratingSystem.createUser(web3.utils.fromUtf8(carlName), {from: carl});
        const carlUserAddress = await ratingSystem.getMyUserContract({from: carl});
        const carlObject = await User.at(bobUserAddress);

        assert.equal(web3.utils.toUtf8(await bobItemObject.skill()), bobItemSkill, "Bob's item skill doesn't match");
        
        // update Carl skills with value equal to 3
        // await carlObject.updateSkill(web3.utils.fromUtf8(bobItemSkill), 3);

        // retrieve Carl skills
        const carlSkillsAddress = await carlObject.skills();
        const carlSkillsObject = await UserSkills.at(carlSkillsAddress);

        // update Carl skills with value equal to 3
        await carlSkillsObject.updateSkill(web3.utils.fromUtf8(bobItemSkill), 3);

        // check if Carl's skill has been update
        assert.equal(await carlSkillsObject.getSkillsNumber(), 1, "Carl skills number doesn't match");
        
        assert.equal(web3.utils.toUtf8(await carlSkillsObject.getSkillNameAtIndex(0)), bobItemSkill, "Carl's skill doesn't match");
        assert.equal(await carlSkillsObject.getSkillValue(web3.utils.fromUtf8(bobItemSkill)), 3, "Carl's skill value doesn't match");

    });


    /////////////////
    // Tests rate with skills
    /////////////////


    it("Should let Carl (User contract) to rate " + bobItemName + " " + score + " stars", async() => {

            const ratingSystem = await RatingSystem.deployed();
            // Get Carl User
            const carlUserAddress = await ratingSystem.getMyUserContract({from: carl});
            const carlObject = await User.at(carlUserAddress);
            // Get Bob User
            const bobUserAddress = await ratingSystem.getMyUserContract({from: bob});
            const bobObject = await User.at(bobUserAddress);
            // Get Bob Item
            const bobItemList = await bobObject.getItems();
            const bobItemAddress = bobItemList[0]; // Bob deployed only one Item
            const bobItemObject = await Item.at(bobItemAddress);
    
            await bobItemObject.commitPermission(carlUserAddress, carl2bobPayment, {from: bob});

            // Carl send an amout of ether to Bob's item    
            const payTx = await carlObject.payItem(bobItemAddress, carl2bobPayment, {from:carl, value: carl2bobPayment});

            // grant permission to Carl to rate Bob's item 
            await bobItemObject.grantPermission(carlUserAddress, {from: bob});

            // Carl (User) rates Bob's item
            await carlObject.addRate(bobItemAddress, score, {from: carl});
    
            // Check that Carl cannot rate again
            assert.notEqual(await bobItemObject.checkForPermission(carlUserAddress), 0, "Carl's permission status should be 1 or 2");
            
            // Check item's ratings
            const ratingBundle = await bobItemObject.getAllRatings();
            assert.equal(await bobItemObject.ratingCount(), 1, bobItemName + " should have only 1 rating");
            assert.equal(ratingBundle._scores.length, 1, bobItemName + " should have only 1 score");
            assert.equal(ratingBundle._blocks.length, 1, bobItemName + " should have only 1 timestamp");
            assert.equal(ratingBundle._raters.length, 1, bobItemName + " should have only 1 rater");
            assert.equal(ratingBundle._scores[0], score, "The score should be " + score);
            assert.equal(ratingBundle._raters[0], carlUserAddress, "The rater should be Carl: " + carlUserAddress);

            assert.equal(ratingBundle._userValueSkills.length, 1, bobItemName + " should have only 1 skill value");
            assert.equal(ratingBundle._userValueSkills[0], 0, "Skill value should be 0");

            // retrieve Carl skills
            const carlSkillsAddress = await carlObject.skills();
            const carlSkillsObject = await UserSkills.at(carlSkillsAddress);

            assert.equal(await carlSkillsObject.getSkillValue(web3.utils.fromUtf8(bobItemSkill)), 1, "Carl's skill should be update to 1");
            
        });

    it("Should let Carl (User contract) to rate and receive Tokens ", async() => {

            const ratingSystem = await RatingSystem.deployed();
            // Get Carl User
            const carlUserAddress = await ratingSystem.getMyUserContract({from: carl});
            const carlObject = await User.at(carlUserAddress);
            // Get Bob User
            const bobUserAddress = await ratingSystem.getMyUserContract({from: bob});
            const bobObject = await User.at(bobUserAddress);
            // Get Bob Item
            const bobItemList = await bobObject.getItems();
            const bobItemAddress = bobItemList[0]; // Bob deployed only one Item
            const bobItemObject = await Item.at(bobItemAddress);


            // retrieve Carl skills
            const carlSkillsAddress = await carlObject.skills();
            const carlSkillsObject = await UserSkills.at(carlSkillsAddress);

            assert.equal(await carlSkillsObject.getSkillsNumber(), 1, "Carl skills number doesn't match");
            
            assert.equal(web3.utils.toUtf8(await carlSkillsObject.getSkillNameAtIndex(0)), bobItemSkill, "Carl's skill doesn't match");
            assert.equal(await carlSkillsObject.getSkillValue(web3.utils.fromUtf8(bobItemSkill)), 1, "Carl's skill value doesn't match");
            

            await bobItemObject.commitPermission(carlUserAddress, carl2bobPayment, {from: bob});
            // Carl send an amout of ether to Bob's item    
            const payTx = await carlObject.payItem(bobItemAddress, carl2bobPayment, {from:carl, value: carl2bobPayment});

            const tokenItemBobAddress = await bobItemObject.tokenContract();
            const tokenItemBobObject = await TokenContract.at(tokenItemBobAddress);

            assert.equal(await tokenItemBobObject.totalSupply(), 1000000, "Total supply should be 1000000");

            // Carl esaurisce i token per lo sconto nel pagamento e gli viene dato 1 token per la skill posseduta
            assert.equal(await tokenItemBobObject.balanceOf(carlUserAddress), 0, "Carl's token should be 0");
            
        });

});