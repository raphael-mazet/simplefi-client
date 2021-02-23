import React, { useEffect, useState, useRef } from 'react';
import './EarningFieldDetails.css';
import DetailsTable from '../../components/DetailsTable/DetailsTable';
import DetailsBarChart from '../../components/DetailsBarChart/DetailsBarChart';
import MaxiToggle from '../../components/MaxiToggle/MaxiToggle';
import MiniToggle from '../../components/MiniToggle/MiniToggle';
import helpers from '../../helpers';

export default function EarningFieldDetails ({name, userFields, history}) {
  const [currentField] = useState(userFields.find(field => field.name === name));
  const [farmingFields, setFarmingFields] = useState([]);
  const [combinedfields, setCombinedFields] = useState({currentField: null, farmingFields: []});
  const [combinedROI, setCombinedROI] = useState({roi: 0, abs: 0});
  const [combinedFlag, setCombinedFlag] = useState(false);
  const [displayAbsROIValue, setDisplayAbsROIValue] = useState(false);
  const [displayRelROIValue, setDisplayRelROIValue] = useState(false);
  const [displayHistInv, setDisplayHistInv] = useState(false);
  const [ROIValue, setROIValue] = useState({title: 'ROI', value: '0%'});
  const [invValue, setInvValue] = useState({title: 'Current', value: '$0'});
  const [relROIValue, setRelROIValue] = useState({title: 'Return', value: '$0'});
  const roiRef = useRef(null);
  const relRoiRef = useRef(null);
  const combinedGraph = useRef(null);

  function toggleCombinedROI(e) {
    const graphStyle = combinedGraph.current.style;
    if (e.target.checked) {
      setCombinedFlag(true);
      graphStyle.display = 'flex';
      graphStyle.animation = 'growDown 300ms ease-in-out forwards';
    } else {
      setCombinedFlag(false);
      graphStyle.animation = 'shrinkUp 300ms ease-in-out forwards';
      setTimeout(() => graphStyle.display = 'none', 300);
    }

    roiRef.current.className += ' roi-pulse';
    setTimeout(() => roiRef.current.className = 'field-overview-value', 300)
  }

  function toggleDisplay(e, target) {
    if (e.target.checked) {
      if (target === 'roi') {
        setDisplayAbsROIValue(true);
      } else if (target === 'inv') {
      setDisplayHistInv(true);
      } else {
        setDisplayRelROIValue(true);
      }
    } else {
      if (target === 'roi') {
        setDisplayAbsROIValue(false);
      } else if (target === 'inv') {
      setDisplayHistInv(false);
      } else {
        setDisplayRelROIValue(false);
      }
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    if (name) {
      /* @dev: the !field.isEarning check is similar to Rewinder()'s excludeFeeder flag it avoids
               showing any earning Fields that this current field's receipt token feeds into
      */
      const targetFarms = userFields.filter(field => !field.isEarning && field.seedTokens[0].tokenId === currentField.receiptToken)
      setFarmingFields(targetFarms);
      setCombinedFields({earningField: currentField, farmingFields: targetFarms});
      setCombinedROI(helpers.calcCombinedROI({earningField: currentField, farmingFields: targetFarms}));

      //FIXME: remove this hard-coded restriction
      if (currentField.contractAddresses[0].contractInterface.name === 'uniswap V2 earn') {
        relRoiRef.current.style.display = 'flex';
      }
    }
  }, [currentField]) //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (name) {
      if (displayAbsROIValue) {
        if (combinedFlag) {
          setROIValue({title: 'return value', value: '$' + Number(combinedROI.abs.toFixed()).toLocaleString()})
        } else {
          setROIValue({title: 'return value', value: '$' + Number(currentField.earningROI.absReturnValue.toFixed()).toLocaleString()})
        }
      } else {
        if (combinedFlag) {
          setROIValue({title: 'ROI', value: (combinedROI.roi * 100).toFixed(2) + '%'})
        } else {
          setROIValue({title: 'ROI', value: (currentField.earningROI.allTimeROI * 100).toFixed(2) + '%'})
        }
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayAbsROIValue, combinedFlag])

  useEffect(() => {
    if (name) {
      if (displayHistInv) {
        setInvValue({title: 'Cumulative', value: '$' + Number(currentField.earningROI.histInvestmentValue.toFixed()).toLocaleString()})
      } else {
        setInvValue({title: 'Current', value: '$' + Number(currentField.investmentValue.toFixed()).toLocaleString()})
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayHistInv]);

  useEffect(() => {
    //FIXME: remove this hard-coded restriction
    if (name && currentField.contractAddresses[0].contractInterface.name === 'uniswap V2 earn') {
      if (displayRelROIValue) {
        //TODO: avoid recalc on each useEffect
        const totalRelROI = currentField.earningROI.relativeProfit.realisedProfitValue + currentField.earningROI.relativeProfit.unrealisedProfitValue;
        const relDolSign = totalRelROI >= 0 ? '$' : '-$';
        setRelROIValue({title: 'return value', value: relDolSign + Number(Math.abs(totalRelROI).toFixed()).toLocaleString()})
      } else {
        setRelROIValue({title: 'ROI', value: (currentField.earningROI.relativeProfit.totalRelativeROI * 100).toFixed(2) + '%'})
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayRelROIValue]);

  if (!name) {
    history.push('/dashboard');
    return (<></>)
  }

  return (
    <div className="field-details">
      <div className="field-details-titles">
        <h2 className="field-title">{name} {currentField.isEarning ? '(earning)' : '(farming)'}</h2>
        <p><span className='field-title-header'>Parent protocol:</span>{currentField.protocol.name}</p>
        <p><span className='field-title-header'>Current nominal APY:</span>{currentField.earningAPY ? (currentField.earningAPY*100).toFixed(2) : (currentField.farmingAPY*100).toFixed(2)}%</p>
        <p><span className='field-title-header'>Underlying tokens:</span>{currentField.seedTokens.reduce((acc, curr) => [...acc, curr.name], []).join(', ')}</p>
        <p><span className='field-title-header' style={{display: !farmingFields.length && 'none'}}>Linked farming fields:</span>{farmingFields.reduce((acc, curr) => [...acc, curr.name], []).join(', ')}</p>
      </div>

      <div className="earning-details-toggle-roi" style={{display: !farmingFields.length && 'none'}}>
        <h3>Add farming ROI</h3>
        <MaxiToggle handleChange={toggleCombinedROI}/>
      </div>

      <div className="field-details-numbers">
        <div className="field-overview field-roi">
          <h2 className="field-overview-header">Total <br/> {ROIValue.title}</h2>
          <p ref={roiRef} className="field-overview-value">{ROIValue.value}</p>
          <MiniToggle before='%' after='$' handleChange={e => toggleDisplay(e, 'roi')} />
        </div>

        <div className="field-overview field-relative-roi" ref={relRoiRef}>
          <h2 className="field-overview-header">Relative <br/> {relROIValue.title}</h2>
          <p className="field-overview-value">{relROIValue.value}</p>
          <MiniToggle before='%' after='$' handleChange={e => toggleDisplay(e, 'relROI')} />
        </div>

        <div className="field-overview field-invested">
          <h2 className="field-overview-header">{invValue.title}  <br/> investment value</h2>
          <p className="field-overview-value">{invValue.value}</p>
          <MiniToggle before='curr.' after='hist.' handleChange={e => toggleDisplay(e, 'inv')} />
        </div>
      </div>

      <div ref={combinedGraph} className="field-details-combined-roi">
        <h2>Combined earning and Farming returns</h2>
        <div className="combined-roi-earnings-chart">
          <DetailsBarChart data={combinedfields} type='earningAndFarming'/>
        </div>
      </div>

      <div className="field-transactions">
        <h2>Transaction history</h2>
        <div className="field-transactions-table">
          <DetailsTable txHistory={currentField.userTxHistory} name={name}/>
        </div>
      </div>
    </div>
  )
}
