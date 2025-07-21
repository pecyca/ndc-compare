import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';

// TEMP: Orange Book testing
import { compareOrangeBookTE } from './utils/orangeBook.js';

(async () => {
    const result = await compareOrangeBookTE('0004-0012', '65162-080');
    console.log('🟧 Orange Book Test:', result);
})();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
