import searchLogo from './search.svg'
// from https://freesvg.org/room-interior
import roomBackground from './saladeestar.svg'
import { useState, useEffect } from 'react';
import realtime from './firebase'
import { ref, onValue, push, update } from "firebase/database";
import './App.css';

function App() {
	const [comments, setComments] = useState([])
	const [currentLocation, setCurrentLocation] = useState('comments/')
	const [formUser, setFormUser] = useState('')
	const [formComment, setFormComment] = useState('')
	// console.log("testing: ", currentLocation);

	useEffect(() => {
		// console.log("starting onvalue again because db changed");
		const foundDb = ref(realtime, 'comments/')
		onValue(foundDb, (snapshot) => {
			// console.log("during onvalue, current location: " + currentLocation);
			const myData = snapshot.val()
			const commentArray = []
			// console.log("during onvalue, my data: ", myData);
			for (let propertyName in myData) {
				// create a new local object for each loop iteration:
				const userComment = {
					key: propertyName,
					newComment: myData[propertyName]
				}
				if (myData[propertyName].user) {
					commentArray.push(userComment)
				}
			}
			setComments(commentArray)
			// console.log("comments: ", commentArray);
		})
	}, [])

	const handleSubmit = (event) => {
		event.preventDefault()
		// form logic
		// add comment to realtime
		// console.log("adding new comment at: " + currentLocation)
		const foundDb = ref(realtime, currentLocation)
		push(foundDb, {
			user: formUser,
			userComment: formComment,
			found: false
		});
		//clear after
		setFormComment('')
	}

	const handleChangeUser = function (event) {
		setFormUser(event.target.value);
	}

	const handleChangeComment = (event) => {
		setFormComment(event.target.value);
	}

	// when a comment is clicked, it is found, and the new current location in the tree is that comment
	// need to stop this from creating a duplicate of itself as a child
	const onFinding = (element) => {
		console.log("element: ", element);
		const oldLocation = currentLocation
		let tempArray = currentLocation.split('/')
		tempArray.pop()
		const currentNode = tempArray.pop()
		if (currentNode !== element.key){

			const newUserInfo = {
				user: element.newComment.user,
				userComment: element.newComment.userComment,
				found: true,
			}
			const newLocation = `${currentLocation}${element.key}/`
			const foundDb = ref(realtime, newLocation)
			update(foundDb, newUserInfo)
			// console.log("during onFinding, new location: " + newLocation)
			if (oldLocation === "comments/") {
	
				setCurrentLocation(newLocation)
			}
		}
		// console.log("during onFinding, current location: " + currentLocation);
	}

	const onBack = () => {
		if (currentLocation !== 'comments/') {
			let tempArray = currentLocation.split('/')
			// console.log("during onBack, tempArray:" + tempArray);
			tempArray.pop()
			tempArray.pop()
			// console.log(tempArray);
			const newLocation = tempArray.join('/') + `/`
			// console.log("during onBack, new location: " + newLocation)
			setCurrentLocation(newLocation)
			// may need to force an update just to cause onValue to trigger?
		}
	}

	// converts firebase entry objects into an array to map
	const outputArray = (element) => {
		let tempArray = []
		for (let propertyName in element) {
			if (element[propertyName].user) {
				const userComment = {
					key: propertyName,
					newComment: element[propertyName]
				}
				tempArray.push(userComment)
			}
		}
		console.log("temp array: ", tempArray);
		return tempArray
	}

	// return true if the key of the current element is the current location
	const isCurrentLocation = (element) => {
		if (currentLocation === "comments/") {
			return true
		} else {
			let tempArray = currentLocation.split(`/`)
			tempArray.pop()
			// get the current node we're on, by first removing the empty entry after /, then removing the highest node
			const currentNode = tempArray.pop()
			// console.log("filter array: ", tempArray);
			return element.key === currentNode
		}
	}

	const notTop = () => {
		if (currentLocation === "comments/") {
			return false
		} else {
			return true
		}
	}

	return (
		<div className="App">
			<header className="searchHeader">
				<img src={searchLogo} className="searchLogo" alt="Magnifying glass logo" />
				<h1>
					Foundit
				</h1>
			</header>
			<form onSubmit={handleSubmit}>
				<label htmlFor="user">Username:</label>
				<input type="text" id="user" value={formUser} onChange={handleChangeUser}></input>
				<label htmlFor="comment">comment:</label>
				<input type="text" id="comment" value={formComment} onChange={handleChangeComment}></input>
				<button>Post</button>
			</form>
			<p>{currentLocation}</p>
			<button onClick={(event) => { onBack() }}>Back</button>
			<div className="wrapper">

			</div>
			<ul>
				{
					comments.filter((element) => { return isCurrentLocation(element) }).map((element) => {
						return (
							<li key={element.key} onClick={() => onFinding(element)} className={element.key}>
								<p className={element.newComment.found ? "found topLevel" : "undiscovered topLevel"} >{element.newComment.user} created room: {element.newComment.userComment}	</p>
								<ul className="inRoom">
									{
										element.newComment && notTop() ?
											outputArray(element.newComment).map((subElement) => {
												return (
													<li key={subElement.newComment.key} onClick={() => onFinding(subElement)}>
														<p className={subElement.newComment.found ? "found2" : "undiscovered2"} >{subElement.newComment.user} says: {subElement.newComment.userComment}	</p>
													</li>
												)
											})
											: ''
									}
								</ul>
							</li>
						)
					})}
			</ul>
		</div>
	);
}

export default App;