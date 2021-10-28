import RoomItem from './RoomItem.js'

// Component to display rooms
const Room = (props) => {
	return (
		<li tabIndex='0' role='button' onClick={() => props.passFunction(props.element)} className={props.element.key}>
			<p className={props.element.newComment.found ? "found topLevel" : "undiscovered topLevel"} >{props.element.newComment.user} created room: {props.element.newComment.userComment}	</p>
			<ul className="inRoom">
				{
					props.element.newComment && props.notTop() ?
						props.outputArray(props.element.newComment).map((subElement) => {
							return (
								<RoomItem key={subElement.key} clickFunction={props.passFunction} clickParam={subElement} pClass={subElement.newComment.found ? "found2" : "undiscovered2"} user={subElement.newComment.user} userComment={subElement.newComment.userComment} />
							)
						})
						: ''
				}
			</ul>
		</li>
	)
}

export default Room