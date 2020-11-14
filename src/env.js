const eraSwapTokenJSON = require('./ethereum/compiledContracts/Eraswap_0.json');
const nrtManagerJSON = require('./ethereum/compiledContracts/NRTManager_0.json');
const timeAllyJSON = require('./ethereum/compiledContracts/TimeAlly_0.json');
const sipJSON = require('./ethereum/compiledContracts/TimeAllySIP_TimeAllySIP.json');

const env = {
  network:
          'homestead',
            // 'kovan',
  deployer: '0xC8e1F3B9a0CdFceF9fFd2343B943989A22517b26',
  esContract: {
    address: '0x72108a8CC3254813C6BE2F1b77be53E185abFdD9',
    abi: eraSwapTokenJSON.abi
  },
  nrtManager: {
    address: '0x5967A8d4884150F49E271798B715092B084dD424',
    abi: nrtManagerJSON.abi
  },
  timeally: {
    address: '0xd8710F2F5335BaAcd4e4e35AbeC57D594891d497',
    abi: timeAllyJSON.abi
  },
  sip: {
    address: '0x54D47C34d92D6BbaEeb8e7f530c0f585d17361DF',
    abi: sipJSON.abi
  },
  batchSendTokens: {
    address: '0xbf2b93384948f57f6927c72badea5e0dd0182aa5',
    abi: [{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"addressArray","type":"address[]"},{"name":"amountArray","type":"uint256[]"},{"name":"totalAmount","type":"uint256"}],"name":"sendTokensByDifferentAmount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"addressArray","type":"address[]"},{"name":"amountToEachAddress","type":"uint256"},{"name":"totalAmount","type":"uint256"}],"name":"sendTokensBySameAmount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
  }
};

if (env.network === 'homestead') {
  env.deployer = '0x2b765725f12bbd98991f06abe65486bc841e6ba3';
  env.esContract.address = '0xef1344bdf80bef3ff4428d8becec3eea4a2cf574';
  env.nrtManager.address = '0x20ee679D73559e4c4B5E3B3042B61bE723828d6C';
  env.timeally.address = '0x5630ee5f247bd6b61991fbb2f117bbeb45990876';
  env.batchSendTokens.address = '0x4D35C3c17751c510135B2261F85845CF4366F47a';
  env.sip.address = '0xbad9af4db5401b7d5e8177a18c1d69c35fc03fd3';
}

module.exports = env;
