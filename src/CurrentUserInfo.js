const CurrentUserInfo = (props) => {
	return (
		<p>{props.user.userData.user} has {props.user.userData.foundPoints} found points and {props.user.userData.undiscoveredPoints} undiscovered points!</p>
	)
}

export default CurrentUserInfo