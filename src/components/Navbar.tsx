import React from 'react';
import { Link } from 'react-router-dom';
import { Burger } from '@mantine/core';

interface NavbarProps {
	openDrawer: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ openDrawer }) => {
	return (
		<header>
			<nav className="navbar">
				<Link to="/" style={{ textDecoration: 'none' }}>
					<div className="logo">
						<img src="/apple-touch-icon.png" alt="Nobel Prize" className="logo-icon" />
					</div>
				</Link>
				<div className="menu-toggle">
					<Burger color="white" onClick={openDrawer} aria-label="Toggle navigation" />
				</div>
			</nav>
		</header>
	);
};

export default Navbar;
