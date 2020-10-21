import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import Pusher from 'pusher-js';
import axios from 'axios';
import { geolocated } from 'react-geolocated';

import Chip from '@material-ui/core/Chip';

import UserOnline from './UserOnline';

const Marker = ({ title, self }) => (
  <Chip color={self ? 'primary' : 'secondary'} label={title} />
);

const GoogleMap = ({ coords }) => {
  const [center, setCenter] = useState({
    lat: 18.795131,
    lng: 98.971295
  });
  const [zoom] = useState(15);
  const [userOnline, setUserOnline] = useState([]);
  const [locations, setLocations] = useState({});
  const [currentUser, setCurrentUser] = useState('');
  const [draggable, setDraggable] = useState(true);

  const updateLocation = location => {
    axios
      .post('http://localhost:3128/update-location', {
        username: currentUser,
        location: location
      })
      .then(res => {
        if (res.status === 200) {
          console.log('new location updated successfully');
        }
      });
  };

  const getLocation = () => {
    const location = {
      lat: coords.latitude,
      lng: coords.longitude
    };

    setLocations({
      [currentUser]: location
    });
    setCenter(location);
    updateLocation(location);
  };

  useEffect(() => {
    const pusher = new Pusher('ea2a97224057952fe0c7', {
      authEndpoint: 'http://localhost:3128/pusher/auth',
      cluster: 'ap1'
    });
    const presenceChannel = pusher.subscribe('presence-channel');

    presenceChannel.bind('pusher:subscription_succeeded', members => {
      setUserOnline(members.members);
      setCurrentUser(members.myID);
    });

    presenceChannel.bind('location-update', body => {
      const { username, location } = body;
      setLocations(prev => ({
        ...prev,
        [username]: location
      }));
    });

    presenceChannel.bind('pusher:member_removed', member => {
      setUserOnline(prev => {
        delete prev[member.id];
        return prev;
      });

      setLocations(prev => {
        delete prev[member.id];
        return prev;
      });

      // notify();
    });

    presenceChannel.bind('pusher:member_added', member => {
      // notify();
    });
  }, []);

  useEffect(() => {
    if (currentUser && coords) {
      getLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const locationMarkers = () => {
    return Object.keys(locations).map((username, index) => {
      const userLocation = locations[username];
      return (
        <Marker
          key={index}
          title={username}
          lat={userLocation.lat}
          lng={userLocation.lng}
          self={username === currentUser}
        />
      );
    });
  };

  const onDragMarkler = (childKey, childProps, mouse) => {
    if (childProps.title !== currentUser) {
      return;
    }

    const location = {
      lat: mouse.lat,
      lng: mouse.lng
    };

    setDraggable(false);

    setLocations(prev => ({
      ...prev,
      [currentUser]: location
    }));
  };

  const onDragMarklerEnd = (childKey, childProps, mouse) => {
    if (childProps.title !== currentUser) {
      return;
    }

    const location = {
      lat: mouse.lat,
      lng: mouse.lng
    };

    setDraggable(true);
    updateLocation(location);
  };

  return (
    <div>
      <div style={{ height: '70vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyBDoOR0TJ2QRqoAYIGSXmme6GPr6-oEEJs' }}
          center={center}
          defaultZoom={zoom}
          onChildMouseDown={onDragMarkler}
          onChildMouseMove={onDragMarkler}
          onChildMouseUp={onDragMarklerEnd}
          draggable={draggable}
        >
          {locationMarkers()}
        </GoogleMapReact>
      </div>
      <UserOnline userOnline={userOnline} />
    </div>
  );
};

export default geolocated({
  watchPosition: true
})(GoogleMap);
