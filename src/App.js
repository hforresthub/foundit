import searchLogo from './search.svg'
import { useState, useEffect } from 'react';
import realtime from './firebase'
import { ref, onValue, push, update } from "firebase/database";
import './App.css';

function App() {
	const [comments, setComments] = useState([])
	const [currentLocation, setCurrentLocation] = useState('comments/')
	const [formUser, setFormUser] = useState('')
	const [formComment, setFormComment] = useState('')

	useEffect(() => {
		console.log("starting onvalue again because db changed");
		const foundDb = ref(realtime, currentLocation)
		onValue(foundDb, (snapshot) => {
			console.log("during onvalue, current location: " + currentLocation);
			const myData = snapshot.val()
			const commentArray = []
			console.log("during onvalue, my data: ", myData);
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
	}, [currentLocation])

	const handleSubmit = (event) => {
		event.preventDefault()
		// form logic
		// add comment to realtime
		console.log("adding new comment at: " + currentLocation)
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
	const onFinding = (element) => {
		const newUserInfo = {
			user: element.newComment.user,
			userComment: element.newComment.userComment,
			found: true,
		}
		const newLocation = `${currentLocation}${element.key}/`
		const foundDb = ref(realtime, newLocation)
		update(foundDb, newUserInfo)
		console.log("during onFinding, new location: " + newLocation)
		setCurrentLocation(newLocation)
		console.log("during onFinding, current location: " + currentLocation);
	}

	const onBack = () => {
		if (currentLocation !== 'comments/') {
			let tempArray = currentLocation.split('/')
			console.log("during onBack, tempArray:" + tempArray);
			tempArray.pop()
			tempArray.pop()
			console.log(tempArray);
			const newLocation = tempArray.join('/') + `/`
			console.log("during onBack, new location: " + newLocation)
			setCurrentLocation(newLocation)
			// may need to force an update just to cause onValue to trigger?
		}
	}

	return (
		<div className="App">
			<header className="App-header">
				<img src={searchLogo} className="App-logo" alt="logo" />
				<h1>
					Foundit
				</h1>
			</header>
			<form onSubmit={handleSubmit}>
				<label htmlFor="user">Username:</label>
				<input type="text" id="user" value={formUser} onChange={handleChangeUser}></input>
				<label htmlFor="comment">comment:</label>
				<input type="text" id="comment" value={formComment} onChange={handleChangeComment}></input>
				<button>Save</button>
			</form>
			<p>{currentLocation}</p>
			<button onClick={(event) => {onBack()}}>Back</button>
			<ul>
				{
					comments.map((element) => {
						return (
							<li key={element.key} onClick={() => onFinding(element)} className={element.key}>
								<p className={element.newComment.found ? "found" : "undiscovered"} >{element.newComment.user} says: {element.newComment.userComment}	</p>
							</li>
						)
					})}
			</ul>
		</div>
	);
}

export default App;