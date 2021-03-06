
async function metamaskConnect () {
  try {
    const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return account
  } catch(error) {
    console.error(error);
    return {error};
  }
}

async function connectWallet (setUserAccount, setChangedAddress, history, userAccount) {
  if (window.ethereum) {
    const newAccount = await metamaskConnect();
    if (newAccount.error) {
      if (newAccount.error.code === 4001) {
        alert('Please connect to Metamask');
      } else {
        alert('Oops, something went wrong - please refresh the page');
      }
    } else if (newAccount[0] && newAccount[0] !== userAccount[0]) {
      setChangedAddress(true);
      setUserAccount(newAccount);
      history.push('/dashboard');
    } else {
      history.push('/dashboard');
    }
  } else {
    alert('Please install Metamask to use SimpleFi (https://metamask.io/)')
  }
}

export {
  connectWallet,
}