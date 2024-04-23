import React, { useState, useEffect } from 'react';
import { Table, Burger, Drawer, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router-dom';

interface SearchFavouriteItem {
	id: string;
	firstname: string;
	surname: string;
	year: number;
	category: string;
	motivation: string;
	share: number;
}

const Favourite: React.FC = () => {
	const colors = ["#ecf5e8", "#c6dbf0"];
	const [opened, { open, close }] = useDisclosure(false);
	const [searches, setSearches] = useState<SearchFavouriteItem[]>([]);

	useEffect(() => {
		const searchFavourite: string = localStorage.getItem('favourites') || '[]';
		const parsedSearches: SearchFavouriteItem[] = JSON.parse(searchFavourite).reverse();
		setSearches(parsedSearches);
	}, []);

	const removeFromFavorites = (id: string) => {
		const favorites: SearchFavouriteItem[] = JSON.parse(localStorage.getItem('favourites') || '[]');

		const updatedFavorites = favorites.filter(item => item.id !== id);

		localStorage.setItem('favourites', JSON.stringify(updatedFavorites));

		setSearches(updatedFavorites);
	};

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
					<h1>Favourites</h1>
				</div>
				<div className="favourites">
					<Table>
						<Table.Tbody>
							{searches.map((search, index) => (
								<Table.Tr style={{ backgroundColor: colors[index % colors.length] }} key={index}>
									<Table.Td>
										<div>
											<h4>First Name:</h4>
											<span>{search.firstname}</span>
										</div>
										{search.surname && (
											<div>
												<h4>Surname:</h4>
												<span>{search.surname}</span>
											</div>
										)}
										<div>
											<h4>Motivation:</h4>
											<span>{search.motivation}</span>
										</div>
										<div>
											<h4>Year:</h4>
											<span>{search.year}</span>
										</div>
										<div>
											<h4>Category:</h4>
											<span>{search.category}</span>
										</div>
										{search.share && (
											<div>
												<h4>Prize Share:</h4>
												<span>
													Received
													{search.share === 1 ? " Full" :
														search.share === 2 ? " a Half" :
														search.share === 3 ? " a Third" :
														search.share === 4 ? " a Quarter" : ''}
												</span>
											</div>
										)}
										<div className="favourites-button-remove">
											<Button color="#ff9f59" onClick={() => removeFromFavorites(search.id)} size="xs">Remove</Button>
										</div>
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

export default Favourite;

