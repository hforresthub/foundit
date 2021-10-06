import searchLogo from './search.svg'
import { useState, useEffect } from 'react';
import realtime from './firebase'
import { ref, onValue, push, update } from "firebase/database";
import './App.css';
import Room from './Room.js'
import CurrentUserInfo from './CurrentUserInfo.js'

function App() {
	// state variables
	const [comments, setComments] = useState([])
	const [users, setUsers] = useState([])
	const [currentLocation, setCurrentLocation] = useState('comments/')
	const [formUser, setFormUser] = useState('')
	const [formComment, setFormComment] = useState('')

	// watch comment data
	useEffect(() => {
		const foundDb = ref(realtime, 'comments/')
		onValue(foundDb, (snapshot) => {
			const myData = snapshot.val()
			const commentArray = []
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
		})
	}, [])

	// watch user data
	useEffect(() => {
		const userFoundDb = ref(realtime, 'users/')
		onValue(userFoundDb, (snapshot) => {
			const myData = snapshot.val()
			const userArray = []
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
		})
	}, [])

	// return true if name is acceptable, false if it contains illegal characters
	const acceptableName = (tryingName) => {
		return !tryingName.includes('.') && !tryingName.includes('#') && !tryingName.includes('$') && !tryingName.includes('[') && !tryingName.includes(']')
	}

	// handles submit of the form, and creates a room or item as appropriate
	const handleSubmit = (event) => {
		event.preventDefault()
		// form logic
		// add comment to realtime

		// check if user exists, if not, create them
		let currentUser = users.filter(element => element.key === formUser)[0]
		// dont allow usernames with illegal characters in them
		if (!currentUser && acceptableName(formUser)) {
			// if user doesnt exist yet, create them
			//update user
			const userFoundDb = ref(realtime, `users/${formUser}`)
			const newUserInfo = {
				user: formUser,
				foundPoints: 0,
				undiscoveredPoints: 0,
			}
			update(userFoundDb, newUserInfo)
			currentUser = { key: formUser, userData: newUserInfo }
		} else if (!acceptableName(formUser)) {
			alert("Name contains illegal character(s), try another without any of the following: . # $ [ ]")
		} else if (acceptableName(formUser)) {
			const foundDb = ref(realtime, currentLocation)
			push(foundDb, {
				user: formUser,
				userComment: formComment,
				found: false
			});
			//clear after
			setFormComment('')
	
			//update user
			const userFoundDb = ref(realtime, `users/${formUser}`)
			const newUserInfo = {
				user: formUser,
				// foundPoints: currentUser.userData.foundPoints + 1,
				undiscoveredPoints: currentUser.userData.undiscoveredPoints + 1,
			}
			update(userFoundDb, newUserInfo)
		}
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
		let currentUser = users.filter(user => user.key === formUser)[0]
		if (!currentUser && acceptableName(formUser)) {
			// if user doesnt exist yet, create them
			//update user
			const userFoundDb = ref(realtime, `users/${formUser}`)
			const newUserInfo = {
				user: formUser,
				foundPoints: 0,
				undiscoveredPoints: 0,
			}
			update(userFoundDb, newUserInfo)
			currentUser = { key: formUser, userData: newUserInfo }
		} else if (!acceptableName(formUser))
		{
			alert("Name contains illegal character(s), try another without any of the following: . # $ [ ]")
		}
		const oldLocation = currentLocation
		let tempArray = currentLocation.split('/')
		tempArray.pop()
		const currentNode = tempArray.pop()
		const newLocation = `${currentLocation}${element.key}/`
		// if the current user isnt the one who made this room/comment, set this room/comment as found and reward the user with a point
		if (currentNode !== element.key && element.newComment.user !== formUser && formUser !== '' && !element.newComment.found && acceptableName(formUser)) {

			const newUserInfo = {
				user: element.newComment.user,
				userComment: element.newComment.userComment,
				found: true,
			}
			const foundDb = ref(realtime, newLocation)
			update(foundDb, newUserInfo)
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
		if (oldLocation === "comments/" && formUser !== '' && acceptableName(formUser)) {

			setCurrentLocation(newLocation)
		}
	}

	const onBack = () => {
		if (currentLocation !== 'comments/') {
			let tempArray = currentLocation.split('/')
			// remove the empty element
			tempArray.pop()
			// remove the subfolder, could just set to comments/ but I want this functionality for if I add sub sub folders etc
			tempArray.pop()
			const newLocation = tempArray.join('/') + `/`
			setCurrentLocation(newLocation)
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
			return element.key === currentNode
		}
	}

	// returns true when we're in a room, as opposed to the top level of the comments part of the database
	const notTop = () => {
		if (currentLocation === "comments/") {
			return false
		} else {
			return true
		}
	}

	// reduce function for the array to find the user with the highest found points
	const highestFound = (prev, cur) => {
		if (prev.userData.foundPoints >= cur.userData.foundPoints) {
			return prev
		} else {
			return cur
		}
	}

	// reduce function for the array to find the user with the highest undiscovered points
	const highestUndiscovered = (prev, cur) => {
		if (prev.userData.undiscoveredPoints >= cur.userData.undiscoveredPoints) {
			return prev
		} else {
			return cur
		}
	}

	// displays the users with the highest scores in both categories 
	const displayHighScore = () => {
		return (
			<ul>
				<li key={users.reduce(highestFound).key + "found"} className="foundHigh">
					<h2>Founderest:</h2>
					<p>{users.reduce(highestFound).userData.user}, found points: {users.reduce(highestFound).userData.foundPoints}</p>
				</li>
				<li key={users.reduce(highestUndiscovered).key + "undiscovered"} className="undiscoveredHigh">
					<h2>Undiscovered country:</h2>
					<p>{users.reduce(highestUndiscovered).userData.user}, undiscovered points: {users.reduce(highestUndiscovered).userData.undiscoveredPoints}</p>
				</li>
			</ul>
		)
	}

	return (
		<div className="App">
			<div className="topBar">
				<div className="foundit">
					<header className="searchHeader">
						<img src={searchLogo} className="searchLogo" alt="Magnifying glass logo" />
						<h1>
							Foundit
						</h1>
					</header>
					<form onSubmit={handleSubmit}>
						<label htmlFor="user">Username:</label>
						<input type="text" id="user" value={formUser} onChange={handleChangeUser} required></input>
						<label htmlFor="comment">{notTop() ? 'Comment' : 'Room name'}</label>
						<input type="text" id="comment" value={formComment} onChange={handleChangeComment} required></input>
						<button>{notTop() ? 'Post comment' : 'Create room'}</button>
					</form>
				</div>
				<div className="information">
					<div className="userData">
						{
							users.length > 0 ? displayHighScore() : ''
						}
					</div>
					<div className="description">
						<p>{!notTop() ? 'Enter a username and then create a room to chat in.  Every room you create that no one has found yields 1 undiscovered point until it is found.  Every room of someone else that you are the first to click gains you a found point.' : 'Enter a username and then post a comment to chat.  Every comment you create that no one has found yields 1 undiscovered point until it is found.  Every comment of someone else that you are the first to click gains you a found point.'}</p>
						<p>{!notTop() ? 'Click a room to enter it.' : 'Click back to try another room.'}</p>
					</div>
				</div>
			</div>
			{
				(users.filter(user => user.key === formUser).length > 0) ? <CurrentUserInfo user={users.filter(user => user.key === formUser)[0]} /> : ''
			}
			{
				notTop() ? <button onClick={() => { onBack() }}>Back</button> : ''
			}
			<ul>
				{
					comments.filter((element) => { return isCurrentLocation(element) }).map((element) => {
						return (
							<Room key={element.key} element={element} passFunction={onFinding} notTop={notTop} outputArray={outputArray} />
						)
					})}
			</ul>
			<footer><a href='https://www.junocollege.com' >Created at Juno College 2021</a></footer>
		</div>
	);
}

export default App;