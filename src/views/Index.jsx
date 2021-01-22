import React from 'react'
import * as Mui from '@material-ui/core'
import * as GPXParser from 'gpxparser'
import SearchIcon from '@material-ui/icons/Search'
import moment from 'moment'
import { MapContainer, TileLayer, Polyline, Circle, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function Index() {
	const [gpx, setGPX] = React.useState()
	const [key, setKey] = React.useState(Math.random())
	const [loading, setLoading] = React.useState(false)
	const [bounds, setBounds] = React.useState([
		[0, 0],
		[0, 0],
	])

	const [seconds, setSeconds] = React.useState(60)
	const [meters, setMeters] = React.useState(100)
	const [stayPoints, setStayPoints] = React.useState(null)

	const handleFileLoad = (e) => {
		try {
			const file = e.target.files[0]
			const fileReader = new FileReader()

			fileReader.onload = (e) => {
				setStayPoints(null)

				const content = e.target.result
				const gpxParser = new GPXParser()
				gpxParser.parse(content)

				setGPX(gpxParser)
				setKey(Math.random())
			}

			fileReader.readAsText(file)
		} catch (e) {
			console.log(e)
		}
	}

	React.useEffect(() => {
		if (gpx) {
			setBounds([
				[Math.min(...gpx.tracks[0].points.map((point) => point.lat)), Math.min(...gpx.tracks[0].points.map((point) => point.lon))],
				[Math.max(...gpx.tracks[0].points.map((point) => point.lat)), Math.max(...gpx.tracks[0].points.map((point) => point.lon))],
			])
		}
	}, [gpx, key])

	return (
		<Mui.Grid style={{ padding: 20 }} container direction="column" justify="flex-end" alignItems="center" spacing={3}>
			<Mui.Grid item>
				<Mui.Typography variant="body1">
					Geospatial Data Management 2020/2021, project 1<br />
					Alfonso Adduci (mat. 908977)
				</Mui.Typography>
			</Mui.Grid>

			<Mui.Grid item>
				<Mui.Typography variant="h3">StayPoints</Mui.Typography>
			</Mui.Grid>

			<Mui.Grid item>
				<Mui.Card>
					<Mui.CardHeader title={'Load a GPX file'} />
					<Mui.CardContent>
						<input type="file" accept=".gpx" onChange={handleFileLoad}></input>
					</Mui.CardContent>
					<Mui.CardActions></Mui.CardActions>
				</Mui.Card>
			</Mui.Grid>

			{gpx?.tracks[0] && (
				<Mui.Grid item>
					<Mui.Card>
						<Mui.CardHeader title={'StayPoints detection'} />
						<Mui.CardContent>
							Stops for at least{' '}
							<Mui.Input
								// label="Number"
								fullWidth
								value={seconds}
								onChange={(e) => {
									setStayPoints(null)
									setSeconds(e.target.value)
								}}
								endAdornment={<Mui.InputAdornment position="end">seconds</Mui.InputAdornment>}
								type="number"
								size="small"
								// variant="outlined"
							/>
							<br />
							<br />
							in a circle of radius
							<Mui.Input
								fullWidth
								value={meters}
								onChange={(e) => {
									setStayPoints(null)
									setMeters(e.target.value)
								}}
								endAdornment={<Mui.InputAdornment position="end">meters</Mui.InputAdornment>}
								type="number"
								size="small"
								// variant="outlined"
							/>
						</Mui.CardContent>
						<Mui.CardActions>
							<Mui.Button
								onClick={(e) => {
									setLoading(true)

									setStayPoints(getStayPoints(gpx.tracks[0].points, meters, seconds))
									setKey(Math.random())

									setLoading(false)
								}}
								startIcon={<SearchIcon />}
								variant="contained"
								color="primary"
								disabled={!!stayPoints || loading || seconds <= 0 || meters <= 0 || false}
							>
								Find
							</Mui.Button>
							{stayPoints && <Mui.Typography variant="body1">{stayPoints.length} StayPoints found</Mui.Typography>}
							{!stayPoints && loading && <Mui.Typography variant="body1">loading...</Mui.Typography>}
						</Mui.CardActions>
					</Mui.Card>
				</Mui.Grid>
			)}

			{gpx?.tracks[0] && (
				<Mui.Grid item>
					<Mui.Card>
						<Mui.CardHeader title={gpx.metadata.name || gpx.tracks[0].name || ''} />
						<Mui.CardContent>
							<MapContainer key={key} bounds={bounds} scrollWheelZoom={false} whenReady={() => {}}>
								<TileLayer attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

								<Polyline pathOptions={{ color: 'red' }} positions={gpx.tracks.map((track) => track.points.map((point) => [point.lat, point.lon]))} />

								{stayPoints &&
									stayPoints.map((point) => (
										<Circle center={[point.lat, point.lon]} radius={meters}>
											<Tooltip>
												From: {moment(point.arv).format('YYYY/MM/DD HH:mm:ss')}
												<br />
												Until: {moment(point.lev).format('YYYY/MM/DD HH:mm:ss')}
												<br />
												Stay: {moment.utc(moment.duration(point.lev - point.arv).asMilliseconds()).format('H[h] m[m] s[s]')}
											</Tooltip>
										</Circle>
									))}
							</MapContainer>
						</Mui.CardContent>
					</Mui.Card>
				</Mui.Grid>
			)}
		</Mui.Grid>
	)
}

const haversine = (p1, p2) => {
	const r = 6378137
	const toRad = (x) => (x * Math.PI) / 180.0

	const lat1 = p1.latitude || p1.lat
	const lng1 = p1.longitude || p1.lng || p1.lon
	const lat2 = p2.latitude || p2.lat
	const lng2 = p2.longitude || p2.lng || p2.lon

	const latd = toRad(lat2 - lat1)
	const lngd = toRad(lng2 - lng1)

	const f = Math.pow(Math.sin(latd / 2.0), 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.pow(Math.sin(lngd / 2.0), 2)
	const c = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f))

	return r * c
}

const getStayPoints = (points, meters, seconds) => {
	try {
		//result container
		const stayPoints = []

		//for each point i (origin)
		let i = 0
		while (i < points.length) {
			//for each subsequent point j (destination)
			let j = i + 1
			while (j < points.length) {
				//calculate the distance (implemented with the haversine formula)
				const dm = haversine(points[i], points[j])

				//if the destination falls outside the radius
				if (dm > meters) {
					//and the time to get there was above the threshold
					const dt = (new Date(points[j].time) - new Date(points[i].time)) / 1e3
					if (dt > seconds) {
						//extract all the sub-points
						const pts = points.slice(i, j)

						//compute the staypoint (average latitude, average longitude, arrive time, leave time)
						//and add it to the result
						stayPoints.push({
							lat: pts.map((point) => point.lat).reduce((acc, val) => acc + val, 0) / pts.length,
							lon: pts.map((point) => point.lon).reduce((acc, val) => acc + val, 0) / pts.length,
							arv: pts[0].time,
							lev: pts.slice(-1)[0].time,
						})
					}

					//avoid re-computing subpaths
					i = j
					break
				}

				//iterate
				j++
			}

			//iterate
			if (j === points.length && i !== j) i++
		}

		//return the set of computed staypoints
		return stayPoints
	} catch (e) {
		//catch-all to handle bad parameters
		console.log(e)
		return null
	}
}
