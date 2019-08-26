import React, { Component } from 'react';
import './SendTokensCSV.css';

const ethers = require('ethers');

class SendTokensCSV extends Component {
  state = {
    half: true,
    startSr: '',
    endSr: '',
    startSrNumber: 0,
    endSrNumber: 0,
    showSpecific: false
  }

  componentDidMount = () => {
    window.ethers = ethers;
    window.soham = this.props;
  }

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
          </tbody>
        </table>
        <div style={{ marginTop: '.5rem' }}>
          <input type="text" placeholder="Enter Start Sr" onKeyUp={event => this.setState({ startSr: event.target.value })} />
          <input type="text" placeholder="Enter End Sr" onKeyUp={event => this.setState({ endSr: event.target.value })} />
          <br />
          <button onClick={() => this.setState({
              startSrNumber: +this.state.startSr,
              endSrNumber: +this.state.endSr,
              showSpecific: true })}>Show These Entries</button>
        </div>
      </>
    );
  }
}

export default SendTokensCSV;
