import {createStore,combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
//import logger from 'redux-logger';
import React from 'react';
import ReactDOM from 'react-dom';
import './bootstrap.css';
import './index.css';
import rootReducer from "./reducers";
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

const store = createStore(
    combineReducers({
        rootReducer
    }),
    {},
    applyMiddleware(thunk)
);


ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById("root")
);

export default store;
