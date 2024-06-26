import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase';

import { Carousel } from '@mantine/carousel';
import { useDisclosure } from '@mantine/hooks';

import DrawerMenu from '../../components/DrawerMenu/DrawerMenu';
import Navbar from '../../components/navbar/navbar';

import '@mantine/carousel/styles.css';
import './details.css';

interface DetailsParams {
	id: string;
	[key: string]: string | undefined;
}

interface NobelPrizeWinner {
	id: string;
	firstname: string;
	surname: string;
	year: number;
	category: string;
	motivation: string;
	share: number;
}

const Details = () => {
	const colors = ["#ecf5e8", "#c6dbf0"];
	const [opened, { open, close }] = useDisclosure(false);
	const { id } = useParams<DetailsParams>();
	const [winner, setWinner] = useState<NobelPrizeWinner | null>(null);
	const [relatedWinners, setRelatedWinners] = useState<NobelPrizeWinner[]>([]);

	// Fetch winner details on component mount
	useEffect(() => {
		const fetchWinnerDetails = async () => {
			const laureateQuery = query(
				collectionGroup(firestore, 'laureates'),
				where('id', '==', id)
			);

			try {
				const querySnapshot = await getDocs(laureateQuery);
				if (!querySnapshot.empty) {
					const docData = querySnapshot.docs[0].data() as NobelPrizeWinner;
					setWinner(docData);
					fetchRelatedWinners(docData.year, docData.id); // Fetch related winners after setting the winner
				} else {
					console.log('No matching document found');
				}
			} catch (error) {
				console.error('Error fetching winner details:', error);
			}
		};

		fetchWinnerDetails();
	}, [id]);

	const fetchRelatedWinners = async (year: number, excludeId: string) => {
		const relatedQuery = query(
			collectionGroup(firestore, 'laureates'),
			where('year', '==', year),
			where('id', '!=', excludeId) // Exclude the current winner's ID
		);

		try {
			const querySnapshot = await getDocs(relatedQuery);
			const relatedData: NobelPrizeWinner[] = querySnapshot.docs.map(doc => doc.data() as NobelPrizeWinner);
			setRelatedWinners(relatedData);
		} catch (error) {
			console.error('Error fetching related winners:', error);
		}
	};

	return (
		<div className="details-page">
			<DrawerMenu opened={opened} close={close} />

			<Navbar openDrawer={open} />

			<div className="winner">
				{winner && (
					<div className="winner__details-inner">
						<div className="winner__details">
							<div className="winner__header">
								<div className="circle">
									<p className="initials">
										{`${winner.firstname.charAt(0)}${winner.surname ? winner.surname.charAt(0) : ''}`}
									</p>
								</div>

								<div>
									<div>
										<h3>{winner.firstname} {winner.surname ? winner.surname : ''}</h3>
									</div>
									<div>
										<p>{winner.category}</p>
									</div>
									<div>
										<p>{winner.year}</p>
									</div>
								</div>
							</div>

							<div className="winner-name-details">
								<div>
									<h4>Motivation:</h4>
									<p>{winner.motivation}</p>
								</div>

								<div>
									<h4>Prize Share:</h4>
									<p>Received
										{winner.share === 1 ? " Full" :
											winner.share === 2 ? " a Half" :
											winner.share === 3 ? " a Third" :
											winner.share === 4 ? " a Quarter" : ''}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="related-winner-details-container">
					<div className="inner-related-winner-details-container">
						<div>
							<h2>Related Nobel Prize Winners</h2>
						</div>
						<Carousel slideSize="70%" height={200} slideGap="xl" controlsOffset="xs">
							{relatedWinners.map((relatedWinner, index) => (
								<div key={index} className="related-winner__details">
									<Link to={`/details/${relatedWinner.id}`} className="link-no-decoration">
										<Carousel.Slide>
											<div className="square" style={{ backgroundColor: colors[index % colors.length] }}>
												<span className="related-initials">
													{`${relatedWinner.firstname.charAt(0)}${relatedWinner.surname ? relatedWinner.surname.charAt(0) : ''}`}
												</span>
											</div>
										</Carousel.Slide>
									</Link>
								</div>
							))}
						</Carousel>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Details;
