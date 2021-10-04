import searchLogo from './search.svg'
import { useState, useEffect } from 'react';
import realtime from './firebase'
import { ref, onValue, push, update } from "firebase/database";
import './App.css';
import RoomItem from './RoomItem.js'

function App() {
	const [comments, setComments] = useState([])
	const [users, setUsers] = useState([])
	const [currentLocation, setCurrentLocation] = useState('comments/')
	const [formUser, setFormUser] = useState('')
	const [formComment, setFormComment] = useState('')
	// console.log("testing: ", currentLocation);

	// watch comment data
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

	// watch user data
	useEffect(() => {
		// console.log("starting onvalue again because db changed");
		const userFoundDb = ref(realtime, 'users/')
		onValue(userFoundDb, (snapshot) => {
			// console.log("during onvalue, current location: " + currentLocation);
			const myData = snapshot.val()
			const userArray = []
			// console.log("during onvalue, my data: ", myData);
			for (let propertyName in myData) {
				// create a new local object for each loop iteration:
				const tempUser = {
					key: propertyName,
					userData: myData[propertyName]
				}
				if (myData[propertyName].user) {
					userArray.push(tempUser)
				}
			}
			setUsers(userArray)
			// console.log("users: ", users);
		})
	}, [])

	const handleSubmit = (event) => {
		event.preventDefault()
		// form logic
		// add comment to realtime
		// console.log("adding new comment at: " + currentLocation)

		// check if user exists, if not, create them
		let currentUser = users.filter(element => element.key === formUser)[0]
		if (!currentUser) {
			// if user doesnt exist yet, create them
			//update user
			// console.log("filtered user: ", users.filter(element => element.key===formUser)[0]);
			const userFoundDb = ref(realtime, `users/${formUser}`)
			const newUserInfo = {
				user: formUser,
				foundPoints: 0,
				undiscoveredPoints: 0,
			}
			update(userFoundDb, newUserInfo)
			currentUser = { key: formUser, userData: newUserInfo }
		}

		const foundDb = ref(realtime, currentLocation)
		push(foundDb, {
			user: formUser,
			userComment: formComment,
			found: false
		});
		//clear after
		setFormComment('')

		//update user
		// console.log("filtered user: ", users.filter(element => element.key===formUser)[0]);
		const userFoundDb = ref(realtime, `users/${formUser}`)
		const newUserInfo = {
			user: formUser,
			// foundPoints: currentUser.userData.foundPoints + 1,
			undiscoveredPoints: currentUser.userData.undiscoveredPoints + 1,
		}
		update(userFoundDb, newUserInfo)
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
		// console.log("element: ", element);
		let currentUser = users.filter(user => user.key === formUser)[0]
		if (!currentUser) {
			// if user doesnt exist yet, create them
			//update user
			// console.log("filtered user: ", users.filter(element => element.key===formUser)[0]);
			const userFoundDb = ref(realtime, `users/${formUser}`)
			const newUserInfo = {
				user: formUser,
				foundPoints: 0,
				undiscoveredPoints: 0,
			}
			update(userFoundDb, newUserInfo)
			currentUser = { key: formUser, userData: newUserInfo }
		}
		const oldLocation = currentLocation
		let tempArray = currentLocation.split('/')
		tempArray.pop()
		const currentNode = tempArray.pop()
		const newLocation = `${currentLocation}${element.key}/`
		// if the current user isnt the one who made this room/comment, set this room/comment as found and reward the user with a point
		if (currentNode !== element.key && element.newComment.user !== formUser && formUser !== '' && !element.newComment.found) {

			const newUserInfo = {
				user: element.newComment.user,
				userComment: element.newComment.userComment,
				found: true,
			}
			const foundDb = ref(realtime, newLocation)
			update(foundDb, newUserInfo)
			// console.log("during onFinding, new location: " + newLocation)
			// change points around for users
			// award a point to the form user who found the comment
			const userFoundDb = ref(realtime, `users/${formUser}`)
			const foundUserInfo = {
				foundPoints: currentUser.userData.foundPoints + 1,
			}
			update(userFoundDb, foundUserInfo)
			// take away points from user whose comment was found
			const userLostDb = ref(realtime, `users/${element.newComment.user}`)
			// get user from list of users, whose name matches the current comment
			let commentUser = users.filter(user => user.key === element.newComment.user)[0]
			const lostUserInfo = {
				undiscoveredPoints: commentUser.userData.undiscoveredPoints - 1,
			}
			update(userLostDb, lostUserInfo)
		} else if (formUser === '') {
			alert('Please enter a Username!')
		}
		if (oldLocation === "comments/" && formUser !== '') {

			setCurrentLocation(newLocation)
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
		// console.log("temp array: ", tempArray);
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

	const highestFound = (prev, cur) => {
		if (prev.userData.foundPoints >= cur.userData.foundPoints) {
			// console.log("prev: ", prev);
			return prev
		} else {
			// console.log("cur: ", cur);
			return cur
		}
	}

	const highestUndiscovered = (prev, cur) => {
		if (prev.userData.undiscoveredPoints >= cur.userData.undiscoveredPoints) {
			// console.log("prev: ", prev);
			return prev
		} else {
			// console.log("cur: ", cur);
			return cur
		}
	}

	const displayHighScore = () => {
		// console.log("users: ", users);
		return (
			<ul>
				<li key={users.reduce(highestFound).key + "found"} className="foundHigh">
					<p>{users.reduce(highestFound).userData.user} found points: {users.reduce(highestFound).userData.foundPoints}</p>
				</li>
				<li key={users.reduce(highestUndiscovered).key + "undiscovered"} className="undiscoveredHigh">
					<p>{users.reduce(highestUndiscovered).userData.user} undiscovered points: {users.reduce(highestUndiscovered).userData.undiscoveredPoints}</p>
				</li>
			</ul>
		)
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
			<div className="userData">
				{
					users.length > 0 ? displayHighScore() : ''
				}
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
											outputArray(element.newComment).map((subElement, index) => {
												return (
													<RoomItem key={subElement.key} clickFunction={onFinding} clickParam={subElement} pClass={subElement.newComment.found ? "found2" : "undiscovered2"} user={subElement.newComment.user} userComment={subElement.newComment.userComment} />
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