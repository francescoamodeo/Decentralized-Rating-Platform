require('dotenv').config();
import { providers } from "ethers";

(async () => {
  const provider = new providers.JsonRpcProvider("https://sepolia.infura.io/v3/"+process.env.INFURA_KEY);

  let occupantions = [];
  let totalGasUsed = 0;
  //const myGasUsed = 0;
  let blockGasOccupation = 0;
  let occupationSum = 0;
  const startBlock = 5252500;
  const endBlock = 5253500;
  const blockGasLimit = 30000000;

  for (i = startBlock; i< endBlock; i++) {

    totalGasUsed = (await provider.getBlock(i)).gasUsed.toString();
    blockGasOccupation = totalGasUsed / blockGasLimit;
    console.log("BGO [" + i + "]: " + blockGasOccupation);

    occupationSum += blockGasOccupation;
    occupantions.push(blockGasOccupation);

  }
  const avgCongestionOccupation = occupationSum / 1000;
 
  occupantions.sort()
  let sum5percentile = 0;
  let sum95percentile = 0;
  for (i = 0; i < 50; i++) sum5percentile += occupantions[i]; 
  for (i = 950; i < 1000; i++) sum95percentile += occupantions[i];

  const avgCongestion5PercentileOccupation = sum5percentile / 50;
  const avgCongestion95PercentileOccupation = sum95percentile / 50;
  console.log("Avg Congestion Ratio: "+avgCongestionOccupation);
  console.log("Avg Congestion Ratio 5-Percentile: "+avgCongestion5PercentileOccupation);
  console.log("Avg Congestion Ratio 95-Percentile: "+avgCongestion95PercentileOccupation);

  const reimaningGasinAvg = blockGasLimit - (blockGasLimit * avgCongestionOccupation);
  const reimaningGasin5Percentile = blockGasLimit - (blockGasLimit * avgCongestion5PercentileOccupation);
  const reimaningGasin95Percentile = blockGasLimit - (blockGasLimit * avgCongestion95PercentileOccupation);
  console.log("Reimaning gas in Avg Congestion:" + reimaningGasinAvg);
  console.log("Reimaning gas in Avg 5-Percentile Congestion: "+ reimaningGasin5Percentile);
  console.log("Reimaning gas in Avg 95-Percentile Congestion: "+ reimaningGasin95Percentile);
})();
