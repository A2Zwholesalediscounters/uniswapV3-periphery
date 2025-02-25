const hre = require("hardhat");

// NFTDescriptor deployed at: 0xe3F2F5Fae636B8c166473DdEd2C76f2bD42e5A0C

// NonfungibleTokenPositionDescriptor deployed at: 0x3A4fcB0BC58e20Fe4D0d259cf2c5555203c80a95

// NonfungiblePositionManager deployed at: 0x05db62BD91291D53Fef49f943dD2954d4edd1ec0

// SwapRouter deployed at: 0xA88359b99194b63CaF26B3d95d906044ff820fc4

// V3Migrator deployed at: 0x2B1EF4dcb4E029c0EAdC3fF656f56925df2fDF28

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with address: ${deployer.address}`);

  
  const UNISWAP_V3_FACTORY = "0x32e175A35150847cFe9172cca3810e1d7E48f773";  
  const WETH9 = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";                   
  const NATIVE_CURRENCY_LABEL = hre.ethers.utils.formatBytes32String("ETH"); 

  
  console.log("Deploying NFTDescriptor Library...");
  const NFTDescriptor = await hre.ethers.getContractFactory("NFTDescriptor");
  const nftDescriptor = await NFTDescriptor.deploy();
  await nftDescriptor.deployed();
  console.log(`NFTDescriptor deployed at: ${nftDescriptor.address}`);

  
  console.log("Deploying NonfungibleTokenPositionDescriptor...");
  const NonfungibleTokenPositionDescriptor = await hre.ethers.getContractFactory("NonfungibleTokenPositionDescriptor", {
    libraries: {
      NFTDescriptor: nftDescriptor.address,
    },
  });
  const tokenDescriptor = await NonfungibleTokenPositionDescriptor.deploy(WETH9, NATIVE_CURRENCY_LABEL);
  await tokenDescriptor.deployed();
  console.log(`NonfungibleTokenPositionDescriptor deployed at: ${tokenDescriptor.address}`);

 
  console.log("Deploying NonfungiblePositionManager...");
  const NonfungiblePositionManager = await hre.ethers.getContractFactory("NonfungiblePositionManager");
  const positionManager = await NonfungiblePositionManager.deploy(
    UNISWAP_V3_FACTORY,
    WETH9,
    tokenDescriptor.address
  );
  await positionManager.deployed();
  console.log(`NonfungiblePositionManager deployed at: ${positionManager.address}`);

  // Deploy SwapRouter
  console.log("Deploying SwapRouter...");
  const SwapRouter = await hre.ethers.getContractFactory("SwapRouter");
  const swapRouter = await SwapRouter.deploy(UNISWAP_V3_FACTORY, WETH9);
  await swapRouter.deployed();
  console.log(`SwapRouter deployed at: ${swapRouter.address}`);

  // Deploy V3Migrator
  console.log("Deploying V3Migrator...");
  const V3Migrator = await hre.ethers.getContractFactory("V3Migrator");
  const v3Migrator = await V3Migrator.deploy(UNISWAP_V3_FACTORY, WETH9, positionManager.address);
  await v3Migrator.deployed();
  console.log(`V3Migrator deployed at: ${v3Migrator.address}`);

  console.log("All contracts deployed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
