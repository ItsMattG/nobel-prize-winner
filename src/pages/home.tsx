import React, { useState, useEffect } from 'react';
import { getDocs, query, where, QuerySnapshot, DocumentData, collectionGroup } from 'firebase/firestore';
import { firestore } from '../firebase';
import prizesData from '../newfile.json';
import { IconSearch, IconAward, IconMoodSad, IconHeartFilled, IconHeart, IconInfoCircle } from '@tabler/icons-react';
import { Select, Input, Button, Table, Pagination, MultiSelect, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import { Link } from 'react-router-dom';
import DrawerMenu from '../components/DrawerMenu'
import Navbar from '../components/Navbar'

interface SearchHistoryItem {
	searchQuery: string | null;
	category: string | null;
	fromYear: number | null;
	toYear: number | null;
	noWinner: boolean | null;
	isOrganisation: boolean | null;
}

interface Laureate {
	id: string;
	firstname: string;
	surname?: string;
	motivation: string;
	share: number;
	isOrganisation?: boolean;
	overallMotivation?: string;
	searchTerms: string[];
	qualityOfMatch: number;
	year?: number;
	category?: string;
	isFavourite?: boolean;
	noWinner?: boolean;
}

interface FavouriteItem {
	id: string;
	firstname: string;
	surname: string;
	year: number;
	category: string;
	motivation: string;
	share: number;
}


const Home: React.FC = () => {
	const [opened, { open, close }] = useDisclosure(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [selectedFromYear, setSelectedFromYear] = useState<number | null>(null);
	const [selectedToYear, setSelectedToYear] = useState<number | null>(null);
	const [selectedNoWinner, setSelectedNoWinner] = useState<boolean>(false);
	const [selectedIsOrganisation, setSelectedIsOrganisation] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasSearched, setHasSearched] = useState<boolean>(false);
	const [searchResults, setSearchResults] = useState<Laureate[]>([]);
	const [, setSearchHistory] = useState<SearchHistoryItem[]>([]);
	const [, setMotivations] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;
	const [showAlert, setShowAlert] = useState(false);
	const icon = <IconInfoCircle />;

	const handleCloseAlert = () => {
		setShowAlert(false);
	};

	const categories = [
		{ value: 'Chemistry', label: 'Chemistry' },
		{ value: 'Literature', label: 'Literature' },
		{ value: 'Medicine', label: 'Medicine' },
		{ value: 'Peace', label: 'Peace' },
		{ value: 'Physics', label: 'Physics' },
	];

	const years = Array.from({ length: 2023 - 1901 + 1 }, (_, index) => ({
		value: `${1901 + index}`,
		label: `${1901 + index}`,
	}));

	const SkeletonPagination = () => (
		<div className="skeleton-pagination">
			<div className="skeleton-pagination-group">
				<span className="animated-text skeleton-pagination-control"></span>
				<span className="animated-text skeleton-pagination-control"></span>
				<span className="animated-text skeleton-pagination-control"></span>
				<span className="animated-text skeleton-pagination-control"></span>
				<span className="animated-text skeleton-pagination-control"></span>
			</div>
		</div>
	);

	const SkeletonResult = () => (
		<div className="skeleton-result-text__container">
			<span className="animated-text skeleton-result-text skeleton-result-text__body"></span>
		</div>
	);

	const SkeletonRow = () => (
		<Table.Tr>
			<Table.Td className="skeleton-text__container">
				<div className="skeleton-header__container">
					<div className="animated-text skeleton-text skeleton-text__title"></div>
					<div className="animated-text skeleton-heart"></div>
				</div>
				<div className="animated-text skeleton-text skeleton-text__body"></div>
			</Table.Td>
		</Table.Tr>
	);

	const SkeletonTable = () => (
		<Table>
			<Table.Tbody>
				<SkeletonRow />
				<SkeletonRow />
				<SkeletonRow />
				<SkeletonRow />
				<SkeletonRow />
				<SkeletonRow />
			</Table.Tbody>
		</Table>
	);

	const addTofavourites = (item: any) => {
		const favourites: any[] = JSON.parse(localStorage.getItem('favourites') || '[]');

		if (!favourites.some(favourite => favourite.id === item.id)) {
			favourites.push(item);
			item.isFavourite = true;
			localStorage.setItem('favourites', JSON.stringify(favourites));
		}
		setSearchResults([...searchResults]);
	};

	const removeFromFavourites = (item: any) => {
		let favourites: any[] = JSON.parse(localStorage.getItem('favourites') || '[]');

		favourites = favourites.filter(favourite => favourite.id !== item.id);
		item.isFavourite = false;
		localStorage.setItem('favourites', JSON.stringify(favourites));
		setSearchResults([...searchResults]);
	};

	useEffect(() => {
		const extractedMotivations = prizesData.prizes.map((prize: any) => {
			if (prize.laureates) {
				return prize.laureates.map((laureate: any) => laureate.motivation);
			} else {
				return [prize.overallMotivation];
			}
		});
		const flatMotivations = extractedMotivations.flat();
		setMotivations(flatMotivations);
	}, []);


	const addToHistory = (
		searchQuery: string | null = null,
		category: string | null = null,
		fromYear: number | null = null,
		toYear: number | null = null,
		noWinner: boolean | null = null,
		isOrganisation: boolean | null = null
	) => {
		// Create an object containing all the search parameters
		const searchParams: SearchHistoryItem = {
			searchQuery,
			category,
			fromYear,
			toYear,
			noWinner,
			isOrganisation,
		};

		const existingHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

		const updatedHistory: SearchHistoryItem[] = [...existingHistory, searchParams];

		setSearchHistory(updatedHistory);
		localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Function to slice the suggestions array based on current page and items per page
	const getSlicedSuggestions = (): Laureate[] => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return searchResults.slice(startIndex, endIndex);
	};

	const handleSearch = () => {
		try {
			if (!searchQuery && !selectedCategory && !selectedFromYear && !selectedToYear && !selectedNoWinner && !selectedIsOrganisation) {
				setShowAlert(true);
				return;
			}
			setIsLoading(true);
			searchPrizes(searchQuery, selectedCategory, selectedFromYear, selectedToYear, selectedNoWinner, selectedIsOrganisation);
			addToHistory(searchQuery, selectedCategory, selectedFromYear, selectedToYear, selectedNoWinner, selectedIsOrganisation); // Add the search query to history
			setTimeout(() => {
				setIsLoading(false);
				setHasSearched(true);
			}, 1000);
		} catch (error) {
			console.error('Error searching prizes:', error);
			setIsLoading(false);
		}
	};

	function calculateQualityOfMatch(query: string, laureates: Laureate[]): Laureate[] {
		// Calculate quality of match for each laureate
		for (const laureate of laureates) {
			let score = 0;

			// Check if the query matches exactly with firstName or surName
			if (laureate.firstname.toLowerCase() === query.toLowerCase()) {
				score += 3; // Exact firstname match gets the highest score
			} else if (laureate.surname && laureate.surname.toLowerCase() === query.toLowerCase()) {
				score += 2; // Exact lastname match gets a lower score than firstname match
			}

			// Check if the query is a partial match of the firstName
			if (laureate.firstname.toLowerCase().startsWith(query.toLowerCase())) {
				score += 2; // Partial firstname match at the beginning gets a higher score
			} else if (laureate.surname && laureate.surname.toLowerCase().startsWith(query.toLowerCase())) {
				score += 1; // Partial lastname match at the beginning gets a lower score than partial firstname match
			}

			// Check if the query is a substring of any search term
			if (laureate.searchTerms.some(term => term.toLowerCase() === query.toLowerCase())) {
				score += 1; // Exact search term match gets a lower score
			} else if (laureate.searchTerms.some(term => term.toLowerCase().includes(query.toLowerCase()))) {
				score += 1; // Partial search term match gets a lower score
			}

			// Update the quality of match score for the laureate
			laureate.qualityOfMatch = score;
		}

		// Sort laureates based on quality of match (descending order)
		return laureates.sort((a, b) => b.qualityOfMatch - a.qualityOfMatch);
	}

	// Function to create a search query based on multiple criteria
	function createSearchQuery(searchTerm: string | null = null, category: string | null = null, fromYear: number | null = null, toYear: number | null = null, noWinner: boolean | null = null, isOrganisation: boolean | null = null) {
		const prizesCollectionGroupRef = collectionGroup(firestore, 'laureates');
		let queries = [];

		if (searchTerm) {
			queries.push(where('searchTerms', 'array-contains', searchTerm.toLowerCase()));
		}

		if (category) {
			queries.push(where('category', '==', category));
		}

		if (fromYear !== undefined && fromYear !== null && toYear !== undefined && toYear !== null) {
			queries.push(where('year', '>=', fromYear), where('year', '<=', toYear));
		} else if (fromYear !== undefined && fromYear !== null) {
			queries.push(where('year', '>=', fromYear));
		} else if (toYear !== undefined && toYear !== null ) {
			queries.push(where('year', '<=', toYear));
		}

		if (noWinner && noWinner === true) {
			queries.push(where('noWinner', '==', noWinner));
		}

		if (isOrganisation && isOrganisation === true) {
			queries.push(where('isOrganisation', '==', isOrganisation));
		}

		return queries.length !== 0 ? query(prizesCollectionGroupRef, ...queries) : null;
	}

	const searchPrizes = async (searchQuery: string | null = null, category: string | null = null, fromYear: number | null = null, toYear: number | null = null, noWinner: boolean | null = null, isOrganisation: boolean | null = null) => {
		try {
			const q = createSearchQuery(searchQuery, category, fromYear, toYear, noWinner, isOrganisation);

			if (!q) {
				setShowAlert(true);
			} else {
				const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

				const results: Laureate[] = [];
				querySnapshot.forEach(doc => {
					const laureateData = doc.data() as Laureate;
					results.push({ ...laureateData, qualityOfMatch: 0 });
				});

				const resultsWithQuality = searchQuery ? calculateQualityOfMatch(searchQuery, results) : results;
				const favourites: FavouriteItem[] = JSON.parse(localStorage.getItem('favourites') || '[]');
				const resultsWithFavourites = resultsWithQuality.map(result => ({
					...result,
					isFavourite: favourites.some(favourite => favourite.id === result.id)
				}));

				setSearchResults(resultsWithFavourites);
			}
		} catch (error) {
			console.error('Error fetching suggestions:', error);
		}
	};

	return (
		<div className="big-container">
			<DrawerMenu opened={opened} close={close} />

			<Navbar openDrawer={open} />

			<div className="smaller-container">
				<div className="inner-smaller-container">
					{showAlert && (
						<div onClick={handleCloseAlert}>
							<Alert variant="light" color="black" withCloseButton title="Refine your search" icon={icon}>
								Please refine your search. Add some filters, have some fun!
							</Alert>
						</div>
					)}
					<div className="container-header">
						<h1 className="test-font">Nobel Prize Winners</h1>
					</div>

					<div className="search-container">
						<div className="search-container-inner">
							<div className="search">
								<Input
									placeholder="Search..."
									size="sm"
									className="search-input"
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
									onKeyDown={(event) => {
										if (event.key === 'Enter') {
											handleSearch();
										}
									}}
								/>
								<Button onClick={handleSearch} size="sm" variant="outline" className="search-button">
									<IconSearch color="#ff9f59" />
								</Button>
							</div>

							<div className="filters">
								<div className="cat-org">
									<Select
										placeholder="Category"
										size="sm"
										data={categories}
										onChange={(selectedValue) => setSelectedCategory(selectedValue)}
									/>
									<MultiSelect
										placeholder="Extra Filters"
										className="multi-select"
										data={['Only Organisations', 'No Winners']}
										onChange={(event) => {
											const selectedValues: string[] = event;

											// Track deselected options
											let deselectedIsOrganisation: boolean = selectedIsOrganisation;
											let deselectedNoWinner: boolean = selectedNoWinner;

											// Loop through the selected options
											selectedValues.forEach(selectedValue => {
												if (selectedValue === 'Only Organisations') {
													setSelectedIsOrganisation(true);
													deselectedIsOrganisation = false; // Mark as not deselected
												} else if (selectedValue === 'No Winners') {
													setSelectedNoWinner(true);
													deselectedNoWinner = false; // Mark as not deselected
												}
											});

											// Update the state for deselected options
											if (deselectedIsOrganisation) {
												setSelectedIsOrganisation(false);
											}
											if (deselectedNoWinner) {
												setSelectedNoWinner(false);
											}
										}}
									/>
								</div>

								<div className="year-container">
									<Select
										placeholder="From Year"
										size="sm"
										className="year-filter"
										data={years}
										onChange={(selectedValue) => {
											setSelectedFromYear(typeof selectedValue === 'string' ? parseInt(selectedValue) : selectedValue);
										}}
									/>
									<Select
										placeholder="To Year"
										size="sm"
										className="year-filter"
										data={years}
										onChange={(selectedValue) => {
											setSelectedToYear(typeof selectedValue === 'string' ? parseInt(selectedValue) : selectedValue);
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					{!isLoading && searchResults.length > 0 && (
						<div className="results-badge-container">
							<span className="results-badge">
								Results: { searchResults.length }
							</span>
						</div>
					)}

					<div className="suggestions">
						{isLoading ? (
							<div className="overflow">
								<SkeletonResult />
								<SkeletonTable />
							</div>
						) : searchResults.length === 0 ? (
							<div className="placeholder-search-something">
								<div className="placeholder-search-something-content">
									<p>{!hasSearched ? 'Search for something...' : 'No results matching search.'}</p>
									<div>
										{!hasSearched
											? <IconAward style={{ height: '170px', width: '170px' }} />
											: <IconMoodSad style={{ height: '170px', width: '170px' }} />
										}
									</div>
								</div>
							</div>
						) : (
							<Table withRowBorders={false}>
								<Table.Tbody>
									{getSlicedSuggestions().map((item, index) => (
										<Table.Tr key={index}>
											<Table.Td>
												<Link to={item.noWinner ? '/' : `/details/${item.id}`} style={{ textDecoration: 'none' }}>
													{item.overallMotivation ? (
														<>
															{item.category && (
																<h4>{item.category} - {item.year}</h4>
															)}
															{item.overallMotivation && (
																<span>{item.overallMotivation}</span>
															)}
														</>
													) : (
														<>
															{item.firstname && (
																<h4>{item.firstname} {item.surname ? item.surname : ''} - {item.year} {item.category}</h4>
															)}
															{item.motivation && (
																<span>{item.motivation}</span>
															)}
														</>
													)}
												</Link>
											</Table.Td>
											<Table.Td>
												{item.isFavourite
													? <IconHeartFilled color="#ff9f59" onClick={() => removeFromFavourites(item)} style={{ cursor: 'pointer', height: '20px', width: '20px' }} />
													: <IconHeart color="#ff9f59" onClick={() => addTofavourites(item)} style={{ cursor: 'pointer', height: '20px', width: '20px' }} />
												}
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						)}
					</div>

					<div className="pagination">
						{isLoading ? (
							<SkeletonPagination />
						) : !isLoading && searchResults.length > 0 && (
							<Pagination
								total={Math.ceil(searchResults.length / itemsPerPage)}
								value={currentPage}
								onChange={handlePageChange}
								mt="sm"
								color="#ff9f59"
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
