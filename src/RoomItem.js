// Component to display an item in a room
const RoomItem = (props) => {

	return (
		<li onClick={() => props.clickFunction(props.clickParam)}>
			<p className={props.pClass} >{props.user} says: {props.userComment}	</p>
		</li>
	)
}

export default RoomItem