import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer } from '@mantine/core';
import './DrawerMenu.css';

interface DrawerMenuProps {
	opened: boolean;
	close: () => void;
}

const DrawerMenu: React.FC<DrawerMenuProps> = ({ opened, close }) => {
	return (
		<Drawer overlayProps={{ backgroundOpacity: 0.5, blur: 4 }} offset={0} size="xs" radius="md" position="right" opened={opened} onClose={close}>
			<div className="draw-content">
				<Link to="/favourite" className="link-no-decoration">
					<div>
						<h3>Favourites</h3>
					</div>
				</Link>
				<Link to="/history" className="link-no-decoration">
					<div>
						<h3>Search History</h3>
					</div>
				</Link>
			</div>
		</Drawer>
	);
};

export default DrawerMenu;
