import React from 'react';
import { Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import DrawerMenu from '../components/DrawerMenu'
import Navbar from '../components/Navbar'

interface SearchHistoryItem {
	searchQuery: string;
	selectedCategory: string;
	selectedFromYear: number;
	selectedToYear: number;
	selectedNoWinner: boolean;
	selectedIsOrganisation: boolean;
}

const History: React.FC = () => {
	const [opened, { open, close }] = useDisclosure(false);
	const searchHistory: string = localStorage.getItem('searchHistory') || '[]';
	const searches: SearchHistoryItem[] = JSON.parse(searchHistory).reverse();

	return (
		<div className="big-container">
			<DrawerMenu opened={opened} close={close} />

			<Navbar openDrawer={open} />

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
										{search.selectedCategory && (
											<div>
												<h4>Category:</h4>
												<span>{search.selectedCategory}</span>
											</div>
										)}
										{search.selectedFromYear && (
											<div>
												<h4>From Year:</h4>
												<span>{search.selectedFromYear}</span>
											</div>
										)}
										{search.selectedToYear && (
											<div>
												<h4>To Year:</h4>
												<span>{search.selectedToYear}</span>
											</div>
										)}
										{search.selectedNoWinner && (
											<div>
												<h4>No Winner:</h4>
												<span>Yes</span>
											</div>
										)}
										{search.selectedIsOrganisation && (
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
