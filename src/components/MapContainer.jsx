// Delegate to Google Maps implementation — passes all props through.
import GoogleMapContainer from './GoogleMapContainer';
export default function MapContainer(props) {
  return <GoogleMapContainer {...props} />;
}
