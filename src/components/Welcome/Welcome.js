import React, { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import simpleFiSplash from '../../assets/images/simpleFi-splash-blue-sun.svg';
import simpleFiLogo from '../../assets/logos/simplefi-logotype.svg';
import './Welcome.css';
import { connectWallet } from '../../authentication/web3';
import { useHistory } from 'react-router-dom';

export default function Welcome ({setUserAccount, userAccount, setSplash, setChangedAddress}) {

  const [accountValue, setAccountValue] = useState('');
  const history = useHistory();
  const accountFormRef = useRef(null);
  const accountButtonRef = useRef(null);

  function toggleForm(e, formRef, buttonRef) {
    e.preventDefault();
    const form = formRef.current.style;
    const button = buttonRef.current.style;
    form.display = 'flex';
    form.animation = 'growDown 300ms ease-in-out forwards';
    button.display = 'none';
  }

  function handleChange(e) {
    setAccountValue(e.target.value)
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (ethers.utils.isAddress(accountValue)) {
      setUserAccount([accountValue.toLowerCase()]);
      setChangedAddress(true);
      history.push('/dashboard');
    } else {
      alert('Please enter a valid Ethereum address')
    }
  }

  useEffect(() => {
    setSplash(false);
    return () => setSplash(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  })

  return (
    <>
      <div className='welcome'>
        <div className='welcome-splash'>
          <div className="splash-main">
            <div className="splash-image">
              <img src={simpleFiLogo} alt='simpleFi logo' className="welcome-splash-image" />
            </div>
            <h2>Making decentralized finance accessible to everyone</h2>
          </div>
        </div>
        <div className="welcome-media">
          <img src={simpleFiSplash} alt="Welcome to SimpleFi" className="welcome-media-image"/>
        </div>
      </div>
      <div className="splash-connect">
        <button className='welcome-button' onClick={() => connectWallet(setUserAccount, setChangedAddress, history, userAccount)}>{userAccount[0] && userAccount[0] === window.ethereum?.selectedAddress ? 'View dashboard' : 'Connect wallet'}</button>
        <p>or</p>
        <button className='alt-connect-button' ref={accountButtonRef} onClick={(e) => toggleForm(e, accountFormRef, accountButtonRef)}>check an account</button>
        <form className="alt-connect-form" ref={accountFormRef} type="text" value={accountValue} onSubmit={handleSubmit}>
          <input className="alt-connect-input" type="text"  placeholder="e.g. 0xf147b...a133934" name="name" onFocus={e => e.target.placeholder = ''} onBlur={e => e.target.placeholder = 'e.g. 0xf147b...a133934'} onChange={handleChange}/>
          <button className="alt-connect-submit" type="submit" value="Submit">Check</button>
        </form>
      </div>
    </>
  )
}