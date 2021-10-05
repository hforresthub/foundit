const CurrentUserInfo = (props) => {
	return (
		<p className='currentUser'>{props.user.userData.user} has {props.user.userData.foundPoints} found points and {props.user.userData.undiscoveredPoints} undiscovered points!</p>
	)
}

export default CurrentUserInfo