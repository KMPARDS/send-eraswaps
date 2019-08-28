import React, { Component } from 'react';
import './SendTokensCSV.css';

const ethers = require('ethers');

class SendTokensCSV extends Component {
  state = {
    half: true,
    startSr: '1',
    endSr: String(this.props.addressArray.length),
    startSrNumber: 0,
    endSrNumber: 0,
    firstTotal: '',
    secondTotal: '',
    showSpecific: false,
    metamaskSending: ''
  };

  componentDidMount = async() => {
    window.ethers = ethers;
    window.soham = this.props;
    this.showTheseEntries(true);
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
      secondTotal = firstTotal.div(2);
    }
    this.setState({
      firstTotal: ethers.utils.formatEther(firstTotal) + ' ES',
      secondTotal: ethers.utils.formatEther(secondTotal) + ' ES'
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
            ? this.props.amountArray.div(2)
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

    window.tx = window.batchInstance.methods.sendTokensByDifferentAmount(
      window.esInstance.options.address,
      sendingAddressesFinal,
      tokenArrayFinal,
      sum
    ).send({from: window.userAddress});

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
          <p>Showing {this.state.startSr}-{this.state.endSr} of {this.props.addressArray.length}</p>
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
        <div style={{ marginTop: '.5rem' }}>
          <input type="text" placeholder="Enter Start Sr" onKeyUp={event => this.setState({ startSr: event.target.value })} />
          <input type="text" placeholder="Enter End Sr" onKeyUp={event => this.setState({ endSr: event.target.value })} />
          <br />
          <button onClick={() => this.showTheseEntries()}>Show These Entries</button>
        </div>
        <div style={{ marginTop: '.5rem' }}>
          <button
            className="button-liquid"
            onClick={() => this.sendToMetamask('liquid')}>{this.state.metamaskSending === 'liquid' ? 'Open Metamask...' : 'Send Liquid'}</button>
          <button
            className="button-reward"
            onClick={() => this.sendToMetamask('timeally')}>{this.state.metamaskSending === 'timeally' ? 'Open Metamask...' : 'Send TimeAlly'}</button>
          <br />
        </div>
      </>
    );
  }
}

export default SendTokensCSV;
