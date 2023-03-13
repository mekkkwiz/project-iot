"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { Bin } from "../types";
import io from "socket.io-client";

type LatLngLiteral = google.maps.LatLngLiteral;
type MapOptions = google.maps.MapOptions;

const Map = () => {
  const mapRef = useRef<google.maps.Map>();
  const [center, setCenter] = useState<LatLngLiteral>({
    lat: 18.795598,
    lng: 98.9510693,
  });

  const centerRef = useRef(center);

  const options = useMemo<MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: false,
    }),
    []
  );

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      centerRef.current = center;
    },
    [center]
  );

  const onDragEnd = useCallback(() => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter();
      if (newCenter) {
        const latLng = { lat: newCenter.lat(), lng: newCenter.lng() };
        if (JSON.stringify(latLng) !== JSON.stringify(centerRef.current)) {
          setCenter(latLng);
          centerRef.current = latLng;
        }
      }
    } else {
      setCenter(centerRef.current);
      console.log("Error: mapRef.current is null");
    }
  }, []);

  const [bins, setBins] = useState<Bin[]>([]);

  const socketInitializer = async () => {
    const response = await fetch("http://localhost:3030/api/socket");

    const { endpoint } = await response.json();
    const socket = io(endpoint);

    socket.on("connect", () => {
      console.log("connected");
    });

    socket.on("bins-updated", (data: string) => {
      const bins = JSON.parse(data);
      setBins(bins);

      // Update the map's center to the first bin's location
      if (bins.length > 0) {
        const firstBin = bins[0];
      }
    });
  };

  useEffect(() => {
    socketInitializer();
  }, []);

  const BinMarker = ({ id, location, status }: Bin) => {
    const [isOpen, setIsOpen] = useState(false);

    const latestStatus = status[status.length - 1];

    const toggleInfoWindow = () => {
      setIsOpen(!isOpen);
    };

    const icon = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: latestStatus.isFull ? "red" : "green",
      fillOpacity: 0.8,
      scale: 8,
      strokeColor: "white",
      strokeWeight: 2,
    };

    return (
      <>
        <Marker
          key={id}
          position={location}
          icon={icon}
          onClick={toggleInfoWindow}
        />
        {isOpen && (
          <InfoWindow onCloseClick={toggleInfoWindow} position={location}>
            <div style={{ color: "black" }}>
              <p>ID: {id}</p>
              <p>Location: {location.label}</p>
              <p>Status: {latestStatus.isFull ? "Full" : "Not Full"}</p>
              <p>Last Updated: {latestStatus.time}</p>
            </div>
          </InfoWindow>
        )}
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Bin Map</title>
      </Head>
      <LoadScript
        googleMapsApiKey={
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_DEFAULT_API_KEY"
        }
      >
        <GoogleMap
          mapContainerStyle={{ height: "100vh", width: "100vw" }}
          zoom={18}
          center={center}
          onLoad={onLoad}
          onDragEnd={onDragEnd}
        >
          {bins.map((bin) => (
            <BinMarker
              key={bin.id}
              id={bin.id}
              location={bin.location}
              status={bin.status}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default Map;
