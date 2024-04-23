import React from 'react';
import { Table, Burger, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router-dom';

interface SearchHistoryItem {
	searchQuery: string;
	category: string;
	fromYear: number;
	toYear: number | null;
	noWinner: boolean | null;
	isOrganisation: boolean | null;
}

const History: React.FC = () => {
	const [opened, { open, close }] = useDisclosure(false);
	const searchHistory: string = localStorage.getItem('searchHistory') || '[]';
	const searches: SearchHistoryItem[] = JSON.parse(searchHistory).reverse();

	return (
		<div className="big-container">
			<Drawer overlayProps={{ backgroundOpacity: 0.5, blur: 4 }} offset={0} size="xs" radius="md" position="right" opened={opened} onClose={close}>
				<div className="draw-content">
					<Link to="/favourites" style={{ textDecoration: 'none' }}>
						<div>
							<h3>Favourites</h3>
						</div>
					</Link>
					<Link to="/history" style={{ textDecoration: 'none' }}>
						<div>
							<h3>Search History</h3>
						</div>
					</Link>
				</div>
			</Drawer>

			<header>
				<nav className="navbar">
					<Link to="/" style={{ textDecoration: 'none' }}>
						<div className="logo">
							<img src="/apple-touch-icon.png" alt="Nobel Prize" className="logo-icon" />
						</div>
					</Link>
					<div className="menu-toggle">
						<Burger color="white" onClick={open} aria-label="Toggle navigation" />
					</div>
				</nav>
			</header>

			<div className="smaller-container">
				<div className="container-header">
					<h1>Search History</h1>
				</div>
				<div className="history">
					<Table>
						<Table.Tbody>
							{searches.map((search, index) => (
								<Table.Tr key={index}>
									<Table.Td>
										<div>
											<h3>Last Search {index + 1}</h3>
										</div>
										{search.searchQuery && (
											<div>
												<h4>Search Query:</h4>
												<span>{search.searchQuery}</span>
											</div>
										)}
										{search.category && (
											<div>
												<h4>Category:</h4>
												<span>{search.category}</span>
											</div>
										)}
										{search.fromYear && (
											<div>
												<h4>From Year:</h4>
												<span>{search.fromYear}</span>
											</div>
										)}
										{search.toYear && (
											<div>
												<h4>To Year:</h4>
												<span>{search.toYear}</span>
											</div>
										)}
										{search.noWinner && (
											<div>
												<h4>No Winner:</h4>
												<span>Yes</span>
											</div>
										)}
										{search.isOrganisation && (
											<div>
												<h4>Is Organisation:</h4>
												<span>Yes</span>
											</div>
										)}
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</div>
			</div>
		</div>
	);
};

export default History;
