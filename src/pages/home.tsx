import React, { useState, useEffect } from 'react';
import { getDocs, query, where, QuerySnapshot, DocumentData, collectionGroup } from 'firebase/firestore';
import { firestore } from '../firebase';
import prizesData from '../newfile.json';
import { IconSearch, IconAward, IconMoodSad, IconHeartFilled, IconHeart, IconInfoCircle } from '@tabler/icons-react';
import { Select, Input, Button, Table, Pagination, Burger, MultiSelect, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import { Link } from 'react-router-dom';
import DrawerMenu from '../components/DrawerMenu'

interface SearchHistoryItem {
	searchQuery: string | null;
	category: string | null;
	fromYear: number | null;
	toYear: number | null;
	noWinner: boolean | null;
	isOrganisation: boolean | null;
}

// interface Prize {
// 	year: string;
// 	category: string;
// 	overallMotivation?: string;
// 	laureates: Laureate[];
// }

// interface NoPrizeAwardedEntry {
// 	year: string;
// 	category: string;
// 	overallMotivation: string;
// }

// interface Laureate {
// 	id: string;
// 	firstname: string;
// 	surname?: string;
// 	motivation: string;
// 	share: string;
// 	isOrganisation?: boolean;
// }

interface LaureateV2 {
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
	const [searchResults, setSearchResults] = useState<LaureateV2[]>([]);
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

	// const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
	// 	const { value } = event.target;
	// 	setSearchQuery(value);

	// 	fetchSuggestions(value);
	// };

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Function to slice the suggestions array based on current page and items per page
	const getSlicedSuggestions = (): LaureateV2[] => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return searchResults.slice(startIndex, endIndex);
	};

	// const fetchSuggestions = async (value: string) => {
	// 	try {
	// 		const prizesCollectionGroupRef = collectionGroup(firestore, 'laureates');
	// 		const searchTerms = value.toLowerCase().split(' ');
	// 		const queryPromises = searchTerms.map(term =>
	// 			getDocs(query(prizesCollectionGroupRef, where('searchTerms', 'array-contains', term)))
	// 		);

	// 		const querySnapshots = await Promise.all(queryPromises);
	// 		const suggestions: SuggestionsItem[] = [];

	// 		querySnapshots.forEach(snapshot => {
	// 			snapshot.forEach(doc => {
	// 				const data = doc.data();
	// 				const fullName = data.surname ? `${data.firstname} ${data.surname}` : data.firstname;
	// 				suggestions.push({ fullName: fullName, motivation: data.motivation });
	// 			});
	// 		});

	// 		// Sort the suggestions based on the custom logic
	// 		suggestions.sort((a, b) => {
	// 			const aFullName = 'fullName' in a ? a.fullName : '';
	// 			const bFullName = 'fullName' in b ? b.fullName : '';

	// 			const aFirstNameStartsWith = aFullName.toLowerCase().startsWith(value.toLowerCase());
	// 			const bFirstNameStartsWith = bFullName.toLowerCase().startsWith(value.toLowerCase());
	// 			const aLastNameStartsWith = aFullName.toLowerCase().endsWith(value.toLowerCase());
	// 			const bLastNameStartsWith = bFullName.toLowerCase().endsWith(value.toLowerCase());

	// 			if (aFirstNameStartsWith && !bFirstNameStartsWith) {
	// 				return -1; // a should come before b
	// 			} else if (!aFirstNameStartsWith && bFirstNameStartsWith) {
	// 				return 1; // b should come before a
	// 			} else if (aLastNameStartsWith && !bLastNameStartsWith) {
	// 				return -1; // a should come before b
	// 			} else if (!aLastNameStartsWith && bLastNameStartsWith) {
	// 				return 1; // b should come before a
	// 			} else {
	// 				return 0; // keep the order unchanged
	// 			}
	// 		});
	// 		setSuggestions(suggestions);
	// 	} catch (error) {
	// 		console.error('Error fetching suggestions:', error);
	// 	}
	// };

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

	function calculateQualityOfMatch(query: string, laureates: LaureateV2[]): LaureateV2[] {
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

				const results: LaureateV2[] = [];
				querySnapshot.forEach(doc => {
					const laureateData = doc.data() as LaureateV2;
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

	// const getAllLaureates = async () => {
	// 	const laureatesCollectionRef = collectionGroup(firestore, 'laureates');
	// 	const laureatesQuerySnapshot = await getDocs(laureatesCollectionRef);

	// 	const laureatesData: Laureate[] = [];
	// 	laureatesQuerySnapshot.forEach((doc) => {
	// 		laureatesData.push({ id: doc.id, ...doc.data() } as Laureate);
	// 	});
	// 	return laureatesData;
	// };

	// const getAllPeace = async () => {
	// 	const chemistryCollectionRef = collection(firestore, 'prizes', '2003', 'Chemistry');
	// 	const chemistryDocSnapshot = await getDocs(chemistryCollectionRef);

	// 	let chemistryDocId;
	// 	chemistryDocSnapshot.forEach((doc) => {
	// 		chemistryDocId = doc.id;
	// 	});

	// 	if (chemistryDocId) {
	// 		const laureatesCollectionRef = collection(firestore, 'prizes', '2003', 'Chemistry', chemistryDocId, 'laureates');
	// 		const querySnapshot = await getDocs(laureatesCollectionRef);
	// 		const laureatesData: DocumentData[] = [];
	// 		querySnapshot.forEach((doc) => {
	// 			laureatesData.push(doc.data());
	// 		});
	// 	} else {
	// 		console.error('Chemistry document not found in 2003 prize');
	// 	}
	// };

	// const savePrizesData = async () => {
	// 	try {
	// 		const data = prizesData;

	// 		if (data && data.prizes) {
	// 			const prizesData: (Prize | NoPrizeAwardedEntry)[] = data.prizes;
	// 			for (let i = 0; i < prizesData.length; i++) {
	// 				const prize = prizesData[i];

	// 				if (validateData(prize)) {
	// 					if ('laureates' in prize) {
	// 						// Prize object
	// 						const validatedPrize = prize as Prize;
	// 						if (validatePrize(validatedPrize)) {
	// 							await insertPrizeIntoFirestore(validatedPrize);
	// 						} else {
	// 							console.error('Invalid prize data:', validatedPrize);
	// 						}
	// 					} else {
	// 						// NoPrizeAwardedEntry object
	// 						const validatedNoPrize = prize as NoPrizeAwardedEntry;
	// 						if (validateNoPrize(validatedNoPrize)) {
	// 							await insertNoPrizeIntoFirestore(validatedNoPrize);
	// 						} else {
	// 							console.error('Invalid no prize data:', validatedNoPrize);
	// 						}
	// 					}
	// 				} else {
	// 					console.error('Invalid data:', prize);
	// 				}
	// 			}
	// 			console.log('Data insertion completed successfully.');
	// 		} else {
	// 			console.error('Failed to fetch prizes data.');
	// 		}
	// 	} catch (error) {
	// 		console.error('Error fetching or inserting data into Firestore:', error);
	// 	}
	// };

	// const validatePrize = (prize: Prize): boolean => {
	// 	return (
	// 		typeof prize.year === 'string' &&
	// 		typeof prize.category === 'string' &&
	// 		prize.overallMotivation ? typeof prize.overallMotivation === 'string' : true &&
	// 		Array.isArray(prize.laureates) &&
	// 		prize.laureates.every(validateLaureate)
	// 	);
	// };

	// const validateLaureate = (laureate: Laureate): boolean => {
	// 	return (
	// 		typeof laureate.id === 'string' &&
	// 		typeof laureate.firstname === 'string' &&
	// 		laureate.surname ? typeof laureate.surname === 'string' : true &&
	// 		typeof laureate.motivation === 'string' &&
	// 		typeof laureate.share === 'string' &&
	// 		laureate.isOrganisation ? typeof laureate.isOrganisation === 'boolean' : true
	// 	);
	// };

	// const validateNoPrize = (noPrize: NoPrizeAwardedEntry): boolean => {
	// 	return (
	// 		typeof noPrize.year === 'string' &&
	// 		typeof noPrize.category === 'string' &&
	// 		typeof noPrize.overallMotivation === 'string'
	// 	);
	// };

	// const validateData = (data: Prize | NoPrizeAwardedEntry): boolean => {
	// 	if ('laureates' in data) {
	// 		const prize = data as Prize;
	// 		return validatePrize(prize);
	// 	} else {
	// 		const noPrize = data as NoPrizeAwardedEntry;
	// 		return validateNoPrize(noPrize);
	// 	}
	// };

	// function normalizeString(str: string): string {
	// 	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	// }

	// const insertSearchTermsIntoFirestore = async () => {
	// 	try {
	// 		// Reference to the 'laureates' collection group
	// 		const laureatesCollectionGroupRef = collectionGroup(firestore, 'laureates');

	// 		// Get all documents from the 'laureates' collection group
	// 		const laureatesQuerySnapshot = await getDocs(laureatesCollectionGroupRef);

	// 		// Iterate through each laureate document
	// 		for (const laureateDoc of laureatesQuerySnapshot.docs) {
	// 			const laureateData = laureateDoc.data();
	// 			console.log('Laureate Data:', laureateData);

	// 			// Check if firstname and surname properties exist
	// 			if (!laureateData || (!laureateData.firstname && !laureateData.surname)) {
	// 				console.log('Firstname and surname not found in laureate data.');
	// 				continue; // Skip to the next iteration
	// 			}

	// 			const { firstname, surname } = laureateData;

	// 			// Generate search terms array
	// 			const searchTerms = [];

	// 			// Add full name if available
	// 			if (firstname && surname) {
	// 				const fullName = normalizeString(firstname + ' ' + surname).toLowerCase();
	// 				searchTerms.push(fullName);
	// 			}

	// 			// Add individual substrings for firstname
	// 			if (firstname) {
	// 				const firstNameSubString: string[] = [];
	// 				for (let i = 0; i < firstname.length - 2; i++) {
	// 					for (let j = i + 3; j <= firstname.length; j++) {
	// 						const substring = normalizeString(firstname.substring(i, j)).toLowerCase();
	// 						if (!firstNameSubString.includes(substring)) {
	// 							firstNameSubString.push(substring);
	// 						}
	// 					}
	// 				}
	// 				if (surname) {
	// 					if (firstNameSubString.length > 4) {
	// 						firstNameSubString.splice(4);
	// 					}
	// 				}
	// 				searchTerms.push(...firstNameSubString.slice(0, 9));
	// 			}

	// 			// Add individual substrings for surname
	// 			if (surname) {
	// 				const surNameSubString: string[] = [];
	// 				for (let i = 0; i < surname.length - 2; i++) {
	// 					for (let j = i + 3; j <= surname.length; j++) {
	// 						const substring = normalizeString(surname.substring(i, j)).toLowerCase();
	// 						if (!surNameSubString.includes(substring)) {
	// 							surNameSubString.push(substring);
	// 						}
	// 					}
	// 				}
	// 				if (surNameSubString.length > 4) {
	// 					surNameSubString.splice(4);
	// 				}
	// 				searchTerms.push(...surNameSubString.slice(0, 9));
	// 			}

	// 			// Update laureate document with searchTerms
	// 			const laureateDocRef = laureateDoc.ref;
	// 			await updateDoc(laureateDocRef, { searchTerms });

	// 			// Output search terms for the current laureate
	// 			console.log('Search terms for', firstname, surname + ':', searchTerms);
	// 		}

	// 		console.log('Search terms inserted into Firestore successfully.');
	// 	} catch (error) {
	// 		console.error('Error inserting search terms into Firestore:', error);
	// 	}
	// };

	// const insertYearAndCategoryIntoFireStore = async (): Promise<void> => {
	// 	try {
	// 		for (const prize of prizesData.prizes) {
	// 			const { year, category, laureates } = prize;
	// 			// if (!laureates && year && category) {
	// 			// 	console.log('year', year);
	// 			// 	console.log('category', category);
	// 			// 	console.log('overallMotivation', overallMotivation);

	// 			// 	const parsedYear = parseInt(year, 10); // Parse the year string to a number

	// 			// 	// Prize has no laureates, create a new document under a 'laureates' subcollection
	// 			// 	const prizeRef = doc(collection(firestore, 'prizes', parsedYear.toString(), category));
	// 			// 	const laureatesCollectionRef = collection(prizeRef, 'laureates');

	// 			// 	// Generate a unique ID for the new document
	// 			// 	const newDocumentRef = doc(laureatesCollectionRef);

	// 			// 	// Set the document data with 'noWinner', 'year', and 'category' fields
	// 			// 	await setDoc(newDocumentRef, { noWinner: true, year: parsedYear, category });

	// 			// 	console.log(`Document created for prize with no laureates: Year ${parsedYear}, Category ${category}`);
	// 			// }
	// 			if (laureates && laureates.length > 0) {
	// 				for (const laureate of laureates) {
	// 					const laureateId = laureate.id;

	// 					const parsedYear = parseInt(year);

	// 					const laureateQuery = query(
	// 						collectionGroup(firestore, 'laureates'),
	// 						where('id', '==', laureateId)
	// 					);
	// 					const laureateQuerySnapshot = await getDocs(laureateQuery);
	// 					console.log('laureate', laureate)
	// 					// Check if the document exists
	// 					if (!laureateQuerySnapshot.empty) {
	// 						// Iterate through the matching documents (there should be only one)
	// 						laureateQuerySnapshot.forEach(async (doc) => {
	// 							const data = doc.data();

	// 							// Check if the year field is a string
	// 							if (data.parsedYear) {
	// 								// Delete the parsedYear field
	// 								delete data.parsedYear;

	// 								// Update the document without the parsedYear field
	// 								await updateDoc(doc.ref, { ...data, parsedYear: deleteField() });
	// 							}
	// 						});
	// 					} else {
	// 						console.log(`No matching document found for laureate ID ${laureateId}`);
	// 					}
	// 				}
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.error('Error inserting search terms into Firestore:', error);
	// 	}
	// };

	// const insertPrizeIntoFirestore = async (prize: Prize) => {
	// 	const prizesRef = collection(firestore, 'prizes');

	// 	// Create a document reference for the year
	// 	const prizeDocRef = doc(prizesRef, prize.year);

	// 	// Check if the document exists
	// 	const prizeDocSnapshot = await getDoc(prizeDocRef);

	// 	// If the document doesn't exist, create it
	// 	if (!prizeDocSnapshot.exists()) {
	// 		await setDoc(prizeDocRef, {}); // You can set any data you want for the document here
	// 		console.log(`Document ${prize.year} created successfully.`);
	// 	}

	// 	// Create a new document for the category
	// 	const prizeCollectionRef = collection(prizeDocRef, prize.category);
	// 	const categoryDocRef = doc(prizeCollectionRef);

	// 	// Check if the document exists
	// 	const categoryDocSnapshot = await getDoc(categoryDocRef);

	// 	// If the document doesn't exist, create it
	// 	if (!categoryDocSnapshot.exists()) {
	// 		await setDoc(categoryDocRef, {}); // You can set any data you want for the document here
	// 		console.log(`Document ${prize.category} created successfully.`);
	// 	}

	// 	// Create a subcollection for laureates
	// 	const laureatesCollectionRef = collection(categoryDocRef, 'laureates');

	// 	// Insert laureates into the subcollection
	// 	for (const laureate of prize.laureates) {
	// 		// Convert share to numeric
	// 		const shareNumeric = Number(laureate.share);
	// 		await addDoc(laureatesCollectionRef, { ...laureate, share: shareNumeric });
	// 	}

	// 	// Check if overallMotivation exists
	// 	if (prize.overallMotivation) {
	// 		// Set the overallMotivation field for the category document
	// 		await setDoc(categoryDocRef, { overallMotivation: prize.overallMotivation });
	// 	}

	// 	console.log('Prize inserted into Firestore successfully.');
	// };

	// const insertNoPrizeIntoFirestore = async (noPrize: NoPrizeAwardedEntry) => {
	// 	const prizesRef = collection(firestore, 'prizes');

	// 	// Create a document reference for the year
	// 	const prizeDocRef = doc(prizesRef, noPrize.year);

	// 	// Check if the document exists
	// 	const prizeDocSnapshot = await getDoc(prizeDocRef);

	// 	// If the document doesn't exist, create it
	// 	if (!prizeDocSnapshot.exists()) {
	// 		await setDoc(prizeDocRef, {}); // You can set any data you want for the document here
	// 		console.log(`Document ${noPrize.year} created successfully.`);
	// 	}

	// 	// Create a new document for the category
	// 	const noPrizeCollectionRef = collection(prizeDocRef, noPrize.category);
	// 	const noPrizeDocRef = doc(noPrizeCollectionRef);

	// 	// Set the overallMotivation field for the category document
	// 	await setDoc(noPrizeDocRef, { overallMotivation: noPrize.overallMotivation });

	// 	console.log('No prize awarded entry inserted into Firestore successfully.');
	// };


	return (
		<div className="big-container">
			<DrawerMenu opened={opened} close={close} />

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

											// Initialize variables to track deselected options
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
															{'category' in item && (
																<h4>{item.category} - {item.year}</h4>
															)}
															{'overallMotivation' in item && (
																<span>{item.overallMotivation}</span>
															)}
														</>
													) : (
														<>
															{'firstname' in item && (
																<h4>{item.firstname} {item.surname ? item.surname : ''} - {item.year} {item.category}</h4>
															)}
															{'motivation' in item && (
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
