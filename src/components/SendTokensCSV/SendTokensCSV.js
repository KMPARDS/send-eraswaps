import React, { Component } from 'react';
import './SendTokensCSV.css';
import { deployer } from '../../env';
const ethers = require('ethers');

class SendTokensCSV extends Component {
  state = {
    half: false,
    startSr: '1',
    endSr: String(this.props.addressArray.length),
    startSrNumber: 0,
    endSrNumber: 0,
    firstTotal: '',
    secondTotal: '',
    showSpecific: false,
    metamaskSending: '',
    nothingToShow: false,
    changedInputSr: false,
    bulkAllowance: 'Checking...',
    approveScreen: false,
    userApproveTxAmount: {},
    timeallyBalance: 'Checking...',
    topupScreen: false,
    userTopupAmount: {}
  };

  componentDidMount = async() => {
    window.ethers = ethers;
    window.soham = this.props;
    await this.showTheseEntries(true);

    (async() => {
      const bulkAllowance = await window.esInstance.functions.allowance(
          window.userAddress,
          window.batchInstance.address
        );
      this.setState({
        bulkAllowance: ethers.utils.formatEther(bulkAllowance) + ' ES',
        approveScreen: bulkAllowance.lt(
          this.props.type === 'dayswappers'
            ? ethers.utils.parseEther(this.state.firstTotal.split(' ')[0])
            : ethers.utils.parseEther(this.state.secondTotal.split(' ')[0])
        )
      });
    })();

    (async() => {
      const timeallyBalance = await window.timeallyInstance.functions.launchReward(
        window.userAddress
      );
      this.setState({
        timeallyBalance: ethers.utils.formatEther(timeallyBalance) + ' ES',
        topupScreen: timeallyBalance.lt(
          ethers.utils.parseEther(this.state.secondTotal.split(' ')[0])
        )
      });
    })();
  };

  showTheseEntries = async(onlyShow) => {
    await this.setState({
      startSrNumber: +this.state.startSr,
      endSrNumber: +this.state.endSr,
      showSpecific: !onlyShow
    });
    let firstTotal = ethers.utils.bigNumberify(0);
    this.props.amountArray.slice((this.state.startSrNumber-1)||0, this.state.endSrNumber||(this.props.amountArray.length-1)).forEach(amount => {
      firstTotal = firstTotal.add(amount);
    });
    let secondTotal = ethers.utils.bigNumberify(0);
    // console.log(this.props.type, 'dayswappers', this.props.type !== 'dayswappers');
    if(this.props.type === 'dayswappers') {
      this.props.stakeArray.slice((this.state.startSrNumber-1)||0, this.state.endSrNumber||(this.props.stakeArray.length-1)).forEach(amount => {
        secondTotal = secondTotal.add(amount);
      });
    } else {
      if(this.state.half) {
        secondTotal = firstTotal.div(2);
      } else {
        secondTotal = firstTotal;
      }
    }

    let nothingToShow = false;
    if(!this.props.amountArray.slice((this.state.startSrNumber-1)||0, this.state.endSrNumber||(this.props.amountArray.length-1)).length) nothingToShow = true;

    this.setState({
      firstTotal: ethers.utils.formatEther(firstTotal) + ' ES',
      secondTotal: ethers.utils.formatEther(secondTotal) + ' ES',
      nothingToShow,
      changedInputSr: false,
      approveScreen: ethers.utils.parseEther(this.state.bulkAllowance === 'Checking...' ? '0' : this.state.bulkAllowance.split(' ')[0])
        .lt(this.props.type === 'dayswappers' ? firstTotal : secondTotal),
      topupScreen: ethers.utils.parseEther(
        this.state.timeallyBalance === 'Checking...' ? '0' : this.state.timeallyBalance.split(' ')[0]
      ).lt(secondTotal)
    });
  };

  sendToMetamask = async type => {
    await this.setState({ metamaskSending: type });
    console.log('sendToMetamask', type);
    const sendingAddressesDraft =
      this.state.showSpecific
      ? this.props.addressArray.slice(this.state.startSrNumber-1, this.state.endSrNumber)
      : this.props.addressArray;
    const tokenArrayDraft =
      this.state.showSpecific
      ? (
        this.props.type !== 'dayswappers'
        ? (
          this.state.half
            ? this.props.amountArray.slice(this.state.startSrNumber-1, this.state.endSrNumber).map(address => address.div(2)) //
            : this.props.amountArray.slice(this.state.startSrNumber-1, this.state.endSrNumber)
          )
        : (type === 'liquid'
            ? this.props.amountArray
            : this.props.stakeArray).slice(this.state.startSrNumber-1, this.state.endSrNumber)
      )
      : (
        this.props.type !== 'dayswappers'
        ? (
          this.state.half
            ? this.props.amountArray.map(address => address.div(2))
            : this.props.amountArray
          )
        : (type === 'liquid'
            ? this.props.amountArray
            : this.props.stakeArray)
      );
    // console.log(sendingAddressesDraft, tokenArrayDraft);
    const sendingAddressesFinal = [];
    const tokenArrayFinal = [];
    let sum = ethers.utils.bigNumberify(0);
    /// @dev removing addresses which have 0 tokens to send coz including stuff in data field costs gas
    sendingAddressesDraft.forEach((address, index) => {
      if(!tokenArrayDraft[index].eq(0)) {
        sendingAddressesFinal.push(address);
        tokenArrayFinal.push(tokenArrayDraft[index]);
        sum = sum.add(tokenArrayDraft[index]);
      }
    });

    sendingAddressesFinal.forEach((address, index) => {
      console.log('preparing to send to', address, ethers.utils.formatEther(tokenArrayFinal[index]));
    });

    // window.tx = window.batchInstance.methods.sendTokensByDifferentAmount(
    //   window.esInstance.options.address,
    //   sendingAddressesFinal,
    //   tokenArrayFinal,
    //   sum
    // ).send({from: window.userAddress});

    if(type === 'liquid') {
      try {
        window.tx = window.batchInstance.sendTokensByDifferentAmount(
          window.esInstance.address,
          sendingAddressesFinal,
          tokenArrayFinal,
          sum
        );
      } catch(err) {
        console.log(err.message);
        alert(err.message);
      }
    } else {
      try {
        window.tx = window.timeallyInstance.functions.giveLaunchReward(
          sendingAddressesFinal,
          tokenArrayFinal
        );
      } catch(err) {
        console.log(err.message);
        alert(err.message);
      }
    }
    this.setState({ metamaskSending: '' });
  };

  render = () => {
    const themeColor = this.props.type === 'dayswappers'
      ? '#f27676'
      : (this.props.type === 'timeally' ? '#da8adf' : '#4ec0db');
    const colorLiquid = '#4ec0db';
    const colorTimeAlly = '#da8adf';

    return (
      <>
        <h3 style={{margin:'0'}}>
          <span
            style={{backgroundColor: themeColor+'55', cursor: 'pointer'}}
            onClick={this.props.goBackFunction}>{'< '}Back</span>
            {' '}
          Send {this.props.type !== 'dayswappers' ?
            (this.props.type === 'timeally' ? 'TimeAlly Rewards' : 'Liquid Tokens')
            : 'DaySwapper Payouts'
          }
            {' '}
          <span style={{color: '#fff1', backgroundColor: themeColor+'11', cursor: 'default'}}>Forw{' >'}</span>
        </h3>
        {this.props.type !== 'dayswappers' ? <p>{
            <span
              style={{color: this.state.half ? '#ffff' : '#fff7', cursor: 'pointer'}}
              onClick={() => this.setState({ half: true })}
              >Half
            </span>
          }{' '}
          {
            <span
              style={{color: !this.state.half ? '#ffff' : '#fff7', cursor: 'pointer'}}
              onClick={() => this.setState({ half: false })}
              >Full
            </span>
          }</p> : <br />}
        {this.state.nothingToShow ? <p>I ain't got no stuff to show</p> : <>
        <p>Showing {this.state.startSrNumber}-{this.state.endSrNumber} of {this.props.addressArray.length}</p>
        <table>
          <thead>
            <tr>
              <th>Sr</th>
              <th>Address</th>
              <th>{this.props.type !== 'dayswappers' ? 'Tokens In CSV' : 'Liquid Tokens'}</th>
              <th>{this.props.type !== 'dayswappers' ? 'Tokens To Send' : 'TimeAlly Rewards'}</th>
            </tr>
          </thead>
          <tbody>
            {(this.state.showSpecific
              ? this.props.addressArray.slice(this.state.startSrNumber-1, this.state.endSrNumber)
              : (this.props.addressArray.length > 30 ? this.props.addressArray.slice(0,3) : this.props.addressArray)).map((address, index) => (
              <tr key={'row-'+address} className="send-tokens-row">
                <td className="send-tokens-cell" style={{textAlign: 'right', backgroundColor: '#fff1'}}>{index+(this.state.startSrNumber||1)}</td>
                <td className="send-tokens-cell">{address}</td>
                <td className="send-tokens-cell" style={{
                  textAlign: 'right',
                  backgroundColor: this.props.type === 'dayswappers' ? colorLiquid + '44' : undefined
                }}>{ethers.utils.formatEther(this.props.amountArray[index+(this.state.startSrNumber||1)-1])} ES</td>
                <td className="send-tokens-cell" style={{
                  textAlign: 'right',
                  backgroundColor: this.props.type === 'dayswappers'
                  ? colorTimeAlly + '44' : themeColor + '44'}}>{ethers.utils.formatEther(
                    this.props.type !== 'dayswappers'
                    ? (this.state.half
                      ? this.props.amountArray[index+(this.state.startSrNumber||1)-1].div(2)
                      : this.props.amountArray[index+(this.state.startSrNumber||1)-1])
                    : this.props.stakeArray[index+(this.state.startSrNumber||1)-1]
                )} ES</td>
              </tr>
            ))}
            {this.props.addressArray.length > 30 && !this.state.showSpecific ? <>
            <tr>
              <td>...</td>
              <td>...</td>
              <td>...</td>
              <td>...</td>
            </tr>
            {this.props.addressArray.slice(this.props.addressArray.length-3).map((address, index) => {
              const actualIndex = index + this.props.addressArray.length-3;
              return (
                <tr key={'row-'+address} className="send-tokens-row">
                  <td className="send-tokens-cell" style={{textAlign: 'right', backgroundColor: '#fff1'}}>{actualIndex+1}</td>
                  <td className="send-tokens-cell">{address}</td>
                  <td className="send-tokens-cell" style={{
                    textAlign: 'right',
                    backgroundColor: this.props.type === 'dayswappers' ? colorLiquid + '44' : undefined
                  }}>{ethers.utils.formatEther(this.props.amountArray[actualIndex])} ES</td>
                  <td className="send-tokens-cell" style={{textAlign: 'right', backgroundColor: this.props.type === 'dayswappers'
                  ? colorTimeAlly + '44' : themeColor + '44'}}>{ethers.utils.formatEther(
                    this.props.type !== 'dayswappers'
                    ? (this.state.half
                      ? this.props.amountArray[actualIndex].div(2)
                      : this.props.amountArray[actualIndex])
                    : this.props.stakeArray[actualIndex]
                  )} ES</td>
                </tr>
              )
            })}
            </> : null}
            <tr>
              <td></td>
              <td></td>
              <td style={{ textAlign: 'right', backgroundColor: this.props.type === 'dayswappers' ? colorLiquid + '66' : undefined
              }}>{this.state.firstTotal}</td>
              <td style={{textAlign: 'right', backgroundColor: this.props.type === 'dayswappers'
              ? colorTimeAlly + '66' : themeColor + '66'}}>{this.state.secondTotal}</td>
            </tr>
          </tbody>
        </table>
        </>}
        <div style={{ marginTop: '.5rem' }}>
          <input type="text" placeholder="Enter Start Sr" onKeyUp={event => this.setState({ startSr: event.target.value, changedInputSr: true })} />
          <input type="text" placeholder="Enter End Sr" onKeyUp={event => this.setState({ endSr: event.target.value, changedInputSr: true })} />
          <br />
          <button onClick={() => this.showTheseEntries()}>Show These Entries</button>
        </div>
        {this.state.changedInputSr ? 'Click on show to send tokens' : <div style={{ marginTop: '.5rem' }}>
          {['dayswappers', 'liquid'].includes(this.props.type) ?
          <>
            <p style={{marginBottom: '0'}}>Allowance to BatchSendTokens(0x4D...): {this.state.bulkAllowance}</p>
            {this.state.approveScreen && this.state.bulkAllowance !== 'Checking'
            ? <>
              <input type="text" onKeyUp={event => this.setState({ userApproveTxAmount: event.target.value })} placeholder="Enter ES to approve" />
              <button onClick={async() => {
                const tx = await window.esInstance.functions.approve(
                  window.batchInstance.address,
                  ethers.utils.parseEther(this.state.userApproveTxAmount)
                );
                await tx.wait();
                //update allowance
                this.setState({bulkAllowance: 'Checking...'});
                const bulkAllowance = await window.esInstance.functions.allowance(
                    window.userAddress,
                    window.batchInstance.address
                  );
                this.setState({bulkAllowance: ethers.utils.formatEther(bulkAllowance) + ' ES'});
              }}>
                Approve BatchSendTokens
              </button>
            </> : null}
            <br />
            <button
              className="button-liquid"
              style={{margin: '20px'}}
              onClick={() => this.sendToMetamask('liquid')}
            >
              {this.state.metamaskSending === 'liquid' ? 'Open Metamask...' : 'Send Liquid'}
            </button>
          </>: null}
          {['dayswappers', 'timeally'].includes(this.props.type) ?
          (window.userAddress.toLowerCase() === deployer.toLowerCase() ? <>
            <p style={{marginBottom: '0'}}>TimeAlly Balance: {this.state.timeallyBalance}</p>
            {this.state.topupScreen && this.state.timeallyBalance !== 'Checking...'
            ? <>
              <input type="text" onKeyUp={event => this.setState({ userTopupAmount: event.target.value })} placeholder="Enter ES" />
              <button onClick={async() => {
                console.log('timeally allowance started...');
                const tx = await window.esInstance.functions.approve(
                  window.timeallyInstance.address,
                  ethers.utils.parseEther(this.state.userTopupAmount)
                );
                await tx.wait();
                console.log('timeally allowance done');
              }}>
                Approve TimeAlly
              </button>
              <button onClick={async() => {
                const tx = await window.timeallyInstance.functions.topupRewardBucket(
                  ethers.utils.parseEther(this.state.userTopupAmount)
                );
                await tx.wait();
                //update allowance
                this.setState({timeallyBalance: 'Checking...'});
                const timeallyBalance = await window.timeallyInstance.functions.launchReward(
                    window.userAddress
                  );
                this.setState({timeallyBalance: ethers.utils.formatEther(timeallyBalance) + ' ES'});
              }}>
                Topup TimeAlly Rewards Balance
              </button>
            </> : null}
            <br />
            <button
              style={{margin:'20px'}}
              className="button-reward"
              onClick={() => this.sendToMetamask('timeally')}
            >
              {this.state.metamaskSending === 'timeally' ? 'Open Metamask...' : 'Send TimeAlly'}
            </button>
          </> : 'Current Metamask address is not deployer of TimeAlly') : null}
          <br />
        </div>}
      </>
    );
  }
}

export default SendTokensCSV;
