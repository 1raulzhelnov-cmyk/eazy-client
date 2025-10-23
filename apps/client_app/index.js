/**
 * @format
 */

import {AppRegistry} from 'react-native';
import 'react-native-gesture-handler';
import Config from 'react-native-config';
// Access at startup to ensure .env loads
// eslint-disable-next-line no-console
console.log('ENV API_URL:', Config.API_URL);
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
