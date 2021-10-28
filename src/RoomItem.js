// Component to display an item in a room
const RoomItem = (props) => {

	return (
		<li tabIndex='0' role='button' onClick={() => props.clickFunction(props.clickParam)}>
			<p className={props.pClass} >{props.user} says: {props.userComment}	</p>
		</li>
	)
}

export default RoomItem