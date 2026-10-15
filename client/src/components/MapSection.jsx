import { MapPin, Navigation } from 'lucide-react';
import Pending from './Pending.jsx';
import { hospital, displayName, fullAddress, directionsHref } from '../config/hospital.js';

/**
 * Location block. Uses the hospital's verified Google Maps embed URL (no paid
 * API key needed). Until that is configured, shows a labelled placeholder —
 * we never point the map at a guessed or unrelated location.
 */
export default function MapSection() {
  const { mapEmbedUrl } = hospital.location;
  const address = fullAddress();
  const directions = directionsHref();

  return (
    <div className="map-block" data-reveal>
      <div className="map-block__map">
        {mapEmbedUrl ? (
          <iframe
            title={`Map showing the location of ${displayName}`}
            src={mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="map-placeholder" role="img" aria-label="Map placeholder: the hospital's verified location has not been added yet">
            <div className="map-placeholder__grid" aria-hidden="true" />
            <div className="map-placeholder__pin" aria-hidden="true">
              <MapPin size={34} strokeWidth={1.75} />
            </div>
            <p className="map-placeholder__text">
              Map will appear here once the hospital’s verified Google Maps location is added.
            </p>
          </div>
        )}
      </div>
      <div className="map-block__info">
        <h3>How to find us</h3>
        <p className="map-block__address">
          <MapPin size={18} aria-hidden="true" />
          {address ? <span>{address}</span> : <Pending label="Physical address" />}
        </p>
        {hospital.address.landmark && <p className="muted">{hospital.address.landmark}</p>}
        {directions ? (
          <a href={directions} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
            <Navigation size={18} aria-hidden="true" />
            Get directions
            <span className="sr-only"> (opens Google Maps in a new tab)</span>
          </a>
        ) : (
          hospital.draftMode && (
            <p className="note">
              <strong>Setup:</strong> add the verified address or Google Maps link in <code>src/config/hospital.js</code> to enable the
              directions button.
            </p>
          )
        )}
      </div>
    </div>
  );
}
