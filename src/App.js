import React, { Component } from 'react';
import CSVReader from 'react-csv-reader';
import axios from 'axios';
import SendTokensCSV from './components/SendTokensCSV/SendTokensCSV';
import './App.css';

const ethers = require('ethers');
window.Web3js = require('web3');

const { esContract, timeally, batchSendTokens, sip } = require('./env');

window.pleaseStopFor = duration => new Promise(function(resolve, reject) {
  setTimeout(() => resolve(), duration);
});

class App extends Component {
  state = {
    loading: false,
    numberOfFiles: 0,
    csvArray: [],
    addressArray: [],
    amountArray: [],
    errors: 0,
    showFileCount: false,
    showWhatToDo: false,
    currentScreen: 0,
    loadingFromDaySwappers: false,
    liquidArray: [],
    stakeArray: []
  };

  componentDidMount = async() => {
    if(window.ethereum) {
      console.log('Metamask found');
      window.web3js = new window.Web3js(window.ethereum);
      await window.ethereum.enable();
      console.log('Metamask is enabled');
      console.log(window.web3js);
      window.provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
      console.log('provider', window.provider)
      window.wallet = window.provider.getSigner();
      // console.log(wiwallet);
      window.esInstance =
      new ethers.Contract(
        esContract.address,
        esContract.abi,
        window.wallet
      );
      // new window.web3js.eth.Contract(esContract.abi, esContract.address);

      window.timeallyInstance =
      new ethers.Contract(
        timeally.address,
        timeally.abi,
        window.wallet
      );
      // new window.web3js.eth.Contract(timeally.abi, timeally.address);

      window.batchInstance =
      new ethers.Contract(
        batchSendTokens.address,
        batchSendTokens.abi,
        window.wallet
      );
      // new window.web3js.eth.Contract(batchSendTokens.abi, batchSendTokens.address);

      window.sipInstance =
      new ethers.Contract(
        sip.address,
        sip.abi,
        window.wallet
      );

      console.log('Contract instances created');

      setInterval(async() => {
        const accounts = await window.web3js.eth.getAccounts();
        window.userAddress = accounts[0];
      }, 2000);

      console.log('Done');
    } else {
      console.log('Metamask is not there');
    }
  }

  onFileLoaded = async output => {
    this.setState({ numberOfFiles: this.state.numberOfFiles + 1, loading: true })
    const addressArray = this.state.addressArray;
    const amountArray = this.state.amountArray;
    let totalAmount = ethers.utils.bigNumberify(0);
    for(const row of output) {
      // console.log(row);
      let address;
      let amount;

      try {
        address = ethers.utils.getAddress(row[0].split(' ').join('').split('\t').join('').toLowerCase());
        amount = ethers.utils.parseEther(row[1].split(' ').join('').split('\t').join(''));
      } catch (error) {
        console.log(error.message);
        console.log('error found in:', row);
        continue;
      }

      const indexOfAddress = addressArray.indexOf(address);
      if(indexOfAddress === -1) {
        addressArray.push(address);
        amountArray.push(amount);
      } else {
        // console.log(indexOfAddress, amountArray[indexOfAddress]);
        amountArray[indexOfAddress] = amountArray[indexOfAddress].add(amount);
      }
    }

    this.setState({ csvArray: output, addressArray, amountArray, loading: false });
    await window.pleaseStopFor(300);
    this.setState({ showFileCount: true });
    await window.pleaseStopFor(300);
    this.setState({ showWhatToDo: true });
  };

  // onDayswappersClick = async() => {
  //   this.setState({ loadingFromDaySwappers: true });
  //   const response = await axios.get('https://apis.dayswappers.com/graph/rewards');
  //   console.log('dayswappers response', response);
  //   const addressArray = [], liquidArray = [], stakeArray = [];
  //   response.data.forEach(obj => {
  //     if(obj.liquid_reward || obj.my_reward) {
  //       // console.log(obj.liquid_reward, String(obj.liquid_reward));
  //       const indexOf = addressArray.indexOf(obj.ethereum_address);
  //       if(indexOf === -1) {
  //         addressArray.push(obj.ethereum_address);
  //         liquidArray.push(ethers.utils.parseEther(String(obj.liquid_reward)));
  //         stakeArray.push(ethers.utils.parseEther(String(obj.my_reward)));
  //       } else {
  //         liquidArray[indexOf] = liquidArray[indexOf].add(obj.liquid_reward);
  //         stakeArray[indexOf] = stakeArray[indexOf].add(obj.my_reward);
  //       }
  //     }
  //   });
  //   this.setState({
  //     loadingFromDaySwappers: false,
  //     currentScreen: 3,
  //     addressArray, liquidArray, stakeArray
  //   });
  // }

  render = () => (
    <div className="App">
      <header className="App-header">
        {this.state.currentScreen === 0 ? <>
          {!this.state.csvArray.length && !this.state.loading ? <>
            <h3>{/*Hi Bhakti ma'am, */}please select mode</h3>
            <button className="csv-input-button" onClick={() => document.getElementById('csv-input').click()}>Select CSV file</button>
            <CSVReader
              inputId="csv-input"
              onFileLoaded={this.onFileLoaded}
              inputStyle={{display: 'none'}}
              onError={this.handleDarkSideForce}
            />
            {/* <span style={{margin: '10px'}}>Or</span>
            <button className="dayswappers-button"
              disabled={this.state.loadingFromDaySwappers}
              onClick={this.onDayswappersClick}>{this.state.loadingFromDaySwappers ? 'Loading...' : 'Pull from DaySwappers'}</button> */}

          </> : (
            !this.state.csvArray.length && this.state.loading ? <>
              <h3>Got the file, checking it out</h3>
            </> : <>
              <h3>Got the CSV data</h3>
            </>
          )}
          {this.state.showFileCount ? <>
            And I just checked, I found {this.state.addressArray.length} addresses in this {this.state.csvArray.length} rowed CSV file
          </> : null}
          {this.state.showWhatToDo ? <>
            <h4>What do you want to do with this file?</h4>
            <button className="button-reward" onClick={() => this.setState({ currentScreen: 1 })}>Hey there, I want to send TimeAlly rewards</button>
            <button className="button-liquid" onClick={() => this.setState({ currentScreen: 2 })}>Nope, I feel like sending liquid tokens</button>
            <button className="button-sip" onClick={() => this.setState({ currentScreen: 4 })}>Instead, I have an urge to send prepaidES in SIPs</button>
          </> : null}
        </> : null}
        {this.state.currentScreen === 1 ?
          <SendTokensCSV
            type="timeally"
            addressArray={this.state.addressArray}
            amountArray={this.state.amountArray}
            goBackFunction={() => this.setState({ currentScreen: 0 })}
            />
          : null}
        {this.state.currentScreen === 2 ?
          <SendTokensCSV
            type="liquid"
            addressArray={this.state.addressArray}
            amountArray={this.state.amountArray}
            goBackFunction={() => this.setState({ currentScreen: 0 })}
            />
          : null}
        {this.state.currentScreen === 3 ?
          <SendTokensCSV
            type="dayswappers"
            addressArray={this.state.addressArray}
            amountArray={this.state.liquidArray}
            stakeArray={this.state.stakeArray}
            goBackFunction={() => this.setState({ currentScreen: 0 })}
            />
          : null}
        {this.state.currentScreen === 4 ?
          <SendTokensCSV
            type="sip"
            addressArray={this.state.addressArray}
            amountArray={this.state.amountArray}
            goBackFunction={() => this.setState({ currentScreen: 0 })}
            />
          : null}
      </header>
    </div>
  );
}

export default App;
