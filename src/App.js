import React, { useEffect, useState } from 'react';
import './App.css';
import CurrencyRow from './CurrencyRow';

const BASE_URL =
  'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';

function App() {
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [saleExchangeRate, setSaleExchangeRate] = useState('');
  const [buyExchangeRate, setBuyExchangeRate] = useState('');
  const [amount, setAmount] = useState(1);
  const [amountInFromCurrency, setAmountInFromCurrency] = useState(true);

  let toAmount = null;
  let fromAmount = null;

  if (amountInFromCurrency) {
    fromAmount = amount;
    // for from UAN
    if (toCurrency === fromCurrency) {
      toAmount = amount;
    } else if (fromCurrency === 'UAH') {
      toAmount = Math.round((amount / saleExchangeRate) * 100) / 100;
    } else if (fromCurrency !== 'UAH' && toCurrency === 'UAH') {
      toAmount = Math.round(amount * buyExchangeRate * 100) / 100;
    } else {
      toAmount =
        Math.round(((amount * buyExchangeRate) / saleExchangeRate) * 100) / 100;
    }
  } else {
    toAmount = amount;
    if (toCurrency === fromCurrency) {
      fromAmount = amount;
    } else if (fromCurrency === 'UAH') {
      fromAmount = Math.round(amount * saleExchangeRate * 100) / 100;
    } else if (fromCurrency !== 'UAH' && toCurrency === 'UAH') {
      fromAmount = Math.round((amount / buyExchangeRate) * 100) / 100;
    } else {
      fromAmount =
        Math.round((amount / buyExchangeRate) * saleExchangeRate * 100) / 100;
    }
  }

  //first render - from UAH to first currency in API (to USD)
  useEffect(() => {
    fetch(BASE_URL)
      //Get data from Privat Api
      .then(res => res.json())
      .then(data => {
        // console.log(data);
        //Create array of all currencies
        const currencies = data.map(item => item.ccy);
        //Get base_ccy from first object from data;
        const baseCurrency = data[0].base_ccy;
        //Add baseCurrency to currencies' array as first element
        currencies.unshift(baseCurrency);
        //Assign the first element to be displayed in the interface
        const firstCurrency = currencies[0];
        //Set data in state
        setSaleExchangeRate(data[0].sale);
        setBuyExchangeRate(data[0].buy);
        setCurrencyOptions(currencies);
        setFromCurrency(firstCurrency);
        setToCurrency(currencies[1]);
      });
  }, []);

  //from when we are changing toCurrency or fromCurrency selects)
  useEffect(() => {
    if (toCurrency && fromCurrency) {
      fetch(BASE_URL)
        .then(res => res.json())
        .then(data => {
          if (fromCurrency === toCurrency) {
            return;
          }
          //from UAH to another currency (when we are changing toCurrency select)
          if (fromCurrency === 'UAH') {
            const item = data.find(item => item.ccy === toCurrency);
            const saleExchangeRateOfToCurrency = item.sale;
            setSaleExchangeRate(saleExchangeRateOfToCurrency);
          } else if (fromCurrency !== 'UAH' && toCurrency === 'UAH') {
            //from different currency (NOT UAH) to UAH
            const item = data.find(item => item.ccy === fromCurrency);
            const buyExchangeRateOfToCurrency = item.buy;
            setBuyExchangeRate(buyExchangeRateOfToCurrency);
          } else {
            //from Not-UAH to Not-UAH
            const itemFromCurrency = data.find(
              item => item.ccy === fromCurrency,
            );
            const buyExchangeRateOfToCurrency = itemFromCurrency.buy;
            setBuyExchangeRate(buyExchangeRateOfToCurrency);
            const itemToCurrency = data.find(item => item.ccy === toCurrency);
            const saleExchangeRateOfToCurrency = itemToCurrency.sale;
            setSaleExchangeRate(saleExchangeRateOfToCurrency);
          }
        });
    }
  }, [toCurrency, fromCurrency]);

  function handleFromAmountChange(e) {
    setAmount(e.target.value);
    setAmountInFromCurrency(true);
  }

  function handleToAmountChange(e) {
    setAmount(e.target.value);
    setAmountInFromCurrency(false);
  }

  return (
    <>
      <h1>Convert</h1>
      <p>Продаю</p>
      <CurrencyRow
        currencyOptions={currencyOptions}
        selectedCurrency={fromCurrency}
        onChangeCurrency={e => setFromCurrency(e.target.value)}
        onChangeAmount={handleFromAmountChange}
        amount={fromAmount}
      />
      <div className="equals">=</div>
      <p>Покупаю</p>
      <CurrencyRow
        currencyOptions={currencyOptions}
        selectedCurrency={toCurrency}
        onChangeCurrency={e => setToCurrency(e.target.value)}
        onChangeAmount={handleToAmountChange}
        amount={toAmount}
      />
    </>
  );
}

export default App;
