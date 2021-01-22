import React from 'react'
import ReactDOM from 'react-dom'
import './assets/styles/styles.scss'
import CssBaseline from '@material-ui/core/CssBaseline'
import App from './App'

ReactDOM.render(
	<React.StrictMode>
		<CssBaseline />
		<App />
	</React.StrictMode>,
	document.getElementById('root')
)
