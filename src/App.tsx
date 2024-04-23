import React from 'react';
import './App.css';
import Home from './pages/home';
import Details from './pages/details';
import History from './pages/history';
import Favourite from './pages/favourite';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
	<Router>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/details/:id" element={<Details />} />
			<Route path="/history" element={<History />} />
			<Route path="/favourite" element={<Favourite />} />
		</Routes>
	</Router>
  );
}

export default App;
