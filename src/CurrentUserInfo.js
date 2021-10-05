const CurrentUserInfo = (props) => {
	return (
		<p className='currentUser'>You have {props.user.userData.foundPoints} found point{props.user.userData.foundPoints === 1 ? '' : 's'} and {props.user.userData.undiscoveredPoints} undiscovered point{props.user.userData.undiscoveredPoints === 1 ? '' : 's'}!</p>
	)
}

export default CurrentUserInfo