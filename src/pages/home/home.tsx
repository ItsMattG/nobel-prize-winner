import { useState } from 'react';
import { Link } from 'react-router-dom';

import { getDocs, query, where, QuerySnapshot, DocumentData, collectionGroup } from 'firebase/firestore';
import { firestore } from '../../firebase';

import { IconSearch, IconAward, IconMoodSad, IconHeartFilled, IconHeart, IconInfoCircle } from '@tabler/icons-react';

import { Select, Input, Button, Table, Pagination, MultiSelect, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import DrawerMenu from '../../components/DrawerMenu/DrawerMenu';
import Navbar from '../../components/navbar/navbar';

import '@mantine/core/styles.css';
import './home.css';

interface SearchParams {
	searchQuery: string;
	selectedCategory: string | null;
	selectedFromYear: number | null;
	selectedToYear: number | null;
	selectedNoWinner: boolean;
	selectedIsOrganisation: boolean;
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

const Home = () => {
	const [opened, { open, close }] = useDisclosure(false);
	const itemsPerPage: number = 6;
	const numberOfSkeletonRows: number = 6;

	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [selectedFromYear, setSelectedFromYear] = useState<number | null>(null);
	const [selectedToYear, setSelectedToYear] = useState<number | null>(null);
	const [selectedNoWinner, setSelectedNoWinner] = useState<boolean>(false);
	const [selectedIsOrganisation, setSelectedIsOrganisation] = useState<boolean>(false);

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasSearched, setHasSearched] = useState<boolean>(false);
	const [searchResults, setSearchResults] = useState<Laureate[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [showAlert, setShowAlert] = useState(false);

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
				{Array.from({ length: numberOfSkeletonRows }).map((_, index) => (
					<SkeletonRow key={index} />
				))}
			</Table.Tbody>
		</Table>
	);

	const toggleFavourite = (item: Laureate) => {
		let favourites: Laureate[] = JSON.parse(localStorage.getItem('favourites') || '[]');

		const isFavourite = favourites.some(favourite => favourite.id === item.id);

		if (isFavourite) {
			favourites = favourites.filter(favourite => favourite.id !== item.id);
			item.isFavourite = false;
		} else {
			favourites.push(item);
			item.isFavourite = true;
		}

		localStorage.setItem('favourites', JSON.stringify(favourites));
		setSearchResults([...searchResults]);
	};

	const addToHistory = (searchParams: SearchParams) => {
		const existingHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

		const updatedHistory: SearchParams[] = [...existingHistory, searchParams];
		localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const getSlicedPrizeWinners = (): Laureate[] => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return searchResults.slice(startIndex, endIndex);
	};

	const handleSearch = () => {
		const searchParams: SearchParams = {
			searchQuery,
			selectedCategory,
			selectedFromYear,
			selectedToYear,
			selectedNoWinner,
			selectedIsOrganisation
		};

		try {
			if (!Object.values(searchParams).some(value => value)) {
				setShowAlert(true);
				return;
			}
			setIsLoading(true);
			searchPrizes(searchParams);
			addToHistory(searchParams);
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
	function createSearchQuery(searchParams: SearchParams) {
		const prizesCollectionGroupRef = collectionGroup(firestore, 'laureates');
		let queries = [];

		if (searchParams.searchQuery) {
			queries.push(where('searchTerms', 'array-contains', searchQuery.toLowerCase()));
		}

		if (searchParams.selectedCategory) {
			queries.push(where('category', '==', searchParams.selectedCategory));
		}

		if (searchParams.selectedFromYear !== undefined && searchParams.selectedFromYear !== null && searchParams.selectedToYear !== undefined && searchParams.selectedToYear !== null) {
			queries.push(where('year', '>=', searchParams.selectedFromYear), where('year', '<=', searchParams.selectedToYear));
		} else if (searchParams.selectedFromYear !== undefined && searchParams.selectedFromYear !== null) {
			queries.push(where('year', '>=', searchParams.selectedFromYear));
		} else if (searchParams.selectedToYear !== undefined && searchParams.selectedToYear !== null ) {
			queries.push(where('year', '<=', searchParams.selectedToYear));
		}

		if (searchParams.selectedNoWinner && searchParams.selectedNoWinner === true) {
			queries.push(where('noWinner', '==', searchParams.selectedNoWinner));
		}

		if (searchParams.selectedIsOrganisation && searchParams.selectedIsOrganisation === true) {
			queries.push(where('isOrganisation', '==', searchParams.selectedIsOrganisation));
		}

		return queries.length !== 0 ? query(prizesCollectionGroupRef, ...queries) : null;
	}

	const searchPrizes = async (searchParams: SearchParams) => {
		try {
			const q = createSearchQuery(searchParams);

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
				const favourites: Laureate[] = JSON.parse(localStorage.getItem('favourites') || '[]');
				const resultsWithFavourites = resultsWithQuality.map(result => ({
					...result,
					isFavourite: favourites.some(favourite => favourite.id === result.id)
				}));

				setSearchResults(resultsWithFavourites);
			}
		} catch (error) {
			console.error('Error fetching results:', error);
		}
	};

	return (
		<div className="page-layout">
			<DrawerMenu opened={opened} close={close} />

			<Navbar openDrawer={open} />

			<div className="page-content">
				<div className="page-content__inner">
					{showAlert && (
						<div onClick={() => setShowAlert(false)}>
							<Alert variant="light" color="black" withCloseButton title="Refine your search" icon={<IconInfoCircle />}>
								Please refine your search. Add some filters, have some fun!
							</Alert>
						</div>
					)}
					<div className="page-header">
						<h1>Nobel Prize Winners</h1>
					</div>

					<div className="search-container">
						<div className="search-container__inner">
							<div className="search-container__input-container">
								<Input
									placeholder="Search..."
									size="sm"
									className="search-container__input-container__search-input"
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
									onKeyDown={(event) => {
										if (event.key === 'Enter') {
											handleSearch();
										}
									}}
								/>
								<Button onClick={handleSearch} size="sm" variant="outline">
									<IconSearch color="#ff9f59" />
								</Button>
							</div>

							<div className="filters">
								<div className="filters__category">
									<Select
										placeholder="Category"
										size="sm"
										data={categories}
										onChange={(selectedValue) => setSelectedCategory(selectedValue)}
									/>
									<MultiSelect
										placeholder="Extra Filters"
										className="filters__category__multi-select"
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
										className="year-container__filter"
										data={years}
										onChange={(selectedValue) => {
											setSelectedFromYear(typeof selectedValue === 'string' ? parseInt(selectedValue) : selectedValue);
										}}
									/>
									<Select
										placeholder="To Year"
										size="sm"
										className="year-container__filter"
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

					<div className="winners">
						{isLoading ? (
							<div className="winners__overflow">
								<SkeletonResult />
								<SkeletonTable />
							</div>
						) : searchResults.length === 0 ? (
							<div className="placeholder-search-something">
								<div className="placeholder-search-something__content">
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
									{getSlicedPrizeWinners().map((item, index) => (
										<Table.Tr key={index}>
											<Table.Td>
												<Link to={item.noWinner ? '/' : `/details/${item.id}`} className="link-no-decoration" >
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
													? <IconHeartFilled color="#ff9f59" onClick={() => toggleFavourite(item)} style={{ cursor: 'pointer', height: '20px', width: '20px' }} />
													: <IconHeart color="#ff9f59" onClick={() => toggleFavourite(item)} style={{ cursor: 'pointer', height: '20px', width: '20px' }} />
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
