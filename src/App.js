import React, { useState, useEffect } from "react";
import './App.css';
import MoreInfo, { MoreInfoWrapper } from './components/moreInfo'
import Threshold from './components/threshold';
import ColorPicker from './components/colorPicker';
import ToggleButton from './components/toggleButton';

import styles from "./app.module.css";

/*global chrome*/

function App() {
  // The threshold and color values are automatically updated
  // by the components that control them:
  const [threshold, setThreshold] = useState(0);
  const [color, setColor] = useState('red');

  /**
   * This configuration of useEffect is similiar to componentDidMount () 
   * in class components.
   * 
   * When the app loads, we want to read the stored color from local storage, if
   * it exists. Otherwise, use the default color (first color)
   */
  useEffect(() => {


    // Try to load the color from local storage
    chrome.storage.sync.get(`sb-censor-color`, (res) => {
      console.log(`Loading color => `, res);
      setColor(res["sb-censor-color"]);
    });

  }, []);

  /**
   * useEffect
   * docs => https://reactjs.org/docs/hooks-effect.html
   * useEffect allows the execution of functions after a state change.
   *
   * In this case, the anonymous function defined as the first parameter
   * of useEffect will be executed anytime the [color] state variable
   * changes.
   *
   * The 2nd argument is a dependency list, which states all variables that
   * will be state changes will be listened for.
   */
  useEffect(() => {

    // When the color changes, send the message to the chrome tabs
    /**
     * Google Chrome Message Passing
     * docs => https://chrome-apps-doc2.appspot.com/extensions/messaging.html
     */

    // Send a message to the background script with the color
    // and spoiler threshold values:
    chrome.runtime.sendMessage({ color: color, threshold: threshold }, function (response) {
      // Log the background's response:
      console.log(response.farewell);
    });

    chrome.tabs.getSelected(null, (tab) => {
      chrome.tabs.sendMessage(tab.id, { sbCensorColor: color }, (response) => {
        console.log(response);
      });
    });

    // Whenever the color changes, also update the color in the
    // local storage
    chrome.storage.sync.set({ "sb-censor-color": color }, () => {
      console.log(`Color (${color}) successfully saved in local storage!`);
    });

  }, [color]);

  return (
    <div className="App">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid rgba(0, 0, 0, 0.2)`, padding: `10px 10px` }}>
        {/* TODO put logo here */}
        <div style={{ width: '30px', height: '30px', backgroundColor: `rgba(0, 0, 0, 0.3)`, marginRight: '10px' }} />
        <div style={{ fontWeight: 'bold', transform: `translateY(-2px)` }}>SpoilerBlock</div>
      </div>

      {/* Toggle Disable / Enable */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: `10px 10px`, borderBottom: `1px solid rgba(0, 0, 0, 0.2)`, alignItems: 'center' }}>
        <div style={{ transform: `translateY(-2px)` }}>Toggle Disable / Enable</div>
        <ToggleButton
          onToggle={(toggleState) => {
            console.log(`Button toggled! (new state => ${toggleState})`);
          }}
        />
      </div>

      <div>
        <MoreInfoWrapper infoType={'threshold'}><Threshold update={setThreshold} /></MoreInfoWrapper>
        <MoreInfoWrapper infoType={'threshold'}><ColorPicker colors={['#FF4747', '#474FFF', '#12A43B', '#E78225', '#A262E2']} update={setColor} /></MoreInfoWrapper>
      </div>
    </div>
  );
}

export default App;
