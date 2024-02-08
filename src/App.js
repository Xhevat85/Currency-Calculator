import React, { useState, useEffect } from 'react';
import './Calculator.css';

const Calculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState({ amount: 0, from: '', to: '' });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [exchangeCurrency, setExchangeCurrency] = useState('');
  const [exchangeResult, setExchangeResult] = useState({ amount: 0, from: '', to: '' });
  const [showExchange, setShowExchange] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});
  const [showCurrencyList, setShowCurrencyList] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (exchangeResult.amount !== 0) {
      setResult(exchangeResult);
    }
  }, [exchangeResult]);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      const currenciesList = Object.keys(data.rates);
      setCurrencies(currenciesList);
      setExchangeRates(data.rates);
    } catch (error) {
      console.error('Fehler beim Abrufen der Währungen:', error);
    }
  };

  const handleButtonClick = (value) => {
    setInput((prevInput) => prevInput + value);
  };

  const calculateExpression = (expression) => {
    try {
      const operators = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
      };

      const parts = expression.match(/(\d+(\.\d+)?|\S)/g);
      const stack = [];
      let currentOperator = null;

      parts.forEach((part) => {
        if (operators[part]) {
          currentOperator = part;
        } else {
          const number = parseFloat(part);
          if (currentOperator) {
            const prevNumber = stack.pop();
            const result = operators[currentOperator](prevNumber, number);
            stack.push(result);
            currentOperator = null;
          } else {
            stack.push(number);
          }
        }
      });

      return stack[0];
    } catch (error) {
      return 'Fehler';
    }
  };

  const handleCalculate = () => {
    if (input.trim() !== '') {
      const currentResult = calculateExpression(input);
      setResult({ amount: currentResult, from: '', to: '' });
      setHistory((prevHistory) => [...prevHistory, { input, result: currentResult }]);
    }
  };

  const handleReset = () => {
    setInput('');
    setResult({ amount: 0, from: '', to: '' });
  };

  const handleHistory = () => {
    setShowHistory((prevShowHistory) => !prevShowHistory);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleCurrencyExchange = async () => {
    try {
      if (input.trim() !== '' && !isNaN(parseFloat(input))) {
        // Eine Anfrage wird gesendet, um den Wechselkurs von der API abzurufen
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${selectedCurrency}`);
           // Die Antwort der Anfrage wird verarbeitet
        const data = await response.json();
        const exchangeRate = data.rates[exchangeCurrency];
           // Der Wechselbetrag wird berechnet
        const exchangeResult = parseFloat(input) * exchangeRate;
         // Das Ergebnis des Wechsels und der Wechselverlauf werden aktualisiert
        setExchangeResult({ amount: exchangeResult, from: selectedCurrency, to: exchangeCurrency });
        setHistory((prevHistory) => [
          ...prevHistory,
          { input: `${input} ${selectedCurrency} -> ${exchangeResult} ${exchangeCurrency}`, result: exchangeResult },
        ]);
      }
    } catch (error) {
      // Fehlerbehandlung, falls während der Anfrage an die API oder der Verarbeitung der Antwort ein Problem auftritt
      console.error('Fehler beim Währungsumtausch:', error);
    }
  };

  const toggleExchange = () => {
    setShowExchange((prevShowExchange) => !prevShowExchange);
  };

  const handleClearInput = () => {
    setInput(prevInput => prevInput.slice(0, -1));
  };

  const toggleCurrencyList = () => {
    setShowCurrencyList((prevShowCurrencyList) => !prevShowCurrencyList);
  };

  return (
    <div className="calculator">
      <h1 className="calculator-title">Taschenrechner & Währungsumtausch</h1>
      <div className="exchange-section">
        <button className="exchange-button" onClick={toggleExchange}>Währungsumtausch</button>
        {showExchange && (
          <div className="exchange-form">
            <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} className="select-box">
              <option value="">Währung auswählen</option>
              {currencies.map((currency, index) => (
                <option key={index} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <button onClick={() => {
              const temp = selectedCurrency;
              setSelectedCurrency(exchangeCurrency);
              setExchangeCurrency(temp);
            }} className="exchange-arrow">⇅</button>
            <select value={exchangeCurrency} onChange={(e) => setExchangeCurrency(e.target.value)} className="select-box">
              <option value="">Umtausch wählen</option>
              {currencies.map((currency, index) => (
                <option key={index} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <button onClick={handleCurrencyExchange} className="exchange-calculate">Währungs Berechnen</button>

            <button onClick={toggleCurrencyList} className="währungs-list">Währungs Liste</button>
            {showCurrencyList && (
              <div className="currency-list">
                <h3>Aktueller Währungs:</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Währung:</th>
                      <th>Wechselkurs:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(exchangeRates)
                      .sort((a, b) => exchangeRates[a] - exchangeRates[b])
                      .map((currency, index) => (
                        <tr key={index}>
                          <td>{currency}</td>
                          <td>{exchangeRates[currency]}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <button onClick={toggleCurrencyList} className="close-button">X</button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="calculator-display">
        <p className="calculator-result">Ergebnis: {result.amount} {result.to}</p>
        <input className="calculator-input" type="text" value={input} readOnly />
      </div>
      <div className="calculator-buttons">
        <div className="button-row">
          <button className="button number" onClick={() => handleButtonClick('1')}>1</button>
          <button className="button number" onClick={() => handleButtonClick('2')}>2</button>
          <button className="button number" onClick={() => handleButtonClick('3')}>3</button>
          <button className="button operator" onClick={() => handleButtonClick('+')}>+</button>
        </div>
        <div className="button-row">
          <button className="button number" onClick={() => handleButtonClick('4')}>4</button>
          <button className="button number" onClick={() => handleButtonClick('5')}>5</button>
          <button className="button number" onClick={() => handleButtonClick('6')}>6</button>
          <button className="button operator" onClick={() => handleButtonClick('-')}>-</button>
        </div>
        <div className="button-row">
          <button className="button number" onClick={() => handleButtonClick('7')}>7</button>
          <button className="button number" onClick={() => handleButtonClick('8')}>8</button>
          <button className="button number" onClick={() => handleButtonClick('9')}>9</button>
          <button className="button operator" onClick={() => handleButtonClick('*')}>*</button>
        </div>
        <div className="button-row">
          <button className="button number" onClick={() => handleButtonClick('0')}>0</button>
          <button className="button equal" onClick={handleCalculate}>=</button>
          <button className="button clear" onClick={handleReset}>C</button>
          <button className="button operator" onClick={() => handleButtonClick('/')}>/</button>
        </div>
        <div className="button-row">
          <button className="button clear custom-clear-button" onClick={handleClearInput}>←</button>
        </div>
      </div>
      <button className="history-button" onClick={handleHistory}>Verlauf</button>
      {showHistory && (
        <div className="history-section">
          <h2>Verlauf</h2>
          <ul>
            {history.map((item, index) => (
              <li key={index}>
                {item.input} = {item.result}
              </li>
            ))}
          </ul>
          <div className="clear-history-container">
            <button onClick={handleClearHistory} className="clear-history">Verlauf Löschen</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
